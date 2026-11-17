"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const planParam = searchParams.get("plan");
  const errorQuery = searchParams.get("error");
  const reasonQuery = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorQuery
      ? `Authentication error: ${errorQuery}${reasonQuery ? ` (${reasonQuery})` : ""}`
      : null
  );

  // Email Sign-in handler
  const handleSignIn = async (userEmail: string, userName?: string, provider = "email") => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail.trim(),
          name: userName || userEmail.split("@")[0],
          provider,
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

  // Google Sign-In redirect to official Google OAuth 2.0 flow
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/google";
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
          Access your high-concurrency neural pipelines and manage compute credits
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

          {/* OFFICIAL GOOGLE SIGN-IN BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-zinc-200 bg-[#161924] border border-white/10 hover:border-zinc-500 hover:bg-[#1C2030] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 group"
            >
              {googleLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-brand-cyan" />
                  Connecting Google Authentication...
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="group-hover:text-white transition-colors">
                    Continue with Google
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/80 w-full" />
            <span className="bg-[#0E1017] px-3 text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
              Or with Corporate Email
            </span>
            <div className="border-t border-border/80 w-full" />
          </div>

          {/* Email Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) handleSignIn(email, name, "email");
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
                  placeholder="flywaycloud@gmail.com"
                  className="w-full rounded-xl border border-border bg-[#090B10] px-3.5 py-2.5 text-xs text-white focus:border-brand-cyan focus:outline-none"
                />
                <Mail className="h-4 w-4 text-zinc-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Full Name / Organization (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full rounded-xl border border-border bg-[#090B10] px-3.5 py-2.5 text-xs text-white focus:border-brand-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-brand-cyan to-brand-blue hover:opacity-95 shadow-md shadow-brand-cyan/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  Authenticating...
                </>
              ) : (
                <>
                  Continue to Workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Enterprise Security Notice */}
          <div className="pt-2 border-t border-border/80 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>256-Bit TLS SSO & OAuth 2.0 Encrypted</span>
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
