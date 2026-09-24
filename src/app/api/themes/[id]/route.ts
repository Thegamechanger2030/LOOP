export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError } from "../../feedback/route";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const theme = await db.theme.findFirst({
      where: { id: params.id, workspaceId: user.workspaceId },
    });
    if (!theme) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const feedback = await db.feedback.findMany({
      where: { workspaceId: user.workspaceId, themes: { some: { themeId: theme.id } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ theme, feedback });
  } catch (err) {
    return handleError(err);
  }
}
