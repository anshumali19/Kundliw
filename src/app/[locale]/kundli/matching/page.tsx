import { Metadata } from "next";
import { MatchingCalculatorClient } from "@/features/astro/components/MatchingCalculatorClient";

interface MatchingPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: MatchingPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "नि:शुल्क कुण्डली मिलान एवं अष्टकूट मेलापक | महर्षि कणाद ज्योतिष केंद्र"
      : "Free Kundli Matching & Ashtakoot Gun Milan | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "वर-कन्या के ३६ गुणों, मांगलिक विचार एवं नाड़ी दोष की शास्त्रीय वैदिक गणना।"
      : "Authentic 36-Guna Ashtakoot matrimonial compatibility calculation with Manglik and Nadi Dosha analysis.",
  };
}

export default function MatchingPage({ params: { locale } }: MatchingPageProps) {
  return (
    <div className="w-full min-h-screen bg-surface-container-lowest py-8">
      <MatchingCalculatorClient locale={locale} />
    </div>
  );
}
