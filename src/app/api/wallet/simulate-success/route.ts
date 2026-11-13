import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateStripeId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { orderRef, paymentIntentId } = await req.json();

    if (!orderRef && !paymentIntentId) {
      return NextResponse.json({ error: "Missing orderRef or paymentIntentId" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          ...(orderRef ? [{ orderRef }] : []),
          ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
        ],
      },
      include: { wallet: { include: { user: true } } },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Pending transaction not found" }, { status: 404 });
    }

    if (transaction.status === "SUCCEEDED") {
      return NextResponse.json({ message: "Transaction already processed", transaction });
    }

    // Process success
    const result = await prisma.$transaction(async (tx) => {
      const newBalance = transaction.wallet.balance + transaction.creditsChange;
      const chargeId = generateStripeId("ch");

      const updatedWallet = await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: newBalance,
          lifetimeSpentCents: { increment: transaction.amountCents },
          lifetimeCreditsGranted: { increment: transaction.creditsChange },
        },
      });

      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCEEDED",
          balanceAfter: newBalance,
          stripeChargeId: chargeId,
        },
      });

      // Add a usage log entry for ledger transparency
      await tx.usageLog.create({
        data: {
          walletId: transaction.walletId,
          serviceName: `Stripe Wallet Credit: ${transaction.description}`,
          serviceCategory: "TOP_UP",
          creditsCost: 0,
          balanceAfter: newBalance,
          executionTimeMs: 95,
          payloadSnippet: `Settled via Stripe Charge [${chargeId}] / Intent [${transaction.stripePaymentIntentId}] for $${(transaction.amountCents / 100).toFixed(2)} ${transaction.currency}`,
        },
      });

      return { wallet: updatedWallet, transaction: updatedTx };
    });

    return NextResponse.json({
      success: true,
      wallet: result.wallet,
      transaction: result.transaction,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
