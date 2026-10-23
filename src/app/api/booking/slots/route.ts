import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    const whereClause: {
      isActive: boolean;
      date?: { gte: Date; lte: Date };
    } = {
      isActive: true,
    };

    if (dateParam) {
      const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    } else {
      // Default: today and next 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      whereClause.date = { gte: today, lte: nextWeek };
    }

    const allSlots = await prisma.slot.findMany({
      where: whereClause,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Filter slots with remaining capacity
    const availableSlots = allSlots
      .filter((s) => s.bookedCount < s.capacity)
      .map((s) => ({
        id: s.id,
        date: s.date.toISOString().slice(0, 10),
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        bookedCount: s.bookedCount,
        available: s.capacity - s.bookedCount,
      }));

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment slots." },
      { status: 500 }
    );
  }
}
