import { getLocale, getTranslations } from "next-intl/server";
import { SocialLinks } from "@/components/content/SocialLinks";
import { Link } from "@/i18n/routing";
import { getLinkList, getSection } from "@/lib/siteConfig/service";
import { RichText } from "@/components/content/RichText";
import { safeHref } from "@/lib/content/richText";
import { prisma } from "@/lib/prisma";
import { kendraEmail } from "@/lib/content/contact";
import { ownKundliHref } from "@/lib/content/ownKundli";
import { isCorePageSlug } from "@/lib/content/pages";
import { LocationMap } from "@/components/content/LocationMap";
import { ExternalLink, Phone, Mail, Clock, Globe } from "lucide-react";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tools = await getSection("tools");
  const featureCfg = await getSection("features");
  const extraLinks = await getLinkList("footerLinks");
  const general = await getSection("general");
  const logoCfg = await getSection("logo");
  const legalCfg = await getSection("legal");
  const business = await getSection("business");
  const pickG = (cfg: Record<string, string | boolean | number>, k: string) => String(cfg[k + (locale === "hi" ? "Hi" : "En")] || "").trim();

  // Fetch admin settings for live contact numbers, address, and social links
  const settings = await prisma.adminSettings
    .findUnique({
      where: { id: "default" },
    })
    .catch(() => null);

  // Custom pages the admin chose to list under Quick Links
  const footerPages = await prisma.staticPage
    .findMany({
      where: { isActive: true, showInFooter: true },
      orderBy: { updatedAt: "asc" },
      select: { slug: true, titleEn: true, titleHi: true },
    })
    .then((rows) => rows.filter((r) => !isCorePageSlug(r.slug)))
    .catch(() => []);

  const phone1 = settings?.phone1;
  const phone2 = settings?.phone2;
  const email = kendraEmail(settings?.email);
  const addressLine1 =
    (locale === "hi"
      ? settings?.addressHi || settings?.addressEn
      : settings?.addressEn || settings?.addressHi) || "";

  return (
    <footer className="w-full bg-[rgb(var(--footer-bg-rgb,128_0_0))] text-on-maroon border-t-4 border-gold pt-8 pb-6 text-left">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 xl:gap-8 pb-8 border-b border-gold/40 text-left">
          {/* Col 1: Identity & Sanctum Address with Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={String(logoCfg.logoUrl || "") || "/Logo.jpeg"} alt={t("title")} width={72} height={54} className="h-14 w-auto rounded-md bg-surface shrink-0" />
              <div className="flex flex-col">
                <span className="font-serif text-base font-bold text-white leading-tight">
                  {t("title")}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">
                  {pickG(general, "tagline") || tCommon("tagline")}
                </span>
              </div>
            </div>
            <div className="text-xs text-on-maroon leading-relaxed space-y-2 [&_a]:!text-white [&_a]:underline">
              <RichText text={pickG(general, "footerNote") || t("bio")} />
            </div>
            {(business.ownerName || business.msmeNumber || Number(business.foundedYear) > 0) && (
              <p className="text-[11px] text-on-maroon/80">
                {[business.ownerName ? `${locale === "hi" ? "संचालक" : "Proprietor"}: ${business.ownerName}` : "", business.msmeNumber ? `MSME: ${business.msmeNumber}` : "", Number(business.foundedYear) > 0 ? `${locale === "hi" ? "स्थापना" : "Since"} ${business.foundedYear}` : ""].filter(Boolean).join(" · ")}
              </p>
            )}
            {addressLine1 && (
            <div className="text-xs text-on-maroon space-y-1 pt-1">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
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

            {/* Social media pages managed from Admin → Website Settings */}
            <SocialLinks tone="light" className="pt-2" />
          </div>

          {/* Col 2: Quick Links (Tools & Services) */}
          <div>
            <div className="font-serif text-base lg:text-lg font-bold text-white mb-3 uppercase tracking-wider">
              {t("servicesTitle")}
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
              <li>
                <Link href="/services" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link href="/services#plans" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("pricingPlans")}
                </Link>
              </li>
              {(
<li>
                <Link href={ownKundliHref("/kundli") as never} className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("kundli")}
                </Link>
              </li>
)}
              {(
<li>
                <Link href={ownKundliHref("/kundli/matching") as never} className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("kundliMatching")}
                </Link>
              </li>
)}
              <li>
                <Link href={ownKundliHref("/kundli/prashna") as never} className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("prashna")}
                </Link>
              </li>
              {tools.panchangEnabled !== false && (
<li>
                <Link href="/panchang" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("panchang")}
                </Link>
              </li>
)}
              <li>
                <Link href="/other-services" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("otherServices")}
                </Link>
              </li>
              <li>
                <Link href="/kundli/astrosage" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("astrosageTool")}
                </Link>
              </li>
              <li>
                <Link href="/vault" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("vault")}
                </Link>
              </li>
              {footerPages.map((fp) => (
                <li key={fp.slug}>
                  <Link href={`/pages/${fp.slug}` as never} className="hover:text-white hover:underline transition-colors block py-0.5">
                    {locale === "hi" ? fp.titleHi : fp.titleEn}
                  </Link>
                </li>
              ))}
              {settings?.appDownloadUrl && (
                <li>
                  <Link href="/app" className="hover:text-white hover:underline transition-colors block py-0.5">
                    {locale === "hi" ? "एंड्रॉइड ऐप" : "Android App"}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 2b: Legal Pages, beside Quick Links, every legal page listed */}
          <div>
            <div className="font-serif text-base lg:text-lg font-bold text-white mb-3 uppercase tracking-wider">
              {locale === "hi" ? "लीगल पेजेस" : "Legal Pages"}
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
            {featureCfg.showCredentialsLink !== false && (
              <li>
                <Link href="/credentials" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("credentials")}
                </Link>
              </li>
            )}
            <li>
              <Link href="/legal/privacy" className="hover:text-white hover:underline transition-colors block py-0.5">
                {t("privacyLink")}
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-white hover:underline transition-colors block py-0.5">
                {t("termsLink")}
              </Link>
            </li>
            <li>
              <Link href="/legal/platform-guidelines" className="hover:text-white hover:underline transition-colors block py-0.5">
                {locale === "hi" ? "प्लेटफ़ॉर्म दिशानिर्देश" : "Platform Guidelines"}
              </Link>
            </li>
            <li>
              <Link href="/legal/member-agreement" className="hover:text-white hover:underline transition-colors block py-0.5">
                {locale === "hi" ? "सदस्य अनुबंध" : "Member Agreement"}
              </Link>
            </li>
            <li>
              <Link href="/legal/rules-regulations" className="hover:text-white hover:underline transition-colors block py-0.5">
                {locale === "hi" ? "नियम एवं विनियम" : "Rules & Regulations"}
              </Link>
            </li>
            <li>
              <Link href="/legal/ephemeris-sources" className="hover:text-white hover:underline transition-colors block py-0.5">
                {t("ephemerisLink")}
              </Link>
            </li>
          </ul>
          </div>

          {/* Col 3: Lineage & Kendra */}
          <div>
            <div className="font-serif text-base lg:text-lg font-bold text-white mb-3 uppercase tracking-wider">
              {tNav("about")} &amp; केंद्र
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/founder" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("founder")}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("gallery")}
                </Link>
              </li>
              {featureCfg.showBlogLink !== false && (
<li>
                <Link href="/blogs" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("blogs")}
                </Link>
              </li>
)}
              <li>
                <Link href="/testimonials" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("testimonials")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("help")}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white hover:underline transition-colors block py-0.5">
                  {tNav("tracker")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Sister Portals & Legal Pages */}
          <div className="space-y-4">
            <div>
              <div className="font-serif text-base lg:text-lg font-bold text-white mb-3 uppercase tracking-wider">
                सहयोगी सेवाएँ • Sister Portals
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a
                    href="https://bharatdarshanmpcg.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-white hover:underline font-medium"
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
                    className="inline-flex items-center gap-1 text-white hover:underline font-medium"
                  >
                    <span>Vindhya Vivah Sanskar</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Col 5: Helpline & Support Contact */}
          <div>
            <div className="font-serif text-base lg:text-lg font-bold text-white mb-3 uppercase tracking-wider">
              {t("contactTitle")}
            </div>
            <ul className="space-y-1.5 text-xs text-on-maroon">
              {phone1 && (
                <li>
                  <a href={`tel:${phone1.replace(/\s+/g, "")}`} className="hover:text-white hover:underline font-semibold text-on-maroon block">
                    {phone1}
                  </a>
                </li>
              )}
              {phone2 && (
                <li>
                  <a href={`tel:${phone2.replace(/\s+/g, "")}`} className="hover:text-white hover:underline text-on-maroon block">
                    {phone2}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-white hover:underline block">
                    {email}
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-4">
              <LocationMap
                settings={settings || {}}
                title={(locale === "hi" ? settings?.mapLabelHi : settings?.mapLabelEn) || (locale === "hi" ? "हमारा स्थान" : "Find us")}
                isHindi={locale === "hi"}
                compact
                onDark
              />
            </div>
          </div>
        </div>

        {extraLinks.length > 0 && (
          <nav aria-label={locale === "hi" ? "और लिंक" : "More links"} className="py-4 border-b border-gold/30 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">{locale === "hi" ? "और लिंक" : "More links"}</span>
            {extraLinks.map((l, i) => {
              const ok = safeHref(l.href);
              if (!ok) return null;
              const label = (locale === "hi" ? l.labelHi || l.labelEn : l.labelEn || l.labelHi) || l.href;
              return (
                <a key={i} href={ok.href} {...(ok.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-on-maroon hover:text-white hover:underline underline-offset-2 hover:underline">
                  {label}
                </a>
              );
            })}
          </nav>
        )}

        {/* Bottom Bar: Broadsheet Copyright & Lineage Seal */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-on-maroon">
          <div className="text-left">
            {pickG(general, "copyright") || t("copyright")}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">दृग्गणित सिद्धान्त</span>
            <span>({t("standardBadge")})</span>
          </div>
        </div>
        {pickG(legalCfg, "disclaimer") && (
          <p className="pt-3 text-[11px] leading-relaxed text-on-maroon/80">{pickG(legalCfg, "disclaimer")}</p>
        )}
      </div>
    </footer>
  );
}