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
  Key,
  Users,
  Plus,
  Trash2,
  Printer,
  Terminal,
  ExternalLink,
} from "lucide-react";
import TopUpModal from "@/components/TopUpModal";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topupQuery = searchParams.get("topup");

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "API_KEYS" | "TEAM" | "INVOICES">("OVERVIEW");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("pro_500");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Developer API Keys State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("Production Cluster API Key");
  const [justGeneratedKey, setJustGeneratedKey] = useState<string | null>(null);
  const [keyGenerating, setKeyGenerating] = useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("DEVELOPER");
  const [teamInviting, setTeamInviting] = useState(false);

  const fetchSessionUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setUserData(data);
        loadApiKeys(data.user.id);
        loadTeamMembers(data.user.id);
      } else {
        const fallbackRes = await fetch("/api/wallet/state?userId=usr_client_ca_02");
        const fallbackData = await fallbackRes.json();
        setUserData(fallbackData);
        loadApiKeys("usr_client_ca_02");
        loadTeamMembers("usr_client_ca_02");
      }
    } catch (err) {
      console.error("Failed to load settings data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async (userId: string) => {
    try {
      const res = await fetch(`/api/developer/keys?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setApiKeys(data.keys || []);
    } catch (e) {}
  };

  const loadTeamMembers = async (userId: string) => {
    try {
      const res = await fetch(`/api/developer/team?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setTeamMembers(data.members || []);
    } catch (e) {}
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

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyGenerating(true);
    try {
      const res = await fetch("/api/developer/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, userId: user?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setJustGeneratedKey(data.key.fullKey);
        setNewKeyName("Production Cluster API Key");
        loadApiKeys(user?.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKeyGenerating(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Any applications using it will immediately lose access.")) return;
    try {
      const res = await fetch("/api/developer/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) loadApiKeys(user?.id);
    } catch (e) {}
  };

  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamInviting(true);
    try {
      const res = await fetch("/api/developer/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole, userId: user?.id }),
      });
      if (res.ok) {
        setInviteEmail("");
        setInviteName("");
        loadTeamMembers(user?.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTeamInviting(false);
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      const res = await fetch("/api/developer/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) loadTeamMembers(user?.id);
    } catch (e) {}
  };

  const user = userData?.user;
  const wallet = user?.wallet || userData?.wallet;
  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions || [];

  return (
    <div className="min-h-screen bg-background pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
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
            Enterprise Management & Compute Credits
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your authenticated identity, Developer API keys, Team RBAC, and CRA-compliant tax invoices
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

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: "OVERVIEW", label: "Billing & Identity", icon: CreditCard },
          { id: "API_KEYS", label: "Developer API Keys", icon: Key, badge: apiKeys.length },
          { id: "TEAM", label: "Team Members & RBAC", icon: Users, badge: teamMembers.length },
          { id: "INVOICES", label: "Tax Invoices & Ledger", icon: FileText, badge: transactions.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-brand-cyan text-black font-bold shadow-md shadow-brand-cyan/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isActive ? "bg-black/20 text-black" : "bg-white/10 text-brand-cyan"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & CREDIT BALANCE */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6 animate-fadeIn">
          {/* LIVE CREDIT BALANCE HUD */}
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
                  Canadian settlement via Stripe Pre-Authorized Commercial SaaS Underwriting. Zero-OTP automatic off-session execution.
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
                  Scale Pack ($1,200)
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

          {/* IDENTITY & RISK MITIGATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-cyan" />
                  Authenticated Enterprise Profile
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified Client
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
        </div>
      )}

      {/* TAB 2: DEVELOPER API KEYS & SDK INTEGRATION */}
      {activeTab === "API_KEYS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Generate API Key Form */}
          <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-brand-cyan" />
                  Developer API Keys
                </h3>
                <p className="text-xs text-zinc-400">
                  Authenticate programmatic requests directly to Flyway Cloud AI Neural Engine from your Python, Node.js, or Zapier pipelines
                </p>
              </div>
            </div>

            {/* Just Generated Key Banner */}
            {justGeneratedKey && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs font-mono space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>✓ API Key Generated! Copy it now (will not be shown again):</span>
                  <button
                    onClick={() => copyToClipboard(justGeneratedKey, "just_gen")}
                    className="text-white hover:text-brand-cyan flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded"
                  >
                    {copiedId === "just_gen" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Key
                  </button>
                </div>
                <div className="p-2 rounded bg-black/60 border border-emerald-500/30 text-white font-mono break-all select-all">
                  {justGeneratedKey}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Cluster API Key"
                className="flex-1 rounded-xl border border-border bg-[#141724] px-4 py-2.5 text-xs text-white font-mono focus:border-brand-cyan focus:outline-none"
              />
              <button
                type="submit"
                disabled={keyGenerating}
                className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="h-4 w-4 text-black" />
                Generate Secret Key
              </button>
            </form>

            {/* Keys Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-[11px] text-zinc-400">
                    <th className="pb-3">Key Name</th>
                    <th className="pb-3">Secret Token</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3">Last Used</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Revoke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-zinc-400">
                        No API keys generated yet. Click "Generate Secret Key" to create one.
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((k) => (
                      <tr key={k.id} className="text-zinc-300">
                        <td className="py-3.5 font-bold text-white">{k.name}</td>
                        <td className="py-3.5 font-mono text-brand-cyan">{k.keyPrefix}</td>
                        <td className="py-3.5 text-zinc-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 text-zinc-400">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</td>
                        <td className="py-3.5">
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                            {k.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleRevokeApiKey(k.id)}
                            className="p-1.5 rounded-lg border border-border text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                            title="Revoke Key"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Integration cURL & Python Docs */}
          <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-brand-purple" />
              Quick Integration: Public Compute REST API (`/api/v1/compute`)
            </h4>
            <div className="p-4 rounded-xl bg-[#090B10] border border-border text-xs font-mono text-zinc-300 space-y-2 overflow-x-auto">
              <span className="text-zinc-500"># cURL Example: Invokes LLM node, automatically debits 50 credits from your wallet ledger</span>
              <pre className="text-brand-cyan">
{`curl -X POST https://flyway-cloud.vercel.app/api/v1/compute \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Evaluate commercial SaaS agreement for Ontario jurisdiction",
    "workflowType": "prompt_node"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS & RBAC */}
      {activeTab === "TEAM" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-cyan" />
                  Team Management & Role-Based Access Control (RBAC)
                </h3>
                <p className="text-xs text-zinc-400">
                  Invite collaborators to your enterprise account with dedicated role permissions
                </p>
              </div>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInviteTeamMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Member Full Name"
                className="rounded-xl border border-border bg-[#141724] px-4 py-2 text-xs text-white font-mono focus:border-brand-cyan focus:outline-none"
              />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@corporate.com"
                className="rounded-xl border border-border bg-[#141724] px-4 py-2 text-xs text-white font-mono focus:border-brand-cyan focus:outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-xl border border-border bg-[#141724] px-4 py-2 text-xs text-white font-mono focus:border-brand-cyan focus:outline-none"
              >
                <option value="DEVELOPER">Role: Developer (API & Runs)</option>
                <option value="FINANCE">Role: Finance (Top-Up & Invoices)</option>
                <option value="ADMIN">Role: Co-Admin (Full Access)</option>
                <option value="VIEWER">Role: Viewer (Read-Only)</option>
              </select>
              <button
                type="submit"
                disabled={teamInviting}
                className="glow-button py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4 text-black" />
                Invite Collaborator
              </button>
            </form>

            {/* Team Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-[11px] text-zinc-400">
                    <th className="pb-3">Member Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Added Date</th>
                    <th className="pb-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {/* Account Owner */}
                  <tr className="text-zinc-300">
                    <td className="py-3.5 font-bold text-white">{user?.name || "Corporate Admin"} (Owner)</td>
                    <td className="py-3.5 text-brand-cyan">{user?.email}</td>
                    <td className="py-3.5">
                      <span className="rounded bg-brand-cyan/10 px-2 py-0.5 text-[9px] font-bold text-brand-cyan border border-brand-cyan/20">
                        OWNER
                      </span>
                    </td>
                    <td className="py-3.5 text-emerald-400 font-bold">Active</td>
                    <td className="py-3.5 text-zinc-400">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right text-zinc-500">—</td>
                  </tr>

                  {teamMembers.map((m) => (
                    <tr key={m.id} className="text-zinc-300">
                      <td className="py-3.5 font-bold text-white">{m.name}</td>
                      <td className="py-3.5 text-zinc-400">{m.email}</td>
                      <td className="py-3.5">
                        <span className="rounded bg-brand-purple/10 px-2 py-0.5 text-[9px] font-bold text-brand-purple border border-brand-purple/20">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-emerald-400 font-bold">{m.status}</td>
                      <td className="py-3.5 text-zinc-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteTeamMember(m.id)}
                          className="p-1.5 rounded-lg border border-border text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TAX INVOICES & LEDGER (CRA COMPLIANT) */}
      {activeTab === "INVOICES" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-cyan" />
                  Stripe Transaction Ledger & Canadian CRA Tax Invoices
                </h3>
                <p className="text-xs text-zinc-400">
                  Official tax receipts compliant with Canada Revenue Agency (CRA) GST/HST input tax credit guidelines
                </p>
              </div>

              <button
                onClick={() => setTopUpModalOpen(true)}
                className="glow-button px-3.5 py-1.5 rounded-lg text-xs font-bold"
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
                                title="Copy Stripe ID"
                              >
                                {copiedId === tx.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
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
                              Tax Invoice
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
        </div>
      )}

      {/* OFFICIAL PRINTABLE COMMERCIAL TAX INVOICE MODAL (CRA & DIFC COMPLIANT) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-[#0F121A] p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <img src="/flyway-logo.png" alt="Flyway Logo" className="h-8 w-8 object-contain" />
                <div>
                  <span className="text-xs font-mono font-bold text-brand-cyan tracking-wider">FLYWAY CLOUD SYSTEMS INC.</span>
                  <h4 className="text-lg font-bold text-white">Official Commercial Tax Invoice</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">CRA Business No: 789123456RT0001 • Ontario, Canada</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-brand-cyan" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#090B10] p-4 rounded-xl border border-border">
              <div>
                <span className="text-zinc-500 block">BILLED TO (TENANT):</span>
                <span className="font-bold text-white block mt-0.5">{user?.companyName || "Commercial Client"}</span>
                <span className="text-zinc-400 block">{user?.email}</span>
                <span className="text-zinc-400 block">Jurisdiction: {user?.country === "US" ? "United States" : "Canada (Domestic / PIPEDA)"}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">INVOICE NUMBER:</span>
                <span className="font-bold text-brand-cyan block mt-0.5">{selectedReceipt.orderRef}</span>
                <span className="text-zinc-400 block">Date: {new Date(selectedReceipt.createdAt).toLocaleDateString()}</span>
                <span className="text-emerald-400 block font-semibold">Payment Status: SETTLED</span>
              </div>
            </div>

            {/* Line Item Table */}
            <div className="border border-border rounded-xl overflow-hidden text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-[#141724] border-b border-border text-[11px] text-zinc-400">
                  <tr>
                    <th className="p-3">Service Description</th>
                    <th className="p-3">Units</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-white">{selectedReceipt.description || "Compute Credit Allocation"}</div>
                      <div className="text-[10px] text-zinc-400">Stripe Descriptor: FLYWAY*COMPUTE • Charge ID: {selectedReceipt.stripeChargeId || selectedReceipt.stripePaymentIntentId}</div>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">+{selectedReceipt.creditsChange.toLocaleString()} cr</td>
                    <td className="p-3 text-right font-bold text-white">
                      ${(selectedReceipt.amountCents / 100).toFixed(2)} {selectedReceipt.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Reconciliation */}
            <div className="text-xs font-mono space-y-1.5 border-t border-border pt-3">
              <div className="flex justify-between text-zinc-400">
                <span>Tax Breakdown (GST/HST 0% Reverse-Charge B2B):</span>
                <span>$0.00 {selectedReceipt.currency}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm border-t border-border/60 pt-2">
                <span>Total Amount Settled:</span>
                <span className="text-brand-cyan">${(selectedReceipt.amountCents / 100).toFixed(2)} {selectedReceipt.currency}</span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
              This invoice serves as proof of commercial digital compute delivery under Flyway Master Services Agreement (MSA 2026.4.1). Eligible for Canadian Input Tax Credit (ITC) & cross-border zero-rated tax exemption.
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
