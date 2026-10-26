import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { linksInputSchema } from "@/lib/content/media";
import { withJsonLinks } from "@/lib/content/json";

const testimonialUpdateSchema = z.object({
  authorNameEn: z.string().min(2).optional(),
  authorNameHi: z.string().min(2).optional(),
  authorTitleEn: z.string().min(2).optional(),
  authorTitleHi: z.string().min(2).optional(),
  cityEn: z.string().min(2).optional(),
  cityHi: z.string().min(2).optional(),
  quoteEn: z.string().min(10).optional(),
  quoteHi: z.string().min(10).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  photoUrl: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
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
    const parsed = testimonialUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: withJsonLinks(parsed.data),
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    await prisma.testimonial.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
