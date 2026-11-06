import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { cancelOrderTx, SelfServiceError } from "@/lib/orders/selfService";

export const dynamic = "force-dynamic";

const schema = z.object({ reason: z.string().trim().min(3).max(500) });

/**
 * Admin: cancel an order and record the refund as sent, or (when the customer already cancelled and
 * asked for a refund) mark that refund as sent. The money itself is sent from the payment account.
 */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please write the reason or the refund reference (at least 3 letters)." }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new SelfServiceError("Order not found.", 404);
      if (order.refundStatus === "REQUESTED") {
        const done = await tx.order.updateMany({ where: { id, refundStatus: "REQUESTED" }, data: { refundStatus: "SENT", refundedAt: new Date() } });
        if (done.count === 0) throw new SelfServiceError("This refund was already marked sent.", 409);
        await tx.orderStatusEvent.create({ data: { orderId: id, status: order.status, note: `Refund sent by the Kendra. Reference: ${parsed.data.reason}`, changedById: guard.user.id } });
        return;
      }
      await cancelOrderTx(tx, id, { by: "ADMIN", actorId: guard.user.id, reason: parsed.data.reason, refundMode: "SENT" });
    });
    return NextResponse.json({ success: true, paymentStatus: "REFUNDED" });
  } catch (e) {
    if (e instanceof SelfServiceError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Refund failed:", e);
    return NextResponse.json({ error: "Could not mark this order refunded." }, { status: 500 });
  }
}
