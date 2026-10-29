import { AuthChooser } from "@/features/auth/AuthChooser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account • Maharshi Kanad Jyotish Kendra",
  description: "Choose how to register with Maharshi Kanad Jyotish Kendra: as a customer or as an associate.",
  robots: { index: false },
};

export default async function RegisterChooserPage(
  props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ callbackUrl?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return (
    <AuthChooser
      mode="register"
      locale={params.locale}
      callbackUrl={searchParams?.callbackUrl}
    />
  );
}
