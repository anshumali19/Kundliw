import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { linksInputSchema } from "@/lib/content/media";
import { withJsonLinks } from "@/lib/content/json";

const testimonialSchema = z.object({
  authorNameEn: z.string().min(2),
  authorNameHi: z.string().min(2),
  authorTitleEn: z.string().min(2),
  authorTitleHi: z.string().min(2),
  cityEn: z.string().min(2),
  cityHi: z.string().min(2),
  quoteEn: z.string().min(10),
  quoteHi: z.string().min(10),
  rating: z.number().int().min(1).max(5).default(5),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  photoUrl: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  orderIndex: z.number().int().default(0),
});

export async function GET() {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: withJsonLinks(parsed.data),
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
