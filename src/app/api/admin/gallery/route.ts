import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { linksInputSchema } from "@/lib/content/media";
import { withJsonLinks } from "@/lib/content/json";

const gallerySchema = z.object({
  titleEn: z.string().min(2),
  titleHi: z.string().min(2),
  captionEn: z.string().optional().nullable(),
  captionHi: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  videoUrl: z.string().optional().nullable(),
  mediaType: z.enum(["IMAGE", "VIDEO", "YOUTUBE"]).default("IMAGE"),
  externalLink: z.string().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export async function GET() {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const items = await prisma.mediaGalleryItem.findMany({
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Failed to fetch gallery items:", error);
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = await prisma.mediaGalleryItem.create({
      data: withJsonLinks(parsed.data),
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery item:", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}
