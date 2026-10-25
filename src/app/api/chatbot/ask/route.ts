import { NextRequest, NextResponse } from "next/server";
import { matchChatbotQuery } from "@/lib/chatbot/matcher";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
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
