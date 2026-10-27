import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const teamSchema = z.object({
  nameEn: z.string().trim().min(2).max(120),
  nameHi: z.string().trim().min(2).max(120),
  roleEn: z.string().trim().min(2).max(160),
  roleHi: z.string().trim().min(2).max(160),
  bioEn: z.string().trim().max(3000).optional().nullable(),
  bioHi: z.string().trim().max(3000).optional().nullable(),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    const members = await prisma.teamMember.findMany({ orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;
  try {
    const parsed = teamSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const member = await prisma.teamMember.create({ data: parsed.data });
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error) {
    console.error("Failed to add team member:", error);
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}
