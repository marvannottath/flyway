import Link from "next/link";
import { Shield, Lock, Globe, Server, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#050608] text-xs text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/5 p-0.5 border border-white/10">
                <img
                  src="/flyway-logo.png"
                  alt="Flyway Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-mono">
                FLYWAY CLOUD AI
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              High-concurrency cloud AI workflow orchestrator, document intelligence extraction nodes, and enterprise-grade compute credit engine for global fintech and SaaS platforms.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational (99.99% SLA)
            </div>
          </div>

          {/* Underwriting & Payment Governance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Commercial Billing</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="h-3 w-3 text-brand-cyan" />
                <span>Pre-Authorized Compute Credit Model</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="h-3 w-3 text-brand-cyan" />
                <span>Multi-Currency (CAD / USD Settlement)</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="h-3 w-3 text-brand-cyan" />
                <span>Stripe Certified PCI DSS Level 1</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="h-3 w-3 text-brand-cyan" />
                <span>Instant Digital Fulfillment Ledger</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Regions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Jurisdictions Served</h4>
            <div className="space-y-1.5 text-[11px] text-zinc-400">
              <p><strong className="text-zinc-200">Canada:</strong> PIPEDA compliant, CAD native settlement, GST/HST itemized invoicing.</p>
              <p><strong className="text-zinc-200">United States:</strong> Delaware / Silicon Valley enterprise direct ACH & card corridors.</p>
              <p><strong className="text-zinc-200">UAE & GCC:</strong> Dubai International Financial Centre (DIFC) & ADGM zero-rated export.</p>
              <p><strong className="text-zinc-200">Europe & UK:</strong> GDPR, 3D-Secure 2.2 SCA automated compliance.</p>
            </div>
          </div>

          {/* Legal Pages */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Compliance & Governance</h4>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              <Link href="/terms" className="hover:text-brand-cyan transition-colors">
                Master Services Agreement (Terms)
              </Link>
              <Link href="/privacy" className="hover:text-brand-cyan transition-colors">
                Privacy Policy & Data Security
              </Link>
              <Link href="/refund-policy" className="hover:text-brand-cyan transition-colors">
                Refund Policy & Credit Disclaimers
              </Link>
              <Link href="/contact" className="hover:text-brand-cyan transition-colors">
                Contact Enterprise Support
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-400">
          <p>© {new Date().getFullYear()} Flyway Cloud AI Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-400" /> 256-Bit TLS Encryption</span>
            <span className="flex items-center gap-1"><Server className="h-3 w-3 text-brand-cyan" /> Edge Distributed Latency &lt; 50ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
