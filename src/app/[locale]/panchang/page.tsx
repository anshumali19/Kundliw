import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { getDailyPanchang } from "@/lib/astro/panchangService";
import { PanchangClient } from "@/features/astro/components/PanchangClient";

interface PanchangPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PanchangPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/panchang"),
    title: isHindi
      ? "दैनिक पंचांग एवं शुभ मुहूर्त • महर्षि कणाद ज्योतिष केंद्र"
      : "Daily Vedic Panchang & Shubh Muhurat • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "शुद्ध सूर्य सिद्धान्त एवं दृग्गणित पर आधारित वाराणसी दैनिक पंचांग, राहु काल एवं अभिजित मुहूर्त।"
      : "Authentic mathematical daily Vedic almanac computed for Varanasi coordinates (Dashashwamedh Ghat).",
  };
}

export default async function PanchangPage(props: PanchangPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const initialPanchang = await getDailyPanchang();

  return (
    <div className="w-full min-h-screen bg-surface-container-lowest py-8">
      <PanchangClient initialPanchang={initialPanchang} locale={locale} />
    </div>
  );
}
