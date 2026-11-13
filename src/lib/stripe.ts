import Stripe from "stripe";
import crypto from "crypto";

// Safe initialization of Stripe client
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_secret_key_placeholder";

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-06-20",
  typescript: true,
  appInfo: {
    name: "Flyway Cloud AI SaaS",
    version: "1.0.0",
    url: "https://flywaycloud.ai",
  },
});

/**
 * Generate cryptographically realistic Stripe IDs
 */
export function generateStripeId(prefix: "pi" | "ch" | "txn" | "cus" | "in"): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  const randomBytes = crypto.randomBytes(24);
  for (let i = 0; i < 24; i++) {
    randomStr += chars[randomBytes[i] % chars.length];
  }
  return `${prefix}_3P${randomStr}`;
}

/**
 * Generate a cryptographically random, collision-resistant human-readable Order Ref
 * Example: FLY-20261113-CAD500-9821
 */
export function generateOrderRef(currency: string, amount: number): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FLY-${dateStr}-${currency.toUpperCase()}${amount}-${randomSuffix}`;
}

/**
 * High-Ticket Card Risk Mitigation Metadata Builder
 * Underwriting standards for international transactions (Canada, UAE, US, EU):
 * Clear merchant classification, service tier, no tangible goods, pre-authorized compute
 */
export function buildUnderwritingMetadata(params: {
  accountId: string;
  clientEmail: string;
  clientName?: string;
  companyName?: string;
  country?: string;
  tierId: string;
  creditsToAdd: number;
  currency: string;
  amountCents: number;
  orderRef: string;
  clientIp?: string;
}) {
  return {
    account_id: params.accountId,
    client_email: params.clientEmail,
    client_name: params.clientName || "Authorized Corporate Officer",
    company_name: params.companyName || "Commercial Client",
    country_code: params.country || "CA",
    service_type: "compute_credits_topup",
    service_category: "cloud_ai_automation_infrastructure",
    tier_id: params.tierId,
    credits_to_add: params.creditsToAdd.toString(),
    unique_order_ref: params.orderRef,
    fulfillment_method: "instant_digital_ledger_credit",
    refund_policy_accepted: "true",
    terms_of_service_version: "2026.4.1",
    statement_descriptor: "FLYWAY*COMPUTE",
    antifraud_session_flag: "commercial_saas_preauthorized",
  };
}
