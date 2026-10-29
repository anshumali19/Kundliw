import { SignInForm } from "@/features/auth/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer sign in • Maharshi Kanad Jyotish Kendra",
  description: "Sign in with your mobile number or email to book consultations and track your orders.",
  robots: { index: false },
};

export default function SignInPage() {
  return <SignInForm portal="user" />;
}

// Reads the visitor (session or address details), so this page is built fresh for every visit
export const dynamic = "force-dynamic";
