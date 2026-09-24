// Sign-up creates a brand-new Workspace + the first User as its ADMIN.
// This is the only route that creates a workspace — everyone who joins
// afterwards is invited into an existing one by an admin.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, workspaceName } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const workspace = await db.workspace.create({
    data: {
      name: workspaceName,
      users: {
        create: { name, email, passwordHash, role: "ADMIN" },
      },
    },
  });

  return NextResponse.json({ workspaceId: workspace.id }, { status: 201 });
}
