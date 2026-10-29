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

// Reads the visitor (session or address details), so this page is built fresh for every visit
export const dynamic = "force-dynamic";
