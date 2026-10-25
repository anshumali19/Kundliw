import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContactClient } from "@/features/contact/ContactClient";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const isHi = params?.locale === "hi";
  return {
    alternates: pageAlternates(params?.locale, "/contact"),
    title: isHi
      ? "संपर्क करें एवं स्थान | महर्षि कणाद ज्योतिष केंद्र"
      : "Contact Us & Location | Maharshi Kanad Jyotish Kendra",
    description: isHi
      ? "महर्षि कणाद ज्योतिष केंद्र से संपर्क करें और अपनी पूछताछ भेजें।"
      : "Contact Maharshi Kanad Jyotish Kendra and send your astrology enquiry.",
  };
}

export default async function ContactPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
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
