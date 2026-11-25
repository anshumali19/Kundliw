import { NextRequest, NextResponse } from "next/server";
import { hiddenFor } from "@/lib/audience";
import { prisma } from "@/lib/prisma";
import { BannerPosition } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") as BannerPosition | null;

    const where: { isActive: boolean; position?: BannerPosition; id: { notIn: string[] } } = {
      isActive: true,
      id: { notIn: await hiddenFor("banner", "web") },
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
    console.error("Failed to load banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load banners",
      },
      { status: 500 }
    );
  }
}
