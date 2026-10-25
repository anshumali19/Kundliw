import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth/guards";
import { SITE_URL } from "@/lib/seo";
import { AssociateDashboard } from "@/features/associate/AssociateDashboard";

export const dynamic = "force-dynamic";

export default async function AssociatePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const user = await requireUser("/associate", locale);
  if (user.role !== Role.ASSOCIATE) {
    redirect(`/${locale}/account`);
  }
  return <AssociateDashboard locale={locale} siteUrl={SITE_URL} />;
}
