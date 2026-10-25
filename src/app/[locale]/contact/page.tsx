import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContactClient } from "@/features/contact/ContactClient";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isHi = params?.locale === "hi";
  return {
    alternates: pageAlternates(params?.locale, "/contact"),
    title: isHi
      ? "संपर्क करें एवं स्थान | महर्षि कणाद ज्योतिष केंद्र"
      : "Contact Us & Location | Maharshi Kanad Jyotish Kendra",
    description: isHi
      ? "महर्षि कणाद ज्योतिष केंद्र से संपर्क करें, वाराणसी केंद्र का गूगल मैप देखें और अपनी जन्मकुंडली या परामर्श संबंधित पूछताछ भेजें।"
      : "Contact Maharshi Kanad Jyotish Kendra, view Google Map location in Varanasi, and submit your astrology enquiries.",
  };
}

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || "hi";

  const settings = await prisma.adminSettings
    .findFirst({
      select: {
        siteNameEn: true,
        siteNameHi: true,
        phone1: true,
        phone2: true,
        email: true,
        addressEn: true,
        addressHi: true,
        city: true,
        googleMapEmbedUrl: true,
        socialWhatsapp: true,
        socialTelegram: true,
        socialFacebook: true,
        socialInstagram: true,
        socialYoutube: true,
      },
    })
    .catch(() => null);

  return (
    <ContactClient
      settings={settings || {}}
      locale={locale}
    />
  );
}
