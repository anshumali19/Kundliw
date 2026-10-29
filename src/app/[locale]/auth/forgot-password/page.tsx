import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/PasswordResetForms";

export const metadata: Metadata = { title: "Forgot password • Maharshi Kanad Jyotish Kendra", robots: { index: false } };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

// Reads the visitor (session or address details), so this page is built fresh for every visit
export const dynamic = "force-dynamic";
