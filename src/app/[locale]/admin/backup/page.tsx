import { requireAdmin } from "@/lib/auth/guards";
import { BackupManager } from "@/features/admin/backup/BackupManager";

export const dynamic = "force-dynamic";

export default async function AdminBackupPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/backup", locale);
  return <BackupManager isHindi={locale === "hi"} />;
}
