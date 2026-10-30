import { requireAdmin } from "@/lib/auth/guards";
import { loadAdminCatalogue } from "@/lib/admin/catalogueData";
import { AdminServicesManager } from "@/features/admin/services/AdminServicesManager";
import { CatalogueSteps } from "@/components/admin/CatalogueSteps";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  // Enforce DB-verified admin check
  await requireAdmin("/admin/plans", locale);
  const { servicesData, offerRefs } = await loadAdminCatalogue();
  return (
    <>
      <CatalogueSteps current="plans" isHindi={locale === "hi"} />
      <AdminServicesManager view="plans" initialServices={servicesData} offers={offerRefs} locale={locale} />
    </>
  );
}
