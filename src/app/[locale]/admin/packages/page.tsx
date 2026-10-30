import { requireAdmin } from "@/lib/auth/guards";
import { loadAdminCatalogue } from "@/lib/admin/catalogueData";
import { AdminServicesManager } from "@/features/admin/services/AdminServicesManager";
import { CatalogueSteps } from "@/components/admin/CatalogueSteps";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  // Enforce DB-verified admin check
  await requireAdmin("/admin/packages", locale);
  const { servicesData, offerRefs } = await loadAdminCatalogue();
  return (
    <>
      <CatalogueSteps current="packages" isHindi={locale === "hi"} />
      <AdminServicesManager view="packages" initialServices={servicesData} offers={offerRefs} locale={locale} />
    </>
  );
}
