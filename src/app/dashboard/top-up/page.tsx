"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import TopUpModal from "@/components/TopUpModal";

export default function TopUpDedicatedPage() {
  const [modalOpen, setModalOpen] = useState(true);
  const [userId, setUserId] = useState<string>("usr_client_ca_02");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUserId(data.user.id);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand-cyan transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to Client Workspace
      </Link>

      <div className="rounded-2xl border border-border bg-[#0D0F17] p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mx-auto">
          <Zap className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Stripe Wallet Top-Up & Allocation Terminal
        </h1>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto">
          Pre-authorize compute units using Stripe with high-ticket underwriting parameters ($250, $500, $1,200, $2,500 CAD/USD).
        </p>

        <button
          onClick={() => setModalOpen(true)}
          className="glow-button px-6 py-3 rounded-xl font-bold text-xs inline-flex items-center gap-2"
        >
          <Zap className="h-4 w-4 fill-black" />
          Open Checkout Terminal
        </button>
      </div>

      <TopUpModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}
