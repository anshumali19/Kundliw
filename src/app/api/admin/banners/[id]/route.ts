import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { BannerPosition, BannerType } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bannerUpdateSchema = z.object({
  titleEn: z.string().min(2).optional(),
  titleHi: z.string().min(2).optional(),
  subtitleEn: z.string().optional().nullable(),
  subtitleHi: z.string().optional().nullable(),
  imageUrl: z.string().min(1).optional(),
  linkUrl: z.string().optional().nullable(),
  position: z.nativeEnum(BannerPosition).optional(),
  type: z.nativeEnum(BannerType).optional(),
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
    const parsed = bannerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update banner";
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

    await prisma.banner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete banner";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
