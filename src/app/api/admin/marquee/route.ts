import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { MarqueePosition } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const marqueeSchema = z.object({
  textEn: z.string().min(2),
  textHi: z.string().min(2),
  speedSec: z.number().int().min(5).max(120).default(30),
  fontSize: z.number().int().min(10).max(36).default(13),
  bgColor: z.string().default("var(--secondary)"),
  textColor: z.string().default("var(--on-secondary)"),
  position: z.nativeEnum(MarqueePosition).default(MarqueePosition.BOTTOM),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export async function GET() {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const items = await prisma.marqueeItem.findMany({
      orderBy: [{ position: "asc" }, { orderIndex: "asc" }],
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch marquee items";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = marqueeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = await prisma.marqueeItem.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create marquee item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
