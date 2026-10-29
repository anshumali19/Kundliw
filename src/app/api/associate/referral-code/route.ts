import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AssociateStatus } from "@prisma/client";
import { guardApiAssociate } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { checkDbRateLimit } from "@/lib/rateLimit";
import { ensureAssociateProfile, generateReferralCode, normalizeReferralCode } from "@/lib/associates/service";

export const dynamic = "force-dynamic";

const schema = z.object({
  mode: z.enum(["generate", "custom"]),
  code: z.string().optional(),
});

/**
 * The associate makes a new referral code: a random one, or their own word.
 * Links shared with the old code stop working, so changes are limited to 5 a day.
 */
export async function POST(request: NextRequest) {
  const guard = await guardApiAssociate();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const profile = await ensureAssociateProfile(guard.user.id);
    if (profile.status !== AssociateStatus.APPROVED) {
      return NextResponse.json({ error: "Your account must be approved before you can change the code." }, { status: 403 });
    }

    const rate = await checkDbRateLimit({ scope: "REFERRAL_CODE_USER", identifier: guard.user.id, windowSeconds: 86400, maxAllowed: 5 });
    if (!rate.allowed) {
      return NextResponse.json({ error: "You can change the code 5 times a day. Please try again tomorrow." }, { status: 429 });
    }

    if (parsed.data.mode === "custom") {
      const code = normalizeReferralCode(parsed.data.code);
      if (!code) {
        return NextResponse.json({ error: "Use 6 to 16 letters or numbers, with no spaces or symbols." }, { status: 400 });
      }
      if (code === profile.referralCode) return NextResponse.json({ success: true, referralCode: code });
      try {
        await prisma.associateProfile.update({ where: { id: profile.id }, data: { referralCode: code } });
      } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
          return NextResponse.json({ error: "That code is already taken. Please try another." }, { status: 409 });
        }
        throw error;
      }
      return NextResponse.json({ success: true, referralCode: code });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateReferralCode();
      try {
        await prisma.associateProfile.update({ where: { id: profile.id }, data: { referralCode: code } });
        return NextResponse.json({ success: true, referralCode: code });
      } catch (error) {
        if ((error as { code?: string }).code !== "P2002") throw error;
      }
    }
    return NextResponse.json({ error: "Could not make a new code. Please try again." }, { status: 500 });
  } catch (error) {
    console.error("Referral code change error:", error);
    return NextResponse.json({ error: "Could not change the code." }, { status: 500 });
  }
}
