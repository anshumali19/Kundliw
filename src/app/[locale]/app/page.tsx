import type { Metadata } from "next";
import QRCode from "qrcode";
import { getSection } from "@/lib/siteConfig/service";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { Smartphone, Download } from "lucide-react";

export const dynamic = "force-dynamic";

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
  const isHindi = locale === "hi";

  const settings = await prisma.adminSettings
    .findUnique({ where: { id: "default" }, select: { appDownloadUrl: true } })
    .catch(() => null);
  const appCfg = await getSection("mobileApp");
  const url = settings?.appDownloadUrl?.trim() || String(appCfg.apkUrl || appCfg.playStoreUrl || "").trim();

  // The QR is generated on the server from the link the admin saved.
  const qr = url
    ? await QRCode.toDataURL(url, { margin: 1, width: 280, color: { dark: "#661919", light: "#FFFFFF" } })
    : null;

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

      {url && qr ? (
        <div className="bg-surface border-2 border-maroon rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt={isHindi ? "ऐप डाउनलोड के लिए QR कोड" : "QR code to download the app"}
            width={200}
            height={200}
            className="w-48 h-48 shrink-0"
          />
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-base">
              {isHindi
                ? "अपने फ़ोन के कैमरे से QR कोड स्कैन करें, या नीचे दिए बटन से सीधे डाउनलोड करें।"
                : "Scan the QR code with your phone camera, or use the button below to download directly."}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded border-2 border-maroon bg-brand hover:bg-brand-hover text-on-brand font-bold"
            >
              <Download className="w-5 h-5" />
              {isHindi ? "ऐप डाउनलोड करें" : "Download app"}
            </a>
          </div>
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
    </div>
  );
}
