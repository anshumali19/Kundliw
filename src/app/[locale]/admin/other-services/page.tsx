import { Metadata } from "next";
import { AdminOtherServicesManager } from "@/features/admin/other-services/AdminOtherServicesManager";

export const metadata: Metadata = {
  title: "Other Services CMS • Maharshi Kanad Jyotish Kendra Admin",
  description: "Manage Bharat Darshan Teerth Yatra, Matrimonial Portal, and Video Discourse Cards.",
};

export default function AdminOtherServicesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <AdminOtherServicesManager locale={locale} />;
}
