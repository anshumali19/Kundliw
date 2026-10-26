import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BlocksView } from "@/components/content/MediaView";
import { normalizeBlocks } from "@/lib/content/media";
import { ArrowRight, CalendarCheck, ScrollText, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/about"),
    title: isHindi
      ? "हमारे बारे में | महर्षि कणाद ज्योतिष केंद्र"
      : "About Us | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "महर्षि कणाद ज्योतिष केंद्र की सेवाओं और कार्यप्रणाली का परिचय।"
      : "About the services and working of Maharshi Kanad Jyotish Kendra.",
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";

  const page = await prisma.staticPage
    .findUnique({ where: { slug: "about" } })
    .catch(() => null);

  // Template text left in the database by earlier setup is ignored on the public page.
  const isTemplate = (value?: string | null) => !value || /admin panel|एडमिन पैनल/i.test(value);

  const title = isHindi
    ? page?.titleHi || "महर्षि कणाद ज्योतिष केंद्र"
    : page?.titleEn || "Maharshi Kanad Jyotish Kendra";

  const customContent = isHindi ? page?.contentHi : page?.contentEn;
  const content = !isTemplate(customContent)
    ? (customContent as string)
    : isHindi
      ? "महर्षि कणाद ज्योतिष केंद्र वैदिक ज्योतिष सेवाएँ प्रदान करता है: कुंडली निर्माण, कुंडली मिलान, प्रश्न कुंडली और परामर्श। आप सेवा चुनकर, प्लान और ऑफ़र लगाकर ऑनलाइन बुकिंग एवं भुगतान कर सकते हैं और अपने ऑर्डर की प्रगति देख सकते हैं।"
      : "Maharshi Kanad Jyotish Kendra offers Vedic astrology services: Kundli preparation, Kundli matching, Prashna Kundli and consultations. You can choose a service, apply a plan and offer, book and pay online, and follow the progress of your order.";

  const points = [
    {
      icon: ScrollText,
      title: isHindi ? "कुंडली एवं मिलान" : "Kundli and matching",
      text: isHindi
        ? "जन्म कुंडली, गुण मिलान और प्रश्न कुंडली के लिए फ़ॉर्म भरें।"
        : "Request a Kundli, Kundli matching or a Prashna Kundli with a simple form.",
    },
    {
      icon: CalendarCheck,
      title: isHindi ? "ऑनलाइन बुकिंग" : "Online booking",
      text: isHindi
        ? "सेवा और प्लान चुनें, ऑफ़र लगाएँ और सुरक्षित भुगतान करें।"
        : "Choose a service and plan, apply an offer and pay securely.",
    },
    {
      icon: Truck,
      title: isHindi ? "ऑर्डर ट्रैकिंग" : "Order tracking",
      text: isHindi
        ? "ऑर्डर प्राप्त होने से रिपोर्ट मिलने तक हर चरण देखें।"
        : "Follow every step from order received to report delivered.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-left space-y-10">
      <div className="border-b border-outline-variant/30 pb-6 space-y-2">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">
          {isHindi ? "हमारे बारे में" : "About us"}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">{title}</h1>
      </div>

      <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 leading-relaxed text-base text-on-surface whitespace-pre-line">
        {content}
      </div>

      <BlocksView blocks={normalizeBlocks(page?.blocks)} isHindi={isHindi} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {points.map(({ icon: Icon, title: pointTitle, text }) => (
          <div
            key={pointTitle}
            className="p-5 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2"
          >
            <Icon className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-base text-secondary">{pointTitle}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        <Link
          href="/services"
          className="px-5 py-3 rounded bg-brand hover:bg-brand-hover text-on-brand font-bold text-sm uppercase tracking-wider border border-primary transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>{isHindi ? "सेवाएँ देखें" : "View services"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/founder"
          className="px-5 py-3 rounded bg-surface text-secondary font-bold text-sm uppercase tracking-wider border border-secondary hover:bg-surface-container-high transition-colors flex items-center justify-center min-h-[44px]"
        >
          {isHindi ? "संस्थापक परिचय" : "About the founder"}
        </Link>
      </div>
    </div>
  );
}
