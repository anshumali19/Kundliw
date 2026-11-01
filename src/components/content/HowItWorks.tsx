import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

export interface HowStep {
  en: string;
  hi: string;
  detailEn: string;
  detailHi: string;
}

/** "What is on this page and how to use it": numbered steps at the top of a dashboard. */
export function HowItWorks({ title, steps, isHindi, footer }: { title: string; steps: HowStep[]; isHindi: boolean; footer?: ReactNode }) {
  return (
    <details open className="rounded-lg border border-gold/60 bg-gold/10 text-left">
      <summary className="flex min-h-[48px] cursor-pointer items-center gap-2 px-4 font-serif text-base font-bold text-secondary">
        <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        {title}
      </summary>
      <ol className="grid gap-3 border-t border-gold/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.en} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-on-brand">{i + 1}</span>
            <span>
              <span className="block text-sm font-bold text-secondary">{isHindi ? s.hi : s.en}</span>
              <span className="block text-xs leading-relaxed text-on-surface-variant">{isHindi ? s.detailHi : s.detailEn}</span>
            </span>
          </li>
        ))}
      </ol>
      {footer && <div className="border-t border-gold/40 px-4 py-3 text-xs">{footer}</div>}
    </details>
  );
}
