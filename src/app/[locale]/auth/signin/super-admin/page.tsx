import { SignInForm } from "@/features/auth/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin sign in • Maharshi Kanad Jyotish Kendra",
  description: "Sign in to the Maharshi Kanad Jyotish Kendra admin panel.",
  robots: { index: false },
};

export default function SignInPage() {
  return <SignInForm portal="super-admin" />;
}

// Reads the visitor (session or address details), so this page is built fresh for every visit
export const dynamic = "force-dynamic";
