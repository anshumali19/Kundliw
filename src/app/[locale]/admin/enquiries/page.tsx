import { Metadata } from "next";
import { AdminEnquiriesManager } from "@/features/admin/enquiries/AdminEnquiriesManager";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isHi = params?.locale === "hi";
  return {
    title: isHi
      ? "संपर्क एवं परामर्श पूछताछ | एडमिन"
      : "Contact & Consultation Enquiries | Admin Console",
  };
}

export default function AdminEnquiriesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || "hi";
  return <AdminEnquiriesManager locale={locale} />;
}
