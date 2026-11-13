import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    // Verify Stripe signature if configured
    if (sig && webhookSecret && !webhookSecret.includes("mock")) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // In local dev/test or mock mode, parse raw JSON body directly
      try {
        event = JSON.parse(rawBody);
      } catch (err) {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata || {};
      const paymentIntentId = paymentIntent.id;
      const amountCents = paymentIntent.amount || 0;
      const creditsToAdd = parseInt(metadata.credits_to_add || "0", 10);
      const accountId = metadata.account_id;
      const orderRef = metadata.unique_order_ref;

      console.log(`[Stripe Webhook] Processing payment_intent.succeeded: ${paymentIntentId} for account: ${accountId}, credits: ${creditsToAdd}`);

      // Perform atomic database wallet crediting with idempotency check
      const result = await prisma.$transaction(async (tx) => {
        // Find existing transaction record by stripePaymentIntentId or orderRef
        let existingTx = null;
        if (paymentIntentId) {
          existingTx = await tx.transaction.findFirst({
            where: {
              OR: [
                { stripePaymentIntentId: paymentIntentId },
                ...(orderRef ? [{ orderRef }] : []),
              ],
            },
            include: { wallet: true },
          });
        }

        // Idempotency check: if already processed and succeeded, return early
        if (existingTx && existingTx.status === "SUCCEEDED") {
          console.log(`[Stripe Webhook] Transaction ${existingTx.id} already succeeded. Skipping duplicate.`);
          return { alreadyProcessed: true, transaction: existingTx };
        }

        // Determine user wallet
        let wallet = null;
        if (existingTx) {
          wallet = existingTx.wallet;
        } else if (accountId) {
          wallet = await tx.wallet.findUnique({
            where: { userId: accountId },
          });
        }

        if (!wallet) {
          throw new Error(`Wallet not found for accountId: ${accountId}`);
        }

        const newBalance = wallet.balance + creditsToAdd;

        // Update Wallet
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            lifetimeSpentCents: { increment: amountCents },
            lifetimeCreditsGranted: { increment: creditsToAdd },
          },
        });

        // Update or create Transaction record
        let finalTx;
        if (existingTx) {
          finalTx = await tx.transaction.update({
            where: { id: existingTx.id },
            data: {
              status: "SUCCEEDED",
              stripeChargeId: typeof paymentIntent.latest_charge === "string" ? paymentIntent.latest_charge : undefined,
              balanceAfter: newBalance,
            },
          });
        } else {
          finalTx = await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: "TOPUP",
              status: "SUCCEEDED",
              amountCents,
              currency: (paymentIntent.currency || "cad").toUpperCase(),
              creditsChange: creditsToAdd,
              balanceAfter: newBalance,
              stripePaymentIntentId: paymentIntentId,
              orderRef: orderRef || `FLY-${Date.now()}`,
              description: `Compute Top-up (+${creditsToAdd.toLocaleString()} credits)`,
              metadataJson: JSON.stringify(metadata),
            },
          });
        }

        return { alreadyProcessed: false, wallet: updatedWallet, transaction: finalTx };
      });

      return NextResponse.json({
        received: true,
        status: "CREDITED_SUCCESSFULLY",
        result,
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = paymentIntent.id;

      await prisma.transaction.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ received: true, status: "MARKED_FAILED" });
    }

    return NextResponse.json({ received: true, unhandledType: event.type });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
