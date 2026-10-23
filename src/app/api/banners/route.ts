import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BannerPosition } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") as BannerPosition | null;

    const where: { isActive: boolean; position?: BannerPosition } = {
      isActive: true,
    };

    if (position && ["TOP", "BOTTOM", "LEFT", "RIGHT"].includes(position)) {
      where.position = position;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({ success: true, banners });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load banners",
      },
      { status: 500 }
    );
  }
}
