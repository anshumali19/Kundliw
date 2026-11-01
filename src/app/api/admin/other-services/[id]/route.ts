import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { linksInputSchema } from "@/lib/content/media";
import { demosInputSchema } from "@/lib/content/demos";
import { withJsonLinks, jsonOrNull } from "@/lib/content/json";

const dayListSchema = z
  .array(
    z.object({
      titleEn: z.string().trim().max(200).default(""),
      titleHi: z.string().trim().max(200).default(""),
      detailsEn: z.string().trim().max(4000).default(""),
      detailsHi: z.string().trim().max(4000).default(""),
    })
  )
  .max(60);

const updateOtherServiceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  titleEn: z.string().trim().min(2, "English title is required").optional(),
  titleHi: z.string().trim().min(2, "Hindi title is required").optional(),
  taglineEn: z.string().trim().optional().nullable(),
  taglineHi: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().min(10, "English description is required").optional(),
  descriptionHi: z.string().trim().min(10, "Hindi description is required").optional(),
  imageUrl: z.string().trim().optional().nullable(),
  actionUrl: z.string().trim().url().optional().nullable(),
  serviceSlug: z.string().trim().max(120).optional().nullable(),
  actionTextEn: z.string().trim().optional().nullable(),
  actionTextHi: z.string().trim().optional().nullable(),
  natureEn: z.string().trim().max(200).optional().nullable(),
  natureHi: z.string().trim().max(200).optional().nullable(),
  numberOfDays: z.coerce.number().int().min(1).max(365).optional().nullable(),
  startDate: z.preprocess((v) => (v === "" || v == null ? null : new Date(String(v))), z.date().nullable()).optional(),
  endDate: z.preprocess((v) => (v === "" || v == null ? null : new Date(String(v))), z.date().nullable()).optional(),
  itineraryDays: dayListSchema.optional().nullable(),
  demos: demosInputSchema.optional().nullable(),
  facebookUrl: z.string().trim().url().optional().nullable(),
  whatsappGroupUrl: z.string().trim().url().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await request.json();
    const parsed = updateOtherServiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { itineraryDays, demos, ...rest } = parsed.data;
    const updated = await prisma.otherService.update({
      where: { id: params.id },
      data: withJsonLinks({ ...rest, ...(itineraryDays !== undefined ? { itineraryDays: jsonOrNull(itineraryDays) } : {}), ...(demos !== undefined ? { demos: jsonOrNull(demos) } : {}) }),
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("[API Admin OtherServices PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update other service." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    // Other services are not tied to orders, so removing really removes it.
    await prisma.otherService.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Other service removed." });
  } catch (error) {
    console.error("[API Admin OtherServices DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete other service." },
      { status: 500 }
    );
  }
}
