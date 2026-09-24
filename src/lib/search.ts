// Semantic retrieval for "Ask LOOP" (AI3).
import { db } from "./db";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "to", "of", "and", "or", "in",
  "on", "for", "it", "this", "that", "i", "we", "you", "my", "our", "with",
  "at", "be", "have", "has", "do", "does", "not", "so", "but", "as",
]);

export function toVector(text: string): Record<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const vector: Record<string, number> = {};
  for (const w of words) {
    vector[w] = (vector[w] ?? 0) + 1;
  }
  return vector;
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const k of keys) {
    const va = a[k] ?? 0;
    const vb = b[k] ?? 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Called on ingestion — stores the vector for later retrieval. */
export async function indexFeedback(feedbackId: string, content: string) {
  const vectorObj = toVector(content);
  const vectorStr = JSON.stringify(vectorObj);
  await db.embedding.upsert({
    where: { feedbackId },
    update: { vector: vectorStr },
    create: { feedbackId, vector: vectorStr },
  });
}

/** Called by Ask LOOP — returns the top-K most relevant feedback items for a question. */
export async function retrieveRelevantFeedback(workspaceId: string, question: string, topK = 8) {
  const questionVector = toVector(question);

  const embeddings = await db.embedding.findMany({
    where: { feedback: { workspaceId } },
    include: { feedback: true },
  });

  const ranked = embeddings
    .map((e) => {
      let vec: Record<string, number> = {};
      try {
        vec = typeof e.vector === "string" ? JSON.parse(e.vector) : (e.vector as any);
      } catch {}
      return {
        feedback: e.feedback,
        score: cosineSimilarity(questionVector, vec),
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked.map((r) => r.feedback);
}
