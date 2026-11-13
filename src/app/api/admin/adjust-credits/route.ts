import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, amount, reason, adminSecret } = body;

    // Verify Master Admin Secret Key
    const configuredSecret = process.env.ADMIN_API_SECRET || "flyway_master_admin_bypass_98124";
    if (adminSecret !== configuredSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid Super-Admin credential token" },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing target userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: "Target user or wallet not found" }, { status: 404 });
    }

    const currentBalance = user.wallet.balance;
    let newBalance = currentBalance;
    let creditsDelta = 0;
    let actionDesc = "";

    switch (action) {
      case "SET_TO_ZERO":
        creditsDelta = -currentBalance;
        newBalance = 0;
        actionDesc = `Manual Credit Burn (Reset to 0) by Super-Admin`;
        break;

      case "ADD_50K":
        creditsDelta = 50000;
        newBalance = currentBalance + 50000;
        actionDesc = `Manual Grant (+50,000 Compute Credits) by Super-Admin`;
        break;

      case "CUSTOM_ADJUST":
        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount)) {
          return NextResponse.json({ error: "Invalid numeric amount for custom adjustment" }, { status: 400 });
        }
        creditsDelta = parsedAmount;
        newBalance = Math.max(0, currentBalance + parsedAmount);
        actionDesc = `Manual Custom Adjustment (${parsedAmount > 0 ? "+" : ""}${parsedAmount} Credits): ${reason || "QA Sandbox Testing"}`;
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Atomic update of wallet and immutable transaction record
    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          balance: newBalance,
          ...(creditsDelta > 0
            ? { lifetimeCreditsGranted: { increment: creditsDelta } }
            : {}),
        },
      });

      const auditTx = await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: creditsDelta < 0 ? "USAGE_BURN" : "MANUAL_ADJUSTMENT",
          status: "SUCCEEDED",
          amountCents: 0,
          currency: user.wallet!.currency,
          creditsChange: creditsDelta,
          balanceAfter: newBalance,
          orderRef: `ADMIN-ADJ-${Date.now()}-${Math.floor(Math.random() * 900)}`,
          description: actionDesc,
          metadataJson: JSON.stringify({
            admin_operator: "SuperAdmin Console",
            action,
            reason: reason || "Sandbox test cycle",
            previousBalance: currentBalance,
            newBalance,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return { wallet: updatedWallet, transaction: auditTx };
    });

    return NextResponse.json({
      success: true,
      action,
      previousBalance: currentBalance,
      newBalance,
      creditsDelta,
      wallet: result.wallet,
      transaction: result.transaction,
    });
  } catch (error: any) {
    console.error("Admin adjust credits error:", error);
    return NextResponse.json({ error: error.message || "Failed to adjust credits" }, { status: 500 });
  }
}
