"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";

type AccountOption = {
  id: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  avatarBg: string;
};

const ACCOUNTS: AccountOption[] = [
  {
    id: "ms",
    name: "MS Sir",
    role: "Administrator",
    initials: "MS",
    email: "admin@demo.loop",
    avatarBg: "from-purple-600 to-red-500",
  },
  {
    id: "dk",
    name: "DK Rawat",
    role: "Manager / Analyst",
    initials: "DK",
    email: "analyst@demo.loop",
    avatarBg: "from-purple-600 to-pink-500",
  },
  {
    id: "dn",
    name: "DN Jha",
    role: "Analyst / User",
    initials: "DN",
    email: "viewer@demo.loop",
    avatarBg: "from-indigo-600 to-purple-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState<AccountOption>(ACCOUNTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: selectedAccount.email,
      password: "Demo1234!",
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials or authentication error.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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

      {/* RIGHT SIDE: Account Selection & Login Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome to LOOP</h2>
            <p className="text-sm font-medium text-[#A78BFA]">Select your account to continue</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          {/* Three Account Cards */}
          <div className="space-y-3.5">
            {ACCOUNTS.map((acc) => {
              const isSelected = selectedAccount.id === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-[#1D1028] border-[#EF4444] shadow-combinedGlow scale-[1.02]"
                      : "bg-[#160D1F] border-[#3B1F4D] hover:border-[#7C3AED] hover:bg-[#1D1028]/60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Circular Avatar with Initials */}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${acc.avatarBg} flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform`}
                    >
                      {acc.initials}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        {acc.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#A78BFA]">{acc.role}</p>
                    </div>
                  </div>

                  {/* Radio / Select Indicator */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EF4444] flex items-center justify-center text-white shadow-glow">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#3B1F4D] group-hover:border-[#7C3AED]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secure Login Button */}
          <div className="pt-2">
            <button
              onClick={handleLogin}
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
                  <span>Secure Login as {selectedAccount.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-[#A78BFA] mt-4">
              Logging into <strong className="text-white">{selectedAccount.email}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
