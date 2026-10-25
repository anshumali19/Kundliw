import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { KundliCalculatorClient } from "@/features/astro/components/KundliCalculatorClient";

interface KundliPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: KundliPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/kundli"),
    title: isHindi
      ? "नि:शुल्क वैदिक जन्मपत्रिका एवं ग्रह स्पष्ट | महर्षि कणाद ज्योतिष केंद्र"
      : "Free Vedic Janampatri & Planetary Calculator | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "सूर्य सिद्धान्त एवं दृग्गणित पर आधारित शुद्ध लग्न, राशि, नक्षत्र एवं ग्रह-स्थिति विचार।"
      : "Compute authentic Vedic natal charts, planetary degrees, ascendant, and Vimshottari Mahadasha.",
  };
}

export default function KundliPage({ params: { locale } }: KundliPageProps) {
  return (
    <div className="w-full min-h-screen bg-surface-container-lowest py-8">
      <KundliCalculatorClient locale={locale} />
    </div>
  );
}
