import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAssociate } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { checkDbRateLimit } from "@/lib/rateLimit";
import { AssociateError, ensureAssociateProfile, requestPayout } from "@/lib/associates/service";

const bodySchema = z.object({ note: z.string().max(500).optional() });

export async function POST(request: NextRequest) {
  const guard = await guardApiAssociate();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const limit = await checkDbRateLimit({
    scope: "ASSOCIATE_PAYOUT",
    identifier: guard.user.id,
    windowSeconds: 3600,
    maxAllowed: 5,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const profile = await ensureAssociateProfile(guard.user.id);
    const payout = await requestPayout(profile.id, parsed.data.note);
    return NextResponse.json({ success: true, payout }, { status: 201 });
  } catch (error) {
    if (error instanceof AssociateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[API Associate Payout] Error:", error);
    return NextResponse.json({ error: "Failed to request payout." }, { status: 500 });
  }
}
