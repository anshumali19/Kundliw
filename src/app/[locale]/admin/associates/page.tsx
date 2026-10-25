import { requireAdmin } from "@/lib/auth/guards";
import { AdminAssociatesManager } from "@/features/admin/associates/AdminAssociatesManager";

export const dynamic = "force-dynamic";

export default async function AdminAssociatesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/associates", locale);
  return <AdminAssociatesManager locale={locale} />;
}
