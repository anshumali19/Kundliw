import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import {
  FileText,
  Download,
  FolderLock,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface VaultPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default async function VaultPage({
  params: { locale },
}: VaultPageProps) {
  const user = await requireUser("/vault", locale);
  const isHindi = locale === "hi";

  const vaultFiles = await prisma.vaultFile.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
    include: {
      order: {
        select: { orderNumber: true, service: { select: { titleEn: true, titleHi: true } } },
      },
    },
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      {/* Header Banner */}
      <div className="bg-surface-container rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
            <FolderLock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              {isHindi ? "व्यक्तिगत डिजिटल अभिलेखागार" : "Protected Personal Digital Vault"}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-0.5">
              {isHindi ? "ग्राहक कुण्डली अभिलेखागार" : "Customer Kundli Vault"}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              {isHindi
                ? "आपके प्रमाणित वैदिक कुण्डली पत्र, वर्षफल एवं षोडशवर्ग चक्रों का सुरक्षित संग्रह।"
                : "Your authenticated digital repository for Vedic chart dossiers and handwritten horoscope records."}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href="/account"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{isHindi ? "खाता डैशबोर्ड पर लौटें" : "Return to Account"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Security Note (Truthful: does not claim encryption) */}
      <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-start gap-3 text-xs text-on-surface-variant">
        <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div>
          <strong className="text-on-surface block mb-0.5">
            {isHindi ? "अभिगम सुरक्षा नियम" : "Access Security Notice"}
          </strong>
          {isHindi
            ? "यह डिजिटल अभिलेखागार आपके व्यक्तिगत खाते से प्रमाणीकृत है। यहाँ संचित कुण्डली पत्र केवल आपके एवं केंद्र के मुख्य दैवज्ञों के लिए उपलब्ध हैं।"
            : "This digital vault is authenticated to your personal customer account. Stored documents are strictly accessible by you and authorized Kendra scholars."}
        </div>
      </div>

      {/* Vault Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-secondary">
            {isHindi ? "उपलब्ध कुण्डली दस्तावेज़" : "Available Kundli Documents"}
          </h2>
          <span className="text-xs text-on-surface-variant font-mono">
            {vaultFiles.length} {isHindi ? "फाइलें" : "files"}
          </span>
        </div>

        {vaultFiles.length === 0 ? (
          <div className="p-12 text-center bg-surface-container rounded-lg border border-outline-variant/40 space-y-4">
            <FileText className="w-12 h-12 text-outline mx-auto" />
            <h3 className="font-serif text-lg font-bold text-secondary">
              {isHindi ? "वर्तमान में कोई कुण्डली पत्र उपलब्ध नहीं है" : "No Kundli documents available yet"}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
              {isHindi
                ? "आपके परामर्श आदेश की गणितीय गणना पूर्ण होने के उपरांत दैवज्ञ द्वारा तैयार पत्रिका यहाँ डाउनलोड हेतु उपलब्ध करा दी जाएगी।"
                : "Once your horoscope calculations and chart audit are finalized by our scholars, your personalized PDF report will appear here for download."}
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2.5 bg-primary-container text-on-primary rounded text-xs uppercase font-bold tracking-wider"
              >
                <span>{isHindi ? "परामर्श सेवाएँ देखें" : "View Services"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vaultFiles.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface rounded-lg p-5 border-2 border-outline-variant/50 hover:border-secondary/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded bg-surface-container flex items-center justify-center text-secondary shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-on-surface">
                      {isHindi ? doc.titleHi : doc.titleEn}
                    </h3>
                    <div className="text-xs text-on-surface-variant mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {doc.order && (
                        <span className="font-mono text-primary font-bold">
                          Ref: {doc.order.orderNumber}
                        </span>
                      )}
                      <span>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(doc.uploadedAt).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href={`/api/vault/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-2 text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isHindi ? "कुण्डली PDF डाउनलोड" : "Download PDF Report"}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
