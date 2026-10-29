import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Compass, Home, Phone } from "lucide-react";

/** Shown for any address that does not exist, inside the normal site header and footer. */
export default async function NotFound() {
  const isHindi = (await getLocale()) === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const btn = "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-lg text-sm font-bold";
  return (
    <div className="w-full max-w-3xl mx-auto px-5 py-16 sm:py-24 text-center">
      <div className="font-serif text-7xl sm:text-8xl font-bold text-primary" aria-hidden="true">404</div>
      <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("This page could not be found", "यह पेज नहीं मिला")}</h1>
      <p className="mt-3 text-on-surface-variant leading-relaxed">
        {t(
          "The address may have been typed wrongly or the page may have moved. You can go back to the home page or look at our services.",
          "हो सकता है पता गलत लिखा गया हो या पेज हट गया हो। आप मुख्य पृष्ठ पर लौट सकते हैं या हमारी सेवाएँ देख सकते हैं।"
        )}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={`${btn} bg-brand text-on-brand hover:bg-brand-hover`}>
          <Home className="w-4 h-4" aria-hidden="true" />
          {t("Home page", "मुख्य पृष्ठ")}
        </Link>
        <Link href="/services" className={`${btn} border-2 border-maroon text-maroon hover:bg-surface-container-high`}>
          <Compass className="w-4 h-4" aria-hidden="true" />
          {t("Our services", "हमारी सेवाएँ")}
        </Link>
        <Link href="/contact" className={`${btn} border-2 border-maroon text-maroon hover:bg-surface-container-high`}>
          <Phone className="w-4 h-4" aria-hidden="true" />
          {t("Contact us", "संपर्क करें")}
        </Link>
      </div>
    </div>
  );
}
