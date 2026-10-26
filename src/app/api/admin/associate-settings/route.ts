import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { getAssociateRules } from "@/lib/associates/service";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  enabled: z.boolean(),
  autoApprove: z.boolean(),
  minPayoutRupees: z.number().min(0).max(1_000_000),
  referralDays: z.number().int().min(1).max(365),
  termsEn: z.string().trim().max(8000).nullable().optional(),
  termsHi: z.string().trim().max(8000).nullable().optional(),
});

/** Rules for the associate programme (admin only). */
export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const rules = await getAssociateRules();
  return NextResponse.json({
    success: true,
    settings: {
      enabled: rules.enabled,
      autoApprove: rules.autoApprove,
      minPayoutRupees: rules.minPayoutPaise / 100,
      referralDays: rules.referralDays,
      termsEn: rules.termsEn,
      termsHi: rules.termsHi,
    },
  });
}

export async function PUT(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid settings." }, { status: 400 });
    }
    const v = parsed.data;
    const data = {
      associatesEnabled: v.enabled,
      associateAutoApprove: v.autoApprove,
      associateMinPayoutPaise: Math.round(v.minPayoutRupees * 100),
      associateReferralDays: v.referralDays,
      associateTermsEn: v.termsEn || null,
      associateTermsHi: v.termsHi || null,
    };
    await prisma.adminSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...data },
      update: data,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Admin Associate Settings PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
