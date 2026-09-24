// POST /api/reports/generate — Voice-of-Customer report (AI4).
// Stats are computed in plain code first; Claude only writes the
// narrative around numbers that are already known to be correct.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { generateReportSchema } from "@/lib/validations";
import { generateReportNarrative, ReportStats } from "@/lib/ai";
import { percentChange, formatDate } from "@/lib/utils";
import { handleError } from "../../feedback/route";

export async function POST(req: Request) {
  try {
    const user = await requireUser(["ADMIN", "ANALYST"]);
    const body = await req.json().catch(() => ({}));
    const { periodDays } = generateReportSchema.parse(body);

    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const [currentItems, previousItems] = await Promise.all([
      db.feedback.findMany({
        where: { workspaceId: user.workspaceId, createdAt: { gte: periodStart } },
        include: { themes: { include: { theme: true } } },
      }),
      db.feedback.findMany({
        where: { workspaceId: user.workspaceId, createdAt: { gte: previousStart, lt: periodStart } },
        include: { themes: { include: { theme: true } } },
      }),
    ]);

    const sentimentBreakdown = {
      positive: currentItems.filter((f) => f.sentiment === "POSITIVE").length,
      neutral: currentItems.filter((f) => f.sentiment === "NEUTRAL").length,
      negative: currentItems.filter((f) => f.sentiment === "NEGATIVE").length,
    };

    const countByTheme = (items: typeof currentItems) => {
      const map = new Map<string, number>();
      for (const item of items) {
        for (const ft of item.themes) {
          map.set(ft.theme.name, (map.get(ft.theme.name) ?? 0) + 1);
        }
      }
      return map;
    };

    const currentCounts = countByTheme(currentItems);
    const previousCounts = countByTheme(previousItems);

    const topThemes = [...currentCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        deltaVsPrevious: percentChange(count, previousCounts.get(name) ?? 0),
      }));

    const sampleQuotes = currentItems
      .filter((f) => f.sentiment === "NEGATIVE")
      .slice(0, 3)
      .map((f) => f.content);

    const stats: ReportStats = {
      periodLabel: `${formatDate(periodStart)} – ${formatDate(now)}`,
      totalItems: currentItems.length,
      sentimentBreakdown,
      topThemes,
      sampleQuotes: sampleQuotes.length ? sampleQuotes : currentItems.slice(0, 3).map((f) => f.content),
    };

    const narrative = await generateReportNarrative(stats);

    const report = await db.report.create({
      data: {
        title: `Voice of Customer — ${stats.periodLabel}`,
        periodStart,
        periodEnd: now,
        contentJson: JSON.stringify({ stats, ...narrative }),
        workspaceId: user.workspaceId,
        generatedById: user.id,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
