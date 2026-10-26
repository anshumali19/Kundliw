import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { blocksInputSchema } from "@/lib/content/media";
import { isCorePageSlug } from "@/lib/content/pages";

const pageUpdateSchema = z.object({
  titleEn: z.string().min(2).optional(),
  titleHi: z.string().min(2).optional(),
  contentEn: z.string().min(10).optional(),
  contentHi: z.string().min(10).optional(),
  blocks: blocksInputSchema.optional(),
  isActive: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = pageUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.staticPage.findUnique({ where: { id: params.id }, select: { slug: true } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    const data = { ...parsed.data };
    if (isCorePageSlug(existing.slug)) {
      delete data.isActive;
      delete data.showInFooter;
    }
    const page = await prisma.staticPage.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Failed to update page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const existing = await prisma.staticPage.findUnique({ where: { id: params.id }, select: { slug: true } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    if (isCorePageSlug(existing.slug)) {
      return NextResponse.json(
        { error: "Built-in pages cannot be removed. Edit their text and blocks instead." },
        { status: 409 }
      );
    }

    await prisma.staticPage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Page deleted" });
  } catch (error) {
    console.error("Failed to delete page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
