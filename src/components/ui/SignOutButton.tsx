"use client";

import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { LogOut } from "lucide-react";

export function SignOutButton({ label, className = "" }: { label: string; className?: string }) {
  const locale = useLocale();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
      className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-error text-on-error-container hover:bg-error-container text-sm font-bold ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {label}
    </button>
  );
}
