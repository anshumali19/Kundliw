import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const chatbotQASchema = z.object({
  questionEn: z.string().min(2),
  questionHi: z.string().min(2),
  answerEn: z.string().min(5),
  answerHi: z.string().min(5),
  keywords: z.array(z.string()).default([]),
  quickReplyEn: z.string().nullable().optional(),
  quickReplyHi: z.string().nullable().optional(),
  category: z.string().default("GENERAL"),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const list = await prisma.chatbotQA.findMany({
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, items: list });
  } catch (error) {
    console.error("[API Admin Chatbot GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chatbot Q&A entries." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await req.json();
    const parsed = chatbotQASchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = await prisma.chatbotQA.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error("[API Admin Chatbot POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create chatbot Q&A entry." },
      { status: 500 }
    );
  }
}
