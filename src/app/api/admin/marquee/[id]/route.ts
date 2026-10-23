import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await guardApiAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 401 });
    }

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
    const msg = error instanceof Error ? error.message : "Failed to update marquee item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await guardApiAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 401 });
    }

    await prisma.marqueeItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Marquee item deleted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete marquee item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
