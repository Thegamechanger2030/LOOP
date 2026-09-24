import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Printer, FileText, CheckCircle2, Quote } from "lucide-react";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const workspaceId = (session!.user as any).workspaceId as string;

  const report = await db.report.findFirst({ where: { id: params.id, workspaceId } });
  if (!report) notFound();

  const content = typeof report.contentJson === "string" ? JSON.parse(report.contentJson) : (report.contentJson as any);

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/reports"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Reports</span>
        </Link>
      </div>

      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{report.title}</h1>
          <p className="text-xs text-slate-400 mt-1">Generated on {formatDate(report.createdAt)}</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <p className="text-3xl font-black text-white">{content.stats?.totalItems || 0}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Total Items</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center">
          <p className="text-3xl font-black text-emerald-400">{content.stats?.sentimentBreakdown?.positive || 0}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Positive</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-rose-500/20 text-center">
          <p className="text-3xl font-black text-rose-400">{content.stats?.sentimentBreakdown?.negative || 0}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Negative</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-400" />
          Executive Summary
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
          {content.summary}
        </p>
      </div>

      {/* Top Themes */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white">Top Theme Growth</h2>
        <div className="space-y-2">
          {content.stats?.topThemes?.map((t: any) => (
            <div
              key={t.name}
              className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-900/80 border border-slate-800"
            >
              <span className="font-semibold text-slate-200">{t.name}</span>
              <span className="text-slate-400 font-mono">
                {t.count} items ({t.deltaVsPrevious >= 0 ? "+" : ""}
                {t.deltaVsPrevious}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Recommended Action Plan
        </h2>
        <ul className="space-y-2 text-xs text-slate-300">
          {content.recommendedActions?.map((a: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {i + 1}
              </span>
              <span className="mt-0.5">{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quotes */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 print:break-inside-avoid">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Quote className="w-4 h-4 text-brand-400" />
          Representative Customer Quotes
        </h2>
        <div className="space-y-2.5">
          {content.stats?.sampleQuotes?.map((q: string, i: number) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border-l-4 border-brand-500 text-xs text-slate-300 italic">
              "{q}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
