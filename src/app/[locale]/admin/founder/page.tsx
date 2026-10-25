import { AdminFounderManager } from "@/features/admin/founder/AdminFounderManager";

interface AdminFounderPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminFounderPage(props: AdminFounderPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return <AdminFounderManager isHindi={isHindi} />;
}
