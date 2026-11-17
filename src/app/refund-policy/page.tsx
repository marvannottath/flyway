import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export default function RefundPolicyPage() {
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
          Merchant Underwriting Disclosure
        </span>
        <h1 className="text-3xl font-extrabold text-white">Refund Policy & Credit Disclaimers</h1>
        <p className="text-xs text-zinc-400">Clear Guidelines for Digital Compute Credit Top-Ups</p>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            1. Digital Fulfillment & Immediate Ledger Settlement
          </h2>
          <p>
            Compute credits are digital allocations granted immediately upon authorization by our payment gateway. Because server clusters and dedicated API compute capacity are provisioned instantaneously upon checkout, top-up charges are non-refundable once compute units have been drawn or utilized.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            2. SLA Downtime Credits
          </h2>
          <p>
            In the rare event that Flyway Cloud fails to meet its guaranteed 99.99% monthly infrastructure uptime SLA, Client is entitled to service credits equivalent to 10% of monthly spend for each 0.1% breach below SLA thresholds. Service credits are applied directly to the account ledger balance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            3. Chargeback Avoidance & Pre-Dispute Resolution
          </h2>
          <p>
            If you do not recognize a charge with the statement descriptor <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">FLYWAY*COMPUTE</code> or believe a billing discrepancy occurred, please contact our 24/7 dedicated finance desk at <strong className="text-brand-cyan">flywaycloud@gmail.com</strong> before initiating a bank dispute. Legitimate duplicate charges resulting from gateway connection retries will be voided within 24 business hours.
          </p>
        </section>
      </div>
    </div>
  );
}
