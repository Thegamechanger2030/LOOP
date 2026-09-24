"use client";

import { useState } from "react";
import { PlusCircle, X, Loader2 } from "lucide-react";

export function NewFeedbackForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("support_ticket");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, channel }),
    });

    if (!res.ok) {
      setError("Could not save feedback. Check the fields and try again.");
      setSubmitting(false);
      return;
    }
    onCreated();
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] shadow-combinedGlow relative animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[#EF4444]" />
          Add Customer Feedback Entry
        </h3>
        <button onClick={onClose} className="p-1 rounded-lg text-[#A78BFA] hover:text-white hover:bg-[#160D1F]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-300 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl px-4 py-2.5">{error}</p>}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#A78BFA] mb-1.5">Feedback content</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full glass-input rounded-xl px-4 py-3 text-sm placeholder:text-[#A78BFA]/50 focus:ring-2 focus:ring-[#7C3AED]/40"
            placeholder="What did the customer say? e.g. 'Loved the speed of the new export feature!'"
          />
        </div>
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#A78BFA] mb-1.5">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-sm cursor-pointer"
          >
            {["support_ticket", "app_store", "nps_survey", "sales_call", "community"].map((c) => (
              <option key={c} value={c} className="bg-[#0D0712] text-slate-200">
                {c.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#3B1F4D] text-[#A78BFA] hover:bg-[#160D1F]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="text-xs font-black px-5 py-2.5 rounded-xl gradient-bg-purple-red gradient-bg-purple-red-hover text-white shadow-combinedGlow disabled:opacity-60 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Classifying...</span>
              </>
            ) : (
              <span>Save & Classify</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
