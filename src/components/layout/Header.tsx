"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Phone,
  Calendar,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  HelpCircle,
  Compass,
  Search,
  UserPlus,
  LogIn,
} from "lucide-react";

export function Header() {
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentHash, setCurrentHash] = useState("");

  // Sync hash for hash-based navigation (e.g. /services#plans)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary desktop bar links with responsive full and compact labels
  const primaryLinks = [
    {
      href: "/services",
      fullLabel: tNav("services"),
      shortLabel: tNav("servicesShort"),
    },
    {
      href: "/services#plans",
      fullLabel: tNav("pricingPlans"),
      shortLabel: tNav("pricingPlansShort"),
    },
    {
      href: "/kundli",
      fullLabel: tNav("kundli"),
      shortLabel: tNav("kundliShort"),
    },
    {
      href: "/kundli/matching",
      fullLabel: tNav("kundliMatching"),
      shortLabel: tNav("kundliMatchingShort"),
    },
    {
      href: "/kundli/prashna",
      fullLabel: tNav("prashna"),
      shortLabel: tNav("prashnaShort"),
    },
  ];

  // Secondary/lineage items accessible in dropdown & mobile
  const kendraLinks = [
    { href: "/about", label: tNav("about"), icon: Compass },
    { href: "/founder", label: tNav("founder"), icon: Sparkles },
    { href: "/gallery", label: tNav("gallery"), icon: ImageIcon },
    { href: "/blogs", label: tNav("blogs"), icon: FileText },
    { href: "/testimonials", label: tNav("testimonials"), icon: MessageSquare },
    { href: "/help", label: tNav("help"), icon: HelpCircle },
    { href: "/panchang", label: tNav("panchang"), icon: BookOpen },
    { href: "/track", label: tNav("tracker"), icon: Search },
  ];

  // Precise route matching so siblings don't share active state
  const checkIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    if (href.includes("#")) {
      const [base, hash] = href.split("#");
      return pathname === base && currentHash === `#${hash}`;
    }
    if (href === "/services") {
      return (pathname === "/services" || pathname.startsWith("/services/")) && currentHash !== "#plans";
    }
    if (href === "/kundli") {
      return pathname === "/kundli";
    }
    if (href === "/kundli/matching") {
      return pathname === "/kundli/matching";
    }
    if (href === "/kundli/prashna") {
      return pathname === "/kundli/prashna";
    }
    return pathname === href;
  };

  const isAnyKendraActive = kendraLinks.some((k) => pathname === k.href || pathname.startsWith(`${k.href}/`));

  // Complete SRS 13-item navigation list for mobile drawer
  const srsMobileMenu = [
    { href: "/services", label: tNav("services") },
    { href: "/services#plans", label: tNav("pricingPlans") },
    { href: "/kundli", label: tNav("kundli") },
    { href: "/kundli/matching", label: tNav("kundliMatching") },
    { href: "/kundli/prashna", label: tNav("prashna") },
    { href: "/about", label: tNav("about") },
    { href: "/founder", label: tNav("founder") },
    { href: "/gallery", label: tNav("gallery") },
    { href: "/blogs", label: tNav("blogs") },
    { href: "/testimonials", label: tNav("testimonials") },
    { href: "/help", label: tNav("help") },
    { href: "/auth/register", label: tNav("register") },
    { href: "/auth/signin", label: tNav("signIn") },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/40">
      {/* 1. Top Sub-Bar: Vedic Invocation, Live Ephemeris Summary & Contact */}
      <div className="bg-surface-container-high border-b border-outline-variant/60">
        <div className="w-full px-4 sm:px-6 xl:px-8 2xl:px-12 h-9 flex items-center justify-between gap-2 text-xs text-on-surface-variant font-medium">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap min-w-0 flex-1">
            <span className="font-serif text-secondary font-semibold italic tracking-wide truncate">
              {tHeader("invocation")}
            </span>
            <span className="hidden lg:inline-block w-px h-3 bg-outline-variant shrink-0"></span>
            <div className="hidden md:flex items-center gap-2 truncate">
              <span className="text-primary font-semibold uppercase tracking-wider shrink-0">
                {tHeader("panchangLabel")}
              </span>
              <span className="text-on-surface-variant italic truncate">
                {tCommon("tagline")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href="tel:+919827991224"
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-primary transition-colors text-xs"
            >
              <Phone className="w-3 h-3 text-primary" />
              <span className="font-semibold">+91-9827991224</span>
            </a>
            <span className="hidden sm:inline-block w-px h-3 bg-outline-variant shrink-0"></span>
            <Link
              href="/auth/signin"
              className="hidden md:inline-flex items-center gap-1 hover:text-primary transition-colors text-xs font-semibold text-secondary"
            >
              <LogIn className="w-3 h-3 text-secondary shrink-0" />
              <span>{tNav("signIn")}</span>
            </Link>
            <span className="hidden md:inline-block w-px h-3 bg-outline-variant shrink-0"></span>
            <Link
              href="/auth/register"
              className="hidden md:inline-flex items-center gap-1 hover:text-secondary transition-colors text-xs font-semibold text-primary"
            >
              <UserPlus className="w-3 h-3 text-primary shrink-0" />
              <span>{tNav("register")}</span>
            </Link>
            <span className="hidden md:inline-block w-px h-3 bg-outline-variant shrink-0"></span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-surface">
        <div className="h-20 w-full px-4 sm:px-6 xl:px-8 2xl:px-12 flex items-center justify-between gap-2 sm:gap-4 xl:gap-2 2xl:gap-6">
          {/* Logo & Kendra Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded border border-secondary flex items-center justify-center bg-surface-container-low text-secondary shrink-0">
              <span className="font-serif text-lg sm:text-xl font-bold">ॐ</span>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="font-serif text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-bold tracking-tight text-secondary leading-tight whitespace-nowrap">
                {tCommon("siteNameHi")}
              </span>
              <span className="text-[8px] sm:text-[9px] xl:text-[9.5px] 2xl:text-[11px] font-semibold text-primary tracking-wider uppercase mt-0.5 whitespace-nowrap">
                {tCommon("siteName")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 h-20 ml-2 2xl:ml-4 mr-auto">
            {primaryLinks.map((link) => {
              const isActive = checkIsActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href.includes("#")) {
                      setCurrentHash(`#${link.href.split("#")[1]}`);
                    } else {
                      setCurrentHash("");
                    }
                  }}
                  className={`h-full flex items-center px-1.5 2xl:px-2.5 text-[11px] 2xl:text-xs uppercase tracking-wide font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                    isActive
                      ? "text-secondary border-secondary font-bold"
                      : "text-on-surface-variant hover:text-secondary border-transparent hover:border-outline-variant/60"
                  }`}
                >
                  <span className="hidden 2xl:inline">{link.fullLabel}</span>
                  <span className="2xl:hidden">{link.shortLabel}</span>
                </Link>
              );
            })}

            {/* Desktop Dropdown for About & Kendra Lineage (opens on hover and click) */}
            <div
              className="relative h-full flex items-center"
              ref={dropdownRef}
              onMouseEnter={() => setMoreDropdownOpen(true)}
              onMouseLeave={() => setMoreDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`h-full flex items-center gap-1 px-1.5 2xl:px-2.5 text-[11px] 2xl:text-xs uppercase tracking-wide font-semibold transition-all duration-200 border-b-2 min-h-[44px] whitespace-nowrap ${
                  isAnyKendraActive
                    ? "text-secondary border-secondary font-bold"
                    : "text-on-surface-variant hover:text-secondary border-transparent hover:border-outline-variant/60"
                }`}
                aria-expanded={moreDropdownOpen}
              >
                <span>{tNav("about")} &amp; केंद्र</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    moreDropdownOpen ? "rotate-180 text-secondary" : ""
                  }`}
                />
              </button>

              {moreDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-64 bg-surface border border-outline-variant/60 shadow-xl rounded-b py-2 z-50 text-left"
                  onMouseEnter={() => setMoreDropdownOpen(true)}
                  onMouseLeave={() => setMoreDropdownOpen(false)}
                >
                  {kendraLinks.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors min-h-[40px]"
                      >
                        <SubIcon className="w-4 h-4 text-primary shrink-0" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Direct Login and Register on Desktop */}
            <Link
              href="/auth/signin"
              className="hidden xl:inline-flex items-center gap-1 px-2 2xl:px-2.5 py-1.5 text-[11px] 2xl:text-xs uppercase tracking-wider font-semibold text-secondary hover:bg-surface-container rounded transition-colors min-h-[38px] whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{tNav("signIn")}</span>
            </Link>

            <Link
              href="/auth/register"
              className="hidden xl:inline-flex items-center gap-1 px-2 2xl:px-2.5 py-1.5 text-[11px] 2xl:text-xs uppercase tracking-wider font-semibold text-primary hover:bg-surface-container rounded transition-colors min-h-[38px] whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{tNav("register")}</span>
            </Link>

            <Link
              href="/services"
              className="hidden sm:inline-flex items-center justify-center px-2.5 2xl:px-3 py-1.5 bg-primary-container hover:bg-primary text-on-primary text-[11px] 2xl:text-xs uppercase tracking-wider font-bold rounded transition-colors border border-primary min-h-[38px] whitespace-nowrap shrink-0 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 mr-1.5 shrink-0" />
              <span className="hidden 2xl:inline">{tCommon("bookConsultation")}</span>
              <span className="2xl:hidden">{tCommon("bookShort")}</span>
            </Link>

            <Link
              href="/account"
              aria-label={tHeader("profileAria")}
              className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity min-h-[36px] min-w-[36px] shrink-0 shadow-sm"
            >
              <User className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-10 h-10 flex items-center justify-center text-secondary rounded hover:bg-surface-container min-h-[40px] min-w-[40px] shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu with complete SRS 13-item list */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-surface border-t border-outline-variant/40 px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            <div className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant px-3 py-1">
              वेबसाइट मेनू • Website Navigation
            </div>
            {srsMobileMenu.map((link) => {
              const isActive = checkIsActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 px-3 rounded text-xs uppercase tracking-wider font-semibold min-h-[44px] flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-surface-container text-secondary font-bold border-l-4 border-secondary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-primary text-xs font-serif">→</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider rounded border border-primary min-h-[44px]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {tCommon("bookConsultation")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
