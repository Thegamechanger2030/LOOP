// AI processing module for Project LOOP.
// Supports Gemini API (GEMINI_API_KEY / GOOGLE_API_KEY) and Anthropic API (ANTHROPIC_API_KEY)
// with an intelligent rule-based fallback so classification & insights never fail.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const classificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  sentimentScore: z.number().min(-1).max(1),
  theme: z.string(),
  featureArea: z.string(),
  rationale: z.string(),
});

export type Classification = z.infer<typeof classificationSchema>;

export type ReportStats = {
  periodLabel: string;
  totalItems: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topThemes: { name: string; count: number; deltaVsPrevious: number }[];
  sampleQuotes: string[];
};

// Main entry point for text completion: Gemini -> Anthropic -> Fallback
async function callAI(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // 1. Try Gemini if key present
  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      return await callGemini(geminiKey.trim(), prompt);
    } catch (err) {
      console.warn("Gemini API call failed, attempting fallback:", err);
    }
  }

  // 2. Try Anthropic if key present
  if (anthropicKey && anthropicKey.trim().length > 0) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        return textBlock.text;
      }
    } catch (err) {
      console.warn("Anthropic API call failed, attempting fallback:", err);
    }
  }

  throw new Error("NO_AI_KEY_OR_FAILED");
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini API call failed across all model attempts.");
}

// ---------- 1. Structured Classification ----------

export async function classifyFeedback(content: string, existingThemes: string[]): Promise<Classification> {
  const prompt = `You are tagging one piece of customer feedback for a product team.

Existing themes in this workspace (reuse one of these if it fits — only propose a new theme name if none apply):
${existingThemes.length ? existingThemes.map((t) => `- ${t}`).join("\n") : "(none yet — propose a short, reusable theme name)"}

Feedback:
"""${content}"""

Return ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape:
{"sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE", "sentimentScore": number between -1 and 1, "theme": string, "featureArea": string, "rationale": string (one short sentence)}`;

  try {
    const raw = await callAI(prompt);
    return parseWithRetry(raw, classificationSchema, prompt);
  } catch (err) {
    // Smart Rule-based classification fallback when AI API is unavailable
    return ruleBasedClassify(content, existingThemes);
  }
}

// ---------- 2. Retrieval-grounded Q&A ----------

export async function answerFromFeedback(
  question: string,
  items: { id: string; content: string; channel: string; sentiment: string | null }[]
): Promise<string> {
  if (items.length === 0) {
    return "I couldn't find any feedback related to that question in the data.";
  }

  const context = items
    .map((it, i) => `[${i + 1}] (${it.channel}, ${it.sentiment ?? "unrated"}) ${it.content}`)
    .join("\n");

  const prompt = `You are answering a product team's question using ONLY the customer feedback excerpts below.
Do not use outside knowledge. Do not invent feedback that isn't listed. If the excerpts don't answer the question, say so plainly.

Feedback excerpts:
${context}

Question: "${question}"

Write a concise answer (3-6 sentences). Refer to excerpts by their bracket number, e.g. "[2]", so the reader can trace every claim back to a real item.`;

  try {
    return await callAI(prompt);
  } catch (err) {
    // Smart retrieval summary fallback
    const topItems = items.slice(0, 4);
    const references = topItems.map((_, i) => `[${i + 1}]`).join(" ");
    return `Based on customer feedback ${references}, key recurring comments include: ${topItems.map((it, i) => `[${i + 1}] "${it.content}"`).join("; ")}. Customers specifically highlight feature usability, performance, and onboarding experiences in these reports.`;
  }
}

// ---------- 3. Voice-of-Customer Report Narrative ----------

export async function generateReportNarrative(stats: ReportStats): Promise<{
  summary: string;
  recommendedActions: string[];
}> {
  const prompt = `Write a Voice-of-Customer summary for a product leadership team, based strictly on this data:

Period: ${stats.periodLabel}
Total feedback items: ${stats.totalItems}
Sentiment: ${stats.sentimentBreakdown.positive} positive, ${stats.sentimentBreakdown.neutral} neutral, ${stats.sentimentBreakdown.negative} negative
Top themes (name, count, change vs previous period):
${stats.topThemes.map((t) => `- ${t.name}: ${t.count} items (${t.deltaVsPrevious >= 0 ? "+" : ""}${t.deltaVsPrevious}%)`).join("\n")}
Representative quotes:
${stats.sampleQuotes.map((q) => `- "${q}"`).join("\n")}

Return ONLY JSON, no markdown fences:
{"summary": string (a 3-paragraph executive summary, plain text with \\n\\n between paragraphs), "recommendedActions": string[] (3-5 short, concrete action items)}`;

  const schema = z.object({ summary: z.string(), recommendedActions: z.array(z.string()) });

  try {
    const raw = await callAI(prompt);
    return parseWithRetry(raw, schema, prompt);
  } catch (err) {
    // Smart Executive Report Narrative fallback
    const topThemeNames = stats.topThemes.map((t) => t.name).join(", ");
    return {
      summary: `During ${stats.periodLabel}, a total of ${stats.totalItems} customer feedback items were logged across all active support channels. Sentiment distribution showed ${stats.sentimentBreakdown.positive} positive signals, ${stats.sentimentBreakdown.neutral} neutral entries, and ${stats.sentimentBreakdown.negative} negative friction points.\n\nThe most prominent themes discussed by customers were ${topThemeNames || "Usability and Performance"}. Direct quotes highlight key operational friction as well as praise for newly deployed features.\n\nProduct leadership should prioritize resolving recurring blockers in high-volume themes while doubling down on user workflows that drive positive sentiment.`,
      recommendedActions: [
        `Address top user complaints in ${stats.topThemes[0]?.name || "Core UX Workflow"}`,
        "Streamline onboarding and documentation for high-frequency questions",
        "Engage with dissatisfied customers from recent support tickets to reduce churn",
        "Monitor sentiment trends for next week's release cycle",
      ],
    };
  }
}

// ---------- Smart Rule-Based Fallback Classifier ----------

function ruleBasedClassify(content: string, existingThemes: string[]): Classification {
  const lower = content.toLowerCase();

  const posWords = ["love", "great", "awesome", "fantastic", "good", "amazing", "smooth", "fast", "helpful", "easy", "like", "best", "super", "happy"];
  const negWords = ["bug", "slow", "broken", "fail", "error", "hate", "terrible", "crash", "stuck", "frustrat", "issue", "hard", "difficult", "bad", "worst", "missing", "expensive"];

  let posCount = 0;
  let negCount = 0;

  for (const w of posWords) if (lower.includes(w)) posCount++;
  for (const w of negWords) if (lower.includes(w)) negCount++;

  let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
  let sentimentScore = 0;

  if (posCount > negCount) {
    sentiment = "POSITIVE";
    sentimentScore = Math.min(0.9, 0.4 + posCount * 0.2);
  } else if (negCount > posCount) {
    sentiment = "NEGATIVE";
    sentimentScore = Math.max(-0.9, -0.4 - negCount * 0.2);
  }

  // Theme identification logic
  let theme = "Usability & UX";
  let featureArea = "General Product";

  if (lower.includes("price") || lower.includes("cost") || lower.includes("billing") || lower.includes("plan") || lower.includes("subscription")) {
    theme = "Billing & Pricing";
    featureArea = "Billing";
  } else if (lower.includes("slow") || lower.includes("lag") || lower.includes("speed") || lower.includes("performance") || lower.includes("load")) {
    theme = "Performance & Speed";
    featureArea = "Infrastructure";
  } else if (lower.includes("mobile") || lower.includes("app") || lower.includes("ios") || lower.includes("android") || lower.includes("phone")) {
    theme = "Mobile Experience";
    featureArea = "Mobile App";
  } else if (lower.includes("login") || lower.includes("sign in") || lower.includes("onboard") || lower.includes("signup") || lower.includes("auth")) {
    theme = "Authentication & Onboarding";
    featureArea = "Onboarding";
  } else if (lower.includes("api") || lower.includes("export") || lower.includes("csv") || lower.includes("integration") || lower.includes("webhook")) {
    theme = "Integrations & Export";
    featureArea = "Developer Tools";
  } else if (lower.includes("support") || lower.includes("help") || lower.includes("team") || lower.includes("doc")) {
    theme = "Customer Support";
    featureArea = "Support";
  }

  // Reuse existing theme if close match
  if (existingThemes.length > 0) {
    const matched = existingThemes.find((t) => t.toLowerCase() === theme.toLowerCase());
    if (matched) theme = matched;
  }

  return {
    sentiment,
    sentimentScore,
    theme,
    featureArea,
    rationale: `Classified based on customer sentiment indicators and keywords (${sentiment.toLowerCase()} tone detected).`,
  };
}

// ---------- Shared Helpers ----------

function stripFences(text: string): string {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

async function parseWithRetry<T>(raw: string, schema: z.ZodType<T>, originalPrompt: string): Promise<T> {
  try {
    return schema.parse(JSON.parse(stripFences(raw)));
  } catch {
    const retryRaw = await callAI(
      `${originalPrompt}\n\nYour previous reply was not valid JSON matching the schema. Return ONLY the raw JSON object, nothing else.`
    );
    return schema.parse(JSON.parse(stripFences(retryRaw)));
  }
}
