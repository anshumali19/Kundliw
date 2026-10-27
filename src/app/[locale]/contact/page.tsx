import { pageAlternates } from "@/lib/seo";
import { getActiveSocialLinks, getSection } from "@/lib/siteConfig/service";
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
        mapEnabled: true,
        mapZoom: true,
        mapLatitude: true,
        mapLongitude: true,
        mapLabelEn: true,
        mapLabelHi: true,
        socialWhatsapp: true,
        socialTelegram: true,
        socialFacebook: true,
        socialInstagram: true,
        socialYoutube: true,
      },
    })
    .catch(() => null);

  const contactCfg = await getSection("contact");
  const social = (await getActiveSocialLinks()).map(({ id, name, url }) => ({ id, name, url }));
  const pickText = (k: string) => String(contactCfg[k + (locale === "hi" ? "Hi" : "En")] || "").trim() || undefined;

  const mp = await getSection("mapPage");
  const on = (k: string) => mp[k] !== false;
  const lbl = (k: string) => String(mp[k + (locale === "hi" ? "Hi" : "En")] || "").trim() || undefined;
  const link = (k: string, def: string) => {
    const v = String(mp[k] ?? def).trim();
    return /^(\/|#|https?:\/\/|tel:|mailto:)/i.test(v) ? v : "";
  };

  return (
    <ContactClient
      settings={settings || {}}
      locale={locale}
      extra={{
        workingHours: pickText("workingHours"),
        note: pickText("contactNote"),
        social,
        icons: {
          show: on("showIcons"),
          map: on("showMap"),
          navigation: on("showNavigation"),
          enquiry: on("showEnquiry"),
          support: on("showSupport"),
          tickets: on("showTickets"),
          address: on("showAddress"),
          phone: on("showPhone"),
          email: on("showEmail"),
          labels: { navigation: lbl("navigationLabel"), enquiry: lbl("enquiryLabel"), support: lbl("supportLabel"), tickets: lbl("ticketsLabel") },
          supportLink: link("supportLink", "/help"),
          ticketsLink: link("ticketsLink", "/account"),
        },
      }}
    />
  );
}
