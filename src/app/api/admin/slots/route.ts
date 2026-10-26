import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { MAX_SLOTS_PER_BATCH, datesInRange, slotBatchSchema, windowToSlots } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";

/** Slots from a week ago onwards, with how many are booked. */
export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    const from = new Date(Date.now() - 7 * 86400000);
    from.setUTCHours(0, 0, 0, 0);
    const slots = await prisma.slot.findMany({
      where: { date: { gte: from } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json({
      success: true,
      slots: slots.map((s) => ({
        id: s.id,
        date: s.date.toISOString().slice(0, 10),
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        bookedCount: s.bookedCount,
        isActive: s.isActive,
      })),
    });
  } catch (error) {
    console.error("[API Admin Slots GET] Error:", error);
    return NextResponse.json({ error: "Failed to load slots." }, { status: 500 });
  }
}

/** Creates many slots at once: a date range, chosen weekdays and a daily time window split by duration. */
export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = slotBatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid slot details." }, { status: 400 });
    }
    const v = parsed.data;
    const today = new Date().toISOString().slice(0, 10);
    if (v.toDate < today) {
      return NextResponse.json({ error: "These dates are already in the past." }, { status: 400 });
    }

    const days = datesInRange(v.fromDate < today ? today : v.fromDate, v.toDate, v.weekdays);
    const times = windowToSlots(v.startTime, v.endTime, v.durationMinutes);
    if (times.length === 0) {
      return NextResponse.json({ error: "The time window is shorter than one slot." }, { status: 400 });
    }
    if (days.length === 0) {
      return NextResponse.json({ error: "No matching days in that range." }, { status: 400 });
    }
    if (days.length * times.length > MAX_SLOTS_PER_BATCH) {
      return NextResponse.json(
        { error: `Too many slots at once (maximum ${MAX_SLOTS_PER_BATCH}). Use a shorter date range.` },
        { status: 400 }
      );
    }

    const data = days.flatMap((date) =>
      times.map((t) => ({ date, startTime: t.startTime, endTime: t.endTime, capacity: v.capacity }))
    );
    // Skip a slot that already exists for the same day and start time.
    const existing = await prisma.slot.findMany({
      where: { date: { in: days } },
      select: { date: true, startTime: true },
    });
    const taken = new Set(existing.map((e) => `${e.date.toISOString().slice(0, 10)}|${e.startTime}`));
    const fresh = data.filter((d) => !taken.has(`${d.date.toISOString().slice(0, 10)}|${d.startTime}`));
    if (fresh.length > 0) await prisma.slot.createMany({ data: fresh });

    return NextResponse.json({ success: true, created: fresh.length, skipped: data.length - fresh.length }, { status: 201 });
  } catch (error) {
    console.error("[API Admin Slots POST] Error:", error);
    return NextResponse.json({ error: "Failed to create slots." }, { status: 500 });
  }
}
