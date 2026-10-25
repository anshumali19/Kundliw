import { requireAdmin } from "@/lib/auth/guards";
import { AdminTranslationsManager } from "@/features/admin/translations/AdminTranslationsManager";

interface AdminTranslationsPageProps {
  params: {
    locale: string;
  };
}

export default async function AdminTranslationsPage({
  params: { locale },
}: AdminTranslationsPageProps) {
  await requireAdmin("/admin/translations", locale);

  return <AdminTranslationsManager initialLocale={locale} />;
}
