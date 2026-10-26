import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { linksInputSchema } from "@/lib/content/media";
import { withJsonLinks } from "@/lib/content/json";

const blogUpdateSchema = z.object({
  titleEn: z.string().min(2).optional(),
  titleHi: z.string().min(2).optional(),
  excerptEn: z.string().optional().nullable(),
  excerptHi: z.string().optional().nullable(),
  contentEn: z.string().min(10).optional(),
  contentHi: z.string().min(10).optional(),
  coverImage: z.string().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  isPublished: z.boolean().optional(),
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = blogUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Keep the original publish date when an already published article is edited.
    const existing = await prisma.blogPost.findUnique({
      where: { id: params.id },
      select: { publishedAt: true },
    });
    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...withJsonLinks(parsed.data),
        publishedAt: parsed.data.isPublished && !existing?.publishedAt ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    await prisma.blogPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Blog post deleted" });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
