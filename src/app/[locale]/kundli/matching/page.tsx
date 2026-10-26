import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { getSection } from "@/lib/siteConfig/service";
import { EmbedFrame, ToolOff, embedAddress } from "@/components/content/EmbedFrame";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/kundli/matching"),
    title: isHindi ? "कुंडली मिलान • महर्षि कणाद ज्योतिष केंद्र" : "Kundli Matching • Maharshi Kanad Jyotish Kendra",
    description: isHindi ? "वर-कन्या के अष्टकूट गुण मिलान और मांगलिक विचार।" : "Ashtakoot guna matching and Manglik check for the couple.",
  };
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  const cfg = await getSection("tools");
  const tech = await getSection("technology");
  const note = [tech[isHindi ? "calcMethodHi" : "calcMethodEn"], tech[isHindi ? "accuracyNoteHi" : "accuracyNoteEn"]].map((x) => String(x || "").trim()).filter(Boolean).join("\n\n") || undefined;
  if (cfg.matchingEnabled === false) return <ToolOff name={isHindi ? "कुंडली मिलान" : "Kundli matching"} isHindi={isHindi} />;
  const src = embedAddress(String(cfg.matchingUrl || ""), "https://www.astrosage.com/freechart/matchmaking.asp", locale);
  return (
    <EmbedFrame
      src={src}
      title="Kundli Matching"
      heading={isHindi ? "कुंडली मिलान" : "Kundli Matching"}
      intro={isHindi ? "वर-कन्या के अष्टकूट गुण मिलान और मांगलिक विचार।" : "Ashtakoot guna matching and Manglik check for the couple."}
      note={note}
      openLabel={isHindi ? "पूरी स्क्रीन में खोलें" : "Open full screen"}
      credit={isHindi ? "यह टूल AstroSage द्वारा संचालित है; सभी अधिकार उनके पास सुरक्षित हैं।" : "This tool is provided by AstroSage; all rights belong to them."}
    />
  );
}
