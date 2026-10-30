import { requireAdmin } from "@/lib/auth/guards";
import { loadAdminCatalogue } from "@/lib/admin/catalogueData";
import { AdminServicesManager } from "@/features/admin/services/AdminServicesManager";
import { CatalogueSteps } from "@/components/admin/CatalogueSteps";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  // Enforce DB-verified admin check
  await requireAdmin("/admin/services", locale);
  const { servicesData, offerRefs } = await loadAdminCatalogue();
  return (
    <>
      <CatalogueSteps current="services" isHindi={locale === "hi"} />
      <AdminServicesManager view="services" initialServices={servicesData} offers={offerRefs} locale={locale} />
    </>
  );
}
