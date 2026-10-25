import { AdminFaqManager } from "@/features/admin/faq/AdminFaqManager";

interface AdminFaqPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default function AdminFaqPage({ params: { locale } }: AdminFaqPageProps) {
  const isHindi = locale === "hi";
  return <AdminFaqManager isHindi={isHindi} />;
}
