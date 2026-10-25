import { redirect } from "next/navigation";

interface AdminDashboardPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminDashboardPage(props: AdminDashboardPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  redirect(`/${locale}/admin/services`);
}
