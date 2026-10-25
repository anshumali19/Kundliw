import { AuthChooser } from "@/features/auth/AuthChooser";

export default function SignInChooserPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { callbackUrl?: string };
}) {
  return (
    <AuthChooser
      mode="signin"
      locale={params.locale}
      callbackUrl={searchParams?.callbackUrl}
    />
  );
}
