import type { Metadata } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarqueeStrip } from "@/components/layout/MarqueeStrip";
import { MobileNav } from "@/components/layout/MobileNav";
import { FloatingActionBar } from "@/components/layout/FloatingActionBar";
import { BannerSlot } from "@/components/banners/BannerSlot";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { prisma } from "@/lib/prisma";
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
  title: "Maharshi Kanad Jyotish Kendra | महर्षि कणाद ज्योतिष केंद्र",
  description:
    "Authentic Vedic Siddhanta, mathematical astronomical calculations, and traditional Horary Jyotisha rooted in ancient scriptures at Dashashwamedh Ghat, Varanasi.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
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

  const settings = await prisma.adminSettings
    .findFirst({
      select: {
        phone1: true,
        whatsappNumber: true,
        socialWhatsapp: true,
      },
    })
    .catch(() => null);

  return (
    <html lang={locale} className={`${notoSerif.variable} ${notoSans.variable} w-full max-w-full overflow-x-hidden`}>
      <body className="bg-surface font-sans text-on-surface antialiased flex flex-col min-h-screen w-full max-w-full overflow-x-hidden relative">
        <GoogleAnalytics />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScrollProvider>
            <Header phone={settings?.phone1 ?? undefined} />
            <div className="pt-[116px] w-full max-w-full overflow-x-hidden">
              <BannerSlot position="TOP" initialBanners={topBanners} />
            </div>
            <main className="flex-1 w-full max-w-full overflow-x-hidden pb-16 xl:pb-0">
              {children}
            </main>
            <BannerSlot position="BOTTOM" initialBanners={bottomBanners} />
            <MarqueeStrip />
            <Footer />
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
