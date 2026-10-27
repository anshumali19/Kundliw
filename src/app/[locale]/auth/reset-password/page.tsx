import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/PasswordResetForms";

export const metadata: Metadata = {
  title: "Reset password • Maharshi Kanad Jyotish Kendra",
  robots: { index: false },
  // The link carries a secret token: never pass it on to other sites
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage(props: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await props.searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : ""} />;
}
