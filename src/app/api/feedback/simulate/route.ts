// POST /api/feedback/simulate — the "simulated channel" ingestion
// required by scope (Section 4.1). Pretends to pull from an app-store
// feed by seeding a handful of realistic items in the chosen channel.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { classifyAndIndex, handleError } from "../route";

const SAMPLE_BY_CHANNEL: Record<string, string[]> = {
  support_ticket: [
    "I have followed up twice and still need help exporting last month's report.",
    "The support agent solved my webhook issue quickly and explained the fix clearly.",
  ],
  app_store: [
    "Five stars, but the search bar could be faster.",
    "Crashes on launch since the last update, please fix.",
    "Exactly the tool our team needed, worth every penny.",
  ],
  community: [
    "Does anyone know if there's a dark mode roadmap?",
    "Just migrated our whole team over, onboarding was rough but we're happy now.",
  ],
  sales_call: [
    "Customer flagged that competitor X offers better reporting.",
    "Renewal call went well, they want a dedicated Slack channel added.",
  ],
  nps_survey: [
    "The product is easy to recommend, especially for teams that need feedback trends in one place.",
    "I like the insights, but the first-time setup was harder than expected.",
  ],
};

export async function POST(req: Request) {
  try {
    const user = await requireUser(["ADMIN", "ANALYST"]);
    const { channel } = await req.json();

    const samples = SAMPLE_BY_CHANNEL[channel];
    if (!samples) {
      return NextResponse.json({ error: "Unknown simulated channel." }, { status: 400 });
    }

    let imported = 0;
    for (const content of samples) {
      const feedback = await db.feedback.create({
        data: { content, channel, workspaceId: user.workspaceId },
      });
      await classifyAndIndex(feedback.id, feedback.content, user.workspaceId);
      imported++;
    }

    return NextResponse.json({ imported });
  } catch (err) {
    return handleError(err);
  }
}
