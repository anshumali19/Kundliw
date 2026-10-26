import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAssociate } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { ensureAssociateProfile, getAssociateRules } from "@/lib/associates/service";

export const dynamic = "force-dynamic";

const blank = z
  .string()
  .trim()
  .max(120)
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

const payoutSchema = z.object({
  payoutUpi: z
    .string()
    .trim()
    .max(80)
    .regex(/^[\w.\-]{2,}@[A-Za-z]{2,}$/, "Enter a valid UPI ID, for example name@bank")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  payoutAccountHolder: blank,
  payoutAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "Account number must be 6 to 20 digits")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  payoutIfsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

/** Where the associate wants to be paid. Only the associate and administrators can see it. */
export async function GET() {
  const guard = await guardApiAssociate();
  if (!guard.ok) return guard.errorResponse;
  const profile = await ensureAssociateProfile(guard.user.id);
  const rules = await getAssociateRules();
  return NextResponse.json({
    payout: {
      payoutUpi: profile.payoutUpi,
      payoutAccountHolder: profile.payoutAccountHolder,
      payoutAccountNumber: profile.payoutAccountNumber,
      payoutIfsc: profile.payoutIfsc,
    },
    rules: {
      minPayoutPaise: rules.minPayoutPaise,
      referralDays: rules.referralDays,
      termsEn: rules.termsEn,
      termsHi: rules.termsHi,
    },
  });
}

export async function PUT(request: NextRequest) {
  const guard = await guardApiAssociate();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = payoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid details." }, { status: 400 });
    }
    const profile = await ensureAssociateProfile(guard.user.id);
    await prisma.associateProfile.update({ where: { id: profile.id }, data: parsed.data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Associate Profile PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save details." }, { status: 500 });
  }
}
