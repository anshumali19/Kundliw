import { requireAdmin } from "@/lib/auth/guards";
import { SiteSettingsManager } from "@/features/admin/site/SiteSettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/website", locale);
  return <SiteSettingsManager isHindi={locale === "hi"} />;
}
