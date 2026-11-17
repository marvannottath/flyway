import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, generateOrderRef, buildUnderwritingMetadata, generateStripeId } from "@/lib/stripe";
import { CREDIT_TIERS, getTierById, calculateCustomCredits } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const body = await req.json();
    const { tierId, currency = "CAD", customAmount, userId: explicitUserId } = body;

    const targetUserId = explicitUserId || sessionCookie || "usr_client_ca_02";

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json(
        { error: "User or associated wallet not found in database" },
        { status: 404 }
      );
    }

    let amountInCents = 0;
    let creditsToAdd = 0;
    let tierName = "Custom Top-Up";

    if (tierId === "custom") {
      const amountVal = Number(customAmount) || 2500;
      if (amountVal < 250) {
        return NextResponse.json(
          { error: "Minimum top-up tier is $250 to ensure compliance with enterprise compute allocations." },
          { status: 400 }
        );
      }
      amountInCents = Math.round(amountVal * 100);
      creditsToAdd = calculateCustomCredits(amountVal);
      tierName = `Custom High-Compute ($${amountVal} ${currency})`;
    } else {
      const tier = getTierById(tierId);
      if (!tier) {
        return NextResponse.json({ error: "Invalid credit tier selected" }, { status: 400 });
      }
      const basePrice = currency === "USD" ? tier.priceUSD : tier.priceCAD;
      amountInCents = Math.round(basePrice * 100);
      creditsToAdd = tier.credits;
      tierName = tier.name;
    }

    const orderRef = generateOrderRef(currency, amountInCents / 100);
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // 1. Build comprehensive Stripe underwriting metadata
    const metadata = buildUnderwritingMetadata({
      accountId: user.id,
      clientEmail: user.email,
      clientName: user.name || undefined,
      companyName: user.companyName || undefined,
      country: user.country || "CA",
      tierId,
      creditsToAdd,
      currency,
      amountCents: amountInCents,
      orderRef,
      clientIp,
    });

    let clientSecret: string | null = null;
    let paymentIntentId = generateStripeId("pi");
    let isMockMode = false;

    // Check if Stripe API key is real test key or placeholder
    const isPlaceholder =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes("mock") ||
      process.env.STRIPE_SECRET_KEY.includes("placeholder") ||
      process.env.STRIPE_SECRET_KEY.includes("...");

    if (!isPlaceholder) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency.toLowerCase(),
          description: `Flyway Cloud: ${tierName} (${creditsToAdd.toLocaleString()} Compute Credits)`,
          statement_descriptor_suffix: "FLYWAY AI",
          // Disabled receipt_email: Silent ledger settlement (invoices viewable inside /dashboard/billing)
          setup_future_usage: "off_session", // High-ticket recurring commercial SaaS standard
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
      } catch (stripeErr: any) {
        console.warn("Stripe live API error, falling back to simulator mode:", stripeErr.message);
        isMockMode = true;
        clientSecret = `${paymentIntentId}_secret_${generateStripeId("pi").slice(6)}`;
      }
    } else {
      isMockMode = true;
      clientSecret = `${paymentIntentId}_secret_${generateStripeId("pi").slice(6)}`;
    }

    // Record PENDING transaction in immutable ledger
    await prisma.transaction.create({
      data: {
        walletId: user.wallet.id,
        type: "TOPUP",
        status: "PENDING",
        amountCents: amountInCents,
        currency,
        creditsChange: creditsToAdd,
        balanceAfter: user.wallet.balance + creditsToAdd,
        stripePaymentIntentId: paymentIntentId,
        orderRef,
        idempotencyKey: `idemp_${orderRef}`,
        description: `${tierName} - ${creditsToAdd.toLocaleString()} credits`,
        metadataJson: JSON.stringify(metadata),
      },
    });

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amountCents: amountInCents,
      currency,
      creditsToAdd,
      orderRef,
      isMockMode,
      tierName,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate compute top-up" },
      { status: 500 }
    );
  }
}
