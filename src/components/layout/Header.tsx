"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useHiddenTools } from "@/components/providers/ToolsProvider";
import { SocialIcon } from "@/components/content/SocialIcon";
import { DateStrip, type DateStripData } from "./DateStrip";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccountMenu } from "./AccountMenu";
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

interface HeaderProps {
  panchang?: { parts?: DateStripData } | null;
  social?: Array<{ id: string; name: string; url: string }>;
  logoUrl?: string;
  phone?: string;
  /** Admin > Website settings > Top bar */
  topbar?: Record<string, boolean | string | number>;
  /** Admin menu (when the admin has changed it) */
  menu?: Array<{ href: string; labelEn: string; labelHi: string }>;
  /** Pages the admin created with "Show in the top menu" */
  pages?: Array<{ href: string; labelEn: string; labelHi: string }>;
}

export function Header({ phone, panchang, social = [], logoUrl, topbar = {}, menu, pages = [] }: HeaderProps = {}) {
  const activePhone = phone || "+91 98279 91224";
  const cleanPhone = activePhone.replace(/[^\d+]/g, "");
  const cleanWa = activePhone.replace(/[^\d]/g, "");
  const waUrl = "https://wa.me/" + cleanWa;
  const tb = (k: string) => topbar[k] !== false;
  const isHindi = useLocale() === "hi";
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const hideTools = useHiddenTools();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
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
      if (bookRef.current && !bookRef.current.contains(event.target as Node)) {
        setBookOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary desktop bar links
  const customMenu = menu && menu.length > 0 ? menu.map((m) => ({ href: m.href, label: isHindi ? m.labelHi || m.labelEn : m.labelEn || m.labelHi })) : null;
  const primaryLinks = customMenu ? hideTools(customMenu) : hideTools([
    { href: "/", label: tNav("home") },
    { href: "/about", label: tNav("about") },
    { href: "/services", label: tNav("services") },
    { href: "/kundli", label: tNav("kundli") },
    { href: "/kundli/prashna", label: tNav("prashna") },
    { href: "/kundli/matching", label: tNav("kundliMatching") },
    { href: "/services#plans", label: tNav("pricingPlans") },
    { href: "/gallery", label: tNav("gallery") },
    { href: "/contact", label: tNav("contact") },
  ]);

  // Secondary/lineage items accessible in dropdown & mobile
  const kendraLinks = hideTools([
    { href: "/about", label: tNav("about"), icon: Compass },
    { href: "/founder", label: tNav("founder"), icon: Sparkles },
    { href: "/other-services", label: tNav("otherServices"), icon: Sparkles },
    { href: "/kundli/astrosage", label: tNav("astrosageTool"), icon: BookOpen },
    { href: "/gallery", label: tNav("gallery"), icon: ImageIcon },
    { href: "/blogs", label: tNav("blogs"), icon: FileText },
    { href: "/testimonials", label: tNav("testimonials"), icon: MessageSquare },
    { href: "/help", label: tNav("help"), icon: HelpCircle },
    { href: "/panchang", label: tNav("panchang"), icon: BookOpen },
    { href: "/track", label: tNav("tracker"), icon: Search },
    ...pages.map((p) => ({ href: p.href, label: isHindi ? p.labelHi || p.labelEn : p.labelEn || p.labelHi, icon: FileText })),
  ]);

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
  const srsMobileMenu = customMenu ? hideTools(customMenu) : hideTools([
    { href: "/services", label: tNav("services") },
    { href: "/services#plans", label: tNav("pricingPlans") },
    { href: "/kundli", label: tNav("kundli") },
    { href: "/kundli/matching", label: tNav("kundliMatching") },
    { href: "/kundli/prashna", label: tNav("prashna") },
    { href: "/other-services", label: tNav("otherServices") },
    { href: "/about", label: tNav("about") },
    { href: "/founder", label: tNav("founder") },
    { href: "/other-services", label: tNav("otherServices") },
    { href: "/kundli/astrosage", label: tNav("astrosageTool") },
    { href: "/gallery", label: tNav("gallery") },
    { href: "/blogs", label: tNav("blogs") },
    { href: "/testimonials", label: tNav("testimonials") },
    { href: "/help", label: tNav("help") },
    { href: "/auth/register", label: tNav("register") },
    { href: "/auth/signin", label: tNav("signIn") },
  ]);
  const mobileExtra = pages.map((p) => ({ href: p.href, label: isHindi ? p.labelHi || p.labelEn : p.labelEn || p.labelHi }));
  const mobileLinks = [...srsMobileMenu, ...mobileExtra.filter((x) => !srsMobileMenu.some((m) => m.href === x.href))];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/40">
      {/* 1. One-line bar: time, day, date, month, paksha, tithi and Samvat; contact and sign-in on the right */}
      <div className={tb("showBar") ? "bg-[rgb(var(--topbar-bg-rgb,128_0_0))]" : "hidden"}>
        <div className="w-full px-3 sm:px-6 xl:px-6 2xl:px-10 h-9 flex items-center justify-between gap-3 text-xs text-on-maroon font-medium [&_a]:!text-on-maroon">
          <DateStrip
            data={panchang?.parts ?? null}
            isHindi={isHindi}
            show={{ time: tb("showTime"), seconds: tb("showSeconds"), day: tb("showDay"), date: tb("showDate"), paksha: tb("showPaksha"), tithi: tb("showTithi"), masa: tb("showMasa"), samvat: tb("showSamvat") }}
          />

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {tb("showSocial") && social.length > 0 && (
              <ul className="hidden xl:flex items-center gap-2" aria-label="Social media">
                {social.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.name} title={l.name} className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/15">
                      <SocialIcon id={l.id} className="w-3.5 h-3.5 text-gold" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {tb("showPanchangButton") && hideTools([{ href: "/panchang" }]).length > 0 && (
            <Link
              href="/panchang"
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold !text-on-gold hover:opacity-90 whitespace-nowrap"
            >
              <BookOpen className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="!text-on-gold">{tNav("panchangCalendar")}</span>
            </Link>
            )}
            {tb("showPhone") && phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="hidden lg:inline-flex items-center gap-1.5 hover:underline text-xs"
              >
                <Phone className="w-3 h-3 text-gold" />
                <span className="font-semibold">{phone}</span>
              </a>
            )}
            {tb("showAuthLinks") && (
              <>
            <Link href="/auth/signin" className="hidden md:inline-flex items-center gap-1 hover:underline text-xs font-semibold">
              <LogIn className="w-3 h-3 text-gold shrink-0" />
              <span>{tNav("signIn")}</span>
            </Link>
            <Link href="/auth/register" className="hidden md:inline-flex items-center gap-1 hover:underline text-xs font-semibold">
              <UserPlus className="w-3 h-3 text-gold shrink-0" />
              <span>{tNav("register")}</span>
            </Link>
              </>
            )}
            <span className="hidden sm:inline-flex"><LanguageSwitcher tone="dark" /></span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-surface">
        <div className="h-20 w-full px-4 sm:px-6 xl:px-6 2xl:px-10 flex items-center justify-between gap-2 sm:gap-4 xl:gap-2 2xl:gap-6">
          {/* Logo & Kendra Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink sm:shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl || "/Logo.jpeg"}
              alt={tCommon("siteNameHi")}
              width={64}
              height={48}
              className="h-12 sm:h-[62px] w-auto shrink-0 rounded"
            />
            <div className="flex flex-col text-left min-w-0">
              <span className="font-serif text-lg sm:text-[22px] font-bold tracking-tight text-secondary leading-[1.05] whitespace-nowrap truncate">
                Maharshi Kanad Jyotish Kendra
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-primary mt-1 whitespace-nowrap truncate">
                {tCommon("siteNameHi")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 2xl:gap-3 h-20 ml-2 xl:ml-3">
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
                  className={`h-full flex items-center px-1.5 2xl:px-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                    isActive
                      ? "text-primary border-saffron font-bold"
                      : "text-secondary hover:text-primary border-transparent hover:border-saffron/50"
                  }`}
                >
                  {link.label}
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
                className={`h-full flex items-center gap-1 px-1.5 xl:px-1.5 2xl:px-2.5 text-xs uppercase xl:tracking-normal 2xl:tracking-wide font-semibold transition-all duration-200 border-b-2 min-h-[44px] whitespace-nowrap ${
                  isAnyKendraActive
                    ? "text-secondary border-signal font-bold"
                    : "text-on-surface-variant hover:text-secondary border-transparent hover:border-outline-variant/60"
                }`}
                aria-expanded={moreDropdownOpen}
              >
                <span>{isHindi ? "और देखें" : "More"}</span>
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
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
            {/* Booking dropdown: the booking path Service, Plan, Offers, then Track and My Account */}
            <div
              className="relative hidden sm:block"
              ref={bookRef}
              onMouseEnter={() => setBookOpen(true)}
              onMouseLeave={() => setBookOpen(false)}
            >
              <button
                type="button"
                onClick={() => setBookOpen(!bookOpen)}
                aria-expanded={bookOpen}
                aria-label={tCommon("bookConsultation")}
                title={tCommon("bookConsultation")}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-brand hover:bg-brand-hover text-on-brand text-xs uppercase tracking-wide font-bold rounded transition-colors border border-primary min-h-[38px] whitespace-nowrap shrink-0 shadow-sm"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="hidden 2xl:inline">{tCommon("bookConsultation")}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${bookOpen ? "rotate-180" : ""}`} />
              </button>
              {bookOpen && (
                <div className="absolute top-full right-0 w-60 pt-1 z-50 text-left">
                  <div className="bg-surface border border-outline-variant/60 shadow-xl rounded py-2">
                    {[
                      { href: "/services", label: tNav("services") },
                      { href: "/services#plans", label: tNav("pricingPlans") },
                      { href: "/offers", label: tNav("offers") },
                      { href: "/track", label: tNav("tracker") },
                      { href: "/account", label: tNav("account") },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setBookOpen(false)}
                        className="flex items-center px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors min-h-[40px]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="sm:hidden inline-flex"><LanguageSwitcher tone="light" /></span>

            <AccountMenu />

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
            {mobileLinks.map((link) => {
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
              <div className="flex gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gold text-on-gold font-bold text-xs uppercase tracking-wider rounded"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{activePhone}</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider rounded"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-3 bg-brand text-on-brand font-bold text-xs uppercase tracking-wider rounded border border-primary min-h-[44px]"
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
