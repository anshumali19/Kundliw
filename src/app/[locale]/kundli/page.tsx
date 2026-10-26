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
    alternates: pageAlternates(locale, "/kundli"),
    title: isHindi ? "निःशुल्क जन्म कुंडली • महर्षि कणाद ज्योतिष केंद्र" : "Free Kundli (Birth Chart) • Maharshi Kanad Jyotish Kendra",
    description: isHindi ? "जन्म विवरण भरकर अपनी वास्तविक जन्म कुंडली बनाएँ।" : "Enter your birth details to create your real birth chart.",
  };
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  const cfg = await getSection("tools");
  const tech = await getSection("technology");
  const note = [tech[isHindi ? "calcMethodHi" : "calcMethodEn"], tech[isHindi ? "accuracyNoteHi" : "accuracyNoteEn"]].map((x) => String(x || "").trim()).filter(Boolean).join("\n\n") || undefined;
  if (cfg.kundliEnabled === false) return <ToolOff name={isHindi ? "कुंडली" : "Kundli"} isHindi={isHindi} />;
  const src = embedAddress(String(cfg.kundliUrl || ""), "https://www.astrosage.com/freekundli/", locale);
  return (
    <EmbedFrame
      src={src}
      title="Free Kundli (Birth Chart)"
      heading={isHindi ? "निःशुल्क जन्म कुंडली" : "Free Kundli (Birth Chart)"}
      intro={isHindi ? "जन्म विवरण भरकर अपनी वास्तविक जन्म कुंडली बनाएँ।" : "Enter your birth details to create your real birth chart."}
      note={note}
      openLabel={isHindi ? "पूरी स्क्रीन में खोलें" : "Open full screen"}
      credit={isHindi ? "यह टूल AstroSage द्वारा संचालित है; सभी अधिकार उनके पास सुरक्षित हैं।" : "This tool is provided by AstroSage; all rights belong to them."}
    />
  );
}
