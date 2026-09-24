export const dynamic = "force-dynamic";


// This route deliberately never lets Claude see the raw question without
// first attaching real feedback as grounding context (see lib/ai.ts).
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { askSchema } from "@/lib/validations";
import { retrieveRelevantFeedback } from "@/lib/search";
import { answerFromFeedback } from "@/lib/ai";
import { handleError } from "../../feedback/route";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const relevant = await retrieveRelevantFeedback(user.workspaceId, parsed.data.question);
    const answer = await answerFromFeedback(
      parsed.data.question,
      relevant.map((f) => ({ id: f.id, content: f.content, channel: f.channel, sentiment: f.sentiment }))
    );

    return NextResponse.json({
      answer,
      sources: relevant.map((f) => ({ id: f.id, content: f.content, channel: f.channel })),
    });
  } catch (err) {
    return handleError(err);
  }
}
