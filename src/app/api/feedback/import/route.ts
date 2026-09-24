// POST /api/feedback/import — CSV bulk upload (C3).
// Accepts multipart/form-data with a single `file` field.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseFeedbackCsv } from "@/lib/csv";
import { classifyAndIndex, handleError } from "../route";

export async function POST(req: Request) {
  try {
    const user = await requireUser(["ADMIN", "ANALYST"]);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const text = await file.text();
    const { rows, failedCount } = parseFeedbackCsv(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found in CSV. Please make sure your CSV contains columns for content/feedback." },
        { status: 400 }
      );
    }

    let imported = 0;
    let rowFailures = 0;

    for (const row of rows) {
      try {
        let validDate: Date | undefined = undefined;
        if (row.created_at) {
          const d = new Date(row.created_at);
          if (!isNaN(d.getTime())) validDate = d;
        }

        const feedback = await db.feedback.create({
          data: {
            content: row.content,
            channel: row.channel || "support_ticket",
            customerLabel: row.customer_label,
            workspaceId: user.workspaceId,
            createdAt: validDate,
          },
        });

        // Run classification cleanly
        await classifyAndIndex(feedback.id, feedback.content, user.workspaceId);
        imported++;
      } catch (rowErr) {
        console.error("Failed to import individual feedback row:", rowErr);
        rowFailures++;
      }
    }

    return NextResponse.json({ imported, failed: failedCount + rowFailures });
  } catch (err) {
    return handleError(err);
  }
}
