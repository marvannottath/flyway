"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  CreditCard,
  User,
  ShieldCheck,
  Download,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  FileText,
  Activity,
  Briefcase,
  Users,
  GitBranch,
  BarChart3,
  Bot,
  Settings,
  Plus,
  Copy,
  Check,
  Filter,
  DollarSign,
  Send,
  Building2,
  PauseCircle,
  PlayCircle,
  Globe2,
} from "lucide-react";
import TopUpModal from "@/components/TopUpModal";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string>("usr_client_ca_02");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "AI_ENGINE" | "CRM" | "HR" | "WORKFLOWS" | "GOVERNANCE"
  >("AI_ENGINE");

  // AI Playground state
  const [workflowType, setWorkflowType] = useState<string>("prompt_node");
  const [promptInput, setPromptInput] = useState<string>("what is marble gallery");
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // CRM State
  const [crmDeals, setCrmDeals] = useState<any[]>([]);
  const [crmStats, setCrmStats] = useState<any>(null);
  const [crmFilter, setCrmFilter] = useState<string>("ALL");
  const [addDealModalOpen, setAddDealModalOpen] = useState(false);
  const [newDealForm, setNewDealForm] = useState({
    companyName: "",
    clientName: "",
    contactEmail: "",
    dealValueCAD: 35000,
    stage: "QUALIFIED",
    probability: 60,
  });

  // HR State
  const [hrEmployees, setHrEmployees] = useState<any[]>([]);
  const [hrStats, setHrStats] = useState<any>(null);
  const [candidateName, setCandidateName] = useState("Alexandre Rostova");
  const [screeningResult, setScreeningResult] = useState<any>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [addEmpModalOpen, setAddEmpModalOpen] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({
    fullName: "",
    workEmail: "",
    department: "Engineering",
    jobTitle: "",
    salaryCAD: 130000,
  });
  const [payrollSimulation, setPayrollSimulation] = useState<string | null>(null);

  // Automations State
  const [automations, setAutomations] = useState<any[]>([]);
  const [automationStats, setAutomationStats] = useState<any>(null);
  const [runningAutoId, setRunningAutoId] = useState<string | null>(null);
  const [lastAutoToast, setLastAutoToast] = useState<string | null>(null);
  const [addWorkflowModalOpen, setAddWorkflowModalOpen] = useState(false);
  const [newWorkflowForm, setNewWorkflowForm] = useState({
    name: "",
    category: "CRM",
    triggerEvent: "On Webhook Event Received",
    actionPlan: "Autonomous AI verification and enrichment node",
    creditCost: 25,
  });

  // Load user data & enterprise modules
  const loadUserData = async (explicitTargetId?: string) => {
    try {
      setLoading(true);
      let targetId = explicitTargetId || userId;

      try {
        const authRes = await fetch("/api/auth/me");
        const authData = await authRes.json();
        if (authData.authenticated && authData.user) {
          targetId = authData.user.id;
          setUserId(targetId);
        }
      } catch (e) {}

      const res = await fetch(`/api/wallet/state?userId=${targetId}`);
      const data = await res.json();
      if (res.ok) {
        setUserData(data);
      }

      await Promise.all([
        loadCrmData(targetId),
        loadHrData(targetId),
        loadWorkflowData(targetId),
      ]);
    } catch (err) {
      console.error("Failed to load user state", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCrmData = async (targetId: string = userId) => {
    try {
      const res = await fetch(`/api/enterprise/crm?userId=${targetId}`);
      const data = await res.json();
      if (res.ok) {
        setCrmDeals(data.deals || []);
        setCrmStats(data.stats || null);
      }
    } catch (e) {}
  };

  const loadHrData = async (targetId: string = userId) => {
    try {
      const res = await fetch(`/api/enterprise/hr?userId=${targetId}`);
      const data = await res.json();
      if (res.ok) {
        setHrEmployees(data.employees || []);
        setHrStats(data.stats || null);
      }
    } catch (e) {}
  };

  const loadWorkflowData = async (targetId: string = userId) => {
    try {
      const res = await fetch(`/api/enterprise/workflows?userId=${targetId}`);
      const data = await res.json();
      if (res.ok) {
        setAutomations(data.automations || []);
        setAutomationStats(data.stats || null);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // AI Inference Execution
  const handleRunExecution = async () => {
    setExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      const res = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workflowType,
          prompt: promptInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "INSUFFICIENT_CREDITS") {
          setExecutionError(data.message);
          setTopUpModalOpen(true);
        } else {
          setExecutionError(data.error || "Execution failed");
        }
      } else {
        setExecutionResult(data);
        loadUserData(userId);
      }
    } catch (err: any) {
      setExecutionError(err.message || "Failed to execute pipeline");
    } finally {
      setExecuting(false);
    }
  };

  // CRM AI Qualify Deal
  const handleQualifyDeal = async (dealId: string) => {
    try {
      const res = await fetch("/api/enterprise/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "AI_QUALIFY", dealId, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Qualification failed");
      } else {
        await loadCrmData(userId);
        await loadUserData(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRM Create Deal
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/enterprise/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          newDeal: newDealForm,
          userId,
        }),
      });
      if (res.ok) {
        setAddDealModalOpen(false);
        setNewDealForm({
          companyName: "",
          clientName: "",
          contactEmail: "",
          dealValueCAD: 35000,
          stage: "QUALIFIED",
          probability: 60,
        });
        await loadCrmData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HR Screen Candidate
  const handleScreenCandidate = async () => {
    setScreeningLoading(true);
    setScreeningResult(null);
    try {
      const res = await fetch("/api/enterprise/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SCREEN_RESUME",
          candidateResume: { name: candidateName },
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Screening failed");
      } else {
        setScreeningResult(data.screeningResult);
        await loadUserData(userId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScreeningLoading(false);
    }
  };

  // HR Add Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/enterprise/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_EMPLOYEE",
          employeeData: newEmpForm,
          userId,
        }),
      });
      if (res.ok) {
        setAddEmpModalOpen(false);
        setNewEmpForm({
          fullName: "",
          workEmail: "",
          department: "Engineering",
          jobTitle: "",
          salaryCAD: 130000,
        });
        await loadHrData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HR Payroll Simulation
  const handleRunPayrollSimulation = () => {
    const totalPayroll = hrEmployees.reduce((sum, e) => sum + e.salaryCAD, 0);
    const monthlyRun = Math.round(totalPayroll / 12);
    setPayrollSimulation(
      `Monthly Payroll Processed: $${monthlyRun.toLocaleString()} CAD across ${hrEmployees.length} employees with direct CRA / Canadian remittance.`
    );
  };

  // Workflow Trigger Now
  const handleTriggerWorkflow = async (automationId: string) => {
    setRunningAutoId(automationId);
    try {
      const res = await fetch("/api/enterprise/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RUN_NOW", automationId, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Workflow execution failed");
      } else {
        setLastAutoToast(
          `Executed in ${data.executionTimeMs}ms! Deducted ${data.creditsDeducted} compute credits.`
        );
        setTimeout(() => setLastAutoToast(null), 4000);
        await loadWorkflowData(userId);
        await loadUserData(userId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningAutoId(null);
    }
  };

  // Workflow Toggle Status
  const handleToggleWorkflow = async (automationId: string) => {
    try {
      const res = await fetch("/api/enterprise/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_STATUS", automationId, userId }),
      });
      if (res.ok) {
        await loadWorkflowData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Workflow Create
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/enterprise/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          newAutomation: newWorkflowForm,
          userId,
        }),
      });
      if (res.ok) {
        setAddWorkflowModalOpen(false);
        setNewWorkflowForm({
          name: "",
          category: "CRM",
          triggerEvent: "On Webhook Event Received",
          actionPlan: "Autonomous AI verification and enrichment node",
          creditCost: 25,
        });
        await loadWorkflowData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Download Audit Export
  const handleExportAudit = () => {
    const auditData = {
      tenant: userData?.user?.companyName || userData?.user?.email,
      exportTimestamp: new Date().toISOString(),
      balance: userData?.wallet?.balance,
      transactions: userData?.wallet?.transactions,
      usageLogs: userData?.wallet?.usageLogs,
      crmDealsCount: crmDeals.length,
      hrHeadcount: hrEmployees.length,
      activeAutomations: automations.length,
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flyway-ledger-audit-${Date.now()}.json`;
    a.click();
  };

  const user = userData?.user;
  const wallet = userData?.wallet;
  const balance = wallet?.balance ?? 0;
  const isLowBalance = balance < 100;

  const filteredDeals =
    crmFilter === "ALL"
      ? crmDeals
      : crmDeals.filter((d) => d.stage === crmFilter);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* TOP HUD BAR */}
      <div className="border-b border-border bg-[#090B10]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Identity & Company */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/30 flex items-center justify-center font-bold text-brand-cyan text-sm shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "G"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {user?.name || "Google Workspace User"}
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                  {user?.country || "CA"}
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                {user?.companyName || "Enterprise Workspace"} •{" "}
                <span className="text-brand-cyan">{user?.email || "alex.corporate@gmail.com"}</span>
              </div>
            </div>
          </div>

          {/* Credits Balance & Top-Up CTA */}
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-border bg-[#10131E] px-4 py-2 flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                  ⚡ Available Compute Credits
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black font-mono text-brand-cyan">
                    {balance.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    (≈ ${(balance / 100).toFixed(2)} {wallet?.currency || "CAD"})
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-border/60" />

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                  Total Settled
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  ${((wallet?.lifetimeSpentCents || 0) / 100).toLocaleString()}{" "}
                  {wallet?.currency || "CAD"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTopUpModalOpen(true)}
              className="glow-button px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0"
            >
              <Zap className="h-4 w-4 fill-black" />
              <span>⚡ Top-Up Credits</span>
            </button>

            <Link
              href="/dashboard/settings"
              className="p-2.5 rounded-xl border border-border hover:border-brand-cyan/40 text-zinc-400 hover:text-white transition-colors"
              title="Settings & Billing"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ENTERPRISE WORKSPACE TAB NAVIGATION */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-border/40 overflow-x-auto">
          <div className="flex items-center gap-2 py-2">
            {[
              { id: "AI_ENGINE", label: "AI Neural Engine", icon: Cpu, badge: "Sub-100ms" },
              { id: "CRM", label: "CRM & Pipelines", icon: Briefcase, count: crmDeals.length },
              { id: "HR", label: "HR & People Ops", icon: Users, count: hrEmployees.length },
              { id: "WORKFLOWS", label: "Automated Workflows", icon: GitBranch, count: automations.length },
              { id: "GOVERNANCE", label: "Corporate Governance", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-brand-cyan text-black shadow-md shadow-brand-cyan/20 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/30 text-black font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isActive ? "bg-black/20 text-black" : "bg-white/10 text-brand-cyan"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE BODY */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Toast Notification */}
        {lastAutoToast && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{lastAutoToast}</span>
          </div>
        )}

        {/* LOW BALANCE ALERT */}
        {isLowBalance && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-300">
                  Low Compute Credit Alert: {balance} credits remaining!
                </h4>
                <p className="text-xs text-red-400/80">
                  Your automated workflows will pause when credits hit 0. Top up with $250, $500, or $1,200 CAD to prevent interruptions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setTopUpModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-red-500/30"
            >
              <Zap className="h-3.5 w-3.5 fill-white" />
              1-Click Top-Up Now
            </button>
          </div>
        )}

        {/* TAB 1: AI NEURAL EXECUTION ENGINE */}
        {activeTab === "AI_ENGINE" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left 2 Cols: Interactive Playground */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">AI Automation Execution Playground</h3>
                    <p className="text-xs text-zinc-400">
                      Live compute simulation consuming real wallet ledger credits per invocation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Cluster Ready
                  </span>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "prompt_node", name: "LLM Node", cost: 50, icon: Sparkles, desc: "50 Credits / req" },
                  { id: "ocr_extract", name: "OCR Extractor", cost: 150, icon: FileText, desc: "150 Credits / doc" },
                  { id: "vector_embed", name: "Vector Cluster", cost: 250, icon: Layers, desc: "250 Credits / batch" },
                  { id: "batch_pipeline", name: "Agent Pipeline", cost: 500, icon: Activity, desc: "500 Credits / run" },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = workflowType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWorkflowType(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? "border-brand-cyan bg-brand-cyan/10 text-white shadow-md shadow-brand-cyan/10"
                          : "border-border bg-[#121520] text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`h-4 w-4 ${active ? "text-brand-cyan" : "text-zinc-400"}`} />
                        <span className="text-[10px] font-mono font-bold text-brand-cyan">-{item.cost}</span>
                      </div>
                      <div className="text-xs font-semibold">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Prompt Suggestions */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Workflow Parameters / Target Query Payload
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { label: "What is marble gallery?", type: "prompt_node" },
                    { label: "Draft B2B MSA Contract", type: "ocr_extract" },
                    { label: "Extract Canadian HST Tax from Invoice", type: "ocr_extract" },
                    { label: "HNSW Vector Cluster Indexing", type: "vector_embed" },
                  ].map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPromptInput(sugg.label);
                        setWorkflowType(sugg.type);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-zinc-300 hover:text-brand-cyan transition-colors"
                    >
                      💡 {sugg.label}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#090B10] p-3 text-xs font-mono text-zinc-200 focus:border-brand-cyan focus:outline-none"
                  placeholder="Enter any question or prompt (e.g. what is marble gallery, contract extract, vector query)..."
                />
              </div>

              {/* Run Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-zinc-400">
                  Estimated Compute Cost:{" "}
                  <span className="font-mono font-bold text-brand-cyan">
                    {workflowType === "batch_pipeline" ? 500 : workflowType === "vector_embed" ? 250 : workflowType === "ocr_extract" ? 150 : 50} credits
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRunExecution}
                  disabled={executing || balance < 50}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-cyan to-brand-blue text-black hover:opacity-95 shadow-md shadow-brand-cyan/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 animate-spin text-black" />
                      Executing Neural Engine...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-black" />
                      Run Workflow Node
                    </>
                  )}
                </button>
              </div>

              {/* Live Answer Output */}
              {executionResult && (
                <div className="mt-4 rounded-xl border border-border bg-[#07090E] p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 text-[11px]">
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Execution Succeeded in {executionResult.executionTimeMs}ms
                    </span>
                    <span className="text-zinc-400">
                      Deducted: <strong className="text-red-400">-{executionResult.creditsDeducted}</strong> credits
                    </span>
                  </div>
                  <pre className="text-zinc-300 text-[11px] whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed font-sans">
                    {executionResult.result}
                  </pre>
                </div>
              )}
            </div>

            {/* Right 1 Col: Quick Settings & Recent Activity */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-[#0D0F17] p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Wallet Configuration
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-zinc-400">Default Currency:</span>
                    <span className="font-mono text-white font-bold">{wallet?.currency || "CAD"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-zinc-400">Auto-Topup:</span>
                    <span className="text-emerald-400 font-semibold">Enabled at 100 Credits</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-zinc-400">Lifetime Credits Granted:</span>
                    <span className="font-mono text-white">{(wallet?.lifetimeCreditsGranted || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setTopUpModalOpen(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-brand-cyan" />
                    Manage Payment & Top-Up
                  </button>
                  <Link
                    href="/dashboard/settings"
                    className="w-full py-2 rounded-xl text-xs text-center text-zinc-400 hover:text-white transition-colors"
                  >
                    Account Settings & Invoices →
                  </Link>
                </div>
              </div>

              {/* Consumption audit logs */}
              <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Recent Consumption Log</span>
                  <Activity className="h-3.5 w-3.5 text-brand-cyan" />
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  {(wallet?.usageLogs || []).length === 0 ? (
                    <div className="text-zinc-500 text-center py-4">No recent executions. Run a prompt node above!</div>
                  ) : (
                    (wallet?.usageLogs || []).slice(0, 5).map((log: any) => (
                      <div key={log.id} className="p-2 rounded-lg bg-[#121522] border border-border flex justify-between items-center">
                        <div>
                          <div className="text-[11px] text-white truncate max-w-[140px]">{log.serviceName}</div>
                          <div className="text-[9px] text-zinc-400">{log.executionTimeMs}ms latency</div>
                        </div>
                        <span className="text-red-400 font-bold">
                          {log.creditsCost > 0 ? `-${log.creditsCost} cr` : "Settled"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRM & DEALS PIPELINE */}
        {activeTab === "CRM" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top CRM Stats */}
            {crmStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                  <span className="text-xs text-zinc-400">Total Pipeline Value</span>
                  <div className="mt-1 text-2xl font-black font-mono text-brand-cyan">
                    ${crmStats.totalPipelineCAD.toLocaleString()} CAD
                  </div>
                  <span className="text-[10px] text-zinc-400">{crmStats.totalDeals} Commercial Accounts</span>
                </div>
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                  <span className="text-xs text-zinc-400">Weighted Forecast Value</span>
                  <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
                    ${crmStats.weightedPipelineCAD.toLocaleString()} CAD
                  </div>
                  <span className="text-[10px] text-zinc-400">Based on AI close probabilities</span>
                </div>
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">AI Deal Scoring Engine</span>
                    <div className="text-sm font-bold text-white mt-1">Autonomous Lead Scoring</div>
                    <span className="text-[10px] text-zinc-400">25 Compute Credits per lead audit</span>
                  </div>
                  <Bot className="h-8 w-8 text-brand-cyan/40" />
                </div>
              </div>
            )}

            {/* Filter and Add Deal Controls */}
            <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-brand-cyan" />
                    Commercial Client Pipeline & Deals
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enterprise accounts, reverse-charge tax validation, and autonomous deal qualification
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddDealModalOpen(true)}
                    className="glow-button px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5 text-black" />
                    + New Commercial Deal
                  </button>
                </div>
              </div>

              {/* Stage Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {["ALL", "LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setCrmFilter(st)}
                    className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                      crmFilter === st
                        ? "bg-brand-cyan text-black font-bold"
                        : "bg-[#121522] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Deals Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-zinc-400">
                      <th className="pb-3">Client / Organization</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Deal Value</th>
                      <th className="pb-3">Stage</th>
                      <th className="pb-3">Probability</th>
                      <th className="pb-3 text-right">Autonomous AI Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredDeals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-zinc-400">
                          No deals match this filter. Click "+ New Commercial Deal" to add one!
                        </td>
                      </tr>
                    ) : (
                      filteredDeals.map((deal) => (
                        <tr key={deal.id} className="text-zinc-300">
                          <td className="py-3.5">
                            <div className="font-bold text-white">{deal.companyName}</div>
                            <div className="text-[11px] text-zinc-400 font-sans">{deal.clientName}</div>
                          </td>
                          <td className="py-3.5 text-zinc-400">{deal.contactEmail}</td>
                          <td className="py-3.5 font-bold text-brand-cyan">
                            ${deal.dealValueCAD.toLocaleString()} CAD
                          </td>
                          <td className="py-3.5">
                            <span className="rounded bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-bold text-brand-cyan border border-brand-cyan/20">
                              {deal.stage}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{deal.probability}%</span>
                              <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${deal.probability}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleQualifyDeal(deal.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 text-[11px] font-bold transition-colors"
                            >
                              <Sparkles className="h-3 w-3" />
                              AI Qualify (-25 cr)
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HR & PEOPLE OPERATIONS */}
        {activeTab === "HR" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top HR Stats */}
            {hrStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                  <span className="text-xs text-zinc-400">Total Workforce Headcount</span>
                  <div className="mt-1 text-2xl font-black font-mono text-brand-cyan">
                    {hrStats.headcount} Team Members
                  </div>
                  <span className="text-[10px] text-zinc-400">{hrStats.activeEmployees} Active • {hrStats.onboarding} Onboarding</span>
                </div>
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                  <span className="text-xs text-zinc-400">Annual Payroll Run</span>
                  <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
                    ${hrStats.totalPayrollCAD.toLocaleString()} CAD / yr
                  </div>
                  <span className="text-[10px] text-zinc-400">Itemized Canadian & International contracts</span>
                </div>
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">Candidate Semantic Screener</span>
                    <div className="text-sm font-bold text-white mt-1">Autonomous Resume Matching</div>
                    <span className="text-[10px] text-zinc-400">50 Compute Credits per applicant evaluation</span>
                  </div>
                  <Users className="h-8 w-8 text-brand-cyan/40" />
                </div>
              </div>
            )}

            {/* AI Resume Screening Tool */}
            <div className="rounded-2xl border border-brand-purple/30 bg-[#0E101A] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="h-4 w-4 text-brand-purple" />
                  Instant AI Candidate Semantic Resume Screener
                </h3>
                <span className="text-[10px] font-mono text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded border border-brand-purple/30">
                  Deducts 50 Credits
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter candidate name or position title..."
                  className="flex-1 rounded-xl border border-border bg-[#121522] px-4 py-2 text-xs font-mono text-white focus:border-brand-purple focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleScreenCandidate}
                  disabled={screeningLoading || balance < 50}
                  className="px-5 py-2 rounded-xl bg-brand-purple text-white font-bold text-xs hover:bg-brand-purple/90 transition-all flex items-center justify-center gap-1.5"
                >
                  {screeningLoading ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                      Evaluating Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Screen Applicant
                    </>
                  )}
                </button>
              </div>

              {screeningResult && (
                <div className="mt-3 p-4 rounded-xl bg-[#141724] border border-brand-purple/40 text-xs font-mono space-y-2">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Candidate: {screeningResult.candidateName}</span>
                    <span>{screeningResult.matchScore}</span>
                  </div>
                  <div className="text-zinc-300">
                    <strong>Competencies:</strong> {screeningResult.primaryCompetencies.join(", ")}
                  </div>
                  <div className="text-zinc-400">
                    <strong>Market Compensation:</strong> {screeningResult.salaryBenchmarkCAD}
                  </div>
                  <div className="text-brand-cyan text-[11px] pt-1">
                    {screeningResult.recommendation}
                  </div>
                </div>
              )}
            </div>

            {/* Employee Directory */}
            <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-cyan" />
                  Employee Roster & People Operations
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunPayrollSimulation}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Simulate Monthly Payroll
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddEmpModalOpen(true)}
                    className="glow-button px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5 text-black" />
                    + Add Team Member
                  </button>
                </div>
              </div>

              {payrollSimulation && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                  ✓ {payrollSimulation}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-zinc-400">
                      <th className="pb-3">Employee Name</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Salary (CAD)</th>
                      <th className="pb-3">Performance</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {hrEmployees.map((emp) => (
                      <tr key={emp.id} className="text-zinc-300">
                        <td className="py-3.5">
                          <div className="font-bold text-white">{emp.fullName}</div>
                          <div className="text-[11px] text-zinc-400">{emp.workEmail}</div>
                        </td>
                        <td className="py-3.5 text-zinc-300">{emp.department}</td>
                        <td className="py-3.5 text-white">{emp.jobTitle}</td>
                        <td className="py-3.5 font-bold text-emerald-400">
                          ${emp.salaryCAD.toLocaleString()} CAD
                        </td>
                        <td className="py-3.5 text-brand-cyan font-bold">
                          ★ {emp.performanceScore.toFixed(1)} / 5.0
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                              emp.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATED WORKFLOWS */}
        {activeTab === "WORKFLOWS" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Workflow Stats */}
            {automationStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                  <span className="text-xs text-zinc-400">Active Automated Workflows</span>
                  <div className="mt-1 text-2xl font-black font-mono text-brand-cyan">
                    {automationStats.activeCount} Pipelines
                  </div>
                  <span className="text-[10px] text-zinc-400">Operating across HR, CRM, Billing & Compliance</span>
                </div>
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5">
                  <span className="text-xs text-zinc-400">Total Autonomous Runs Completed</span>
                  <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
                    {automationStats.totalRuns.toLocaleString()} Invocations
                  </div>
                  <span className="text-[10px] text-zinc-400">Zero human intervention required</span>
                </div>
                <div className="rounded-2xl border border-border bg-[#0D0F17] p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">Event Trigger Loop</span>
                    <div className="text-sm font-bold text-white mt-1">Real-time Webhook Queues</div>
                    <span className="text-[10px] text-zinc-400">10-75 compute credits per execution</span>
                  </div>
                  <GitBranch className="h-8 w-8 text-brand-cyan/40" />
                </div>
              </div>
            )}

            {/* Automations Grid */}
            <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-brand-cyan" />
                    Autonomous Enterprise Automation Workflows
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Pre-scheduled event listeners and background triggers running across your cloud infrastructure
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAddWorkflowModalOpen(true)}
                  className="glow-button px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5 text-black" />
                  + Create Automation
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automations.map((auto) => (
                  <div
                    key={auto.id}
                    className="rounded-xl border border-border bg-[#121522] p-5 flex flex-col justify-between hover:border-brand-cyan/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">
                          {auto.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleWorkflow(auto.id)}
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
                            auto.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-700/30 text-zinc-400 border-zinc-600 hover:text-white"
                          }`}
                        >
                          {auto.status} (Click to Toggle)
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2.5">{auto.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        <strong>Trigger:</strong> {auto.triggerEvent}
                      </p>
                      <p className="text-xs text-zinc-300 mt-1">
                        <strong>Action:</strong> {auto.actionPlan}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
                      <div className="text-xs font-mono text-zinc-400">
                        Cost: <strong className="text-white">{auto.creditCost} credits</strong> • Runs:{" "}
                        <strong className="text-brand-cyan">{auto.runCount}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerWorkflow(auto.id)}
                        disabled={runningAutoId === auto.id || balance < auto.creditCost}
                        className="px-3 py-1.5 rounded-lg bg-brand-cyan text-black font-bold text-xs hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-brand-cyan/20 disabled:opacity-50"
                      >
                        {runningAutoId === auto.id ? (
                          <>
                            <RotateCcw className="h-3 w-3 animate-spin text-black" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-black" />
                            Trigger Now (-{auto.creditCost} cr)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CORPORATE GOVERNANCE & COMPLIANCE */}
        {activeTab === "GOVERNANCE" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-2xl border border-border bg-[#0D0F17] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    Sovereign Governance, Tax Compliance & Audit Ledger
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Compliant under Canadian PIPEDA, UAE ADGM/DIFC, and Stripe Pre-Authorized Underwriting Standards
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportAudit}
                  className="glow-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5 text-black" />
                  Download Full Ledger Audit (JSON)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#121522] border border-border space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Globe2 className="h-4 w-4 text-brand-cyan" />
                    Canadian PIPEDA & Sovereign Data Residency
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Compute clusters reside in Montreal (ca-central-1). Customer datasets and vector embeddings are encrypted at rest with AES-256 and never used to train global public models.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#121522] border border-border space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-brand-purple" />
                    UAE & Cross-Border Commercial Tax Invoicing
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Compliant with UAE Federal Decree-Law No. 8 on Value Added Tax. Out-of-scope / 0% reverse-charge applicable for cross-border UAE commercial entities.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#121522] border border-border space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    Merchant Statement Descriptor & Fraud Score
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Settles under <code className="text-brand-cyan font-bold font-mono">FLYWAY*COMPUTE</code>. Merchant Category Code: 7372 (Computer Programming & Data Processing). Radar Risk Score: 0.02.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#121522] border border-border space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Master Services Agreement (MSA 2026.4.1)
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Status: <span className="text-emerald-400 font-bold">Active & Certified</span>. Pre-authorizes recurring off-session compute top-ups with zero OTP interruption for corporate clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD DEAL */}
      {addDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-border bg-[#0E1018] p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-cyan" />
              Add New Commercial Client Opportunity
            </h4>
            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  value={newDealForm.companyName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, companyName: e.target.value })}
                  placeholder="e.g. Apex Global Logistics (Toronto, Canada)"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Contact Officer Name</label>
                <input
                  type="text"
                  required
                  value={newDealForm.clientName}
                  onChange={(e) => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  placeholder="e.g. Samantha Vance"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={newDealForm.contactEmail}
                  onChange={(e) => setNewDealForm({ ...newDealForm, contactEmail: e.target.value })}
                  placeholder="samantha@apexglobal.ca"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Deal Value (CAD)</label>
                  <input
                    type="number"
                    required
                    value={newDealForm.dealValueCAD}
                    onChange={(e) => setNewDealForm({ ...newDealForm, dealValueCAD: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newDealForm.probability}
                    onChange={(e) => setNewDealForm({ ...newDealForm, probability: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddDealModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-border text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:opacity-95"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {addEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-border bg-[#0E1018] p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-cyan" />
              Add Employee to Roster
            </h4>
            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newEmpForm.fullName}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, fullName: e.target.value })}
                  placeholder="e.g. Liam Sterling"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={newEmpForm.workEmail}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, workEmail: e.target.value })}
                  placeholder="liam.sterling@flywaycloud.ai"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Department</label>
                  <select
                    value={newEmpForm.department}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI Research">AI Research</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Salary CAD / yr</label>
                  <input
                    type="number"
                    required
                    value={newEmpForm.salaryCAD}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, salaryCAD: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newEmpForm.jobTitle}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddEmpModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-border text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:opacity-95"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE WORKFLOW */}
      {addWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-border bg-[#0E1018] p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-brand-cyan" />
              Create Autonomous Workflow Pipeline
            </h4>
            <form onSubmit={handleCreateWorkflow} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={newWorkflowForm.name}
                  onChange={(e) => setNewWorkflowForm({ ...newWorkflowForm, name: e.target.value })}
                  placeholder="e.g. Autonomous Customer KYC & Sanctions Verification"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newWorkflowForm.category}
                    onChange={(e) => setNewWorkflowForm({ ...newWorkflowForm, category: e.target.value })}
                    className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="CRM">CRM</option>
                    <option value="HR">HR</option>
                    <option value="BILLING">BILLING</option>
                    <option value="ADMINISTRATION">ADMINISTRATION</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Credit Cost / Run</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newWorkflowForm.creditCost}
                    onChange={(e) => setNewWorkflowForm({ ...newWorkflowForm, creditCost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Trigger Event</label>
                <input
                  type="text"
                  required
                  value={newWorkflowForm.triggerEvent}
                  onChange={(e) => setNewWorkflowForm({ ...newWorkflowForm, triggerEvent: e.target.value })}
                  placeholder="e.g. On Stripe Payment Succeeded Webhook"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Action Plan</label>
                <input
                  type="text"
                  required
                  value={newWorkflowForm.actionPlan}
                  onChange={(e) => setNewWorkflowForm({ ...newWorkflowForm, actionPlan: e.target.value })}
                  placeholder="e.g. Extracts tax identification, verifies reverse-charge, emails digital invoice"
                  className="w-full rounded-xl border border-border bg-[#141724] p-2.5 text-white font-mono focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddWorkflowModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-border text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:opacity-95"
                >
                  Deploy Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPUP MODAL */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        userId={userId}
        onSuccess={() => loadUserData(userId)}
      />
    </div>
  );
}
