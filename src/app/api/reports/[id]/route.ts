export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError } from "../../feedback/route";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const report = await db.report.findFirst({
      where: { id: params.id, workspaceId: user.workspaceId },
    });
    if (!report) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(report);
  } catch (err) {
    return handleError(err);
  }
}
