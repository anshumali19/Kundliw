import { SignInForm } from "@/features/auth/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Associate sign in • Maharshi Kanad Jyotish Kendra",
  description: "Sign in to your associate dashboard at Maharshi Kanad Jyotish Kendra.",
  robots: { index: false },
};

export default function SignInPage() {
  return <SignInForm portal="associate" />;
}
