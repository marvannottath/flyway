"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, User, Settings, LogOut, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check login state
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Compliance & Terms", href: "/terms" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-[#08090D]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Crisp White & High Contrast */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#141724] border border-white/20 p-1.5 shadow-lg shadow-brand-cyan/20 group-hover:scale-105 transition-transform">
            <img
              src="/flyway-logo.png"
              alt="Flyway Cloud AI Official Logo"
              className="h-full w-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-brand-cyan transition-colors flex items-center gap-1.5">
              FLYWAY <span className="text-xs font-mono font-medium text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/20">CLOUD</span>
            </span>
            <span className="text-[10px] text-zinc-400 -mt-0.5 hidden sm:block">Enterprise AI Automation Engine</span>
          </div>
        </Link>

        {/* Public Navigation Links (Clean, No Admin) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-brand-cyan bg-brand-cyan/10"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth State Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            /* Logged In View */
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#121522] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:bg-[#1A1E2F] transition-colors"
              >
                Workspace
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-xl bg-[#141826] border border-brand-cyan/30 px-3 py-1.5 text-xs text-white hover:border-brand-cyan transition-all shadow-sm"
              >
                <div className="flex items-center gap-1 font-mono text-brand-cyan font-bold">
                  <Zap className="h-3.5 w-3.5 fill-brand-cyan/30" />
                  <span>{(currentUser.wallet?.balance ?? 0).toLocaleString()}</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <Settings className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-zinc-300">Settings</span>
              </Link>
            </div>
          ) : (
            /* Logged Out Public View (Google Sign-In & Get Started) */
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#121522] px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-[#1A1E2E] transition-all"
              >
                {/* Google Icon */}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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
                <span>Sign In</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-brand-cyan/20 hover:opacity-95 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
