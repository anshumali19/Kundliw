import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Active services with their active plans, for the quick Booking selector in the menu. */
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: {
        slug: true,
        titleEn: true,
        titleHi: true,
        plans: {
          where: { isActive: true },
          orderBy: { orderIndex: "asc" },
          select: { id: true, slug: true, titleEn: true, titleHi: true, pricePaise: true },
        },
      },
    });
    return NextResponse.json({ services: services.filter((s) => s.plans.length > 0) });
  } catch (error) {
    console.error("Booking catalog error:", error);
    return NextResponse.json({ services: [] });
  }
}
