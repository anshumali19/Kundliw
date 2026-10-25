import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

const bodySchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  note: z.string().trim().max(500).optional(),
});

/** Admin approves, rejects or completes an appointment. Rejecting frees the reserved slot. */
export async function PATCH(
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
    const { status, note } = parsed.data;
    if (status === AppointmentStatus.REJECTED && !note) {
      return NextResponse.json({ error: "Please give a reason for rejecting the appointment." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { slot: true, user: { select: { name: true, email: true, phone: true } } },
      });
      if (!order) return { error: "Order not found.", code: 404 as const };
      if (!order.slotId || !order.appointmentStatus) {
        return { error: "This order has no appointment.", code: 409 as const };
      }
      if (order.appointmentStatus === status) {
        return { order };
      }
      if (order.appointmentStatus === AppointmentStatus.REJECTED) {
        return { error: "A rejected appointment cannot be reopened. Ask the customer to book again.", code: 409 as const };
      }

      if (status === AppointmentStatus.REJECTED) {
        await tx.slot.updateMany({
          where: { id: order.slotId, bookedCount: { gt: 0 } },
          data: { bookedCount: { decrement: 1 } },
        });
      }

      const updated = await tx.order.update({
        where: { id },
        data: { appointmentStatus: status, appointmentNote: note || null },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: order.status,
          note: `Appointment ${status.toLowerCase()}${note ? `: ${note}` : "."}`,
          changedById: guard.user.id,
        },
      });
      return { order: updated, previous: order };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.code });
    }

    if (result.previous?.user && status !== AppointmentStatus.COMPLETED) {
      const when = result.previous.slot
        ? `${result.previous.slot.date.toISOString().slice(0, 10)} ${result.previous.slot.startTime}-${result.previous.slot.endTime}`
        : "";
      await sendNotification({
        email: result.previous.user.email,
        phone: result.previous.user.phone,
        subject: `Appointment ${status === AppointmentStatus.APPROVED ? "confirmed" : "update"} - ${result.previous.orderNumber}`,
        message:
          status === AppointmentStatus.APPROVED
            ? `Namaste ${result.previous.user.name || ""}, your appointment for order ${result.previous.orderNumber} is confirmed${when ? ` for ${when}` : ""}.${note ? `\n${note}` : ""}`
            : `Namaste ${result.previous.user.name || ""}, we are unable to take your appointment for order ${result.previous.orderNumber}. ${note || ""} Please book another time or contact the Kendra.`,
      });
    }

    return NextResponse.json({ success: true, appointmentStatus: result.order.appointmentStatus });
  } catch (error) {
    console.error("[API Admin Appointment PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update appointment." }, { status: 500 });
  }
}
