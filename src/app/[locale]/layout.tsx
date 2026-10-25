import type { Metadata } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { PageNavButtons } from "@/components/layout/PageNavButtons";
import { Footer } from "@/components/layout/Footer";
import { MarqueeStrip } from "@/components/layout/MarqueeStrip";
import { MobileNav } from "@/components/layout/MobileNav";
import { FloatingActionBar } from "@/components/layout/FloatingActionBar";
import { BannerSlot } from "@/components/banners/BannerSlot";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_NAME_HI, SITE_URL } from "@/lib/seo";
import "@/app/globals.css";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_NAME_HI}`,
    template: "%s",
  },
  description:
    "Vedic astrology consultations, Kundli preparation, Kundli matching and Prashna Kundli from Maharshi Kanad Jyotish Kendra, with online booking and order tracking in Hindi and English.",
  applicationName: SITE_NAME,
  icons: { apple: "/icons/apple-touch-icon.png" },
  keywords: [
    "Vedic astrology",
    "Kundli",
    "Kundli matching",
    "Prashna Kundli",
    "Jyotish consultation",
    "Panchang",
    "कुंडली",
    "ज्योतिष परामर्श",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_NAME_HI}`,
    description:
      "Book Vedic astrology consultations, Kundli and Kundli matching online, and track your order until delivery.",
    locale: "hi_IN",
    alternateLocale: ["en_IN"],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | ${SITE_NAME_HI}`,
    description:
      "Vedic astrology consultations, Kundli and Kundli matching with online booking.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const messages = await getMessages();

  const topBanners = await prisma.banner
    .findMany({
      where: { isActive: true, position: "TOP" },
      orderBy: { orderIndex: "asc" },
    })
    .catch(() => []);

  const bottomBanners = await prisma.banner
    .findMany({
      where: { isActive: true, position: "BOTTOM" },
      orderBy: { orderIndex: "asc" },
    })
    .catch(() => []);

  const marqueeItems = await prisma.marqueeItem
    .findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        textEn: true,
        textHi: true,
        speedSec: true,
        fontSize: true,
        bgColor: true,
        textColor: true,
        position: true,
      },
    })
    .catch(() => []);
  const topMarquee = marqueeItems.filter((m) => m.position === "TOP");
  const bottomMarquee = marqueeItems.filter((m) => m.position === "BOTTOM");

  const settings = await prisma.adminSettings
    .findFirst({
      select: {
        phone1: true,
        email: true,
        addressEn: true,
        city: true,
        whatsappNumber: true,
        socialWhatsapp: true,
        socialFacebook: true,
        socialInstagram: true,
        socialTwitter: true,
        socialYoutube: true,
      },
    })
    .catch(() => null);

  const sameAs = [
    settings?.socialFacebook,
    settings?.socialInstagram,
    settings?.socialTwitter,
    settings?.socialYoutube,
  ].filter((u): u is string => !!u && /^https?:\/\//.test(u));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_NAME_HI,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        image: `${SITE_URL}/icon.svg`,
        description:
          "Vedic astrology consultations, Kundli preparation, Kundli matching and Prashna Kundli with online booking.",
        ...(settings?.phone1 ? { telephone: settings.phone1 } : {}),
        ...(settings?.email ? { email: settings.email } : {}),
        ...(settings?.addressEn || settings?.city
          ? {
              address: {
                "@type": "PostalAddress",
                ...(settings?.addressEn ? { streetAddress: settings.addressEn } : {}),
                ...(settings?.city ? { addressLocality: settings.city } : {}),
                addressCountry: "IN",
              },
            }
          : {}),
        areaServed: "IN",
        availableLanguage: ["Hindi", "English"],
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: ["hi", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang={locale} className={`${notoSerif.variable} ${notoSans.variable} w-full max-w-full overflow-x-hidden`}>
      <body className="bg-surface font-sans text-on-surface antialiased flex flex-col min-h-screen w-full max-w-full overflow-x-hidden relative">
        <JsonLd data={structuredData} />
        <GoogleAnalytics />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScrollProvider>
            <Header phone={settings?.phone1 ?? undefined} />
            <div className="pt-[116px] w-full max-w-full overflow-x-hidden">
              <BannerSlot position="TOP" initialBanners={topBanners} />
            </div>
            {topMarquee.length > 0 && <MarqueeStrip items={topMarquee} position="TOP" />}
            <main className="flex-1 w-full max-w-full overflow-x-hidden pb-6 xl:pb-0">
              <PageNavButtons />
              {children}
            </main>
            <BannerSlot position="BOTTOM" initialBanners={bottomBanners} />
            <MarqueeStrip items={bottomMarquee} position="BOTTOM" />
            <div className="pb-32 xl:pb-14">
              <Footer />
            </div>
            <MobileNav />
            <FloatingActionBar
              phone={settings?.phone1 || undefined}
              whatsappNumber={
                settings?.socialWhatsapp ||
                settings?.whatsappNumber ||
                settings?.phone1 ||
                undefined
              }
            />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
