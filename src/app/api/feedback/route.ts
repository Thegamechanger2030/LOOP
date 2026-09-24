export const dynamic = "force-dynamic";


// POST /api/feedback  — single-entry creation (Analyst/Admin only)
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { createFeedbackSchema } from "@/lib/validations";
import { classifyFeedback } from "@/lib/ai";
import { indexFeedback } from "@/lib/search";

export async function GET(req: Request) {
  try {
    const user = await requireUser(); // any role may view

    const { searchParams } = new URL(req.url);
    const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = 20;
    const search = searchParams.get("search")?.trim();
    const channel = searchParams.get("channel");
    const sentiment = searchParams.get("sentiment");
    const status = searchParams.get("status");
    const themeId = searchParams.get("themeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Every filter below is AND-ed with workspaceId — this is the tenant
    // isolation boundary. There is no query path here that skips it.
    const where: any = { workspaceId: user.workspaceId };
    if (search) where.content = { contains: search, mode: "insensitive" };
    if (channel) where.channel = channel;
    if (sentiment) where.sentiment = sentiment;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json({ error: "Invalid 'from' date." }, { status: 400 });
        }
        where.createdAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json({ error: "Invalid 'to' date." }, { status: 400 });
        }
        where.createdAt.lte = toDate;
      }
    }
    if (themeId) where.themes = { some: { themeId } };

    const [items, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: { themes: { include: { theme: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.feedback.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(["ADMIN", "ANALYST"]);
    const body = await req.json();
    const parsed = createFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const feedback = await db.feedback.create({
      data: { ...parsed.data, workspaceId: user.workspaceId },
    });

    await classifyAndIndex(feedback.id, feedback.content, user.workspaceId);

    const fresh = await db.feedback.findUnique({
      where: { id: feedback.id },
      include: { themes: { include: { theme: true } } },
    });

    return NextResponse.json(fresh, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

/** Shared by single-entry, CSV import, and channel simulation. */
export async function classifyAndIndex(feedbackId: string, content: string, workspaceId: string) {
  const existingThemes = await db.theme.findMany({ where: { workspaceId }, select: { name: true } });

  try {
    const result = await classifyFeedback(content, existingThemes.map((t) => t.name));

    const theme = await db.theme.upsert({
      where: { workspaceId_name: { workspaceId, name: result.theme } },
      update: {},
      create: { workspaceId, name: result.theme },
    });

    await db.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: result.sentiment,
        sentimentScore: result.sentimentScore,
        featureArea: result.featureArea,
        themes: {
          create: { themeId: theme.id, confidence: 0.9 },
        },
      },
    });
  } catch (err) {
    // Classification failing shouldn't lose the feedback item itself —
    // it just stays unclassified until a manual re-classify is triggered.
    console.error(`Classification failed for feedback ${feedbackId}:`, err);
  }

  try {
    await indexFeedback(feedbackId, content);
  } catch (err) {
    // Search indexing is optional; ingestion must remain successful if it is unavailable.
    console.error(`Search indexing failed for feedback ${feedbackId}:`, err);
  }
}

export function handleError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}
