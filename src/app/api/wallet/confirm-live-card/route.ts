import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodId, orderRef } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    // 1. Confirm PaymentIntent with Stripe Live
    let confirmedPi: any = null;
    if (paymentMethodId) {
      try {
        confirmedPi = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
          return_url: "https://flyway-cloud.vercel.app/dashboard/billing",
        });
      } catch (stripeErr: any) {
        return NextResponse.json(
          { error: stripeErr.message || "Card authorization failed" },
          { status: 400 }
        );
      }
    } else {
      confirmedPi = await stripe.paymentIntents.retrieve(paymentIntentId);
    }

    // 2. Handle 3D Secure authentication if required by bank
    if (confirmedPi.status === "requires_action" && confirmedPi.next_action?.redirect_to_url?.url) {
      return NextResponse.json({
        requiresAction: true,
        redirectUrl: confirmedPi.next_action.redirect_to_url.url,
      });
    }

    // 3. If succeeded, commit transaction & credit balance immediately
    if (confirmedPi.status === "succeeded") {
      const transaction = await prisma.transaction.findFirst({
        where: {
          OR: [
            { stripePaymentIntentId: paymentIntentId },
            ...(orderRef ? [{ orderRef }] : []),
          ],
        },
        include: { wallet: true },
      });

      if (transaction && transaction.status !== "SUCCEEDED") {
        const newBalance = transaction.wallet.balance + transaction.creditsChange;
        const latestCharge = typeof confirmedPi.latest_charge === "string" ? confirmedPi.latest_charge : undefined;

        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: newBalance,
              lifetimeSpentCents: { increment: transaction.amountCents },
              lifetimeCreditsGranted: { increment: transaction.creditsChange },
            },
          }),
          prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "SUCCEEDED",
              balanceAfter: newBalance,
              stripeChargeId: latestCharge,
            },
          }),
        ]);
      }

      return NextResponse.json({
        success: true,
        status: "SUCCEEDED",
        chargeId: confirmedPi.latest_charge,
      });
    }

    return NextResponse.json({
      status: confirmedPi.status,
      message: `Payment status: ${confirmedPi.status}`,
    });
  } catch (err: any) {
    console.error("Live card confirmation error:", err);
    return NextResponse.json({ error: err.message || "Failed to process card" }, { status: 500 });
  }
}
