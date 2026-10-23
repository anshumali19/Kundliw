"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Phone, MapPin, Calendar, User, Menu, X } from "lucide-react";

export function Header() {
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/panchang", label: tNav("panchang") },
    { href: "/services", label: tNav("services") },
    { href: "/kundli", label: tNav("kundli") },
    { href: "/kundli/matching", label: tNav("kundliMatching") },
    { href: "/kundli/prashna", label: tNav("prashna") },
    { href: "/vault", label: tNav("vault") },
    { href: "/track", label: tNav("tracker") },
    { href: "/about", label: tNav("about") },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/40">
      {/* 1. Top Sub-Bar: Vedic Invocation, Live Ephemeris Summary & Contact */}
      <div className="bg-surface-container-high border-b border-outline-variant/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between text-xs text-on-surface-variant font-medium">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <span className="font-serif text-secondary font-semibold italic tracking-wide">
              {tHeader("invocation")}
            </span>
            <span className="hidden lg:inline-block w-px h-3 bg-outline-variant"></span>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-primary font-semibold uppercase tracking-wider">
                {tHeader("panchangLabel")}
              </span>
              <span className="text-on-surface-variant italic">
                {tCommon("tagline")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+919827991224"
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-primary transition-colors text-xs"
            >
              <Phone className="w-3 h-3 text-primary" />
              <span className="font-semibold">+91-9827991224</span>
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-surface">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo & Kendra Identity */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded border border-secondary flex items-center justify-center bg-surface-container-low text-secondary">
              <span className="font-serif text-2xl font-bold">ॐ</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-secondary leading-tight">
                {tCommon("siteNameHi")}
              </span>
              <span className="text-[11px] font-semibold text-primary tracking-widest uppercase mt-0.5">
                {tCommon("siteName")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 h-20">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-full flex items-center px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                    isActive
                      ? "text-secondary border-secondary font-bold"
                      : "text-on-surface-variant hover:text-on-surface border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/services"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 bg-primary-container hover:bg-primary text-on-primary text-xs uppercase tracking-wider font-bold rounded transition-colors border border-primary min-h-[44px]"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              {tCommon("bookConsultation")}
            </Link>

            <Link
              href="/account"
              aria-label={tHeader("profileAria")}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-11 h-11 flex items-center justify-center text-secondary rounded hover:bg-surface-container"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-surface border-t border-outline-variant/40 px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded text-sm uppercase tracking-wider font-semibold text-on-surface hover:bg-surface-container min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-outline-variant/30 flex flex-col gap-2">
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
