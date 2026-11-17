export interface CreditTier {
  id: string;
  name: string;
  tagline: string;
  priceCAD: number;
  priceUSD: number;
  credits: number;
  bonusCredits: number;
  popular?: boolean;
  enterprise?: boolean;
  features: string[];
  unitCostCAD: number; // e.g. $0.01 per credit
}

export const CREDIT_TIERS: CreditTier[] = [
  {
    id: "micro_test_5",
    name: "Developer Micro-Test",
    tagline: "Live card tokenization & instant compute test",
    priceCAD: 5,
    priceUSD: 4,
    credits: 500,
    bonusCredits: 0,
    unitCostCAD: 0.01,
    features: [
      "500 Live Compute Credits",
      "Instant Card Setup & Vaulting (MIT off-session)",
      "Automated Balance Top-Up Rail Verification",
      "Zero Setup Fees & Instant Activation",
    ],
  },
  {
    id: "starter_250",
    name: "Starter Fleet",
    tagline: "Essential compute for growing AI production pipelines",
    priceCAD: 250,
    priceUSD: 185,
    credits: 25000,
    bonusCredits: 0,
    unitCostCAD: 0.01,
    features: [
      "25,000 Compute Units (Valid for 12 mos)",
      "Up to 25 Concurrent AI Workflow Nodes",
      "Standard LLM & OCR Extraction API",
      "Sub-second Execution Latency",
      "Webhook & REST API Access",
      "Email Support (24h SLA)",
    ],
  },
  {
    id: "pro_500",
    name: "Pro Scaling Pack",
    tagline: "High-throughput capacity with 20% bonus volume",
    priceCAD: 500,
    priceUSD: 370,
    credits: 60000, // 50k + 10k bonus
    bonusCredits: 10000,
    popular: true,
    unitCostCAD: 0.0083,
    features: [
      "60,000 Compute Units (Includes 10k Bonus)",
      "Up to 100 Concurrent AI Workflow Nodes",
      "Priority Pipeline Queueing",
      "Document Intelligence & OCR Pipeline",
      "Custom Webhook Handlers & Retries",
      "Priority Support (4h SLA)",
      "Zero Overcharge Guarantee",
    ],
  },
  {
    id: "enterprise_1200",
    name: "Enterprise Fleet",
    tagline: "Dedicated cloud clusters for heavy fintech & AI workloads",
    priceCAD: 1200,
    priceUSD: 890,
    credits: 160000, // 120k + 40k bonus
    bonusCredits: 40000,
    unitCostCAD: 0.0075,
    features: [
      "160,000 Compute Units (Includes 40k Bonus)",
      "Unlimited Concurrent AI Workflows",
      "Dedicated High-Memory Vector Worker Pool",
      "Global Edge Distribution (Canada, US, UAE, EU)",
      "99.99% Uptime SLA with Burst Guarantees",
      "Dedicated Account Engineer & Slack Channel",
    ],
  },
  {
    id: "custom_2500",
    name: "Custom High-Compute",
    tagline: "Institutional scale for multi-tenant LLM & ETL automation",
    priceCAD: 2500,
    priceUSD: 1850,
    credits: 360000, // 250k + 110k bonus
    bonusCredits: 110000,
    enterprise: true,
    unitCostCAD: 0.0069,
    features: [
      "360,000+ Scalable Compute Units",
      "Custom Model Fine-Tuning & Self-Hosted Nodes",
      "Bespoke Data Residency (Canada PIPEDA / UAE ADGM)",
      "SOC 2 Type II & ISO 27001 Compliance Reports",
      "Custom Wire / ACH / High-Ticket Card Processing",
      "15-minute Emergency Response SLA",
    ],
  },
];

export function getTierById(id: string): CreditTier | undefined {
  return CREDIT_TIERS.find((t) => t.id === id);
}

export function calculateCustomCredits(amountCAD: number): number {
  // Base 100 credits per $1 CAD + tiered bonus multiplier
  if (amountCAD >= 2500) {
    return Math.floor(amountCAD * 144); // ~360k for $2500
  }
  if (amountCAD >= 1200) {
    return Math.floor(amountCAD * 133); // ~160k for $1200
  }
  if (amountCAD >= 500) {
    return Math.floor(amountCAD * 120); // ~60k for $500
  }
  return Math.floor(amountCAD * 100); // 25k for $250
}
