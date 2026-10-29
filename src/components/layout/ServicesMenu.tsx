"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";

interface CatalogPlan {
  slug: string;
  titleEn: string;
  titleHi: string;
  pricePaise: number;
}
interface CatalogPackage {
  id: string;
  titleEn: string;
  titleHi: string;
  plans: CatalogPlan[];
  availability?: { status: "open" | "full" | "closed"; seatsLeft: number | null };
}
interface CatalogService {
  slug: string;
  titleEn: string;
  titleHi: string;
  packages: CatalogPackage[];
}

/** Main-menu "Services" item: hover or click to see every service, its packages and the plans in each package. */
export function ServicesMenu({ label, active }: { label: string; active: boolean }) {
  const isHindi = useLocale() === "hi";
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<CatalogService[] | null>(null);
  const [svc, setSvc] = useState<string>("");
  const [pkg, setPkg] = useState<string>("");

  useEffect(() => {
    if (!open || services) return;
    let live = true;
    fetch("/api/booking/catalog")
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        const list: CatalogService[] = d.services ?? [];
        setServices(list);
        if (list[0]) {
          setSvc(list[0].slug);
          setPkg(list[0].packages[0]?.id ?? "");
        }
      })
      .catch(() => live && setServices([]));
    return () => {
      live = false;
    };
  }, [open, services]);

  const t = (en: string, hi: string) => (isHindi ? hi || en : en || hi);
  const activeService = services?.find((s) => s.slug === svc);
  const activePackage = activeService?.packages.find((k) => k.id === pkg) ?? activeService?.packages[0];
  const rupees = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const close = () => setOpen(false);

  return (
    <div className="relative h-full flex items-center" onMouseEnter={() => setOpen(true)} onMouseLeave={close}>
      <Link
        href="/services"
        onClick={close}
        aria-expanded={open}
        aria-haspopup="true"
        className={`h-full flex items-center gap-1 px-1.5 2xl:px-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
          active || open ? "text-primary border-saffron font-bold" : "text-secondary hover:text-primary border-transparent hover:border-saffron/50"
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>

      {open && (
        <div className="absolute top-full left-0 pt-1 z-50 text-left w-[min(46rem,94vw)]">
          <div className="bg-surface border border-outline-variant/60 shadow-xl rounded overflow-hidden">
            {services === null ? (
              <p className="p-4 text-xs text-on-surface-variant">{isHindi ? "लोड हो रहा है…" : "Loading…"}</p>
            ) : services.length === 0 ? (
              <p className="p-4 text-xs text-on-surface-variant">{isHindi ? "अभी कोई सेवा उपलब्ध नहीं।" : "No services available right now."}</p>
            ) : (
              <div className="grid grid-cols-3 max-h-[calc(100dvh-10rem)] overflow-y-auto divide-x divide-outline-variant/40">
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-primary">{isHindi ? "सेवा" : "Service"}</div>
                  {services.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      onClick={close}
                      onMouseEnter={() => {
                        setSvc(s.slug);
                        setPkg(s.packages[0]?.id ?? "");
                      }}
                      onFocus={() => {
                        setSvc(s.slug);
                        setPkg(s.packages[0]?.id ?? "");
                      }}
                      className={`block px-3 py-2 text-xs font-semibold ${s.slug === svc ? "bg-surface-container-high text-primary" : "text-on-surface hover:bg-surface-container-high"}`}
                    >
                      {t(s.titleEn, s.titleHi)}
                    </Link>
                  ))}
                </div>

                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-primary">{isHindi ? "पैकेज" : "Package"}</div>
                  {activeService?.packages.map((k) => {
                    const blocked = k.availability && k.availability.status !== "open";
                    return (
                      <Link
                        key={k.id || "std"}
                        href={`/services/${activeService.slug}`}
                        onClick={close}
                        onMouseEnter={() => setPkg(k.id)}
                        onFocus={() => setPkg(k.id)}
                        className={`block px-3 py-2 text-xs font-semibold ${k.id === activePackage?.id ? "bg-surface-container-high text-primary" : "text-on-surface hover:bg-surface-container-high"}`}
                      >
                        {t(k.titleEn, k.titleHi)}
                        {blocked ? (
                          <span className="block text-[10px] font-bold text-error">{isHindi ? "बुकिंग बंद / भर चुका" : "Closed / full"}</span>
                        ) : k.availability?.seatsLeft != null ? (
                          <span className="block text-[10px] font-semibold text-on-surface-variant">
                            {isHindi ? `${k.availability.seatsLeft} स्थान शेष` : `${k.availability.seatsLeft} seats left`}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>

                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-primary">{isHindi ? "प्लान" : "Plan"}</div>
                  {activePackage &&
                    activeService &&
                    activePackage.plans.map((p) =>
                      activePackage.availability && activePackage.availability.status !== "open" ? (
                        <span key={p.slug} className="flex justify-between gap-2 px-3 py-2 text-xs text-on-surface-variant opacity-60">
                          <span>{t(p.titleEn, p.titleHi)}</span>
                          <span>{rupees(p.pricePaise)}</span>
                        </span>
                      ) : (
                        <Link
                          key={p.slug}
                          href={`/booking?service=${encodeURIComponent(activeService.slug)}&plan=${encodeURIComponent(p.slug)}`}
                          onClick={close}
                          className="flex justify-between gap-2 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high"
                        >
                          <span>{t(p.titleEn, p.titleHi)}</span>
                          <span className="text-primary">{rupees(p.pricePaise)}</span>
                        </Link>
                      )
                    )}
                  <p className="px-3 pt-2 text-[10px] text-on-surface-variant">
                    {isHindi ? "प्लान चुनने पर ऑफ़र और भुगतान का चरण आएगा।" : "Choosing a plan continues to Offer and Payment."}
                  </p>
                </div>
              </div>
            )}
            <Link href="/services" onClick={close} className="block border-t border-outline-variant/40 px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-high">
              {isHindi ? "सभी सेवाएँ देखें →" : "View all services →"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
