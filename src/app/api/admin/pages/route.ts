import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const pageSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(2),
  titleHi: z.string().min(2),
  contentEn: z.string().min(10),
  contentHi: z.string().min(10),
});

export async function GET() {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const pages = await prisma.staticPage.findMany({
      orderBy: { slug: "asc" },
    });
    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const body = await request.json();
    const parsed = pageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const page = await prisma.staticPage.upsert({
      where: { slug: parsed.data.slug },
      create: parsed.data,
      update: parsed.data,
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Failed to save page:", error);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}
