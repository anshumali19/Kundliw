import { NextRequest, NextResponse } from "next/server";
import { resolveApprovedReferral, normalizeReferralCode } from "@/lib/associates/service";
import { getClientIp, checkDbRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/** Tells the booking page whether a referral code belongs to an approved associate. */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = await checkDbRateLimit({ scope: "REFERRAL_CHECK_IP", identifier: ip, windowSeconds: 60, maxAllowed: 20 });
  if (!rate.allowed) {
    return NextResponse.json({ valid: false, error: `Too many attempts. Retry in ${rate.retryAfterSeconds} seconds.` }, { status: 429 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const code = normalizeReferralCode(body?.code);
    if (!code) return NextResponse.json({ valid: false });
    const associate = await resolveApprovedReferral(code);
    return NextResponse.json({ valid: !!associate, code: associate ? code : undefined });
  } catch (error) {
    console.error("Referral check error:", error);
    return NextResponse.json({ valid: false });
  }
}
