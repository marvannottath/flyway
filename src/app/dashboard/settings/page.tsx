"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  CreditCard,
  User,
  ShieldCheck,
  Download,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  Sparkles,
  Copy,
  Check,
  Building2,
  FileText,
} from "lucide-react";
import TopUpModal from "@/components/TopUpModal";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topupQuery = searchParams.get("topup");

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("pro_500");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSessionUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setUserData(data);
      } else {
        const fallbackRes = await fetch("/api/wallet/state?userId=usr_client_ca_02");
        const fallbackData = await fallbackRes.json();
        setUserData(fallbackData);
      }
    } catch (err) {
      console.error("Failed to load settings data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionUser();
    if (topupQuery) {
      setSelectedTier(topupQuery);
      setTopUpModalOpen(true);
    }
  }, [topupQuery]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("flyway_user_id");
      localStorage.removeItem("flyway_user_email");
    }
    router.push("/");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const user = userData?.user;
  const wallet = user?.wallet || userData?.wallet;
  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions || [];

  return (
    <div className="min-h-screen bg-background pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back and Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand-cyan mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Workspace
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Account Settings & Compute Credits
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your authenticated identity, live compute credit allocation, and Stripe settlement ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTopUpModalOpen(true)}
            className="glow-button px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <Zap className="h-4 w-4 fill-black" />
            <span>⚡ Top-Up Credits</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-border text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SECTION 1: LIVE CREDIT BALANCE HUD */}
      <div className="rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-[#101524] via-[#0E1018] to-[#0A0C12] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-brand-cyan uppercase tracking-wider mb-1">
              <Zap className="h-4 w-4 fill-brand-cyan/20" />
              Live Compute Credit Allocation
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {balance.toLocaleString()}
              </span>
              <span className="text-sm font-mono text-zinc-400">
                Credits Available (≈ ${(balance / 100).toFixed(2)} {wallet?.currency || "CAD"})
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl">
              Usage is debited atomically across LLM nodes (50 cr), OCR parsing (150 cr), Vector embeddings (250 cr), and Agent pipelines (500 cr).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedTier("scale_1200");
                setTopUpModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4 text-brand-cyan" />
              Scale Top-Up ($1,200)
            </button>
            <button
              onClick={() => {
                setSelectedTier("starter_250");
                setTopUpModalOpen(true);
              }}
              className="glow-button px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4 fill-black" />
              Quick Top-Up ($250)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: CLIENT IDENTITY & BILLING CONFIG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Identity Profile */}
        <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-brand-cyan" />
              Authenticated Enterprise Profile
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active Tenant
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-zinc-400">Authorized Name:</span>
              <span className="text-white font-semibold">{user?.name || "Corporate Admin"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-zinc-400">Registered Email:</span>
              <span className="text-brand-cyan font-mono">{user?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-zinc-400">Organization:</span>
              <span className="text-white">{user?.companyName || "Enterprise Client"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-zinc-400">Jurisdiction:</span>
              <span className="text-white font-mono">{user?.country === "US" ? "United States (USD)" : "Canada (CAD / PIPEDA)"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Tenant Account ID:</span>
              <span className="text-zinc-400 font-mono text-[10px]">{user?.id || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Auto-Topup & Risk Mitigation */}
        <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              High-Ticket Card Risk Mitigation
            </h3>
            <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">
              MSA Bound
            </span>
          </div>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <div>
                <div className="font-semibold text-white">Pre-Authorized Auto-Topup</div>
                <div className="text-[11px] text-zinc-400">Automatically adds $250 CAD if balance &lt; 100 cr</div>
              </div>
              <button
                type="button"
                onClick={() => setAutoTopUp(!autoTopUp)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoTopUp ? "bg-brand-cyan" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                    autoTopUp ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-zinc-400">Stripe Statement Descriptor:</span>
              <span className="font-mono text-brand-cyan font-bold">FLYWAY*COMPUTE</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-zinc-400">3D Secure / OTP Requirement:</span>
              <span className="text-emerald-400 font-semibold">Exempt (Merchant Initiated MIT)</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Card Risk Score:</span>
              <span className="text-emerald-400 font-mono font-bold">0.02 (Authorized Commercial SaaS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: INVOICE & STRIPE TRANSACTION LEDGER */}
      <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-cyan" />
              Stripe Transaction Ledger & Commercial Invoices
            </h3>
            <p className="text-xs text-zinc-400">
              Itemized record of credit purchases settled via Stripe Payments with unique transaction IDs
            </p>
          </div>

          <button
            onClick={() => setTopUpModalOpen(true)}
            className="glow-button px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            + Top-Up Now
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border text-[11px] text-zinc-400">
                <th className="pb-3">Order Ref</th>
                <th className="pb-3">Stripe Transaction ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount Charged</th>
                <th className="pb-3">Credits Added</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Official Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    No top-up transactions yet. Click <strong>"Top-Up Now"</strong> to add credits.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => {
                  const txId = tx.stripeChargeId || tx.stripePaymentIntentId || "pi_3P...";
                  return (
                    <tr key={tx.id} className="text-zinc-300">
                      <td className="py-3.5 text-brand-cyan font-bold">{tx.orderRef}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-brand-purple font-bold truncate max-w-[170px]" title={txId}>
                            {txId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(txId, tx.id)}
                            className="text-zinc-400 hover:text-white"
                            title="Copy Stripe Transaction ID"
                          >
                            {copiedId === tx.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 text-zinc-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        ${(tx.amountCents / 100).toFixed(2)} {tx.currency}
                      </td>
                      <td className="py-3.5 text-emerald-400 font-bold">
                        +{tx.creditsChange.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(tx)}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-brand-cyan border border-border hover:border-brand-cyan/40 px-2.5 py-1 rounded transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Digital Tax Invoice Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[#0F121A] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/flyway-logo.png" alt="Logo" className="h-6 w-6 object-contain" />
                <div>
                  <span className="text-xs font-mono font-bold text-brand-cyan">FLYWAY CLOUD AI</span>
                  <h4 className="text-base font-bold text-white">Official Commercial Tax Invoice</h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs font-mono space-y-2 text-zinc-300 bg-[#090B10] p-4 rounded-xl border border-border">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order Reference:</span>
                <span className="text-brand-cyan font-bold">{selectedReceipt.orderRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Stripe Payment Intent:</span>
                <span className="text-zinc-200 font-bold truncate max-w-[220px]">
                  {selectedReceipt.stripePaymentIntentId || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Stripe Charge ID:</span>
                <span className="text-brand-purple font-bold truncate max-w-[220px]">
                  {selectedReceipt.stripeChargeId || selectedReceipt.stripePaymentIntentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Processor:</span>
                <span>Stripe Payments Canada / Int.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Statement Descriptor:</span>
                <span className="text-brand-cyan font-bold">FLYWAY*COMPUTE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Client Account:</span>
                <span>{user?.companyName || user?.email}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Settled:</span>
                <span>${(selectedReceipt.amountCents / 100).toFixed(2)} {selectedReceipt.currency}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Credits Credited:</span>
                <span>+{selectedReceipt.creditsChange.toLocaleString()} Compute Credits</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[10px]">
                <span>Settlement Timestamp:</span>
                <span>{new Date(selectedReceipt.createdAt).toISOString()}</span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 text-center">
              This invoice serves as proof of commercial compute allocation under Flyway MSA terms. Valid for GST/HST reverse-charge input credits.
            </p>
          </div>
        </div>
      )}

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        userId={user?.id || "usr_client_ca_02"}
        onSuccess={fetchSessionUser}
        defaultTierId={selectedTier}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SettingsContent />
    </Suspense>
  );
}
