"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/routing";

/**
 * Shows a "back soon" page instead of the site while maintenance mode is on.
 * Sign-in pages and the admin area stay open, and the admin sees the real site with a reminder strip.
 */
export function MaintenanceGate({
  on,
  isAdmin,
  isHindi,
  messageEn,
  messageHi,
  children,
}: {
  on: boolean;
  isAdmin: boolean;
  isHindi: boolean;
  messageEn: string;
  messageHi: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (!on) return <>{children}</>;

  if (isAdmin) {
    return (
      <>
        <div role="status" className="w-full bg-signal px-4 py-2 text-center text-xs font-bold text-on-signal">
          {isHindi ? "रखरखाव मोड चालू है: आगंतुकों को 'जल्द वापसी' पेज दिखता है।" : "Maintenance mode is ON: visitors see the 'back soon' page. You see the real site."}
        </div>
        {children}
      </>
    );
  }

  if (pathname.startsWith("/auth") || pathname.startsWith("/admin")) return <>{children}</>;

  const message =
    (isHindi ? messageHi : messageEn).trim() ||
    (isHindi ? "वेबसाइट पर कुछ सुधार कार्य चल रहा है। कृपया थोड़ी देर बाद पधारें।" : "We are making a few improvements to the website. Please visit again shortly.");

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 font-serif text-5xl text-primary" aria-hidden="true">ॐ</div>
      <h1 className="font-serif text-2xl font-bold text-secondary sm:text-3xl">{isHindi ? "जल्द ही वापसी" : "We will be back soon"}</h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{message}</p>
    </section>
  );
}
