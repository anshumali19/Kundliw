import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const blogUpdateSchema = z.object({
  titleEn: z.string().min(2).optional(),
  titleHi: z.string().min(2).optional(),
  excerptEn: z.string().optional().nullable(),
  excerptHi: z.string().optional().nullable(),
  contentEn: z.string().min(10).optional(),
  contentHi: z.string().min(10).optional(),
  coverImage: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
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
    const parsed = blogUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        publishedAt: parsed.data.isPublished ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update blog post";
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

    await prisma.blogPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Blog post deleted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete blog post";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
