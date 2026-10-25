import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateChatbotQASchema = z.object({
  questionEn: z.string().min(2).optional(),
  questionHi: z.string().min(2).optional(),
  answerEn: z.string().min(5).optional(),
  answerHi: z.string().min(5).optional(),
  keywords: z.array(z.string()).optional(),
  quickReplyEn: z.string().nullable().optional(),
  quickReplyHi: z.string().nullable().optional(),
  category: z.string().optional(),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    const body = await req.json();
    const parsed = updateChatbotQASchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.chatbotQA.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("[API Admin Chatbot PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update chatbot Q&A entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    await prisma.chatbotQA.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Entry deleted." });
  } catch (error) {
    console.error("[API Admin Chatbot DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete chatbot Q&A entry." },
      { status: 500 }
    );
  }
}
