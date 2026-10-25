import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

const toggleSchema = z.object({ isActive: z.boolean() });

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const { id } = await context.params;
  try {
    const parsed = toggleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const rule = await prisma.commissionRule.update({ where: { id }, data: { isActive: parsed.data.isActive } });
    return NextResponse.json({ success: true, rule });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }
    console.error("[API Admin Commission Rules PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update rule." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const { id } = await context.params;
  try {
    await prisma.commissionRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }
    console.error("[API Admin Commission Rules DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete rule." }, { status: 500 });
  }
}
