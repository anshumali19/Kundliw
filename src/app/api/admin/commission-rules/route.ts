import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DiscountType } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ruleSchema = z
  .object({
    serviceId: z.string().min(1).nullable().optional(),
    planId: z.string().min(1).nullable().optional(),
    type: z.nativeEnum(DiscountType),
    // PERCENTAGE: basis points (0-10000). FLAT: paise.
    value: z.number().int().min(0).max(100_000_000),
    isActive: z.boolean().optional(),
  })
  .refine((r) => r.type !== DiscountType.PERCENTAGE || r.value <= 10000, {
    message: "Percentage cannot exceed 100%.",
    path: ["value"],
  });

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const [rules, services] = await Promise.all([
      prisma.commissionRule.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.service.findMany({
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          titleEn: true,
          titleHi: true,
          plans: { select: { id: true, titleEn: true, titleHi: true }, orderBy: { orderIndex: "asc" } },
        },
      }),
    ]);
    return NextResponse.json({ rules, services });
  } catch (error) {
    console.error("[API Admin Commission Rules GET] Error:", error);
    return NextResponse.json({ error: "Failed to load commission rules." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = ruleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid commission rule." },
        { status: 400 }
      );
    }
    const { serviceId, planId, type, value, isActive } = parsed.data;

    // One rule per scope: replace instead of stacking duplicates.
    const existing = await prisma.commissionRule.findFirst({
      where: { serviceId: serviceId ?? null, planId: planId ?? null },
    });
    const data = { serviceId: serviceId ?? null, planId: planId ?? null, type, value, isActive: isActive ?? true };
    const rule = existing
      ? await prisma.commissionRule.update({ where: { id: existing.id }, data })
      : await prisma.commissionRule.create({ data });

    return NextResponse.json({ success: true, rule }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("[API Admin Commission Rules POST] Error:", error);
    return NextResponse.json({ error: "Failed to save commission rule." }, { status: 500 });
  }
}
