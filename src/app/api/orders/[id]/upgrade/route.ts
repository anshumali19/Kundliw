import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { startUpgrade, SelfServiceError } from "@/lib/orders/selfService";

export const dynamic = "force-dynamic";

const schema = z.object({ planId: z.string().min(1) });

/** A customer upgrades a paid order to a higher plan of the same package. Returns the new order to pay. */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiUser();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please choose a plan." }, { status: 400 });
  try {
    const r = await startUpgrade(id, guard.user.id, parsed.data.planId);
    return NextResponse.json({ success: true, ...r });
  } catch (e) {
    if (e instanceof SelfServiceError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Upgrade failed:", e);
    return NextResponse.json({ error: "Could not start the upgrade." }, { status: 500 });
  }
}
