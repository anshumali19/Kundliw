import { AdminFaqManager } from "@/features/admin/faq/AdminFaqManager";

interface AdminFaqPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminFaqPage(props: AdminFaqPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return <AdminFaqManager isHindi={isHindi} />;
}
