export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError } from "../feedback/route";

export async function GET() {
  try {
    const user = await requireUser();
    const reports = await db.report.findMany({
      where: { workspaceId: user.workspaceId },
      orderBy: { createdAt: "desc" },
      include: { generatedBy: { select: { name: true } } },
    });
    return NextResponse.json(reports);
  } catch (err) {
    return handleError(err);
  }
}
