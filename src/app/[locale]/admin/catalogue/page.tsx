import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatPaiseToInr } from "@/lib/billing/gst";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue: Service, Package, Plan, Offer • Admin",
};

type Tab = "services" | "packages" | "plans" | "offers";
const TABS: Tab[] = ["services", "packages", "plans", "offers"];

const th = "px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-secondary whitespace-nowrap";
const td = "px-3 py-2.5 align-top text-sm";
const pill = (ok: boolean) =>
  `inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${ok ? "bg-green-100 text-green-800" : "bg-surface-container-high text-on-surface-variant"}`;
const warn = "inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900";

export default async function AdminCataloguePage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; service?: string }>;
}) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  await requireAdmin("/admin/catalogue", locale);
  const hi = locale === "hi";
  const t = (en: string, h: string) => (hi ? h : en);

  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "services";
  const serviceFilter = sp.service || "";

  const [services, offers] = await Promise.all([
    prisma.service.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        packages: { orderBy: { orderIndex: "asc" } },
        plans: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.offer.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const name = (x: { titleEn: string; titleHi: string }) => (hi ? x.titleHi || x.titleEn : x.titleEn);
  const visibleServices = serviceFilter ? services.filter((s) => s.slug === serviceFilter) : services;
  const packageCount = services.reduce((n, s) => n + s.packages.length, 0);
  const planCount = services.reduce((n, s) => n + s.plans.length, 0);
  const planName = new Map(services.flatMap((s) => s.plans.map((p) => [p.id, name(p)] as const)));
  const offersFor = (slug: string) => offers.filter((o) => o.serviceSlugs.length === 0 || o.serviceSlugs.includes(slug));

  const counts: Record<Tab, number> = { services: services.length, packages: packageCount, plans: planCount, offers: offers.length };
  const labels: Record<Tab, [string, string]> = {
    services: ["Services", "सेवाएँ"],
    packages: ["Packages", "पैकेज"],
    plans: ["Plans", "प्लान"],
    offers: ["Offers", "ऑफ़र"],
  };
  const hrefFor = (tb: Tab, svc?: string) => `/admin/catalogue?tab=${tb}${svc ? `&service=${encodeURIComponent(svc)}` : ""}`;

  return (
    <div className="space-y-6 text-left">
      <header>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Catalogue: Service → Package → Plan → Offer", "कैटलॉग: सेवा → पैकेज → प्लान → ऑफ़र")}</h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
          {t(
            "See everything in the order a customer meets it. Add or edit in Services & plans (steps 1 to 3) and in Offers (step 4). Orange notes show what is still unfinished.",
            "सब कुछ उसी क्रम में देखें जिसमें ग्राहक देखता है। चरण 1 से 3 'सेवाएँ व प्लान' में और चरण 4 'ऑफ़र' में जोड़ें या बदलें। नारंगी नोट बताते हैं कि क्या अधूरा है।"
          )}
        </p>
      </header>

      <nav aria-label={t("Steps", "चरण")} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TABS.map((tb, i) => (
          <Link
            key={tb}
            href={hrefFor(tb, serviceFilter)}
            aria-current={tab === tb ? "page" : undefined}
            className={`rounded-lg border p-4 min-h-[76px] transition-colors ${tab === tb ? "border-maroon bg-brand text-on-brand" : "border-outline-variant bg-surface hover:bg-gold/30"}`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{t("Step", "चरण")} {i + 1}</div>
            <div className="font-serif text-lg font-bold">{t(labels[tb][0], labels[tb][1])}</div>
            <div className="text-xs opacity-80">{counts[tb]} {t("in total", "कुल")}</div>
          </Link>
        ))}
      </nav>

      {tab !== "services" && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("Filter by service", "सेवा के अनुसार छाँटें")}>
          <span className="text-xs font-bold text-secondary">{t("Service:", "सेवा:")}</span>
          {[{ slug: "", label: t("All", "सभी") }, ...services.map((s) => ({ slug: s.slug, label: name(s) }))].map((f) => (
            <Link
              key={f.slug || "all"}
              href={hrefFor(tab, f.slug)}
              className={`min-h-[36px] inline-flex items-center rounded-full border px-3 text-xs font-bold ${serviceFilter === f.slug ? "bg-brand text-on-brand border-maroon" : "bg-surface text-secondary border-outline-variant hover:bg-gold/30"}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface">
        {tab === "services" && (
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-container-low">
              <tr>
                <th className={th}>{t("Service", "सेवा")}</th>
                <th className={th}>{t("Packages", "पैकेज")}</th>
                <th className={th}>{t("Plans", "प्लान")}</th>
                <th className={th}>{t("Offers", "ऑफ़र")}</th>
                <th className={th}>{t("Shown to visitors", "दिखता है")}</th>
                <th className={th}>{t("Check", "जाँच")}</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {services.map((s) => {
                const notes: string[] = [];
                if (s.plans.length === 0) notes.push(t("No plans yet", "अभी कोई प्लान नहीं"));
                else if (s.packages.length > 0 && s.plans.some((p) => !p.packageId)) notes.push(t("Some plans have no package", "कुछ प्लान बिना पैकेज के हैं"));
                if (s.isActive && s.plans.filter((p) => p.isActive).length === 0) notes.push(t("Switched on but no active plan", "चालू है पर कोई सक्रिय प्लान नहीं"));
                return (
                  <tr key={s.id}>
                    <td className={td}><div className="font-semibold text-secondary">{name(s)}</div><div className="text-xs text-on-surface-variant">/{s.slug}</div></td>
                    <td className={td}><Link href={hrefFor("packages", s.slug)} className="font-bold text-primary hover:underline">{s.packages.length}</Link></td>
                    <td className={td}><Link href={hrefFor("plans", s.slug)} className="font-bold text-primary hover:underline">{s.plans.length}</Link></td>
                    <td className={td}><Link href={hrefFor("offers", s.slug)} className="font-bold text-primary hover:underline">{offersFor(s.slug).length}</Link></td>
                    <td className={td}><span className={pill(s.isActive)}>{s.isActive ? t("Yes", "हाँ") : t("Hidden", "छिपा")}</span></td>
                    <td className={td}>{notes.length ? notes.map((n) => <div key={n}><span className={warn}>{n}</span></div>) : <span className="text-xs text-green-800">✓</span>}</td>
                    <td className={td}><Link href="/admin/services" className="text-xs font-bold text-primary hover:underline">{t("Edit →", "बदलें →")}</Link></td>
                  </tr>
                );
              })}
              {services.length === 0 && <tr><td className={td} colSpan={7}>{t("No services yet. Add one in Services & plans.", "अभी कोई सेवा नहीं। 'सेवाएँ व प्लान' में जोड़ें।")}</td></tr>}
            </tbody>
          </table>
        )}

        {tab === "packages" && (
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-container-low">
              <tr>
                <th className={th}>{t("Package", "पैकेज")}</th>
                <th className={th}>{t("Service", "सेवा")}</th>
                <th className={th}>{t("Plans", "प्लान")}</th>
                <th className={th}>{t("Days / seats", "दिन / सीटें")}</th>
                <th className={th}>{t("Shown", "दिखता है")}</th>
                <th className={th}>{t("Check", "जाँच")}</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {visibleServices.flatMap((s) =>
                s.packages.map((k) => {
                  const inPkg = s.plans.filter((p) => p.packageId === k.id);
                  return (
                    <tr key={k.id}>
                      <td className={td}><div className="font-semibold text-secondary">{name(k)}</div></td>
                      <td className={td}>{name(s)}</td>
                      <td className={td}><Link href={hrefFor("plans", s.slug)} className="font-bold text-primary hover:underline">{inPkg.length}</Link></td>
                      <td className={td}>{[k.numberOfDays ? `${k.numberOfDays} ${t("days", "दिन")}` : "", k.seats ? `${k.seats} ${t("seats", "सीटें")}` : ""].filter(Boolean).join(" · ") || "—"}</td>
                      <td className={td}><span className={pill(k.isActive)}>{k.isActive ? t("Yes", "हाँ") : t("Hidden", "छिपा")}</span></td>
                      <td className={td}>{inPkg.length === 0 ? <span className={warn}>{t("No plans in this package", "इस पैकेज में कोई प्लान नहीं")}</span> : <span className="text-xs text-green-800">✓</span>}</td>
                      <td className={td}><Link href="/admin/services" className="text-xs font-bold text-primary hover:underline">{t("Edit →", "बदलें →")}</Link></td>
                    </tr>
                  );
                })
              )}
              {visibleServices.every((s) => s.packages.length === 0) && <tr><td className={td} colSpan={7}>{t("No packages here yet. Open Services & plans and use \"Add package\" under a service.", "यहाँ अभी कोई पैकेज नहीं। 'सेवाएँ व प्लान' में सेवा के नीचे 'पैकेज जोड़ें' दबाएँ।")}</td></tr>}
            </tbody>
          </table>
        )}

        {tab === "plans" && (
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-container-low">
              <tr>
                <th className={th}>{t("Plan", "प्लान")}</th>
                <th className={th}>{t("Package", "पैकेज")}</th>
                <th className={th}>{t("Service", "सेवा")}</th>
                <th className={th}>{t("Price", "मूल्य")}</th>
                <th className={th}>{t("Offers that apply", "लागू ऑफ़र")}</th>
                <th className={th}>{t("Shown", "दिखता है")}</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {visibleServices.flatMap((s) =>
                s.plans.map((p) => {
                  const pkg = s.packages.find((k) => k.id === p.packageId);
                  const applying = offers.filter((o) => o.isActive && (o.serviceSlugs.length === 0 || o.serviceSlugs.includes(s.slug)) && (o.planIds.length === 0 || o.planIds.includes(p.id)));
                  return (
                    <tr key={p.id}>
                      <td className={td}><div className="font-semibold text-secondary">{name(p)}</div></td>
                      <td className={td}>{pkg ? name(pkg) : <span className={warn}>{t("No package", "पैकेज नहीं")}</span>}</td>
                      <td className={td}>{name(s)}</td>
                      <td className={td}>{formatPaiseToInr(p.pricePaise)}</td>
                      <td className={td}>{applying.length ? applying.map((o) => o.code).join(", ") : "—"}</td>
                      <td className={td}><span className={pill(p.isActive)}>{p.isActive ? t("Yes", "हाँ") : t("Hidden", "छिपा")}</span></td>
                      <td className={td}><Link href="/admin/services" className="text-xs font-bold text-primary hover:underline">{t("Edit →", "बदलें →")}</Link></td>
                    </tr>
                  );
                })
              )}
              {visibleServices.every((s) => s.plans.length === 0) && <tr><td className={td} colSpan={7}>{t("No plans here yet.", "यहाँ अभी कोई प्लान नहीं।")}</td></tr>}
            </tbody>
          </table>
        )}

        {tab === "offers" && (
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-container-low">
              <tr>
                <th className={th}>{t("Offer / code", "ऑफ़र / कोड")}</th>
                <th className={th}>{t("Discount", "छूट")}</th>
                <th className={th}>{t("Applies to", "किस पर लागू")}</th>
                <th className={th}>{t("Valid", "मान्यता")}</th>
                <th className={th}>{t("Used", "प्रयोग")}</th>
                <th className={th}>{t("Switched on", "चालू")}</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {offers
                .filter((o) => !serviceFilter || o.serviceSlugs.length === 0 || o.serviceSlugs.includes(serviceFilter))
                .map((o) => {
                  const svcNames = o.serviceSlugs.length ? o.serviceSlugs.map((slug) => { const s = services.find((x) => x.slug === slug); return s ? name(s) : slug; }).join(", ") : t("All services", "सभी सेवाएँ");
                  const planNames = o.planIds.length ? o.planIds.map((id) => planName.get(id) || "?").join(", ") : "";
                  const expired = o.validUntil ? o.validUntil < new Date() : false;
                  return (
                    <tr key={o.id}>
                      <td className={td}><div className="font-semibold text-secondary">{name(o)}</div><div className="font-mono text-xs">{o.code}</div></td>
                      <td className={td}>{o.discountType === "PERCENTAGE" ? `${o.discountValuePaise}%` : formatPaiseToInr(o.discountValuePaise)}</td>
                      <td className={td}><div>{svcNames}</div>{planNames && <div className="text-xs text-on-surface-variant">{t("Only plans:", "केवल प्लान:")} {planNames}</div>}</td>
                      <td className={td}>{o.validFrom.toISOString().slice(0, 10)}{o.validUntil ? ` → ${o.validUntil.toISOString().slice(0, 10)}` : ""}{expired && <div><span className={warn}>{t("Expired", "समाप्त")}</span></div>}</td>
                      <td className={td}>{o.usedCount}{o.usageLimit ? ` / ${o.usageLimit}` : ""}</td>
                      <td className={td}><span className={pill(o.isActive)}>{o.isActive ? t("Yes", "हाँ") : t("Off", "बंद")}</span></td>
                      <td className={td}><Link href="/admin/offers" className="text-xs font-bold text-primary hover:underline">{t("Edit →", "बदलें →")}</Link></td>
                    </tr>
                  );
                })}
              {offers.length === 0 && <tr><td className={td} colSpan={7}>{t("No offers yet. Add one in Offers.", "अभी कोई ऑफ़र नहीं। 'ऑफ़र' में जोड़ें।")}</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/services" className="min-h-[44px] inline-flex items-center rounded border border-maroon bg-brand px-4 text-sm font-bold text-on-brand">{t("Open Services & plans (steps 1 to 3)", "सेवाएँ व प्लान खोलें (चरण 1 से 3)")}</Link>
        <Link href="/admin/offers" className="min-h-[44px] inline-flex items-center rounded border border-maroon px-4 text-sm font-bold text-secondary hover:bg-gold">{t("Open Offers (step 4)", "ऑफ़र खोलें (चरण 4)")}</Link>
        <Link href="/admin/other-services" className="min-h-[44px] inline-flex items-center rounded border border-maroon px-4 text-sm font-bold text-secondary hover:bg-gold">{t("Other services", "अन्य सेवाएँ")}</Link>
      </div>
    </div>
  );
}
