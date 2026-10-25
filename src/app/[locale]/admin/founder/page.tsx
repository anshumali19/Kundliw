import { AdminFounderManager } from "@/features/admin/founder/AdminFounderManager";

interface AdminFounderPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default function AdminFounderPage({ params: { locale } }: AdminFounderPageProps) {
  const isHindi = locale === "hi";
  return <AdminFounderManager isHindi={isHindi} />;
}
