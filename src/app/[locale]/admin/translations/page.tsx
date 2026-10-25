import { requireAdmin } from "@/lib/auth/guards";
import { AdminTranslationsManager } from "@/features/admin/translations/AdminTranslationsManager";

interface AdminTranslationsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminTranslationsPage(props: AdminTranslationsPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  await requireAdmin("/admin/translations", locale);

  return <AdminTranslationsManager initialLocale={locale} />;
}
