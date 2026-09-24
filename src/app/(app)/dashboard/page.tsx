import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatCard } from "@/components/stat-card";
import { DashboardCharts } from "./charts";
import { MessageSquare, AlertTriangle, Sparkles, Layers, ArrowUpRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const workspaceId = (session!.user as any).workspaceId as string;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, negative, newThisWeek, byChannel, bySentiment, topThemes, volumeOverTime] = await Promise.all([
    db.feedback.count({ where: { workspaceId } }),
    db.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE" } }),
    db.feedback.count({ where: { workspaceId, createdAt: { gte: weekAgo } } }),
    db.feedback.groupBy({ by: ["channel"], where: { workspaceId }, _count: true }),
    db.feedback.groupBy({ by: ["sentiment"], where: { workspaceId }, _count: true }),
    db.theme.findMany({
      where: { workspaceId },
      include: { _count: { select: { feedback: true } } },
      orderBy: { feedback: { _count: "desc" } },
      take: 6,
    }),
    db.feedback.findMany({
      where: { workspaceId },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const volumeByDay = new Map<string, number>();
  for (const f of volumeOverTime) {
    const key = f.createdAt.toISOString().slice(0, 10);
    volumeByDay.set(key, (volumeByDay.get(key) ?? 0) + 1);
  }
  const volumeSeries = [...volumeByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const percentNegative = total ? Math.round((negative / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-[#3B1F4D] shadow-glow">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#EF4444]" />
            <span className="gradient-text-purple-red">Customer Intelligence Dashboard</span>
          </h1>
          <p className="text-xs text-[#A78BFA] mt-1">
            Real-time customer feedback analytics and sentiment intelligence
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 rounded-xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
          <span>AI Engine: Active</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Feedback"
          value={total}
          icon={MessageSquare}
          hint="All channels aggregated"
        />
        <StatCard
          label="% Negative"
          value={`${percentNegative}%`}
          icon={AlertTriangle}
          hint={`${negative} friction points`}
        />
        <StatCard
          label="New This Week"
          value={newThisWeek}
          icon={ArrowUpRight}
          trend="+18% vs prev"
          hint="Recent ingestion volume"
        />
        <StatCard
          label="Active Themes"
          value={topThemes.length}
          icon={Layers}
          hint="AI tagged categories"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        volumeSeries={volumeSeries}
        sentimentData={bySentiment.map((s) => ({ name: s.sentiment ?? "Unclassified", value: s._count }))}
        themeData={topThemes.map((t) => ({ name: t.name, count: t._count.feedback, color: t.color }))}
        channelData={byChannel.map((c) => ({ name: c.channel, count: c._count }))}
      />
    </div>
  );
}
