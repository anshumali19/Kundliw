import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { CREDENTIAL_LABEL, CredentialKind } from "@/lib/content/credentials";
import { CredentialsGrid } from "@/features/credentials/CredentialsGrid";
import { BadgeCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface CredentialsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: CredentialsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/credentials"),
    title: isHindi ? "प्रमाणपत्र एवं दस्तावेज़ • महर्षि कणाद ज्योतिष केंद्र" : "Credentials and documents • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "जीएसटी, एमएसएमई, ट्रेडमार्क और आईएसओ जैसे आधिकारिक दस्तावेज़ देखें, डाउनलोड करें और प्रिंट करें।"
      : "View, download and print official documents such as GST, MSME, trademark and ISO.",
  };
}

export default async function CredentialsPage(props: CredentialsPageProps) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";

  const rows = await prisma.credential
    .findMany({ where: { isActive: true }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] })
    .catch(() => []);

  const items = rows.map((r) => {
    const label = CREDENTIAL_LABEL[(r.kind as CredentialKind) in CREDENTIAL_LABEL ? (r.kind as CredentialKind) : "OTHER"];
    return {
      id: r.id,
      kindLabel: isHindi ? label.hi : label.en,
      title: isHindi ? r.titleHi : r.titleEn,
      description: isHindi ? r.descriptionHi || r.descriptionEn : r.descriptionEn || r.descriptionHi,
      documentNumber: r.documentNumber,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      mimeType: r.mimeType,
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 text-left space-y-8">
      <div className="space-y-2 border-b border-outline-variant/40 pb-5">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <BadgeCheck className="w-4 h-4" />
          <span>{isHindi ? "आधिकारिक दस्तावेज़" : "Official documents"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {isHindi ? "प्रमाणपत्र एवं दस्तावेज़" : "Credentials and documents"}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {isHindi
            ? "आप इन दस्तावेज़ों को देख, डाउनलोड और प्रिंट कर सकते हैं।"
            : "You can view, download and print these documents."}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-dashed border-outline-variant text-center text-sm text-on-surface-variant">
          {isHindi ? "दस्तावेज़ शीघ्र उपलब्ध होंगे।" : "Documents will be available soon."}
        </div>
      ) : (
        <CredentialsGrid items={items} isHindi={isHindi} />
      )}
    </div>
  );
}
