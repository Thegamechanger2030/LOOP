"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, X } from "lucide-react";

type Theme = {
  id: string;
  name: string;
  color: string;
  totalCount: number;
  thisWeek: number;
  lastWeek: number;
  trendPercent: number;
};

type DrillDown = {
  theme: Theme;
  feedback: { id: string; content: string; sentiment: string | null; createdAt: string }[];
};

export default function TrendsPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DrillDown | null>(null);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((data) => {
        setThemes(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function openTheme(id: string) {
    const res = await fetch(`/api/themes/${id}`);
    const data = await res.json();
    setSelected(data);
  }

  if (loading)
    return (
      <div className="glass-card rounded-2xl p-12 text-center text-[#A78BFA]">
        <p className="text-sm font-medium">Analyzing feedback trends...</p>
      </div>
    );

  if (themes.length === 0) {
    return (
      <EmptyState
        title="No themes yet"
        description="Themes appear automatically once customer feedback items are ingested."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-[#3B1F4D] flex items-center justify-between shadow-glow">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 border border-[#3B1F4D] flex items-center justify-center text-[#EF4444]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Theme Trends</h1>
          </div>
          <p className="text-xs text-[#A78BFA] mt-1">Week-over-week feedback volume analysis by topic</p>
        </div>
      </div>

      {/* Grid of Themes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => {
          const isUp = t.trendPercent > 0;
          const isDown = t.trendPercent < 0;
          return (
            <button
              key={t.id}
              onClick={() => openTheme(t.id)}
              className="text-left glass-card glass-card-hover rounded-2xl p-5 border border-[#3B1F4D] space-y-3 group shadow-glow"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shadow-redGlow"
                    style={{ backgroundColor: t.color || "#7C3AED" }}
                  />
                  {t.name}
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                    isUp
                      ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                      : isDown
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-[#7C3AED]/15 text-[#A78BFA] border-[#3B1F4D]"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : isDown ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {Math.abs(t.trendPercent)}%
                </span>
              </div>

              <div className="pt-2 border-t border-[#3B1F4D] flex items-center justify-between text-xs text-[#A78BFA]">
                <span>
                  <strong className="text-white font-bold">{t.totalCount}</strong> total items
                </span>
                <span>
                  {t.thisWeek} this week <span className="text-[#A78BFA]/70">(was {t.lastWeek})</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Drill-down Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-[#0D0712]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card rounded-2xl border border-[#3B1F4D] max-w-xl w-full max-h-[80vh] flex flex-col p-6 shadow-combinedGlow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3B1F4D]">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: selected.theme.color || "#7C3AED" }}
                />
                <h2 className="text-lg font-black text-white">{selected.theme.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg text-[#A78BFA] hover:text-white hover:bg-[#160D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {selected.feedback.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-[#160D1F] border border-[#3B1F4D] space-y-2">
                  <p className="text-xs text-[#F8FAFC] font-medium leading-relaxed">{f.content}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#3B1F4D]">
                    <Badge kind="sentiment" value={f.sentiment} />
                    <span className="text-[10px] text-[#A78BFA] font-mono">{formatDate(f.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
