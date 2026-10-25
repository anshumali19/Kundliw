import { requireAdmin } from "@/lib/auth/guards";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBackupPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/backup", locale);
  const isHindi = locale === "hi";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left space-y-5">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
          {isHindi ? "बैकअप" : "Backup"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "अपनी सामग्री और रिकॉर्ड (सेवाएँ, प्लान, ऑफ़र, ऑर्डर, उपयोगकर्ता, एसोसिएट आदि) की एक प्रति डाउनलोड करें।"
            : "Download a copy of your content and records: services, plans, offers, orders, users, associates and more."}
        </p>
      </div>

      <div className="bg-surface border border-outline-variant/60 rounded-lg p-5 space-y-3">
        {/* File download from an API route, not a page navigation */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/backup"
          download
          className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded border border-maroon bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
        >
          <Download className="w-4 h-4" />
          {isHindi ? "बैकअप डाउनलोड करें (JSON)" : "Download backup (JSON)"}
        </a>
        <ul className="text-sm text-on-surface-variant list-disc pl-5 space-y-1">
          <li>
            {isHindi
              ? "फ़ाइल में API कुंजियाँ, पासवर्ड हैश और अपलोड की गई फ़ाइलों की सामग्री शामिल नहीं होती।"
              : "The file does not include API keys, password hashes or the contents of uploaded files."}
          </li>
          <li>
            {isHindi
              ? "इसे सुरक्षित जगह रखें, क्योंकि इसमें ग्राहकों की जानकारी होती है।"
              : "Keep it somewhere safe, because it contains customer details."}
          </li>
          <li>
            {isHindi
              ? "डेटाबेस सेवा (जैसे Prisma Postgres या Neon) अपने स्तर पर भी स्वचालित बैकअप रखती है; उसकी अवधि आपके प्लान पर निर्भर है।"
              : "Your database provider (such as Prisma Postgres or Neon) also keeps its own automatic backups; how long depends on your plan."}
          </li>
        </ul>
      </div>
    </div>
  );
}
