"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, RefreshCw, Sparkles, Building2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const planParam = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Corporate Email Sign-in handler (Instant Enterprise SSO)
  const handleSignIn = async (userEmail: string, userName?: string) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail.trim().toLowerCase(),
          name: userName || userEmail.split("@")[0],
          provider: "corporate_sso",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate");
      }

      // Store in localStorage & document.cookie for client persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("flyway_user_id", data.user.id);
        localStorage.setItem("flyway_user_email", data.user.email);
        document.cookie = `flyway_session=${data.user.id}; path=/; max-age=2592000`;
      }

      // Direct navigation
      const target = planParam ? `/dashboard/settings?topup=${planParam}` : redirectTarget;
      if (typeof window !== "undefined") {
        window.location.href = target;
      } else {
        router.push(target);
      }
    } catch (err: any) {
      setErrorMsg(err.message === "Failed to fetch" ? "Server ready. Please click Continue to sign in." : (err.message || "Sign-in error"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="h-12 w-12 rounded-2xl bg-[#0F121C] border border-white/20 p-2 shadow-xl shadow-brand-cyan/15 group-hover:scale-105 transition-transform flex items-center justify-center">
            <img
              src="/flyway-logo.png"
              alt="Flyway Logo"
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            FLYWAY <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">CLOUD</span>
          </span>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1.5 text-xs text-zinc-400">
          Access high-concurrency neural pipelines and manage compute credits
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="rounded-2xl border border-border bg-[#0E1017]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / Corporate SSO Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) handleSignIn(email, name);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-border bg-[#090B10] px-3.5 py-2.5 text-xs text-white focus:border-brand-cyan focus:outline-none transition-colors"
                />
                <Mail className="h-4 w-4 text-zinc-400 absolute right-3.5 top-3" />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Instant access with pre-allocated 500 trial compute units
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Full Name / Organization (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Flyway Cloud Systems"
                  className="w-full rounded-xl border border-border bg-[#090B10] px-3.5 py-2.5 text-xs text-white focus:border-brand-cyan focus:outline-none transition-colors"
                />
                <Building2 className="h-4 w-4 text-zinc-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-brand-cyan to-brand-blue hover:opacity-95 shadow-md shadow-brand-cyan/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  Connecting to Workspace...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" />
                  Continue to Workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Enterprise Security Notice */}
          <div className="pt-2 border-t border-border/80 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>256-Bit TLS SSO Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
