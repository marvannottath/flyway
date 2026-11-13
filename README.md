# Flyway Cloud AI & Workflow Automation Engine
### Enterprise Pre-Authorized Compute Credit & Usage-Based SaaS Platform

[![Next.js 14+](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-green?style=flat&logo=prisma)](https://prisma.io)
[![Stripe Certified](https://img.shields.io/badge/Stripe-PaymentIntents_&_Elements-635BFF?style=flat&logo=stripe)](https://stripe.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Dark_Mode-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

---

## 1. Architectural Overview & Fintech Underwriting Strategy

**Flyway** is an institutional-grade SaaS platform built specifically to support high-ticket, recurring international card top-ups ($250, $500, $1,200, $2,500+ CAD/USD) across Canada, the United States, UAE, and Europe without triggering anti-fraud false positives or card network merchant classification blocks.

### Anti-Fraud & Underwriting Compliance Safeguards
1. **Commercial B2B SaaS Pre-Authorization (`setup_future_usage: 'off_session'`)**:
   Informs Stripe and Visa/Mastercard/Amex acquiring networks that charges represent scheduled compute resource allocations for verified business tenants rather than high-risk consumer card-not-present retail purchases.
2. **Clear Billing Descriptors**:
   Charges appear explicitly as `FLYWAY*COMPUTE` with receipt emails and itemized GST/HST/VAT tax invoices.
3. **Collision-Resistant Idempotency Keys (`orderRef`)**:
   Every PaymentIntent generates an immutable reference (e.g. `FLY-202611-CAD500-XXXX`) and attaches structured underwriting metadata:
   - `service_type: "compute_credits_topup"`
   - `account_id: "<tenant_id>"`
   - `fulfillment_method: "instant_digital_ledger_credit"`
   - `antifraud_session_flag: "commercial_saas_preauthorized"`
4. **Instant Digital Ledger Settlement**:
   Payments credit internal wallet balances atomically using database transactions, eliminating delivery delays and merchant fulfillment disputes.

---

## 2. Directory Structure

```
flyway/
├── .env                              # Stripe, Database & Admin secrets
├── package.json                      # Next.js 14, Stripe, Prisma, Lucide, Tailwind
├── prisma/
│   ├── schema.prisma                 # User, Wallet, Transaction & UsageLog models
│   ├── seed.js                       # SuperAdmin & International enterprise seed data
│   └── dev.db                        # Active SQLite Database
├── src/
│   ├── app/
│   │   ├── admin/page.tsx            # Super-Admin Instant Credit Burn & Reset Console
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── adjust-credits/   # [Burn to 0], [+50k], [Custom Delta]
│   │   │   │   └── users/            # Tenant roster & network telemetry
│   │   │   ├── ai/execute/           # Neural pipeline simulation (deducts 50-500 credits)
│   │   │   ├── wallet/
│   │   │   │   ├── create-intent/    # Stripe PaymentIntent with underwriting metadata
│   │   │   │   ├── simulate-success/ # Instant test-card fulfillment simulator
│   │   │   │   └── state/            # Live wallet balance & transaction ledger
│   │   │   └── webhooks/stripe/      # Stripe webhook handler (idempotent crediting)
│   │   ├── contact/page.tsx          # 24/7 Enterprise support & global offices
│   │   ├── dashboard/
│   │   │   ├── billing/page.tsx      # Invoices, download receipts & saved cards
│   │   │   ├── page.tsx              # Credit Balance HUD & AI Playground
│   │   │   └── top-up/page.tsx       # Dedicated Stripe checkout page
│   │   ├── privacy/page.tsx          # PIPEDA, GDPR, zero model training terms
│   │   ├── refund-policy/page.tsx    # Non-refundable compute allocation terms
│   │   ├── terms/page.tsx            # B2B Master Services Agreement (MSA)
│   │   ├── globals.css               # Linear/Vercel-inspired dark theme & glows
│   │   ├── layout.tsx                # Global layout with navigation & footer
│   │   └── page.tsx                  # Public enterprise landing page & pricing tiers
│   ├── components/
│   │   ├── Footer.tsx                # Compliance links & regional presence
│   │   ├── Navbar.tsx                # Navigation header & quick dashboard link
│   │   └── TopUpModal.tsx            # Stripe Elements checkout modal
│   ├── lib/
│   │   ├── pricing.ts                # $250, $500, $1,200, $2,500 CAD/USD tiers
│   │   ├── prisma.ts                 # Prisma Client singleton
│   │   └── stripe.ts                 # Stripe SDK & metadata builders
│   └── types/index.ts                # TypeScript data interfaces
└── tailwind.config.ts                # High-contrast dark SaaS palette
```

---

## 3. Predefined Credit Tiers

| Tier Name | Price (CAD) | Price (USD) | Credits Granted | Bonus Credits | Unit Cost | Target Workload |
|---|---|---|---|---|---|---|
| **Starter Fleet** | $250 | $185 | 25,000 | 0 | $0.0100 | Testing & Light AI Automations |
| **Pro Scaling Pack** | $500 | $370 | 60,000 | +10,000 (20%) | $0.0083 | Document OCR & Production Pipelines |
| **Enterprise Fleet** | $1,200 | $890 | 160,000 | +40,000 (33%) | $0.0075 | High-Concurrency Multi-Agent Nodes |
| **Custom High-Compute** | $2,500+ | $1,850+ | 360,000+ | +110,000 (44%) | $0.0069 | Institutional Fintech Workloads |

---

## 4. Super-Admin Testing Console (`/admin`)

The secret console allows QA engineers and operators to test real credit card top-ups back-to-back using the same card without waiting for credits to naturally exhaust.

### Available Controls:
- **`[Deduct All Credits (Set to 0)]`**:
  Wipes the selected tenant's wallet to 0 credits. Immediately triggers the dashboard's **Low Balance Critical Alert Banner** and opens the top-up checkout modal.
- **`[Add +50,000 Credits]`**:
  Instantly grants 50k compute units directly into the database ledger without generating a Stripe card charge.
- **`[Custom Adjustment]`**:
  Allows positive or negative arbitrary credit adjustments with audit reason logging.
- **Master Admin Secret Guard**:
  Protected by `flyway_master_admin_bypass_98124` (configured in `.env`).

---

## 5. Quickstart & Verification Commands

```bash
# Navigate to the project root
cd /Users/marvan/.gemini/antigravity/scratch/flyway

# Re-seed test database with international clients
node prisma/seed.js

# Start production server
npm run build && npm run start

# Inspect live endpoints
curl -s "http://localhost:3000/api/wallet/state?userId=usr_client_ca_02"
```
