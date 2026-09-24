"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/utils";
import { NewFeedbackForm } from "./new-feedback-form";
import {
  Upload,
  Download,
  Plus,
  Search,
  RefreshCw,
  Sparkles,
  Inbox as InboxIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type FeedbackItem = {
  id: string;
  content: string;
  channel: string;
  sentiment: string | null;
  status: string;
  createdAt: string;
  themes: { theme: { id: string; name: string; color: string } }[];
};

export default function InboxPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (channel) params.set("channel", channel);
    if (sentiment) params.set("sentiment", sentiment);
    if (status) params.set("status", status);

    try {
      const res = await fetch(`/api/feedback?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, channel, sentiment, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it)));
    await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/feedback/import", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setImportMsg({
          type: "success",
          text: `Successfully imported ${data.imported} feedback items (${data.failed} failed/skipped).`,
        });
      } else {
        setImportMsg({
          type: "error",
          text: data.error || "Failed to upload CSV file.",
        });
      }
    } catch (err) {
      setImportMsg({ type: "error", text: "Network error occurred while uploading CSV." });
    } finally {
      setImporting(false);
      e.target.value = "";
      load();
    }
  }

  function downloadSampleCsv() {
    const csvContent =
      "content,channel,customer_label,created_at\n" +
      '"The new dashboard load times are blazing fast! Loving the clean analytics layout.",app_store,Sarah Jenkins,2026-08-10T10:15:00Z\n' +
      '"Having trouble exporting custom CSV reports on the free plan.",support_ticket,Mark TechCorp,2026-08-11T14:22:00Z\n' +
      '"Pricing for the Pro plan feels a bit steep for small startup teams.",sales_call,Alex Rivera,2026-08-09T09:30:00Z\n' +
      '"Mobile app crashes whenever I try to upload a screenshot.",app_store,Elena Rostova,2026-08-12T16:45:00Z\n' +
      '"The Ask LOOP AI feature is incredible! Saved our product team hours.",nps_survey,David K.,2026-08-13T11:00:00Z\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_customer_feedback.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function simulateChannel(ch: string) {
    setImportMsg(null);
    try {
      const res = await fetch("/api/feedback/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: ch }),
      });
      const data = await res.json();
      setImportMsg({
        type: res.ok ? "success" : "error",
        text: res.ok ? `Simulated & imported ${data.imported} items from ${ch.replace("_", " ")}.` : data.error,
      });
      load();
    } catch {
      setImportMsg({ type: "error", text: "Failed to simulate channel feedback." });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-[#3B1F4D] shadow-glow">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 border border-[#3B1F4D] flex items-center justify-center">
              <InboxIcon className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Customer Inbox</h1>
              <p className="text-xs text-[#A78BFA] mt-0.5">
                Centralized feedback repository • <span className="text-[#EF4444] font-bold">{total} total entries</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={downloadSampleCsv}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-[#3B1F4D] bg-[#160D1F] hover:bg-[#1D1028] text-slate-200 flex items-center gap-1.5 transition"
            title="Download ready-to-use CSV template"
          >
            <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Sample CSV</span>
          </button>

          <label className="text-xs font-bold px-3.5 py-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-red-200 cursor-pointer flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>{importing ? "Importing CSV..." : "Upload CSV"}</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={importing} />
          </label>

          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-black px-4 py-2 rounded-xl gradient-bg-purple-red gradient-bg-purple-red-hover text-white shadow-combinedGlow flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feedback</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {importMsg && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl text-xs font-bold border ${
            importMsg.type === "success"
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-[#EF4444]/15 text-red-300 border-[#EF4444]/30"
          }`}
        >
          {importMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
          )}
          <span>{importMsg.text}</span>
        </div>
      )}

      {/* New Feedback Form Modal / Drawer */}
      {showForm && (
        <NewFeedbackForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-[#3B1F4D] space-y-3 shadow-glow">
        <div className="flex flex-wrap gap-2.5 items-center text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#A78BFA]" />
            <input
              placeholder="Search customer feedback content..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/40"
            />
          </div>

          <select
            value={channel}
            onChange={(e) => {
              setPage(1);
              setChannel(e.target.value);
            }}
            className="glass-input rounded-xl px-3 py-2 text-xs cursor-pointer"
          >
            <option value="" className="bg-[#0D0712]">All channels</option>
            {["support_ticket", "app_store", "nps_survey", "sales_call", "community"].map((c) => (
              <option key={c} value={c} className="bg-[#0D0712]">
                {c.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={sentiment}
            onChange={(e) => {
              setPage(1);
              setSentiment(e.target.value);
            }}
            className="glass-input rounded-xl px-3 py-2 text-xs cursor-pointer"
          >
            <option value="" className="bg-[#0D0712]">All sentiment</option>
            <option value="POSITIVE" className="bg-[#0D0712]">Positive</option>
            <option value="NEUTRAL" className="bg-[#0D0712]">Neutral</option>
            <option value="NEGATIVE" className="bg-[#0D0712]">Negative</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="glass-input rounded-xl px-3 py-2 text-xs cursor-pointer"
          >
            <option value="" className="bg-[#0D0712]">All statuses</option>
            <option value="NEW" className="bg-[#0D0712]">New</option>
            <option value="REVIEWED" className="bg-[#0D0712]">Reviewed</option>
            <option value="ACTIONED" className="bg-[#0D0712]">Actioned</option>
          </select>

          {(search || channel || sentiment || status) && (
            <button
              onClick={() => {
                setSearch("");
                setChannel("");
                setSentiment("");
                setStatus("");
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-[#A78BFA] hover:bg-[#160D1F] transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Quick Channel Simulators */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#3B1F4D]/60 text-[11px] text-[#A78BFA]">
          <span className="flex items-center gap-1 font-black uppercase tracking-wider text-[#EF4444]">
            <Sparkles className="w-3 h-3 text-[#A855F7]" /> Simulate feeds:
          </span>
          {["app_store", "community", "sales_call"].map((c) => (
            <button
              key={c}
              onClick={() => simulateChannel(c)}
              className="px-2.5 py-1 rounded-lg border border-[#3B1F4D] bg-[#160D1F] hover:bg-[#1D1028] text-slate-200 transition"
            >
              + {c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feedback Table */}
      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-[#A78BFA] space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#EF4444]" />
          <p className="text-sm font-medium">Fetching feedback items...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No feedback found" description="Try clearing filters, or add your first feedback item above." />
      ) : (
        <div className="glass-card rounded-2xl border border-[#3B1F4D] overflow-hidden shadow-glow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#160D1F] text-[#A78BFA] text-[11px] uppercase tracking-wider border-b border-[#3B1F4D]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Customer Feedback</th>
                  <th className="px-4 py-3.5 font-bold">Channel</th>
                  <th className="px-4 py-3.5 font-bold">Themes</th>
                  <th className="px-4 py-3.5 font-bold">Sentiment</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B1F4D]/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#160D1F]/50 transition-colors">
                    <td className="px-5 py-4 max-w-md">
                      <p className="text-[#F8FAFC] text-sm font-medium leading-relaxed">{item.content}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#160D1F] border border-[#3B1F4D] text-[#A78BFA] font-bold capitalize">
                        {item.channel.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.themes.map((t) => (
                          <span
                            key={t.theme.id}
                            className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${t.theme.color}20`,
                              borderColor: `${t.theme.color}50`,
                              color: t.theme.color || "#A855F7",
                            }}
                          >
                            {t.theme.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge kind="sentiment" value={item.sentiment} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className="glass-input text-xs rounded-lg px-2 py-1 font-bold cursor-pointer border border-[#3B1F4D]"
                      >
                        <option value="NEW" className="bg-[#0D0712]">NEW</option>
                        <option value="REVIEWED" className="bg-[#0D0712]">REVIEWED</option>
                        <option value="ACTIONED" className="bg-[#0D0712]">ACTIONED</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-[#A78BFA] whitespace-nowrap font-mono text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#3B1F4D] bg-[#160D1F]/60 text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3.5 py-1.5 rounded-xl border border-[#3B1F4D] text-[#A78BFA] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#160D1F] transition"
            >
              ← Previous
            </button>
            <span className="text-slate-300 font-semibold">
              Page <strong className="text-[#EF4444] font-black">{page}</strong> of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3.5 py-1.5 rounded-xl border border-[#3B1F4D] text-[#A78BFA] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#160D1F] transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
