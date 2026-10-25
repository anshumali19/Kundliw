import { Metadata } from "next";
import { AdminEnquiriesManager } from "@/features/admin/enquiries/AdminEnquiriesManager";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const isHi = params?.locale === "hi";
  return {
    title: isHi
      ? "संपर्क एवं परामर्श पूछताछ | एडमिन"
      : "Contact & Consultation Enquiries | Admin Console",
  };
}

export default async function AdminEnquiriesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  const locale = params?.locale || "hi";
  return <AdminEnquiriesManager locale={locale} />;
}
