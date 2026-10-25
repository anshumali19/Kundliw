import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FaqClient } from "@/features/faq/FaqClient";
import { JsonLd } from "@/components/seo/JsonLd";

interface FaqPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: FaqPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/faq"),
    title: isHindi
      ? "प्रायः पूछे जाने वाले प्रश्न (FAQ) • महर्षि कणाद ज्योतिष केंद्र"
      : "Frequently Asked Questions (FAQ) • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "कुण्डली निर्माण, पंचांग, दक्षिणा एवं अनुष्ठान से संबंधित महत्वपूर्ण जिज्ञासा समाधान।"
      : "Comprehensive answers to common questions about horoscopes, ephemeris calculations, and Vedic rituals.",
  };
}

export default async function FaqPage(props: FaqPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const items = await prisma.faqItem
    .findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    })
    .catch(() => []);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: locale === "hi" ? item.questionHi : item.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: locale === "hi" ? item.answerHi : item.answerEn,
      },
    })),
  };

  return (
    <>
      {items.length > 0 && <JsonLd data={faqJsonLd} />}
      <FaqClient initialItems={items} locale={locale} />
    </>
  );
}
