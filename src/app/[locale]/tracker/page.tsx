import { redirect } from "next/navigation";

export default function TrackerRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/track`);
}
