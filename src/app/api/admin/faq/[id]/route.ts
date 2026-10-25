import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFaqSchema = z.object({
  questionEn: z.string().trim().min(3).optional(),
  questionHi: z.string().trim().min(3).optional(),
  answerEn: z.string().trim().min(5).optional(),
  answerHi: z.string().trim().min(5).optional(),
  category: z.string().trim().optional(),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await req.json();
    const parsed = updateFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.faqItem.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("[API Admin FAQ PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ item." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    await prisma.faqItem.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "FAQ item deleted." });
  } catch (error) {
    console.error("[API Admin FAQ DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ item." },
      { status: 500 }
    );
  }
}
