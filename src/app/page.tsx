"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Cpu,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Database,
  Lock,
  Globe2,
} from "lucide-react";
import { CREDIT_TIERS } from "@/lib/pricing";

export default function LandingPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<"CAD" | "USD">("CAD");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check login state
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleSelectPlan = (tierId: string) => {
    if (currentUser) {
      router.push(`/dashboard/settings?topup=${tierId}`);
    } else {
      router.push(`/login?plan=${tierId}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background radial glowing effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-brand-cyan/15 via-brand-blue/5 to-transparent blur-3xl pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Animated Brand Logo in Hero - Crisp White & High Contrast */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-cyan/60 via-white/40 to-brand-blue/60 opacity-60 blur-xl group-hover:opacity-90 transition-opacity duration-500 animate-pulse" />
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-[#121522] border-2 border-white/30 p-3 shadow-2xl shadow-brand-cyan/30">
              <img
                src="/flyway-logo.png"
                alt="Flyway Cloud AI Official Emblem"
                className="h-full w-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
              />
            </div>
          </div>
        </div>

        {/* Underwriting / Trust Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1 text-xs font-mono text-brand-cyan mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-brand-cyan animate-ping" />
          <span>Underwritten for Enterprise High-Ticket Top-Ups & CAD/USD Settlements</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Flyway — Enterprise AI Automation &{" "}
          <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
            High-Concurrency Cloud Engine
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
          The infrastructure of choice for international fintechs and high-growth SaaS in Canada, the US, UAE, and Europe. Pre-authorize dedicated AI compute credits for multi-agent workflows, instant OCR extraction, and autonomous ETL pipelines.
        </p>

        {/* Primary Clean CTAs (Login First Flow) */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-brand-cyan to-brand-blue hover:opacity-95 shadow-xl shadow-brand-cyan/25 flex items-center justify-center gap-2.5 transition-all group"
          >
            {/* Google Icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#000"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#000"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#000"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#000"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google / Sign In</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <a
            href="#pricing"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-xs text-white border border-border bg-[#11141D] hover:bg-[#181D2A] transition-colors flex items-center justify-center gap-2"
          >
            <span>View Compute Credit Pricing</span>
          </a>
        </div>

        {/* Stats Strip */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border border-border rounded-2xl bg-[#0D0F16]/80 backdrop-blur-md p-6">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">99.99%</div>
            <div className="text-xs text-zinc-400 mt-1">Uptime SLA Guaranteed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-cyan">&lt; 85ms</div>
            <div className="text-xs text-zinc-400 mt-1">Global Pipeline Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-purple">$2,500+</div>
            <div className="text-xs text-zinc-400 mt-1">Institutional Top-Up Tiers</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">Zero</div>
            <div className="text-xs text-zinc-400 mt-1">Duplicate Card Blocks</div>
          </div>
        </div>
      </section>

      {/* CORE SOLUTIONS */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-brand-cyan font-semibold">
            High-Performance Cloud Architecture
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Purpose-built for High-Concurrency Autonomous Intelligence
          </p>
          <p className="mt-4 text-sm text-zinc-300">
            Every compute credit maps directly to dedicated CPU, GPU, and vector pipeline allocations with instant ledger settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glow-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Autonomous AI Workflows</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                Execute multi-step agent graphs and decision trees with high-concurrency event loops.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Throughput:</span>
              <span className="text-brand-cyan">10,000 req/sec</span>
            </div>
          </div>

          <div className="glow-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Document Intelligence</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                Extract structured JSON from balance sheets, invoices, and regulatory filings with 99.8% precision OCR.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Cost Model:</span>
              <span className="text-brand-blue">150 credits / doc</span>
            </div>
          </div>

          <div className="glow-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Vector Embedding Cluster</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                High-dimensional HNSW vectorization nodes with sub-millisecond similarity recall across tens of millions of documents.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Index Latency:</span>
              <span className="text-brand-purple">&lt; 15ms</span>
            </div>
          </div>

          <div className="glow-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Stripe Risk Underwriting</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                Off-session pre-authorizations, dynamic statement descriptors, and commercial entity tags prevent 3DS and fraud alerts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Approval Rate:</span>
              <span className="text-emerald-400">99.4% Authorized</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & CREDIT TIERS */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Transparent Pre-Authorized Compute Credits
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Flexible Usage-Based Credit Tiers
          </h2>
          <p className="mt-4 text-sm text-zinc-300">
            Sign in with your Google account to purchase and allocate credits directly into your verified workspace wallet ledger.
          </p>

          {/* Currency Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-[#141722] border border-border">
            <button
              onClick={() => setCurrency("CAD")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currency === "CAD"
                  ? "bg-brand-cyan text-black shadow-md shadow-brand-cyan/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              CAD ($) — Canadian Native
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currency === "USD"
                  ? "bg-brand-cyan text-black shadow-md shadow-brand-cyan/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              USD ($) — International
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREDIT_TIERS.map((tier) => {
            const price = currency === "USD" ? tier.priceUSD : tier.priceCAD;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  tier.popular
                    ? "border-brand-cyan bg-[#101420] shadow-2xl shadow-brand-cyan/10 scale-[1.02]"
                    : "border-border bg-[#0E1017] hover:border-zinc-700"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-3 py-0.5 text-[10px] font-extrabold uppercase text-black tracking-widest shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    {tier.bonusCredits > 0 && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{tier.bonusCredits.toLocaleString()} Bonus
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 min-h-[32px]">{tier.tagline}</p>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      ${price.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 uppercase">{currency}</span>
                  </div>

                  <div className="mt-2 text-xs font-mono text-brand-cyan flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 fill-brand-cyan/20" />
                    <strong>{tier.credits.toLocaleString()}</strong> Compute Credits
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-zinc-300 border-t border-border/60 pt-4">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-cyan shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-border/60">
                  <button
                    onClick={() => handleSelectPlan(tier.id)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tier.popular
                        ? "bg-gradient-to-r from-brand-cyan to-brand-blue text-black shadow-lg shadow-brand-cyan/20 hover:opacity-95"
                        : "bg-white/10 hover:bg-white/15 text-white"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {currentUser ? `Top-Up ${tier.name}` : `Sign In to Purchase (${tier.name})`}
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center mt-2">
                    Instant automated ledger credit upon login
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Compliance & Merchant Disclaimers */}
        <div className="mt-14 rounded-2xl border border-border bg-[#0C0E14] p-6 max-w-4xl mx-auto text-xs text-zinc-300 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldCheck className="h-4 w-4 text-brand-cyan" />
            <span>Commercial SaaS Merchant Disclosures & Stripe Underwriting Compliance</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Flyway Cloud AI provides commercial business-to-business (B2B) cloud workflow orchestration and artificial intelligence compute capacity. All charges reflect pre-purchased digital service compute units allocated to your client account ledger under standard Master Services Agreement (MSA) terms.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[10px] text-zinc-400 border-t border-border/60">
            <div><strong>Billing Descriptor:</strong> FLYWAY*COMPUTE</div>
            <div><strong>Fulfillment:</strong> Real-Time Ledger Credit</div>
            <div><strong>Customer Support:</strong> billing@flywaycloud.ai</div>
          </div>
        </div>
      </section>
    </div>
  );
}
