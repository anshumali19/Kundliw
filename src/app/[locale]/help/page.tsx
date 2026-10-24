import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HelpCircle, Phone, Mail, Clock } from "lucide-react";

interface HelpPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: HelpPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "सहायता एवं संपर्क • महर्षि कणाद ज्योतिष केंद्र"
      : "Help & Support • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "परामर्श बुकिंग, भुगतान सत्यापन एवं अक्सर पूछे जाने वाले प्रश्न।"
      : "Consultation booking support, payment verification, and frequently asked questions.",
  };
}

export default async function HelpPage({ params: { locale } }: HelpPageProps) {
  const isHindi = locale === "hi";
  const [page, settings] = await Promise.all([
    prisma.staticPage.findUnique({ where: { slug: "help" } }),
    prisma.adminSettings.findUnique({ where: { id: "default" } }),
  ]);

  const title = isHindi ? page?.titleHi || "सहायता एवं संपर्क केंद्र" : page?.titleEn || "Help Center & Support";
  const content = isHindi
    ? page?.contentHi ||
      "यदि आपको परामर्श स्लॉट चयन, जन्म विवरण दर्ज करने अथवा भुगतान में कोई सहायता चाहिए, तो आप हमारे सहायता कक्ष से संपर्क कर सकते हैं।"
    : page?.contentEn ||
      "If you need guidance with consultation booking, birth detail verification, or payment reconciliation, our helpline is available daily.";

  const phone1 = settings?.phone1 || "+91-9827991224";
  const phone2 = settings?.phone2 || "+91-7509124672";

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-8 lg:px-12 text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <HelpCircle className="w-4 h-4" />
          <span>{isHindi ? "सहायता एवं मार्गदर्शन" : "Help & Guidance"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">{title}</h1>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
            {isHindi ? "सीधी दूरभाष हेल्पलाइन" : "Direct Telephone Helpline"}
          </span>
          <div className="space-y-1">
            <a
              href={`tel:${phone1.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>{phone1}</span>
            </a>
            <a
              href={`tel:${phone2.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>{phone2}</span>
            </a>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {isHindi ? "प्रातः ०९:०० से सायं ०७:०० बजे तक" : "Daily 09:00 AM – 07:00 PM IST"}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
            {isHindi ? "आधिकारिक ईमेल" : "Official Inquiries Email"}
          </span>
          <a
            href="mailto:contact@kanadastro.org"
            className="flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
          >
            <Mail className="w-4 h-4 text-primary" />
            <span>contact@kanadastro.org</span>
          </a>
          <p className="text-[11px] text-on-surface-variant">
            {isHindi ? "२४ घंटे के भीतर लिखित प्रत्युत्तर" : "Written response within 24 hours"}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 shadow-sm leading-relaxed whitespace-pre-line text-sm text-on-surface space-y-4">
        {content}
      </div>
    </div>
  );
}
