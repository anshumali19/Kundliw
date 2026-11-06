import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { cancelCommission } from "@/lib/associates/service";

export const dynamic = "force-dynamic";

const schema = z.object({ reason: z.string().trim().min(3).max(500) });

/**
 * Cancel an order and mark it refunded (the refund itself is sent from the payment account).
 * Frees the appointment seat, the coupon use and the associate commission, and records why.
 */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please write the reason (at least 3 letters)." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) return { error: "Order not found", status: 404 as const };
      if (order.paymentStatus === PaymentStatus.REFUNDED) return { error: "This order is already refunded.", status: 409 as const };

      const claimed = await tx.order.updateMany({
        where: { id, paymentStatus: { not: PaymentStatus.REFUNDED } },
        data: { paymentStatus: PaymentStatus.REFUNDED },
      });
      if (claimed.count === 0) return { error: "This order is already refunded.", status: 409 as const };

      if (order.slotId && order.paymentStatus !== PaymentStatus.FAILED) {
        await tx.slot.updateMany({ where: { id: order.slotId, bookedCount: { gt: 0 } }, data: { bookedCount: { decrement: 1 } } });
      }
      if (order.offerId && order.paymentStatus !== PaymentStatus.FAILED) {
        await tx.offer.updateMany({ where: { id: order.offerId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
      }
      await cancelCommission(tx, id);
      await tx.orderStatusEvent.create({
        data: { orderId: id, status: order.status, note: `Cancelled and marked refunded by admin. Reason: ${parsed.data.reason}` },
      });
      return { ok: true as const };
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true, paymentStatus: "REFUNDED" });
  } catch (e) {
    console.error("Refund failed:", e);
    return NextResponse.json({ error: "Could not mark this order refunded." }, { status: 500 });
  }
}
