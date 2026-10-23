import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const blogSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(2),
  titleHi: z.string().min(2),
  excerptEn: z.string().optional().nullable(),
  excerptHi: z.string().optional().nullable(),
  contentEn: z.string().min(10),
  contentHi: z.string().min(10),
  coverImage: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch blogs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await guardApiAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 401 });
    }

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
        ...parsed.data,
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create blog post";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
