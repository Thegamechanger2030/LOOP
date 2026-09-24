export const dynamic = "force-dynamic";


// the manual re-classify action (AI1 acceptance criteria).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { updateFeedbackStatusSchema } from "@/lib/validations";
import { classifyAndIndex, handleError } from "../route";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(["ADMIN", "ANALYST"]);

    // Scope the lookup by workspaceId FIRST — a Viewer from another
    // tenant guessing an ID must get a 404, never a 403 that confirms
    // the row exists.
    const existing = await db.feedback.findFirst({
      where: { id: params.id, workspaceId: user.workspaceId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const body = await req.json();

    if (body.action === "reclassify") {
      await classifyAndIndex(existing.id, existing.content, user.workspaceId);
      const fresh = await db.feedback.findUnique({
        where: { id: existing.id },
        include: { themes: { include: { theme: true } } },
      });
      return NextResponse.json(fresh);
    }

    const parsed = updateFeedbackStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await db.feedback.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err);
  }
}
