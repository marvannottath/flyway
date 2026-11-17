"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowLeft,
  Calendar,
  Building,
  RefreshCw,
  Plus,
} from "lucide-react";
import TopUpModal from "@/components/TopUpModal";

export default function BillingPage() {
  const [userId, setUserId] = useState("usr_client_ca_02");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wallet/state?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUserData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const wallet = userData?.wallet;
  const transactions = wallet?.transactions || [];

  return (
    <div className="min-h-screen bg-background pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand-cyan mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to AI Workspace
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Billing, Invoices & Payment Ledger
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enterprise pre-purchased compute credit invoices, reverse charge tax compliance, and automated ledger records
          </p>
        </div>

        <button
          onClick={() => setTopUpModalOpen(true)}
          className="glow-button px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 self-start"
        >
          <Zap className="h-4 w-4 fill-black" />
          <span>⚡ Purchase Compute Credits</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-[#0E1017] p-5">
          <div className="text-xs text-zinc-400">Current Compute Balance</div>
          <div className="mt-2 text-3xl font-black font-mono text-brand-cyan">
            {(wallet?.balance || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Valid for 12 months across all nodes</div>
        </div>

        <div className="rounded-2xl border border-border bg-[#0E1017] p-5">
          <div className="text-xs text-zinc-400">Total Billed to Date</div>
          <div className="mt-2 text-3xl font-black font-mono text-white">
            ${((wallet?.lifetimeSpentCents || 0) / 100).toLocaleString()} {wallet?.currency || "CAD"}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">All invoices cleared via Stripe</div>
        </div>

        <div className="rounded-2xl border border-border bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Auto-Topup Protection</span>
            <span
              onClick={() => setAutoTopUp(!autoTopUp)}
              className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                autoTopUp
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {autoTopUp ? "ENABLED" : "PAUSED"}
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-white">
            $250 CAD reload when &lt; 100 credits
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Guarantees zero AI pipeline downtime</div>
        </div>
      </div>

      {/* Saved Payment Methods & Underwriting */}
      <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-cyan" />
              Corporate Payment Method (Stripe Tokenized)
            </h3>
            <p className="text-xs text-zinc-400">
              High-ticket card pre-authorization with 3DS 2.2 Off-Session verification
            </p>
          </div>
          <button
            onClick={() => setTopUpModalOpen(true)}
            className="text-xs font-semibold text-brand-cyan border border-brand-cyan/30 px-3 py-1.5 rounded-lg hover:bg-brand-cyan/10 transition-colors"
          >
            Update Payment Card
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121520] p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 rounded-lg bg-[#191D2B] border border-border flex items-center justify-center font-mono font-bold text-xs text-white">
              VISA
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">
                •••• •••• •••• 4242
              </div>
              <div className="text-[11px] text-zinc-400">
                Expires 12/28 • Default for auto-reload
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Active Corporate Card</span>
          </div>
        </div>
      </div>

      {/* Invoice History & Digital Receipts */}
      <div className="rounded-2xl border border-border bg-[#0D0F17] p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-cyan" />
          Itemized Invoice & Digital Ledger History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border text-[11px] text-zinc-400">
                <th className="pb-3">Invoice / Order Ref</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Credits Granted</th>
                <th className="pb-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-400">
                    No billing transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="text-zinc-300">
                    <td className="py-3.5 text-brand-cyan font-bold">{tx.orderRef}</td>
                    <td className="py-3.5 text-zinc-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-white">{tx.description}</td>
                    <td className="py-3.5 font-bold text-white">
                      ${(tx.amountCents / 100).toFixed(2)} {tx.currency}
                    </td>
                    <td className="py-3.5 text-emerald-400 font-bold">
                      +{tx.creditsChange.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-brand-cyan border border-border hover:border-brand-cyan/40 px-2 py-1 rounded transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal Drawer */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[#0F121A] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-brand-cyan">FLYWAY CLOUD AI</span>
                <h4 className="text-base font-bold text-white">Official Tax Invoice & Digital Receipt</h4>
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
                <span className="text-zinc-400">Order Ref:</span>
                <span className="text-brand-cyan font-bold">{selectedReceipt.orderRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Date:</span>
                <span>{new Date(selectedReceipt.createdAt).toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Processor:</span>
                <span>Stripe Payments Canada / Int.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Statement Descriptor:</span>
                <span>FLYWAY*COMPUTE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Client Account:</span>
                <span>{userData?.user?.companyName}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Paid:</span>
                <span>${(selectedReceipt.amountCents / 100).toFixed(2)} {selectedReceipt.currency}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Credits Credited:</span>
                <span>+{selectedReceipt.creditsChange.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 text-center">
              This invoice serves as proof of commercial compute allocation under Flyway MSA terms.
            </p>
          </div>
        </div>
      )}

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        userId={userId}
        onSuccess={loadData}
      />
    </div>
  );
}
