import { Metadata } from "next";
import { AdminKeysManager } from "@/features/admin/settings/AdminKeysManager";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isHi = params?.locale === "hi";
  return {
    title: isHi
      ? "सुरक्षित एपीआई एवं क्रेडेंशियल विन्यास | एडमिन"
      : "API Keys & Secure Credentials | Admin Vault",
  };
}

export default function AdminSettingsKeysPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || "hi";
  return <AdminKeysManager locale={locale} />;
}
