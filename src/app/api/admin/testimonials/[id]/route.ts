import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

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
  orderIndex: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      data: parsed.data,
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update testimonial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const msg = error instanceof Error ? error.message : "Failed to delete testimonial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
