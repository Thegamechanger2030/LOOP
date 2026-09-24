"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", workspaceName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Could not create account.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0c051e] relative overflow-hidden">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3">
            {/* L + Circular Loop Symbol with Purple-to-Blue Gradient */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform hover:rotate-180 transition-transform duration-700" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="loopGradSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#loopGradSignup)"
                  strokeWidth="10"
                  strokeDasharray="180 60"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-xl text-white tracking-tighter">L</span>
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-400 bg-clip-text text-transparent">
              LOOP
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Create Your AI SaaS Workspace</h1>
          <p className="text-xs text-purple-300">You will be designated as the workspace admin.</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-purple-500/20 space-y-4 shadow-glass">
          {error && <p className="text-xs font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 rounded-xl px-4 py-2.5">{error}</p>}

          {[
            { key: "workspaceName", label: "Workspace / Company name", type: "text", placeholder: "Acme Corp" },
            { key: "name", label: "Your name", type: "text", placeholder: "Ava Admin" },
            { key: "email", label: "Email address", type: "email", placeholder: "ava@acme.com" },
            { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">{field.label}</label>
              <input
                type={field.type}
                required
                minLength={field.key === "password" ? 8 : undefined}
                placeholder={field.placeholder}
                value={(form as any)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-accentPink-500/40"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-xs font-extrabold py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-accentPink-600 hover:from-brand-500 hover:to-accentPink-500 text-white shadow-pinkGlow flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            <span>{loading ? "Creating Workspace..." : "Create New Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-accentPink-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
