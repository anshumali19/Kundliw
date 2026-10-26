"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LayoutDashboard, LogIn, LogOut, User } from "lucide-react";

/** Where each kind of account lands after sign-in. */
export function homeForRole(role?: string): "/admin" | "/associate" | "/account" {
  if (role === "ADMIN") return "/admin";
  if (role === "ASSOCIATE") return "/associate";
  return "/account";
}

/** Profile button: sign-in link when signed out, a menu with Logout when signed in. */
export function AccountMenu() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const btn =
    "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand flex items-center justify-center text-on-brand hover:opacity-90 transition-opacity min-h-[36px] min-w-[36px] shrink-0 shadow-sm";

  if (status !== "authenticated") {
    return (
      <Link href="/auth/signin" aria-label={tNav("signIn")} className={btn}>
        <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
      </Link>
    );
  }

  const role = session?.user?.role;
  const name = session?.user?.name || session?.user?.email || session?.user?.phone || "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tHeader("profileAria")}
        className={btn}
      >
        <User className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-surface border border-outline-variant rounded-lg shadow-xl z-50 py-2 text-left"
        >
          {name && (
            <div className="px-4 pb-2 mb-1 border-b border-outline-variant/60 text-xs text-on-surface-variant truncate">
              {name}
            </div>
          )}
          <Link
            href={homeForRole(role)}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 min-h-[44px] text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            {role === "ADMIN" ? tNav("admin") : tNav("account")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="w-full flex items-center gap-2.5 px-4 min-h-[44px] text-sm font-semibold text-on-error-container hover:bg-error-container"
          >
            <LogOut className="w-4 h-4" />
            {tNav("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
