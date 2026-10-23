import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";

interface LegalPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export const dynamic = "force-dynamic";

const VALID_SLUGS = ["terms", "privacy", "refund"];

export async function generateMetadata({ params: { locale, slug } }: LegalPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  const titles: Record<string, { en: string; hi: string }> = {
    terms: { en: "Terms of Service & Astrological Ethics", hi: "सेवा नियम एवं ज्योतिषीय आचार संहिता" },
    privacy: { en: "Privacy Policy & Natal Data Protection", hi: "गोपनीयता नीति एवं जन्म विवरण सुरक्षा" },
    refund: { en: "Dakshina & Consultation Cancellation Policy", hi: "परामर्श निरस्तीकरण एवं धनवापसी नीति" },
  };

  const current = titles[slug] || { en: "Legal Notice", hi: "वैधानिक सूचना" };
  return {
    title: `${isHindi ? current.hi : current.en} • Maharshi Kanad Jyotish Kendra`,
  };
}

export default async function LegalPage({ params: { locale, slug } }: LegalPageProps) {
  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  const isHindi = locale === "hi";
  const page = await prisma.staticPage.findUnique({ where: { slug } });

  const defaultTitles: Record<string, { en: string; hi: string }> = {
    terms: { en: "Terms of Service & Astrological Ethics", hi: "सेवा नियम एवं ज्योतिषीय आचार संहिता" },
    privacy: { en: "Privacy Policy & Natal Data Protection", hi: "गोपनीयता नीति एवं जन्म विवरण सुरक्षा" },
    refund: { en: "Dakshina Cancellation & Refund Policy", hi: "परामर्श निरस्तीकरण एवं दक्षिणा वापसी नीति" },
  };

  const defaultContents: Record<string, { en: string; hi: string }> = {
    terms: {
      en: "All astrological consultations, horary analyses, and computational Janampatris provided by Maharshi Kanad Jyotish Kendra are rendered strictly under ancient Vedanga Jyotish principles. Astrology is an advisory discipline designed for ethical life guidance.",
      hi: "महर्षि कणाद ज्योतिष केंद्र द्वारा प्रदान किए जाने वाले समस्त परामर्श, प्रश्न विचार एवं गणितीय कुण्डलियां शास्त्रीय वेदांग ज्योतिष के सिद्धांतों पर आधारित हैं। ज्योतिष एक मार्गदर्शनकारी विद्या है।",
    },
    privacy: {
      en: "We respect the confidentiality of every customer's birth coordinates, family Gotra, and specific personal queries. Your birth records are stored securely and never shared with third parties or advertising brokers.",
      hi: "हम प्रत्येक जातक के जन्म विवरण, गोत्र एवं व्यक्तिगत प्रश्नों की पूर्ण गोपनीयता सुनिश्चित करते हैं। आपका विवरण किसी भी तृतीय पक्ष को विपणन हेतु प्रदान नहीं किया जाता।",
    },
    refund: {
      en: "Consultation slots may be rescheduled or cancelled up to 24 hours prior to the reserved time. Once custom planetary calculations and physical Kundli calligraphy have commenced, Dakshina contributions are processed per policy guidelines.",
      hi: "परामर्श स्लॉट को निर्धारित समय से २४ घंटे पूर्व पुनः निर्धारित अथवा निरस्त किया जा सकता है। हस्तलिखित कुण्डली निर्माण प्रारंभ होने के पश्चात नियमानुसार कार्यवाही की जाती है।",
    },
  };

  const title = isHindi
    ? page?.titleHi || defaultTitles[slug]?.hi
    : page?.titleEn || defaultTitles[slug]?.en;

  const content = isHindi
    ? page?.contentHi || defaultContents[slug]?.hi
    : page?.contentEn || defaultContents[slug]?.en;

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-6 max-w-4xl mx-auto text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          <span>{isHindi ? "वैधानिक एवं नीति विधान" : "Legal & Compliance"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">{title}</h1>
      </div>

      <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 shadow-sm leading-relaxed whitespace-pre-line text-sm text-on-surface space-y-4">
        {content}
      </div>
    </div>
  );
}
