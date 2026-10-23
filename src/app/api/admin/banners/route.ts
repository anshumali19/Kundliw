import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { BannerPosition, BannerType } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bannerSchema = z.object({
  titleEn: z.string().min(2),
  titleHi: z.string().min(2),
  subtitleEn: z.string().optional().nullable(),
  subtitleHi: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  linkUrl: z.string().optional().nullable(),
  position: z.nativeEnum(BannerPosition).default(BannerPosition.RIGHT),
  type: z.nativeEnum(BannerType).default(BannerType.STATIC),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { orderIndex: "asc" }],
    });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch banners";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await guardApiAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create banner";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
