"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        setError("Incorrect email or password. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0712] text-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT SIDE: Brand Showcase & Feature Highlights */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#3B1F4D] relative z-10 bg-gradient-to-b from-[#160D1F]/90 to-[#0D0712]/90">
        <div>
          {/* LOOP Logo (Far Left) */}
          <div className="flex items-center gap-3.5 mb-12">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform hover:rotate-180 transition-transform duration-700" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="loopLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#loopLogoGrad)"
                  strokeWidth="10"
                  strokeDasharray="180 60"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-xl text-white tracking-tighter">L</span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">LOOP</span>
              <p className="text-[10px] font-bold tracking-widest text-[#A78BFA] uppercase">
                CUSTOMER INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="space-y-4 max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Customer Intelligence <br />
              <span className="gradient-text-purple-red">Made Smarter</span>
            </h1>
            <p className="text-base text-[#A78BFA] leading-relaxed font-normal">
              Real-time customer feedback analytics & theme sentiment intelligence. Aggregate all support tickets, app store reviews, and sales notes into unified AI insights.
            </p>
          </div>

          {/* Feature Highlights with Purple-Red Gradient Icons */}
          <div className="mt-12 space-y-5 max-w-md">
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#1D1028]/80 border border-[#3B1F4D]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] flex items-center justify-center text-white shadow-glow shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Real-time Analytics</h4>
                <p className="text-xs text-[#A78BFA]">Instant feedback ingestion & volume tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#1D1028]/80 border border-[#3B1F4D]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] flex items-center justify-center text-white shadow-glow shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI-Powered Insights</h4>
                <p className="text-xs text-[#A78BFA]">Automated Gemini classification & trend detection</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#1D1028]/80 border border-[#3B1F4D]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] flex items-center justify-center text-white shadow-glow shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Secure & Reliable</h4>
                <p className="text-xs text-[#A78BFA]">Strict tenant isolation & role permissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-[#3B1F4D] text-xs text-[#A78BFA] flex items-center justify-between">
          <span>&copy; 2026 Project LOOP SaaS</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Systems Operational
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center items-center relative z-10">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-8">
          {/* Welcome Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome to LOOP</h2>
            <p className="text-sm font-medium text-[#A78BFA]">Sign in to continue</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#3B1F4D] bg-[#160D1F] px-4 py-3 text-sm text-white placeholder:text-[#8B7A99] focus:border-[#A855F7] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#3B1F4D] bg-[#160D1F] px-4 py-3 text-sm text-white placeholder:text-[#8B7A99] focus:border-[#A855F7] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Secure Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EF4444] hover:from-[#8B5CF6] hover:to-[#F87171] text-white font-black text-sm uppercase tracking-wider shadow-combinedGlow flex items-center justify-center gap-2.5 transition transform active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Secure Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
          <p className="text-center text-sm text-[#A78BFA]">
            New to LOOP?{" "}
            <Link href="/signup" className="font-bold text-white underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
