import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { CREDIT_TIERS, getTierById } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { tierId = "micro_test_5", currency = "CAD", customAmount, userId: explicitUserId } = await req.json();

    const targetUserId = explicitUserId || sessionCookie || "usr_client_ca_02";

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    let amountCents = 500;
    let creditsToAdd = 500;
    let tierName = "Developer Micro-Test";

    if (tierId === "custom") {
      const val = Number(customAmount) || 5;
      amountCents = Math.round(val * 100);
      creditsToAdd = Math.round(val * 100);
      tierName = `Custom AI Compute ($${val} ${currency})`;
    } else {
      const tier = getTierById(tierId);
      if (tier) {
        amountCents = Math.round((currency === "USD" ? tier.priceUSD : tier.priceCAD) * 100);
        creditsToAdd = tier.credits;
        tierName = tier.name;
      }
    }

    const origin = req.headers.get("origin") || "https://flyway-cloud.vercel.app";
    const orderRef = `FLY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Flyway Cloud: ${tierName}`,
              description: `${creditsToAdd.toLocaleString()} Neural Compute Credits (Valid across all AI nodes)`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user.email,
      metadata: {
        account_id: user.id,
        credits_to_add: String(creditsToAdd),
        unique_order_ref: orderRef,
      },
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: {
          account_id: user.id,
          credits_to_add: String(creditsToAdd),
          unique_order_ref: orderRef,
        },
      },
      success_url: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&credited=${creditsToAdd}`,
      cancel_url: `${origin}/dashboard/settings`,
    });

    // Record pending transaction
    await prisma.transaction.create({
      data: {
        walletId: user.wallet.id,
        type: "TOPUP",
        status: "PENDING",
        amountCents,
        currency: currency.toUpperCase(),
        creditsChange: creditsToAdd,
        balanceAfter: user.wallet.balance + creditsToAdd,
        stripePaymentIntentId: session.id,
        orderRef,
        idempotencyKey: `idemp_${orderRef}`,
        description: `${tierName} - ${creditsToAdd.toLocaleString()} credits`,
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error("Error creating Stripe checkout session:", err);
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
