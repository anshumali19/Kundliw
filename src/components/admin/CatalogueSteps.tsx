import { Link } from "@/i18n/routing";
import { InfoTip } from "./InfoTip";

export type CatalogueStep = "services" | "packages" | "plans" | "offers";

const STEPS: Array<{ id: CatalogueStep; href: string; en: string; hi: string; tipEn: string; tipHi: string }> = [
  {
    id: "services",
    href: "/admin/services",
    en: "Services",
    hi: "सेवाएँ",
    tipEn: "Step 1. A service is what you sell, for example Kundli or Yagya. Add its title, picture, video and description here.",
    tipHi: "चरण 1. सेवा वह है जो आप बेचते हैं, जैसे कुंडली या यज्ञ। यहाँ उसका नाम, चित्र, वीडियो और विवरण जोड़ें।",
  },
  {
    id: "packages",
    href: "/admin/packages",
    en: "Packages",
    hi: "पैकेज",
    tipEn: "Step 2. A package is a version of a service, for example Sadharan, Madhyam or Uttam. Every package sits under one service and you can move it to another.",
    tipHi: "चरण 2. पैकेज सेवा का एक रूप है, जैसे साधारण, मध्यम या उत्तम। हर पैकेज एक सेवा के अंदर होता है और उसे दूसरी सेवा में ले जा सकते हैं।",
  },
  {
    id: "plans",
    href: "/admin/plans",
    en: "Plans",
    hi: "प्लान",
    tipEn: "Step 3. A plan is the thing the customer pays for inside a package: its price, delivery time and what is included.",
    tipHi: "चरण 3. प्लान पैकेज के अंदर वह चीज़ है जिसके लिए ग्राहक भुगतान करता है: कीमत, डिलीवरी का समय और क्या शामिल है।",
  },
  {
    id: "offers",
    href: "/admin/offers",
    en: "Offers",
    hi: "ऑफ़र",
    tipEn: "Step 4. An offer is a discount or promo code. Attach it to chosen plans, to a whole package, or to a whole service.",
    tipHi: "चरण 4. ऑफ़र एक छूट या प्रोमो कोड है। इसे चुने हुए प्लान, पूरे पैकेज या पूरी सेवा से जोड़ें।",
  },
];

/** The four steps in order, so the admin always sees where they are: Service → Package → Plan → Offer. */
export function CatalogueSteps({ current, isHindi }: { current: CatalogueStep; isHindi: boolean }) {
  return (
    <nav aria-label={isHindi ? "चरण" : "Steps"} className="mb-5">
      <ol className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {STEPS.map((s, i) => {
          const on = s.id === current;
          return (
            <li key={s.id} className="relative">
              <Link
                href={s.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-[56px] items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  on ? "border-maroon bg-brand text-on-brand" : "border-outline-variant bg-surface hover:bg-gold/30 text-secondary"
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${on ? "bg-gold text-secondary" : "bg-surface-container-high"}`}>{i + 1}</span>
                <span className="font-serif text-base font-bold">{isHindi ? s.hi : s.en}</span>
              </Link>
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <InfoTip text={isHindi ? s.tipHi : s.tipEn} />
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
