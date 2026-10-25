import { redirect } from "next/navigation";

export default async function TrackerRedirect(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  redirect(`/${locale}/track`);
}
