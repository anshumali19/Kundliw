import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

// Administrator accounts are never created or changed through the web panel.
const roleSchema = z.object({ role: z.enum(["USER", "ASSOCIATE"]) });

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
    const parsed = roleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Role must be USER or ASSOCIATE." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (target.role === Role.ADMIN) {
      return NextResponse.json(
        { error: "Administrator accounts cannot be changed here." },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[API Admin Users PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
