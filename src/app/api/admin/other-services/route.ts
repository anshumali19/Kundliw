import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { linksInputSchema } from "@/lib/content/media";
import { withJsonLinks } from "@/lib/content/json";

const otherServiceInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  titleEn: z.string().trim().min(2, "English title is required"),
  titleHi: z.string().trim().min(2, "Hindi title is required"),
  taglineEn: z.string().trim().optional().nullable(),
  taglineHi: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().min(10, "English description is required"),
  descriptionHi: z.string().trim().min(10, "Hindi description is required"),
  imageUrl: z.string().trim().optional().nullable(),
  actionUrl: z.string().trim().url().optional().nullable(),
  actionTextEn: z.string().trim().optional().nullable(),
  actionTextHi: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const items = await prisma.otherService.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[API Admin OtherServices GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load other services." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await request.json();
    const parsed = otherServiceInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;
    const existing = await prisma.otherService.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `An item with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const item = await prisma.otherService.create({
      data: withJsonLinks(parsed.data),
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("[API Admin OtherServices POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create other service." },
      { status: 500 }
    );
  }
}
