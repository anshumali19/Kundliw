import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { Check } from "lucide-react";

/**
 * For a signed-in customer or associate: what they have already opted for, and everything they can
 * book, laid out as Service → Package → Plan → Offer.
 */
export async function ServiceExplorer({ userId, locale }: { userId: string; locale: string }) {
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const name = (x: { titleEn: string; titleHi: string }) => (isHindi ? x.titleHi || x.titleEn : x.titleEn);
  const now = new Date();

  const [services, offers, orders] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      include: {
        packages: { where: { isActive: true }, orderBy: { orderIndex: "asc" } },
        plans: { where: { isActive: true }, orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.offer.findMany({
      where: { isActive: true, validFrom: { lte: now }, OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId },
      select: { serviceId: true, planId: true, extraPlanIds: true },
    }),
  ]);

  const bookedServices = new Set(orders.map((o) => o.serviceId).filter(Boolean) as string[]);
  const bookedPlans = new Set(orders.flatMap((o) => [o.planId, ...o.extraPlanIds]).filter(Boolean) as string[]);

  const offersFor = (serviceSlug: string, planId: string) =>
    offers.filter((o) => (o.serviceSlugs.length === 0 || o.serviceSlugs.includes(serviceSlug)) && (o.planIds.length === 0 || o.planIds.includes(planId)));
  const offerText = (o: (typeof offers)[number]) =>
    o.discountType === "PERCENTAGE" ? `${o.discountValuePaise}% ${t("off", "छूट")}` : `${formatPaiseToInr(o.discountValuePaise)} ${t("off", "छूट")}`;

  const mine = services.filter((s) => bookedServices.has(s.id));

  return (
    <section className="space-y-4 text-left" aria-labelledby="service-explorer-title">
      <div>
        <h2 id="service-explorer-title" className="font-serif text-xl font-bold text-secondary">
          {t("Services you have opted for and can opt for", "आपकी चुनी हुई और चुनी जा सकने वाली सेवाएँ")}
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          {t("Open a service to see its packages, the plans inside them and the offers on each plan.", "किसी सेवा को खोलकर उसके पैकेज, उनके प्लान और हर प्लान के ऑफ़र देखें।")}
        </p>
      </div>

      <ol className="grid grid-cols-2 lg:grid-cols-4 gap-2" aria-label={t("Overview", "सारांश")}>
        {[
          { n: 1, en: "Services", hi: "सेवाएँ", count: services.length },
          { n: 2, en: "Packages", hi: "पैकेज", count: services.reduce((x, sv) => x + sv.packages.length, 0) },
          { n: 3, en: "Plans", hi: "प्लान", count: services.reduce((x, sv) => x + sv.plans.length, 0) },
          { n: 4, en: "Offers", hi: "ऑफ़र", count: offers.length },
        ].map((x) => (
          <li key={x.n} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface px-3 py-2 min-h-[56px]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">{x.n}</span>
            <span>
              <span className="block font-serif text-base font-bold text-secondary">{isHindi ? x.hi : x.en}</span>
              <span className="block text-xs text-on-surface-variant">{x.count} {t("in total", "कुल")}</span>
            </span>
          </li>
        ))}
      </ol>

      {mine.length > 0 && (
        <p className="text-sm text-secondary">
          <span className="font-bold">{t("You have opted for:", "आपने चुनी हैं:")}</span> {mine.map((s) => name(s)).join(", ")}
        </p>
      )}

      {services.length === 0 ? (
        <p className="rounded border border-outline-variant/50 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
          {t("No services are open for booking right now.", "अभी कोई सेवा बुकिंग के लिए खुली नहीं है।")}
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((s) => {
            const loose = s.plans.filter((p) => !p.packageId || !s.packages.some((k) => k.id === p.packageId));
            return (
              <details key={s.id} className="group rounded-lg border border-outline-variant/60 bg-surface" open={bookedServices.has(s.id)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 min-h-[56px]">
                  <span className="font-serif text-base font-bold text-secondary">{name(s)}</span>
                  <span className="flex items-center gap-2 text-xs">
                    {bookedServices.has(s.id) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-800">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        {t("Opted", "चुनी हुई")}
                      </span>
                    )}
                    <span className="text-on-surface-variant">{s.packages.length} {t("packages", "पैकेज")}</span>
                    <span aria-hidden="true" className="text-primary transition-transform group-open:rotate-90">›</span>
                  </span>
                </summary>
                <div className="space-y-4 border-t border-outline-variant/30 p-4">
                  {[...s.packages.map((k) => ({ key: k.id, title: name(k), plans: s.plans.filter((p) => p.packageId === k.id) })), ...(loose.length ? [{ key: "loose", title: t("Other plans", "अन्य प्लान"), plans: loose }] : [])].map((pk) => (
                    <div key={pk.key}>
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{t("Package", "पैकेज")}: {pk.title}</div>
                      {pk.plans.length === 0 ? (
                        <p className="text-xs text-on-surface-variant">{t("No plans yet.", "अभी कोई प्लान नहीं।")}</p>
                      ) : (
                        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {pk.plans.map((p) => {
                            const ofs = offersFor(s.slug, p.id);
                            return (
                              <li key={p.id} className="flex flex-col justify-between rounded-lg border border-outline-variant/60 bg-surface-container-low p-3">
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-bold text-secondary">{name(p)}</span>
                                    {bookedPlans.has(p.id) && (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">{t("Booked", "बुक किया")}</span>
                                    )}
                                  </div>
                                  <div className="mt-1 font-serif text-lg font-bold text-secondary">{formatPaiseToInr(p.pricePaise)}</div>
                                  <div className="mt-2 text-[11px] text-on-surface-variant">
                                    <span className="font-bold uppercase tracking-wider text-primary">{t("Offers", "ऑफ़र")}: </span>
                                    {ofs.length === 0 ? t("none right now", "अभी कोई नहीं") : ofs.map((o) => `${o.code} (${offerText(o)})`).join(", ")}
                                  </div>
                                </div>
                                <Link
                                  href={`/services/${s.slug}`}
                                  className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded bg-brand px-3 text-xs font-bold text-on-brand hover:bg-brand-hover"
                                >
                                  {bookedPlans.has(p.id) ? t("View again", "फिर देखें") : t("View & book", "देखें और बुक करें")}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
