import { NextRequest, NextResponse } from "next/server";
import { matchChatbotQuery } from "@/lib/chatbot/matcher";
import { getClientIp, checkDbRateLimit } from "@/lib/rateLimit";

const MAX_QUERY_LENGTH = 500;

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Rate limit: 20 chatbot queries per IP per minute (60 seconds)
  const rl = await checkDbRateLimit({
    scope: "CHATBOT_ASK",
    identifier: ip,
    windowSeconds: 60,
    maxAllowed: 20,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get("q") || "";
  const q = rawQ.trim();

  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Query exceeds maximum permitted length of ${MAX_QUERY_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const locale = (searchParams.get("locale") === "en" ? "en" : "hi") as "hi" | "en";

  try {
    const result = await matchChatbotQuery(q, locale);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[API Chatbot Ask] Error:", error);
    return NextResponse.json(
      { error: "Error processing query" },
      { status: 500 }
    );
  }
}
