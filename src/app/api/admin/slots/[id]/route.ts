import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { slotUpdateSchema } from "@/lib/booking/slots";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;
  try {
    const parsed = slotUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid slot details." }, { status: 400 });
    const slot = await prisma.slot.findUnique({ where: { id } });
    if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
    if (parsed.data.capacity !== undefined && parsed.data.capacity < slot.bookedCount) {
      return NextResponse.json(
        { error: `Capacity cannot be below the ${slot.bookedCount} already booked.` },
        { status: 400 }
      );
    }
    const updated = await prisma.slot.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ success: true, slot: { id: updated.id, capacity: updated.capacity, isActive: updated.isActive } });
  } catch (error) {
    console.error("[API Admin Slots PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update the slot." }, { status: 500 });
  }
}

/** A slot with bookings cannot be deleted (switch it off instead). */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;
  try {
    const slot = await prisma.slot.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
    if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
    if (slot.bookedCount > 0 || slot._count.orders > 0) {
      return NextResponse.json({ error: "This slot has bookings. Switch it off instead of deleting it." }, { status: 409 });
    }
    await prisma.slot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Admin Slots DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete the slot." }, { status: 500 });
  }
}
