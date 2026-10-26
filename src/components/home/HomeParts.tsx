import type { ReactNode } from "react";

/** Left-aligned section heading: small label, short accent bar, serif title, intro. */
export function SectionHead({
  label,
  title,
  intro,
  dark = false,
}: {
  label: string;
  title: string;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl mb-10 lg:mb-12">
      <span className={`block text-xs font-bold uppercase tracking-[0.2em] mb-3 ${dark ? "text-gold" : "text-primary"}`}>{label}</span>
      <div className={`h-0.5 w-[76px] mb-5 ${dark ? "bg-gold" : "bg-saffron"}`} />
      <h2 className={`font-serif font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] mb-4 ${dark ? "text-white" : "text-secondary"}`}>{title}</h2>
      {intro && <p className={`text-sm sm:text-[15px] leading-[1.85] ${dark ? "text-white/75" : "text-on-surface-variant"}`}>{intro}</p>}
    </div>
  );
}

/** A full-width band with the site's section padding. */
export function Band({
  id,
  tone = "light",
  children,
}: {
  id?: string;
  tone?: "light" | "soft" | "dark";
  children: ReactNode;
}) {
  const bg = tone === "soft" ? "bg-surface-container" : tone === "dark" ? "bg-maroon text-white" : "bg-surface";
  return (
    <section id={id} className={`${bg} py-16 sm:py-20 lg:py-24 scroll-mt-28`}>
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">{children}</div>
    </section>
  );
}

export interface PlanView {
  id: string;
  slug: string;
  title: string;
  pricePaise: number;
  features: string[];
  popular: boolean;
}

export function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
