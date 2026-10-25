import { Metadata } from "next";
import { PrashnaRequestClient } from "@/features/astro/components/PrashnaRequestClient";

interface PrashnaPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PrashnaPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "प्रश्न कुण्डली एवं दैवज्ञ परामर्श | महर्षि कणाद ज्योतिष केंद्र"
      : "Vedic Prashna Shastra & Horary Consultation | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "तात्कालिक प्रश्न लग्न विचार एवं दैवज्ञ समाधान।"
      : "Submit horary Vedic astrology questions for Senior Daivajna examination.",
  };
}

export default async function PrashnaPage(props: PrashnaPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  return (
    <div className="w-full min-h-screen bg-surface-container-lowest py-8">
      <PrashnaRequestClient locale={locale} />
    </div>
  );
}
