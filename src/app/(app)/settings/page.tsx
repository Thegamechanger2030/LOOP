"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import { Key, Users, UserPlus, ShieldCheck, Check, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";

type Member = { id: string; name: string; email: string; role: string; createdAt: string };

export default function SettingsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ANALYST" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Gemini API Key state
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaving, setKeySaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  function load() {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function saveApiKey(e: React.FormEvent) {
    e.preventDefault();
    setKeySaving(true);
    setKeyStatus(null);
    try {
      const res = await fetch("/api/settings/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setKeyStatus("Gemini API key updated successfully! AI features are active.");
      } else {
        setKeyStatus(`Error: ${data.error}`);
      }
    } catch {
      setKeyStatus("Failed to update API key.");
    }
    setKeySaving(false);
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Could not invite member.");
      setSubmitting(false);
      return;
    }
    setForm({ name: "", email: "", password: "", role: "ANALYST" });
    setSubmitting(false);
    load();
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-[#3B1F4D] flex items-center justify-between shadow-glow">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Workspace Settings</h1>
          <p className="text-xs text-[#A78BFA] mt-1">Configure AI credentials, workspace roles, and team members.</p>
        </div>
      </div>

      {/* Gemini API Key Configuration Card */}
      <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] space-y-4 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 border border-[#3B1F4D] flex items-center justify-center text-[#EF4444]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Gemini API Key Configuration
                <Sparkles className="w-4 h-4 text-[#A855F7]" />
              </h2>
              <p className="text-xs text-[#A78BFA]">Set your Google Gemini API key for feedback classification & insights.</p>
            </div>
          </div>
        </div>

        <form onSubmit={saveApiKey} className="space-y-3">
          {keyStatus && (
            <p className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {keyStatus}
            </p>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#A78BFA] mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full glass-input rounded-xl pl-4 pr-12 py-3 text-xs font-mono focus:ring-2 focus:ring-[#7C3AED]/40"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-[#A78BFA] hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#A78BFA] mt-1.5">
              Key is stored securely on the server. If not set, system automatically uses fallback smart classification.
            </p>
          </div>

          <button
            type="submit"
            disabled={keySaving || !apiKey.trim()}
            className="text-xs font-black px-5 py-2.5 rounded-xl gradient-bg-purple-red gradient-bg-purple-red-hover text-white shadow-combinedGlow disabled:opacity-50 flex items-center gap-2 transition"
          >
            {keySaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Key...</span>
              </>
            ) : (
              <span>Save Gemini API Key</span>
            )}
          </button>
        </form>
      </div>

      {/* Team Members List */}
      <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] space-y-4 shadow-glow">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 border border-[#3B1F4D] flex items-center justify-center text-[#A78BFA]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Team Members ({members.length})</h2>
            <p className="text-xs text-[#A78BFA]">Current users with access to this workspace.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-[#A78BFA] py-4 text-center">Loading members...</p>
        ) : (
          <div className="divide-y divide-[#3B1F4D]/60">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] border border-[#3B1F4D] flex items-center justify-center text-white font-black text-xs">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{m.name}</p>
                    <p className="text-xs text-[#A78BFA]">{m.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#160D1F] border border-[#3B1F4D] text-[#EF4444]">
                    {m.role}
                  </span>
                  <p className="text-[10px] text-[#A78BFA] mt-1">Joined {formatDate(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Teammate Card */}
      {isAdmin ? (
        <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] space-y-4 shadow-glow">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Invite a Teammate</h2>
              <p className="text-xs text-[#A78BFA]">Add a new user to collaborate on customer feedback.</p>
            </div>
          </div>

          <form onSubmit={invite} className="space-y-3">
            {error && <p className="text-xs text-red-300 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl px-4 py-2.5">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="glass-input rounded-xl px-3.5 py-2.5 text-xs"
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="glass-input rounded-xl px-3.5 py-2.5 text-xs"
              />
              <input
                required
                type="password"
                minLength={8}
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="glass-input rounded-xl px-3.5 py-2.5 text-xs"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="glass-input rounded-xl px-3.5 py-2.5 text-xs cursor-pointer"
              >
                <option value="ADMIN" className="bg-[#0D0712]">ADMIN</option>
                <option value="ANALYST" className="bg-[#0D0712]">ANALYST</option>
                <option value="VIEWER" className="bg-[#0D0712]">VIEWER</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs font-black px-5 py-2.5 rounded-xl gradient-bg-purple-red gradient-bg-purple-red-hover text-white shadow-combinedGlow disabled:opacity-60 transition"
            >
              {submitting ? "Inviting..." : "Send Invitation"}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-xs text-[#A78BFA] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
          Only workspace admins can invite new team members.
        </p>
      )}
    </div>
  );
}
