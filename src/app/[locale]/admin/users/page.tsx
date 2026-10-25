import { requireAdmin } from "@/lib/auth/guards";
import { AdminUsersManager } from "@/features/admin/users/AdminUsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/users", locale);
  return <AdminUsersManager locale={locale} />;
}
