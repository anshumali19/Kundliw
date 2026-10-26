import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { getSection } from "@/lib/siteConfig/service";
import { EmbedFrame, embedAddress } from "@/components/content/EmbedFrame";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/panchang"),
    title: isHindi ? "हिंदी पंचांग कैलेंडर • महर्षि कणाद ज्योतिष केंद्र" : "Hindi Panchang Calendar • Maharshi Kanad Jyotish Kendra",
    description: isHindi ? "आज की तिथि, नक्षत्र, योग, करण, राहु काल और शुभ मुहूर्त।" : "Today's tithi, nakshatra, yoga, karana, Rahu Kaal and auspicious times.",
  };
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  const cfg = await getSection("tools");
  const src = embedAddress(String(cfg.panchangUrl || ""), "https://panchang.astrosage.com/?language={lang}", locale);
  return (
    <EmbedFrame
      src={src}
      title="Hindi Panchang Calendar"
      heading={isHindi ? "हिंदी पंचांग कैलेंडर" : "Hindi Panchang Calendar"}
      intro={isHindi ? "आज की तिथि, नक्षत्र, योग, करण, राहु काल और शुभ मुहूर्त।" : "Today's tithi, nakshatra, yoga, karana, Rahu Kaal and auspicious times."}
      openLabel={isHindi ? "पूरी स्क्रीन में खोलें" : "Open full screen"}
      credit={isHindi ? "यह टूल AstroSage द्वारा संचालित है; सभी अधिकार उनके पास सुरक्षित हैं।" : "This tool is provided by AstroSage; all rights belong to them."}
    />
  );
}
