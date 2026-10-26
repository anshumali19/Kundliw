"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useHiddenTools } from "@/components/providers/ToolsProvider";
import { Link, usePathname } from "@/i18n/routing";
import { homeForRole } from "./AccountMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Home,
  Menu,
  Compass,
  CalendarCheck,
  Percent,
  UserCircle,
  X,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Phone,
  CalendarDays,
  Sparkles,
  Award,
  Search,
  Shield,
  HelpCircle,
  BadgeCheck,
  BookOpen,
  LogIn,
  UserPlus,
  LogOut,
  Languages,
} from "lucide-react";

/**
 * Bottom bar for phones: Home, Menu, Services, Booking, Offers, Login (or My Account).
 * "Menu" opens a sheet with every page, plus login, logout and the language switch.
 */
export function MobileNav() {
  const tNav = useTranslations("nav");
  const hideTools = useHiddenTools();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = status === "authenticated";

  // Close the sheet when the page changes
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const accountHref = signedIn ? homeForRole(session?.user?.role) : "/auth/signin";

  const tabs = [
    { key: "home", href: "/", label: tNav("home"), icon: Home },
    { key: "services", href: "/services", label: tNav("services"), icon: Compass },
    { key: "booking", href: "/services#plans", label: tNav("booking"), icon: CalendarCheck },
    { key: "offers", href: "/offers", label: tNav("offers"), icon: Percent },
    { key: "login", href: accountHref, label: signedIn ? tNav("account") : tNav("login"), icon: UserCircle },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sheetLinks = hideTools([
    { href: "/services", label: tNav("services"), icon: Compass },
    { href: "/gallery", label: tNav("gallery"), icon: ImageIcon },
    { href: "/blogs", label: tNav("blogs"), icon: FileText },
    { href: "/offers", label: tNav("offers"), icon: Percent },
    { href: "/testimonials", label: tNav("testimonials"), icon: MessageSquare },
    { href: "/help", label: tNav("contact"), icon: Phone },
    { href: "/panchang", label: tNav("panchang"), icon: CalendarDays },
    { href: "/kundli", label: tNav("kundli"), icon: Sparkles },
    { href: "/kundli/matching", label: tNav("kundliMatching"), icon: BookOpen },
    { href: "/kundli/prashna", label: tNav("prashna"), icon: Search },
    { href: "/other-services", label: tNav("otherServices"), icon: Award },
    { href: "/founder", label: tNav("founder"), icon: Award },
    { href: "/about", label: tNav("about"), icon: HelpCircle },
    { href: "/credentials", label: tNav("credentials"), icon: BadgeCheck },
    { href: "/track", label: tNav("tracker"), icon: Search },
    { href: "/vault", label: tNav("vault"), icon: Shield },
    { href: "/guides/user", label: tNav("userGuide"), icon: BookOpen },
  ]);

  const tile =
    "flex items-center gap-2.5 min-h-[48px] px-3 rounded-lg border border-outline-variant bg-surface hover:bg-brand/10 text-sm font-semibold text-on-surface";

  return (
    <>
      <nav
        className="xl:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-outline-variant shadow-sm"
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-6 items-center h-16 px-1">
          {tabs.slice(0, 1).map((tab) => (
            <TabLink key={tab.key} tab={tab} active={isActive(tab.href)} />
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center min-h-[44px] text-on-surface-variant hover:text-on-surface"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[11px] mt-1 leading-tight">{tNav("menu")}</span>
          </button>
          {tabs.slice(1).map((tab) => (
            <TabLink key={tab.key} tab={tab} active={isActive(tab.href)} />
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="xl:hidden fixed inset-0 z-[70] flex items-end" role="dialog" aria-modal="true" aria-label={tNav("menu")}>
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={tNav("close")}
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-full max-h-[88dvh] overflow-y-auto bg-surface rounded-t-2xl border-t-4 border-brand p-4 pb-8 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="text-left">
                <h2 className="font-bold text-lg text-secondary flex items-center gap-2">
                  <Menu className="w-5 h-5 text-primary" />
                  {tNav("menu")}
                </h2>
                <p className="text-xs text-on-surface-variant">{tNav("menuSub")}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={tNav("close")}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-container"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sheetLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href as never} className={tile}>
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
              {signedIn ? (
                <>
                  <Link href={accountHref} className={tile}>
                    <UserCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{tNav("account")}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: `/${locale}` })}
                    className={`${tile} !border-error text-on-error-container`}
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tNav("signOut")}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className={tile}>
                    <LogIn className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{tNav("login")}</span>
                  </Link>
                  <Link href="/auth/register" className={tile}>
                    <UserPlus className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{tNav("register")}</span>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant/60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                <Languages className="w-4 h-4 text-primary" />
                {tNav("language")}
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TabLink({
  tab,
  active,
}: {
  tab: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href as never}
      className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
        active ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[11px] mt-1 max-w-full px-0.5 text-center leading-tight break-words">
        {tab.label.split(" (")[0]}
      </span>
    </Link>
  );
}
