import { NextRequest, NextResponse } from "next/server";
import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE_SECONDS,
  resolveApprovedReferral,
} from "@/lib/associates/service";

export const dynamic = "force-dynamic";

/**
 * Referral link target (served as /r/<code>). Remembers an approved associate's
 * code for 30 days so later bookings are attributed to them, then opens the home page.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const response = NextResponse.redirect(new URL("/", request.url));

  try {
    const associate = await resolveApprovedReferral(code);
    if (associate) {
      response.cookies.set(REFERRAL_COOKIE, associate.referralCode, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
      });
    }
  } catch (error) {
    console.error("[Referral link] Error:", error);
  }

  return response;
}
