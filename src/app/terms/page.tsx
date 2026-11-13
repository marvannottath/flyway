import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand-cyan transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to Home
      </Link>

      <div className="space-y-2 border-b border-border/80 pb-6">
        <span className="text-xs font-mono text-brand-cyan uppercase tracking-wider">
          Legal Agreement • Version 2026.4.1
        </span>
        <h1 className="text-3xl font-extrabold text-white">Master Services Agreement (MSA)</h1>
        <p className="text-xs text-zinc-400">Effective Date: April 1, 2026</p>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            1. Nature of the Service & Pre-Authorized Compute Credits
          </h2>
          <p>
            Flyway Cloud AI Systems Inc. ("Flyway", "we", "our") provides an enterprise cloud platform for artificial intelligence workflow orchestration, document intelligence extraction, and high-concurrency neural compute pipelines. By purchasing Compute Credits or Wallet Top-Ups, Client acquires pre-purchased digital units of compute consumed across Flyway API endpoints and worker nodes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            2. Commercial Underwriting & High-Ticket Transactions
          </h2>
          <p>
            Transactions exceeding $250 CAD or equivalent in USD represent pre-authorized commercial allocations intended for business-to-business (B2B) use. By providing credit card details through our tokenized Stripe Elements processor, Client authorizes Flyway to pre-authorize off-session charges for recurring auto-topup allocations when compute balances drop below designated minimum thresholds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            3. Credit Expiration & Consumption
          </h2>
          <p>
            Purchased Compute Credits remain valid for a period of twelve (12) calendar months from the timestamp of ledger settlement. Credits are deducted automatically per invocation according to the published pricing schedule (e.g., 50 credits per LLM node, 150 credits per OCR page, 500 credits per distributed batch workflow).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            4. Service Level Agreement (SLA) & Jurisdiction
          </h2>
          <p>
            Flyway provides a 99.99% monthly infrastructure uptime guarantee. This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, with international arbitration available under DIFC-LCIA rules for UAE and Middle Eastern clients.
          </p>
        </section>
      </div>
    </div>
  );
}
