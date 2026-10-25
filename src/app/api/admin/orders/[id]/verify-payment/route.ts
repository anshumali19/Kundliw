import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { approveManualPayment, rejectManualPayment, PaymentError } from "@/lib/payments/service";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifyActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;
    const admin = guard.user;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const orderId = params.id;

    const body = await request.json();
    const parsed = verifyActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid verification action" }, { status: 400 });
    }

    const { action, note, reason } = parsed.data;

    if (action === "APPROVE") {
      const updated = await approveManualPayment(orderId, admin.id, note);
      return NextResponse.json({
        success: true,
        orderId: updated.id,
        paymentStatus: updated.paymentStatus,
      });
    } else {
      const updated = await rejectManualPayment(
        orderId,
        admin.id,
        reason || note || "Payment could not be verified by accounts desk."
      );
      return NextResponse.json({
        success: true,
        orderId: updated.id,
        paymentStatus: updated.paymentStatus,
      });
    }
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
