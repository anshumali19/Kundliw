import { RegisterForm } from "@/features/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer registration • Maharshi Kanad Jyotish Kendra",
  description: "Create a customer account to book Kundli and astrology consultations and track your orders.",
  robots: { index: false },
};

export default function RegisterPage() {
  return <RegisterForm accountType="USER" />;
}
