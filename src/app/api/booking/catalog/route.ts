import { activePlanWhere } from "@/lib/content/packages";
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
          where: activePlanWhere,
          orderBy: { orderIndex: "asc" },
          select: { id: true, slug: true, titleEn: true, titleHi: true, pricePaise: true, packageId: true },
        },
        packages: {
          where: { isActive: true },
          orderBy: { orderIndex: "asc" },
          select: { id: true, titleEn: true, titleHi: true },
        },
      },
    });
    // Service > Package > Plan. Plans without a package are grouped as "Standard"; plans of a switched-off package are left out.
    const shaped = services
      .map((s) => {
        const ids = new Set(s.packages.map((k) => k.id));
        const plans = s.plans.filter((p) => !p.packageId || ids.has(p.packageId));
        const packages = s.packages
          .map((k) => ({ ...k, plans: plans.filter((p) => p.packageId === k.id) }))
          .filter((k) => k.plans.length > 0);
        const loose = plans.filter((p) => !p.packageId);
        if (loose.length > 0) packages.push({ id: "", titleEn: "Standard", titleHi: "मानक", plans: loose });
        return { slug: s.slug, titleEn: s.titleEn, titleHi: s.titleHi, packages, plans };
      })
      .filter((s) => s.plans.length > 0);
    return NextResponse.json({ services: shaped });
  } catch (error) {
    console.error("Booking catalog error:", error);
    return NextResponse.json({ services: [] });
  }
}
