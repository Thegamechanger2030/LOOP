export const dynamic = "force-dynamic";


// by both the Trends view and the dashboard's "top themes" chart (AI2).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError } from "../feedback/route";
import { percentChange } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();

    const themes = await db.theme.findMany({
      where: { workspaceId: user.workspaceId },
      include: { _count: { select: { feedback: true } } },
    });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const withTrends = await Promise.all(
      themes.map(async (theme) => {
        const [thisWeek, lastWeek] = await Promise.all([
          db.feedbackTheme.count({
            where: { themeId: theme.id, feedback: { createdAt: { gte: weekAgo } } },
          }),
          db.feedbackTheme.count({
            where: { themeId: theme.id, feedback: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } },
          }),
        ]);

        return {
          id: theme.id,
          name: theme.name,
          color: theme.color,
          totalCount: theme._count.feedback,
          thisWeek,
          lastWeek,
          trendPercent: percentChange(thisWeek, lastWeek),
        };
      })
    );

    withTrends.sort((a, b) => b.totalCount - a.totalCount);

    return NextResponse.json(withTrends);
  } catch (err) {
    return handleError(err);
  }
}
