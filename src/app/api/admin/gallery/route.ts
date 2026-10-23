import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const gallerySchema = z.object({
  titleEn: z.string().min(2),
  titleHi: z.string().min(2),
  captionEn: z.string().optional().nullable(),
  captionHi: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  orderIndex: z.number().int().default(0),
});

export async function GET() {
  try {
    const items = await prisma.mediaGalleryItem.findMany({
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch gallery items";
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
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = await prisma.mediaGalleryItem.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create gallery item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
