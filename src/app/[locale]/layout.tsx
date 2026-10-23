import type { Metadata } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarqueeStrip } from "@/components/layout/MarqueeStrip";
import { MobileNav } from "@/components/layout/MobileNav";
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

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body className="bg-surface font-sans text-on-surface antialiased flex flex-col min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1 w-full pt-[116px] pb-16 xl:pb-0">
            {children}
          </main>
          <MarqueeStrip />
          <Footer />
          <MobileNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
