import { RegisterForm } from "@/features/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Associate registration • Maharshi Kanad Jyotish Kendra",
  description: "Register as an associate of Maharshi Kanad Jyotish Kendra and earn commission on referrals.",
  robots: { index: false },
};

export default function RegisterPage() {
  return <RegisterForm accountType="ASSOCIATE" />;
}
