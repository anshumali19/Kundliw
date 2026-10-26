import { requireAdmin } from "@/lib/auth/guards";
import { AdminSlotsManager } from "@/features/admin/slots/AdminSlotsManager";

export const dynamic = "force-dynamic";

export default async function AdminSlotsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/slots", locale);
  return <AdminSlotsManager isHindi={locale === "hi"} />;
}
