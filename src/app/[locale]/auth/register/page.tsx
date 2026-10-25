import { AuthChooser } from "@/features/auth/AuthChooser";

export default function RegisterChooserPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { callbackUrl?: string };
}) {
  return (
    <AuthChooser
      mode="register"
      locale={params.locale}
      callbackUrl={searchParams?.callbackUrl}
    />
  );
}
