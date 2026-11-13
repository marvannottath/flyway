"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Terminal,
  Flame,
  PlusCircle,
  Sliders,
  RotateCw,
  ShieldAlert,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Lock,
} from "lucide-react";

export default function AdminConsolePage() {
  const [adminSecret, setAdminSecret] = useState("flyway_master_admin_bypass_98124");
  const [authorized, setAuthorized] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected User for action
  const [selectedUserId, setSelectedUserId] = useState<string>("usr_client_ca_02");
  const [customDelta, setCustomDelta] = useState<number>(-500);
  const [customReason, setCustomReason] = useState<string>("QA Real Card Top-Up Burn Test");
  const [actionSuccess, setActionSuccess] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load all users
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users?token=${adminSecret}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load admin user data");
      }
      setUsers(data.users);
      setStats(data.stats);
      setAuthorized(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate admin session");
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Adjustment
  const handleAdjustCredits = async (
    action: "SET_TO_ZERO" | "ADD_50K" | "CUSTOM_ADJUST"
  ) => {
    setActionLoading(true);
    setActionSuccess(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/adjust-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          action,
          amount: action === "CUSTOM_ADJUST" ? customDelta : undefined,
          reason: customReason,
          adminSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setActionSuccess(data);
      // Immediately refresh users to show live updated balances
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Credit adjustment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-[#07080D] pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-[11px] font-mono font-bold mb-2">
            <Terminal className="h-3.5 w-3.5" />
            SECRET SUPER-ADMIN TESTING CONSOLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Credit Burn & Wallet Reset Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Zero out or inject compute balances on demand to test high-ticket card top-ups back-to-back.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Admin Secret Token"
            className="rounded-lg border border-border bg-[#10131C] px-3 py-1.5 text-xs font-mono text-zinc-200 focus:border-brand-purple focus:outline-none"
          />
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all flex items-center gap-1"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Aggregate Network Metrics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-[#0E1018] p-5">
            <span className="text-xs text-zinc-400">Total Registered Tenants</span>
            <div className="mt-1 text-2xl font-bold font-mono text-white">
              {stats.totalUsers} Enterprises
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-[#0E1018] p-5">
            <span className="text-xs text-zinc-400">Compute Credits in Circulation</span>
            <div className="mt-1 text-2xl font-bold font-mono text-brand-cyan">
              {stats.totalCreditsInCirculation.toLocaleString()} Units
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-[#0E1018] p-5">
            <span className="text-xs text-zinc-400">Total Billed Volume</span>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
              ${stats.totalRevenueCAD} CAD
            </div>
          </div>
        </div>
      )}

      {/* Action Notification */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-mono text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <strong>Action Succeeded:</strong> Balance changed from{" "}
              <span className="text-zinc-300 font-bold">{actionSuccess.previousBalance.toLocaleString()}</span> →{" "}
              <span className="text-white font-bold">{actionSuccess.newBalance.toLocaleString()}</span> (Delta:{" "}
              <span className={actionSuccess.creditsDelta < 0 ? "text-red-400" : "text-emerald-400"}>
                {actionSuccess.creditsDelta > 0 ? "+" : ""}{actionSuccess.creditsDelta.toLocaleString()}
              </span>
              )
            </div>
          </div>
          <span className="text-[10px] text-zinc-400">{actionSuccess.transaction?.orderRef}</span>
        </div>
      )}

      {/* Super-Admin Burn Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection & Burn Control (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-brand-purple/40 bg-[#0E101A] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Manual Credit Burn / Reset Tool
                </h3>
                <p className="text-xs text-zinc-400">
                  Select a tenant to manipulate balance state in real-time
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-md border border-brand-purple/30">
              Immediate Ledger Commit
            </span>
          </div>

          {/* User Selector Dropdown */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Target Tenant Account:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-border bg-[#141724] px-4 py-2.5 text-xs text-white font-mono focus:border-brand-purple focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.companyName} ({u.country}) | Balance: {u.wallet?.balance?.toLocaleString()} Credits
                </option>
              ))}
            </select>
          </div>

          {/* Target User Info Card */}
          {selectedUser && (
            <div className="rounded-xl border border-border bg-[#121522] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-400">Live Credit Balance</span>
                <div className="text-2xl font-extrabold font-mono text-brand-cyan">
                  {(selectedUser.wallet?.balance || 0).toLocaleString()} Credits
                </div>
                <div className="text-[11px] text-zinc-400">
                  Account ID: <code className="text-zinc-300">{selectedUser.id}</code>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard`}
                  className="text-xs text-brand-cyan border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 rounded-lg hover:bg-brand-cyan/20 transition-colors"
                >
                  View Client Dashboard →
                </Link>
              </div>
            </div>
          )}

          {/* ONE-CLICK ACTION BUTTONS */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-zinc-300 block">
              Direct Sandbox Intervention Actions:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Deduct All Credits (Set to 0) */}
              <button
                type="button"
                onClick={() => handleAdjustCredits("SET_TO_ZERO")}
                disabled={actionLoading}
                className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all text-left flex items-start gap-3 group"
              >
                <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 text-red-400 group-hover:scale-105 transition-transform">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-300">
                    [Deduct All Credits (Set to 0)]
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Instantly wipes wallet so you can test low-balance top-up alerts with a real card.
                  </div>
                </div>
              </button>

              {/* Button 2: Add +50,000 Credits */}
              <button
                type="button"
                onClick={() => handleAdjustCredits("ADD_50K")}
                disabled={actionLoading}
                className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all text-left flex items-start gap-3 group"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    [Add +50,000 Credits]
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Instantly injects 50k compute credits into the wallet with zero charge.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Delta Adjustment */}
          <div className="rounded-xl border border-border bg-[#121522] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sliders className="h-4 w-4 text-brand-purple" />
              <span>Custom Delta Adjustment (+/- Credits)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Credits Delta (Negative to burn, positive to add)
                </label>
                <input
                  type="number"
                  value={customDelta}
                  onChange={(e) => setCustomDelta(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-[#090B10] px-3 py-1.5 text-xs font-mono text-white focus:border-brand-purple focus:outline-none"
                  placeholder="-500 or +10000"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Audit Reason / QA Tag
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full rounded-lg border border-border bg-[#090B10] px-3 py-1.5 text-xs text-white focus:border-brand-purple focus:outline-none"
                  placeholder="Testing repeat top-up"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAdjustCredits("CUSTOM_ADJUST")}
              disabled={actionLoading}
              className="w-full py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Apply Custom Delta ({customDelta > 0 ? "+" : ""}{customDelta} Credits)
            </button>
          </div>
        </div>

        {/* Live System Tenant Roster (1 Col) */}
        <div className="rounded-2xl border border-border bg-[#0E1018] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Users className="h-4 w-4 text-brand-cyan" />
              Registered Tenants ({users.length})
            </h4>
            <span className="text-[10px] text-zinc-400 font-mono">Live Sync</span>
          </div>

          <div className="space-y-3">
            {users.map((u) => {
              const isSelected = u.id === selectedUserId;
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-border bg-[#131622] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-zinc-400">{u.companyName}</div>
                    </div>
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 border border-border">
                      {u.country}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2 font-mono">
                    <span className="text-[10px] text-zinc-400">Balance:</span>
                    <span
                      className={`text-xs font-bold ${
                        (u.wallet?.balance || 0) < 100 ? "text-red-400" : "text-brand-cyan"
                      }`}
                    >
                      {(u.wallet?.balance || 0).toLocaleString()} Credits
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
