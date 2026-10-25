import { AuthChooser } from "@/features/auth/AuthChooser";

export default async function SignInChooserPage(
  props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ callbackUrl?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return (
    <AuthChooser
      mode="signin"
      locale={params.locale}
      callbackUrl={searchParams?.callbackUrl}
    />
  );
}
