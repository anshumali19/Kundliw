import { Metadata } from "next";
import { AdminKeysManager } from "@/features/admin/settings/AdminKeysManager";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const isHi = params?.locale === "hi";
  return {
    title: isHi
      ? "सुरक्षित एपीआई एवं क्रेडेंशियल विन्यास | एडमिन"
      : "API Keys & Secure Credentials | Admin Vault",
  };
}

export default async function AdminSettingsKeysPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  const locale = params?.locale || "hi";
  return <AdminKeysManager locale={locale} />;
}
