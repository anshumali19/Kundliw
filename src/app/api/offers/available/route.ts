import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyOffer, pickBestAutoOffer } from "@/lib/offers/apply";
import { formatPaiseToInr } from "@/lib/billing/gst";

export const dynamic = "force-dynamic";

/**
 * Offers the admin chose to show next to a plan ("Show this offer next to its plans").
 * Only offers marked for display are listed, so private codes are never exposed.
 */
export async function GET(request: NextRequest) {
  const planId = new URL(request.url).searchParams.get("planId") || "";
  if (!planId) return NextResponse.json({ offers: [], auto: null });

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true },
      select: { id: true, pricePaise: true, service: { select: { slug: true } } },
    });
    if (!plan) return NextResponse.json({ offers: [], auto: null });

    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: { isActive: true, showOnPlan: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const list = offers
      .map((o) => {
        const r = applyOffer(o, plan.pricePaise, now, { serviceSlug: plan.service?.slug, planId: plan.id });
        return r.isValid
          ? {
              code: o.code,
              titleEn: o.titleEn,
              titleHi: o.titleHi,
              discountPaise: r.discountPaise,
              discountFormatted: formatPaiseToInr(r.discountPaise),
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // An offer that applies by itself, so the customer does not have to type a code
    const autoOffers = await prisma.offer.findMany({ where: { isActive: true, autoApply: true } });
    const best = pickBestAutoOffer(autoOffers, plan.pricePaise, now, { serviceSlug: plan.service?.slug, planId: plan.id });
    const auto = best
      ? { code: best.offer.code, titleEn: best.offer.titleEn, titleHi: best.offer.titleHi, discountFormatted: formatPaiseToInr(best.discountPaise) }
      : null;

    return NextResponse.json({ offers: list, auto });
  } catch (error) {
    console.error("Available offers error:", error);
    return NextResponse.json({ offers: [], auto: null });
  }
}
