export const dynamic = "force-dynamic";


// POST /api/members — invite a teammate with a role (Admin only, C2).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { inviteMemberSchema } from "@/lib/validations";
import { handleError } from "../feedback/route";

export async function GET() {
  try {
    const user = await requireUser();
    const members = await db.user.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(members);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(["ADMIN"]);
    const body = await req.json();
    const parsed = inviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const member = await db.user.create({
      data: { ...parsed.data, passwordHash, workspaceId: user.workspaceId },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
