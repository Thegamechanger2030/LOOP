// POST /api/settings/key — Save/update Gemini API Key in server environment
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    await requireUser(["ADMIN"]);

    const body = await req.json();
    const { geminiApiKey } = body;

    if (typeof geminiApiKey !== "string") {
      return NextResponse.json({ error: "Invalid API Key string." }, { status: 400 });
    }

    const trimmedKey = geminiApiKey.trim();
    process.env.GEMINI_API_KEY = trimmedKey;

    // Persist to .env file if it exists
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf-8");
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${trimmedKey}"`);
      } else {
        content += `\nGEMINI_API_KEY="${trimmedKey}"\n`;
      }
      fs.writeFileSync(envPath, content, "utf-8");
    }

    return NextResponse.json({ success: true, message: "Gemini API key saved successfully!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update API key." }, { status: 500 });
  }
}
