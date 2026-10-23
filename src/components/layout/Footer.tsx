import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <footer className="w-full bg-surface-container-low border-t border-secondary/20 pt-12 pb-16 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-outline-variant/50 text-left">
          {/* Col 1: Identity & Sanctum Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded border border-secondary flex items-center justify-center font-serif text-lg text-secondary bg-surface font-bold">
                ॐ
              </span>
              <span className="font-serif text-lg font-bold text-secondary">
                {t("title")}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              {t("bio")}
            </p>
            <div className="text-xs text-on-surface-variant space-y-1">
              <div className="font-semibold text-secondary uppercase tracking-wider">
                {t("campusLabel")}
              </div>
              <div>{t("addressLine1")}</div>
              <div>{t("addressLine2")}</div>
            </div>
          </div>

          {/* Col 2: Vedic Services */}
          <div>
            <div className="font-serif text-sm font-bold text-secondary mb-3 uppercase tracking-wider">
              {t("servicesTitle")}
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <Link href="/panchang" className="hover:text-primary transition-colors block py-0.5">
                  {t("srv1")}
                </Link>
              </li>
              <li>
                <Link href="/kundli/matching" className="hover:text-primary transition-colors block py-0.5">
                  {t("srv2")}
                </Link>
              </li>
              <li>
                <Link href="/kundli/prashna" className="hover:text-primary transition-colors block py-0.5">
                  {t("srv3")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors block py-0.5">
                  {t("srv4")}
                </Link>
              </li>
              <li>
                <Link href="/vault" className="hover:text-primary transition-colors block py-0.5">
                  {t("srv5")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Helpline & Hours */}
          <div>
            <div className="font-serif text-sm font-bold text-secondary mb-3 uppercase tracking-wider">
              {t("contactTitle")}
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <span className="font-semibold text-on-surface">{t("phone")}</span>
              </li>
              <li>
                <span>{t("email")}</span>
              </li>
              <li>
                <span>{t("hours")}</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/services"
                  className="font-semibold text-primary uppercase tracking-wider text-xs hover:underline block"
                >
                  {t("bookSlotLink")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Canonical Accreditation & Legal */}
          <div>
            <div className="font-serif text-sm font-bold text-secondary mb-3 uppercase tracking-wider">
              {t("legalTitle")}
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors block py-0.5">
                  {t("aboutLink")}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-primary transition-colors block py-0.5">
                  {t("privacyLink")}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-primary transition-colors block py-0.5">
                  {t("termsLink")}
                </Link>
              </li>
              <li>
                <Link href="/legal/ephemeris-sources" className="hover:text-primary transition-colors block py-0.5">
                  {t("ephemerisLink")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Broadsheet Copyright & Lineage Seal */}
        <div className="pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="text-left">
            {t("copyright")} {tCommon("allRightsReserved")}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary font-semibold">दृग्गणित सिद्धान्त</span>
            <span>({t("standardBadge")})</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
