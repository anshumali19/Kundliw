import { AuthChooser } from "@/features/auth/AuthChooser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in • Maharshi Kanad Jyotish Kendra",
  description: "Choose how to sign in to Maharshi Kanad Jyotish Kendra: customer, associate or admin.",
  robots: { index: false },
};

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
