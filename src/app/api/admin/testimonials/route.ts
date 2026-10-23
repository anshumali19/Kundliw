import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const testimonialSchema = z.object({
  authorNameEn: z.string().min(2),
  authorNameHi: z.string().min(2),
  authorTitleEn: z.string().min(2),
  authorTitleHi: z.string().min(2),
  cityEn: z.string().min(2),
  cityHi: z.string().min(2),
  quoteEn: z.string().min(10),
  quoteHi: z.string().min(10),
  rating: z.number().int().min(1).max(5).default(5),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch testimonials";
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
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create testimonial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
