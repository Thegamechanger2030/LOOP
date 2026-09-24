"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, User, BookOpen, Loader2 } from "lucide-react";

type Answer = { answer: string; sources: { id: string; content: string; channel: string }[] };

const SUGGESTIONS = [
  "What are users saying about onboarding and setup?",
  "What is the most common billing or pricing complaint?",
  "Are customers happy with the mobile app experience?",
  "Why are users complaining about export speed?",
];

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ question: string; result: Answer }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/insights/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        setError("Couldn't get an answer — try rephrasing the question.");
        setLoading(false);
        return;
      }

      const result: Answer = await res.json();
      setHistory((prev) => [{ question: q, result }, ...prev]);
      setQuestion("");
    } catch {
      setError("Failed to reach AI insights service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-[#3B1F4D] flex items-center justify-between shadow-glow">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 border border-[#3B1F4D] flex items-center justify-center text-[#EF4444]">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Ask LOOP AI</h1>
          </div>
          <p className="text-xs text-[#A78BFA] mt-1">
            Grounded AI analysis directly derived from your stored customer feedback items.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
          <span>Gemini 1.5 Flash Grounded</span>
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="relative"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask any question about your customer feedback..."
          className="w-full glass-input rounded-2xl pl-5 pr-32 py-4 text-sm placeholder:text-[#A78BFA]/50 focus:ring-2 focus:ring-[#7C3AED]/40 shadow-glow"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2.5 top-2.5 bottom-2.5 px-5 rounded-xl gradient-bg-purple-red gradient-bg-purple-red-hover text-white font-extrabold text-xs shadow-combinedGlow disabled:opacity-50 flex items-center gap-1.5 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick Suggestions Chips */}
      {history.length === 0 && (
        <div className="space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#A78BFA]">Suggested queries:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="text-xs font-medium px-3.5 py-2 rounded-xl border border-[#3B1F4D] bg-[#160D1F] hover:bg-[#1D1028] hover:border-[#7C3AED] text-slate-200 hover:text-white transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#EF4444]" />
                <span>"{s}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-300 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Conversation Cards */}
      <div className="space-y-6">
        {history.map((h, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 border border-[#3B1F4D] space-y-4 shadow-glow animate-in fade-in">
            {/* User Question */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#3B1F4D]">
              <div className="w-8 h-8 rounded-full bg-[#160D1F] border border-[#3B1F4D] flex items-center justify-center text-slate-200 shrink-0">
                <User className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#A78BFA]">Question</p>
                <p className="text-sm font-bold text-white mt-0.5">{h.question}</p>
              </div>
            </div>

            {/* AI Answer */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-xs font-bold text-[#EF4444]">Grounded AI Insight</p>
                <p className="text-sm text-[#F8FAFC] leading-relaxed whitespace-pre-line font-normal">
                  {h.result.answer}
                </p>

                {/* Sources / References */}
                {h.result.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#3B1F4D] space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#EF4444]" />
                      Referenced Feedback Sources ({h.result.sources.length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {h.result.sources.slice(0, 4).map((s, idx) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-[#160D1F] border border-[#3B1F4D] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                            <span className="text-[#EF4444]">Source [{idx + 1}]</span>
                            <span className="capitalize px-1.5 py-0.5 rounded bg-[#1D1028] text-[#A78BFA] border border-[#3B1F4D]">
                              {s.channel.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-slate-200 line-clamp-2">"{s.content}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
