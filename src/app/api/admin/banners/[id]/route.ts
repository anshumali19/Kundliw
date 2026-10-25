import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { BannerPosition, BannerType } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bannerUpdateSchema = z.object({
  titleEn: z.string().min(2).optional(),
  titleHi: z.string().min(2).optional(),
  subtitleEn: z.string().optional().nullable(),
  subtitleHi: z.string().optional().nullable(),
  imageUrl: z.string().min(1).optional(),
  linkUrl: z.string().optional().nullable(),
  position: z.nativeEnum(BannerPosition).optional(),
  type: z.nativeEnum(BannerType).optional(),
  isActive: z.boolean().optional(),
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
    const parsed = bannerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Failed to update banner:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    await prisma.banner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error("Failed to delete banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
