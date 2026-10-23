import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { approveManualPayment, rejectManualPayment } from "@/lib/payments/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifyActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional(),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await guardApiAdmin();
    if (guard.errorResponse) return guard.errorResponse;
    const admin = guard.user;

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
    const msg = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
