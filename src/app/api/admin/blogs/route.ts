import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { linksInputSchema } from "@/lib/content/media";
import { withJsonLinks } from "@/lib/content/json";

const blogSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(2),
  titleHi: z.string().min(2),
  excerptEn: z.string().optional().nullable(),
  excerptHi: z.string().optional().nullable(),
  contentEn: z.string().min(10),
  contentHi: z.string().min(10),
  coverImage: z.string().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        ...withJsonLinks(parsed.data),
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
