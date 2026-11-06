import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { cancelOrderByUser, SelfServiceError } from "@/lib/orders/selfService";

export const dynamic = "force-dynamic";

const schema = z.object({ reason: z.string().trim().min(3, "Please tell us why.").max(500) });

/** A customer cancels their own order. Money is refunded by the Kendra afterwards. */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiUser();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please tell us why." }, { status: 400 });
  try {
    const r = await cancelOrderByUser(id, guard.user.id, parsed.data.reason);
    return NextResponse.json({ success: true, refundPaise: r.refundPaise });
  } catch (e) {
    if (e instanceof SelfServiceError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Cancel failed:", e);
    return NextResponse.json({ error: "Could not cancel this order." }, { status: 500 });
  }
}
