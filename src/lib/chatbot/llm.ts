import { prisma } from "@/lib/prisma";

const DEFAULT_MODEL = "gemini-flash-lite-latest";
const TIMEOUT_MS = 12000;

export function isLlmConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Free AI answer using Google Gemini (free tier of Google AI Studio).
 * The model is told to answer only from the Kendra knowledge base.
 * Returns null on any failure so the caller can fall back to rule-based answers.
 */
export async function askLlm(query: string, locale: "hi" | "en"): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const [qa, settings] = await Promise.all([
    prisma.chatbotQA.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" }, take: 60 }).catch(() => []),
    prisma.adminSettings
      .findUnique({ where: { id: "default" }, select: { phone1: true, whatsappNumber: true } })
      .catch(() => null),
  ]);

  const knowledge = qa
    .map((q) => `Q: ${locale === "hi" ? q.questionHi : q.questionEn}\nA: ${locale === "hi" ? q.answerHi : q.answerEn}`)
    .join("\n\n");
  const contact = settings?.whatsappNumber || settings?.phone1 || "";

  const system = [
    "You are the website assistant of Maharshi Kanad Jyotish Kendra, a Vedic astrology centre.",
    `Reply in ${locale === "hi" ? "Hindi (Devanagari)" : "English"}, politely, in at most 5 short sentences. Plain text; you may use **bold** for key words.`,
    "Answer using ONLY the knowledge base below. Never invent prices, addresses, timings or guarantees.",
    "Do not give medical, legal or financial advice or promise outcomes; astrology is guidance.",
    `If the answer is not in the knowledge base, say you are not sure and suggest contacting the Kendra${contact ? ` (${contact})` : ""} or submitting an enquiry.`,
    "",
    "KNOWLEDGE BASE:",
    knowledge || "(empty)",
  ].join("\n");

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: query }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}
