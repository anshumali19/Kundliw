import { redirect } from "next/navigation";

interface AdminDashboardPageProps {
  params: {
    locale: string;
  };
}

export default function AdminDashboardPage({
  params: { locale },
}: AdminDashboardPageProps) {
  redirect(`/${locale}/admin/services`);
}
