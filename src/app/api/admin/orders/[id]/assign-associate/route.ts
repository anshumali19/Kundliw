import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CommissionStatus, PaymentStatus } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { AssociateError, attachReferralToOrder, cancelCommission } from "@/lib/associates/service";

const bodySchema = z.object({ associateId: z.string().min(1).nullable() });

/** Admin assigns a booking to an associate (or clears the assignment). */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const { id } = await context.params;
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { associateId } = parsed.data;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { commission: true },
      });
      if (!order) throw new AssociateError("Order not found.", 404);

      if (order.commission && order.commission.status === CommissionStatus.PAID) {
        throw new AssociateError("The commission for this order is already paid out and cannot be changed.", 409);
      }
      if (order.commission?.payoutId) {
        throw new AssociateError("This order's commission is part of a payout request. Resolve the payout first.", 409);
      }

      // Remove any earlier attribution and its commission before reassigning.
      if (order.commission) {
        await tx.commission.delete({ where: { id: order.commission.id } });
      }
      await tx.order.update({ where: { id }, data: { associateId: null } });

      if (associateId) {
        await attachReferralToOrder(tx, order, associateId);
        if (order.paymentStatus === PaymentStatus.PAID) {
          await tx.commission.updateMany({
            where: { orderId: id, status: CommissionStatus.PENDING },
            data: { status: CommissionStatus.EARNED },
          });
        } else if (order.paymentStatus === PaymentStatus.FAILED || order.paymentStatus === PaymentStatus.REFUNDED) {
          await cancelCommission(tx, id);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AssociateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[API Admin Assign Associate] Error:", error);
    return NextResponse.json({ error: "Failed to assign associate." }, { status: 500 });
  }
}
