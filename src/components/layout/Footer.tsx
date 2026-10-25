import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Phone, Mail, Clock, Globe } from "lucide-react";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  // Fetch admin settings for live contact numbers, address, and social links
  const settings = await prisma.adminSettings
    .findUnique({
      where: { id: "default" },
    })
    .catch(() => null);

  const phone1 = settings?.phone1;
  const phone2 = settings?.phone2;
  const email = settings?.email;
  const addressLine1 =
    (locale === "hi"
      ? settings?.addressHi || settings?.addressEn
      : settings?.addressEn || settings?.addressHi) || "";

  return (
    <footer className="w-full bg-maroon text-on-maroon border-t-4 border-brand pt-8 pb-6 text-left">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-8 pb-8 border-b border-brand/40 text-left">
          {/* Col 1: Identity & Sanctum Address with Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded border border-brand flex items-center justify-center font-serif text-xl bg-on-maroon text-maroon font-bold shrink-0">
                ॐ
              </span>
              <div className="flex flex-col">
                <span className="font-serif text-base font-bold text-brand leading-tight">
                  {t("title")}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-hover font-bold">
                  {tCommon("tagline")}
                </span>
              </div>
            </div>
            <p className="text-xs text-on-maroon leading-relaxed">
              {t("bio")}
            </p>
            {addressLine1 && (
            <div className="text-xs text-on-maroon space-y-1 pt-1">
              <div className="font-semibold text-brand uppercase tracking-wider text-[11px]">
                {t("campusLabel")}
              </div>
              <div>{addressLine1}</div>
              {settings?.city && (
                <div className="italic text-on-maroon/80">
                  {settings.city} ({settings.latitude?.toFixed(4)}°N, {settings.longitude?.toFixed(4)}°E)
                </div>
              )}
            </div>
            )}

            {/* Social Media Links from AdminSettings */}
            <div className="flex items-center gap-3 pt-2">
              {settings?.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:text-brand-hover transition-colors underline"
                  title="Facebook"
                >
                  Facebook
                </a>
              )}
              {settings?.socialTwitter && (
                <a
                  href={settings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:text-brand-hover transition-colors underline"
                  title="Twitter / X"
                >
                  Twitter
                </a>
              )}
              {settings?.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:text-brand-hover transition-colors underline"
                  title="Instagram"
                >
                  Instagram
                </a>
              )}
              {settings?.socialYoutube && (
                <a
                  href={settings.socialYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:text-brand-hover transition-colors underline"
                  title="YouTube"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links (Tools & Services) */}
          <div>
            <div className="font-serif text-xs font-bold text-brand mb-3 uppercase tracking-wider">
              {t("servicesTitle")}
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
              <li>
                <Link href="/services" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link href="/services#plans" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("pricingPlans")}
                </Link>
              </li>
              <li>
                <Link href="/kundli" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("kundli")}
                </Link>
              </li>
              <li>
                <Link href="/kundli/matching" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("kundliMatching")}
                </Link>
              </li>
              <li>
                <Link href="/kundli/prashna" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("prashna")}
                </Link>
              </li>
              <li>
                <Link href="/panchang" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("panchang")}
                </Link>
              </li>
              <li>
                <Link href="/other-services" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("otherServices")}
                </Link>
              </li>
              <li>
                <Link href="/kundli/astrosage" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("astrosageTool")}
                </Link>
              </li>
              <li>
                <Link href="/vault" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("vault")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Lineage & Kendra */}
          <div>
            <div className="font-serif text-xs font-bold text-brand mb-3 uppercase tracking-wider">
              {tNav("about")} &amp; केंद्र
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
              <li>
                <Link href="/about" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/founder" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("founder")}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("gallery")}
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("blogs")}
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("testimonials")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("help")}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-brand-hover transition-colors block py-0.5">
                  {tNav("tracker")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Sister Portals & Legal Pages */}
          <div className="space-y-4">
            <div>
              <div className="font-serif text-xs font-bold text-brand mb-3 uppercase tracking-wider">
                सहयोगी सेवाएँ • Sister Portals
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a
                    href="https://bharatdarshanmpcg.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-hover hover:underline font-medium"
                  >
                    <span>Bharat Darshan MPCG</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://vindhyavivahsanskar.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-hover hover:underline font-medium"
                  >
                    <span>Vindhya Vivah Sanskar</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-brand/40">
              <div className="font-serif text-xs font-bold text-brand mb-2 uppercase tracking-wider">
                {t("legalTitle")}
              </div>
              <ul className="space-y-1 text-xs text-on-maroon">
                <li>
                  <Link href="/legal/privacy" className="hover:text-brand-hover transition-colors block py-0.5">
                    {t("privacyLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-brand-hover transition-colors block py-0.5">
                    {t("termsLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/ephemeris-sources" className="hover:text-brand-hover transition-colors block py-0.5">
                    {t("ephemerisLink")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 5: Helpline & Support Contact */}
          <div>
            <div className="font-serif text-xs font-bold text-brand mb-3 uppercase tracking-wider">
              {t("contactTitle")}
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
              {phone1 && (
                <li>
                  <a href={`tel:${phone1.replace(/\s+/g, "")}`} className="hover:text-brand-hover font-semibold text-on-maroon block">
                    {phone1}
                  </a>
                </li>
              )}
              {phone2 && (
                <li>
                  <a href={`tel:${phone2.replace(/\s+/g, "")}`} className="hover:text-brand-hover text-on-maroon block">
                    {phone2}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-brand-hover block">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Broadsheet Copyright & Lineage Seal */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-on-maroon">
          <div className="text-left">
            {t("copyright")}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand font-semibold">दृग्गणित सिद्धान्त</span>
            <span>({t("standardBadge")})</span>
          </div>
        </div>
      </div>
    </footer>
  );
}