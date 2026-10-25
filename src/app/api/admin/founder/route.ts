import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const linkSchema = z.object({
  labelEn: z.string().trim().min(1),
  labelHi: z.string().trim().min(1),
  url: z.string().trim().url(),
});

const updateFounderSchema = z.object({
  nameEn: z.string().trim().min(2).optional(),
  nameHi: z.string().trim().min(2).optional(),
  designationEn: z.string().trim().min(2).optional(),
  designationHi: z.string().trim().min(2).optional(),
  roleEn: z.string().trim().min(2).optional(),
  roleHi: z.string().trim().min(2).optional(),
  photoUrl: z.string().trim().nullable().optional(),
  bioEn: z.string().trim().min(10).optional(),
  bioHi: z.string().trim().min(10).optional(),
  youtubeUrl: z.string().trim().nullable().optional(),
  additionalLinks: z.array(linkSchema).optional(),
  footerNoteEn: z.string().trim().nullable().optional(),
  footerNoteHi: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const profile = await prisma.founderProfile.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[API Admin Founder GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load founder profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await req.json();
    const parsed = updateFounderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.founderProfile.upsert({
      where: { id: "default" },
      update: parsed.data as any,
      create: {
        id: "default",
        nameEn: parsed.data.nameEn || "Pt. Radheshyam Shastri",
        nameHi: parsed.data.nameHi || "पं. राधेश्याम शास्त्री",
        designationEn: parsed.data.designationEn || "Founder & Chief Astrologer",
        designationHi: parsed.data.designationHi || "संस्थापक एवं मुख्य ज्योतिषाचार्य",
        roleEn: parsed.data.roleEn || "Vedic Ephemeris & Siddhanta Jyotish Tradition",
        roleHi: parsed.data.roleHi || "काशी वेदांग ज्योतिष एवं दृग्गणित सिद्धान्त परंपरा",
        photoUrl: parsed.data.photoUrl,
        bioEn: parsed.data.bioEn || "Vedic Astrologer with 40+ years experience.",
        bioHi: parsed.data.bioHi || "काशी के वरिष्ठ दैवज्ञ।",
        youtubeUrl: parsed.data.youtubeUrl,
        additionalLinks: (parsed.data.additionalLinks as any) || [],
        footerNoteEn: parsed.data.footerNoteEn,
        footerNoteHi: parsed.data.footerNoteHi,
        isActive: parsed.data.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("[API Admin Founder PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update founder profile." },
      { status: 500 }
    );
  }
}
