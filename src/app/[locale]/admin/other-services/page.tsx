import { Metadata } from "next";
import { AdminOtherServicesManager } from "@/features/admin/other-services/AdminOtherServicesManager";

export const metadata: Metadata = {
  title: "Other Services CMS • Maharshi Kanad Jyotish Kendra Admin",
  description: "Manage Bharat Darshan Teerth Yatra, Matrimonial Portal, and Video Discourse Cards.",
};

export default async function AdminOtherServicesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  return <AdminOtherServicesManager locale={locale} />;
}
