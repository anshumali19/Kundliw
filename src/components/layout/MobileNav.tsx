"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Home, Compass, BookOpen, Shield } from "lucide-react";

export function MobileNav() {
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: tNav("home"), icon: Home },
    { href: "/services", label: tNav("services"), icon: Compass },
    { href: "/kundli/matching", label: tNav("kundliMatching"), icon: BookOpen },
    { href: "/vault", label: tNav("vault"), icon: Shield },
  ];

  return (
    <nav
      className="xl:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-secondary/20 shadow-sm"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="w-full h-[2px] bg-primary-container"></div>
      <div className="grid grid-cols-4 items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-1 max-w-full px-0.5 text-center leading-tight break-words">
                {tab.label.split(" (")[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
