import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFaqSchema = z.object({
  questionEn: z.string().trim().min(3, "English question must be at least 3 characters"),
  questionHi: z.string().trim().min(3, "Hindi question must be at least 3 characters"),
  answerEn: z.string().trim().min(5, "English answer must be at least 5 characters"),
  answerHi: z.string().trim().min(5, "Hindi answer must be at least 5 characters"),
  category: z.string().trim().default("GENERAL"),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const items = await prisma.faqItem.findMany({
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[API Admin FAQ GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load FAQ items." },
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
    const parsed = createFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = await prisma.faqItem.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error("[API Admin FAQ POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ item." },
      { status: 500 }
    );
  }
}
