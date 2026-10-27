import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/siteConfig/service";
import { formatPaiseToInr } from "@/lib/billing/gst";

export const dynamic = "force-dynamic";

/** Everything the offers pop-up needs: the admin's wording and the offers running right now. */
export async function GET() {
  try {
    const cfg = await getSection("offerPopup");
    if (cfg.enabled === false) return NextResponse.json({ enabled: false });

    const now = new Date();
    const max = Math.min(Math.max(Math.round(Number(cfg.maxOffers) || 4), 1), 10);
    const rows = await prisma.offer.findMany({
      where: {
        isActive: true,
        showInPopup: true,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const live = rows.filter((o) => o.usageLimit == null || o.usedCount < o.usageLimit).slice(0, max);

    const slugs = Array.from(new Set(live.flatMap((o) => o.serviceSlugs)));
    const services = slugs.length
      ? await prisma.service.findMany({ where: { slug: { in: slugs } }, select: { slug: true, titleEn: true, titleHi: true } })
      : [];
    const byslug = new Map(services.map((s) => [s.slug, s]));

    const offers = live.map((o) => ({
      code: o.code,
      titleEn: o.titleEn,
      titleHi: o.titleHi,
      discountEn:
        o.discountType === "PERCENTAGE"
          ? `${o.discountValuePaise}% off${o.maxDiscountPaise ? ` (up to ${formatPaiseToInr(o.maxDiscountPaise)})` : ""}`
          : `${formatPaiseToInr(o.discountValuePaise)} off`,
      discountHi:
        o.discountType === "PERCENTAGE"
          ? `${o.discountValuePaise}% छूट${o.maxDiscountPaise ? ` (अधिकतम ${formatPaiseToInr(o.maxDiscountPaise)})` : ""}`
          : `${formatPaiseToInr(o.discountValuePaise)} की छूट`,
      minOrder: o.minOrderValuePaise > 0 ? formatPaiseToInr(o.minOrderValuePaise) : "",
      validUntil: o.validUntil ? o.validUntil.toISOString().slice(0, 10) : "",
      auto: o.autoApply,
      appliesToEn: o.serviceSlugs.map((s) => byslug.get(s)?.titleEn).filter(Boolean).join(", "),
      appliesToHi: o.serviceSlugs.map((s) => byslug.get(s)?.titleHi).filter(Boolean).join(", "),
    }));

    return NextResponse.json({
      enabled: true,
      offers,
      config: {
        delaySeconds: Math.min(Math.max(Number(cfg.delaySeconds) || 4, 0), 60),
        repeatHours: Math.min(Math.max(Number(cfg.repeatHours ?? 24) || 0, 0), 24 * 30),
        homeOnly: cfg.homeOnly === true,
        showList: cfg.showList !== false,
        titleEn: String(cfg.titleEn || ""),
        titleHi: String(cfg.titleHi || ""),
        introEn: String(cfg.introEn || ""),
        introHi: String(cfg.introHi || ""),
        ctaLabelEn: String(cfg.ctaLabelEn || ""),
        ctaLabelHi: String(cfg.ctaLabelHi || ""),
        ctaLink: String(cfg.ctaLink || "/services"),
        showWhenNoOffers: cfg.showWhenNoOffers === true,
      },
    });
  } catch (error) {
    console.error("Offer popup error:", error);
    return NextResponse.json({ enabled: false });
  }
}
