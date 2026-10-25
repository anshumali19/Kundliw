import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { MarqueePosition } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const marqueeUpdateSchema = z.object({
  textEn: z.string().min(2).optional(),
  textHi: z.string().min(2).optional(),
  speedSec: z.number().int().min(5).max(120).optional(),
  fontSize: z.number().int().min(10).max(36).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  position: z.nativeEnum(MarqueePosition).optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = marqueeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = await prisma.marqueeItem.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Failed to update marquee item:", error);
    return NextResponse.json({ error: "Failed to update marquee item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    await prisma.marqueeItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Marquee item deleted" });
  } catch (error) {
    console.error("Failed to delete marquee item:", error);
    return NextResponse.json({ error: "Failed to delete marquee item" }, { status: 500 });
  }
}
