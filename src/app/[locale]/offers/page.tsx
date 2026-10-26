import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { Percent } from "lucide-react";

export const dynamic = "force-dynamic";

interface OffersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: OffersPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/offers"),
    title: isHindi ? "ऑफ़र • महर्षि कणाद ज्योतिष केंद्र" : "Offers • Maharshi Kanad Jyotish Kendra",
    description: isHindi ? "वर्तमान में उपलब्ध छूट एवं ऑफ़र।" : "Current discounts and offer codes.",
  };
}

export default async function OffersPage(props: OffersPageProps) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  const now = new Date();

  const offers = await prisma.offer
    .findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 text-left space-y-8">
      <div className="space-y-2 border-b border-outline-variant/40 pb-5">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Percent className="w-4 h-4" />
          <span>{isHindi ? "छूट एवं ऑफ़र" : "Discounts and offers"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {isHindi ? "ऑफ़र" : "Offers"}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {isHindi
            ? "बुकिंग के समय ऑफ़र कोड डालें और छूट पाएँ।"
            : "Enter an offer code while booking to get the discount."}
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-dashed border-outline-variant text-center text-sm text-on-surface-variant">
          {isHindi ? "अभी कोई ऑफ़र उपलब्ध नहीं है।" : "No offers are available right now."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {offers.map((o) => {
            const isPercent = o.discountType === "PERCENTAGE";
            const value = isPercent ? `${o.discountValuePaise}%` : formatPaiseToInr(o.discountValuePaise);
            return (
              <div key={o.id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-lg text-secondary">{isHindi ? o.titleHi : o.titleEn}</h2>
                  <span className="px-3 py-1 rounded-full bg-brand text-on-brand text-sm font-bold">
                    {isHindi ? `${value} छूट` : `${value} off`}
                  </span>
                </div>
                <div className="inline-block px-3 py-1.5 rounded border-2 border-dashed border-brand font-mono font-bold tracking-widest text-secondary">
                  {o.code}
                </div>
                <ul className="text-xs text-on-surface-variant space-y-1">
                  {o.minOrderValuePaise > 0 && (
                    <li>
                      {isHindi ? "न्यूनतम ऑर्डर: " : "Minimum order: "}
                      {formatPaiseToInr(o.minOrderValuePaise)}
                    </li>
                  )}
                  {isPercent && o.maxDiscountPaise ? (
                    <li>
                      {isHindi ? "अधिकतम छूट: " : "Maximum discount: "}
                      {formatPaiseToInr(o.maxDiscountPaise)}
                    </li>
                  ) : null}
                  {o.validUntil && (
                    <li>
                      {isHindi ? "मान्य तिथि तक: " : "Valid until: "}
                      {o.validUntil.toLocaleDateString(isHindi ? "hi-IN" : "en-IN")}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/services"
        className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-brand hover:bg-brand-hover text-on-brand font-bold"
      >
        {isHindi ? "सेवाएँ देखें और बुक करें" : "View services and book"}
      </Link>
    </div>
  );
}
