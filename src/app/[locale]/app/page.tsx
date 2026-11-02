import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { getSection } from "@/lib/siteConfig/service";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { Smartphone, Download } from "lucide-react";


interface AppPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: AppPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/app"),
    title: isHindi ? "एंड्रॉइड ऐप डाउनलोड" : "Download the Android App",
    description: isHindi
      ? "महर्षि कणाद ज्योतिष केंद्र का एंड्रॉइड ऐप डाउनलोड करें।"
      : "Download the Maharshi Kanad Jyotish Kendra Android app.",
  };
}

export default async function AppDownloadPage(props: AppPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const isHindi = locale === "hi";

  const settings = await prisma.adminSettings
    .findUnique({ where: { id: "default" }, select: { appDownloadUrl: true } })
    .catch(() => null);
  const appCfg = await getSection("mobileApp");
  const str = (k: string) => String(appCfg[k] ?? "").trim();
  const pick = (en: string, hi: string, fallback: string) => (isHindi ? str(hi) || str(en) : str(en)) || fallback;

  // Two apps, each with a name, icon, link and QR code the admin sets (Admin > Website settings > Mobile app)
  const defs = [
    { key: "android", enabled: appCfg.androidEnabled !== false, name: pick("androidNameEn", "androidNameHi", isHindi ? "एंड्रॉइड ऐप (गूगल प्ले)" : "Android App (Google Play)"), icon: str("androidIcon"), url: str("playStoreUrl"), qrImage: str("androidQrImage"), button: "Google Play" },
    { key: "apk", enabled: appCfg.apkEnabled !== false, name: pick("apkNameEn", "apkNameHi", isHindi ? "APK फ़ाइल ऐप" : "APK file app"), icon: str("apkIcon"), url: settings?.appDownloadUrl?.trim() || str("apkUrl"), qrImage: str("apkQrImage"), button: isHindi ? "APK डाउनलोड करें" : "Download APK" },
  ];
  const apps = await Promise.all(
    defs
      .filter((d) => d.enabled && d.url)
      .map(async (d) => ({
        ...d,
        // An uploaded QR picture wins; otherwise the QR is made on the server from the link
        qr: d.qrImage || (await QRCode.toDataURL(d.url, { margin: 1, width: 280, color: { dark: "#641E2B", light: "#FFFFFF" } })),
      }))
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 text-left space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Smartphone className="w-4 h-4" />
          <span>{isHindi ? "मोबाइल ऐप" : "Mobile app"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {isHindi ? "एंड्रॉइड ऐप डाउनलोड करें" : "Download the Android app"}
        </h1>
      </div>

      {String(appCfg[isHindi ? "appTextHi" : "appTextEn"] || "").trim() && (
        <p className="text-base text-on-surface-variant">{String(appCfg[isHindi ? "appTextHi" : "appTextEn"])}</p>
      )}

      {apps.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {apps.map((d) => (
            <article key={d.key} className="flex flex-col items-center gap-4 rounded-lg border-2 border-maroon bg-surface p-6 text-center">
              <div className="flex items-center gap-3">
                {d.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.icon} alt="" width={48} height={48} className="h-12 w-12 rounded-xl object-contain" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-on-brand"><Smartphone className="h-6 w-6" aria-hidden="true" /></span>
                )}
                <h2 className="font-serif text-xl font-bold text-secondary">{d.name}</h2>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.qr} alt={isHindi ? `${d.name} के लिए QR कोड` : `QR code for ${d.name}`} width={200} height={200} className="h-48 w-48" />
              <p className="text-sm text-on-surface-variant">
                {isHindi ? "फ़ोन के कैमरे से QR कोड स्कैन करें, या नीचे के बटन से सीधे डाउनलोड करें।" : "Scan the QR code with your phone camera, or use the button below."}
              </p>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-2 rounded border-2 border-maroon bg-brand px-6 font-bold text-on-brand hover:bg-brand-hover">
                <Download className="h-5 w-5" aria-hidden="true" />
                {d.button}
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant/60 rounded-lg p-6">
          <p className="text-base">
            {isHindi
              ? "एंड्रॉइड ऐप शीघ्र उपलब्ध होगा। तब तक आप इसी वेबसाइट का पूरा उपयोग अपने फ़ोन के ब्राउज़र में कर सकते हैं।"
              : "The Android app will be available soon. Until then you can use this website fully in your phone browser."}
          </p>
        </div>
      )}

      {str("appStoreUrl") && (
        <a href={str("appStoreUrl")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-[48px] px-5 rounded-lg border-2 border-maroon text-secondary font-bold hover:bg-surface-container-high">
          <Download className="w-5 h-5" />
          App Store (iPhone)
        </a>
      )}
    </div>
  );
}
