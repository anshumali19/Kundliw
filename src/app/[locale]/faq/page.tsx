import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FaqClient } from "@/features/faq/FaqClient";

interface FaqPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: FaqPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "प्रायः पूछे जाने वाले प्रश्न (FAQ) • महर्षि कणाद ज्योतिष केंद्र"
      : "Frequently Asked Questions (FAQ) • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "कुण्डली निर्माण, पंचांग, दक्षिणा एवं अनुष्ठान से संबंधित महत्वपूर्ण जिज्ञासा समाधान।"
      : "Comprehensive answers to common questions about horoscopes, ephemeris calculations, and Vedic rituals.",
  };
}

export default async function FaqPage({ params: { locale } }: FaqPageProps) {
  const items = await prisma.faqItem
    .findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    })
    .catch(() => []);

  return <FaqClient initialItems={items} locale={locale} />;
}
