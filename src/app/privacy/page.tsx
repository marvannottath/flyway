import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
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
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
          Compliance & Data Governance
        </span>
        <h1 className="text-3xl font-extrabold text-white">Privacy & Data Security Policy</h1>
        <p className="text-xs text-zinc-400">PIPEDA (Canada), GDPR (EU), and DIFC Data Protection Law Compliant</p>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            1. Zero Foundation Model Training Guarantee
          </h2>
          <p>
            Flyway Cloud AI does not store, train on, or allow third parties to train machine learning models on any customer prompts, uploaded document scans, financial ledger data, or workflow execution payloads. All data is processed in ephemeral memory and discarded immediately following extraction.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            2. Payment Security & Stripe PCI DSS Level 1 Compliance
          </h2>
          <p>
            Flyway never stores, logs, or transmits raw credit card numbers or security CVV codes. All payments are tokenized directly via Stripe's encrypted payment vault operating under PCI DSS Level 1 certification. Transactions are encrypted using 256-bit TLS across regional endpoints.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            3. Regional Data Residency
          </h2>
          <p>
            Clients may select regional routing for compute workloads between Canada (Montreal/Toronto), United States (East/West), Europe (Frankfurt), and UAE (Dubai ADGM). All personal identifiable information is safeguarded in accordance with local data protection frameworks.
          </p>
        </section>
      </div>
    </div>
  );
}
