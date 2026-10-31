import { Link } from "@/i18n/routing";
import type { RevenuePoint, RevenueRange } from "@/lib/admin/dashboardStats";

const RANGES: Array<{ id: RevenueRange; en: string; hi: string }> = [
  { id: "daily", en: "Daily", hi: "दैनिक" },
  { id: "weekly", en: "Weekly", hi: "साप्ताहिक" },
  { id: "monthly", en: "Monthly", hi: "मासिक" },
];

function rupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Earnings (dakshina) bar chart with Daily / Weekly / Monthly tabs; the tab is the ?range= query. */
export function RevenueChart({ points, range, isHindi }: { points: RevenuePoint[]; range: RevenueRange; isHindi: boolean }) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const max = Math.max(...points.map((p) => p.paise), 1);
  const total = points.reduce((s, p) => s + p.paise, 0);

  return (
    <section className="rounded border border-outline-variant/60 bg-surface" aria-labelledby="revenue-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/50 px-4 py-3">
        <div>
          <h2 id="revenue-title" className="font-serif text-lg font-bold text-secondary">
            {t("Earnings (Dakshina)", "आय (दक्षिणा)")}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {t("Paid orders only. Total for this view:", "केवल प्राप्त भुगतान। इस दृश्य का कुल:")} <strong>{rupees(total)}</strong>
          </p>
        </div>
        <div className="flex gap-1" role="tablist" aria-label={t("Chart period", "अवधि")}>
          {RANGES.map((r) => (
            <Link
              key={r.id}
              href={{ pathname: "/admin", query: { range: r.id } }}
              role="tab"
              aria-selected={r.id === range}
              className={`inline-flex min-h-[40px] items-center rounded px-3 text-xs font-bold uppercase tracking-wider ${
                r.id === range ? "bg-brand text-on-brand" : "border border-outline-variant text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {isHindi ? r.hi : r.en}
            </Link>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="flex h-44 min-w-[480px] items-end gap-1" role="img" aria-label={t("Bar chart of earnings", "आय का बार चार्ट")}>
          {points.map((p) => (
            <div key={p.label} className="flex h-full flex-1 flex-col justify-end" title={`${p.label}: ${rupees(p.paise)}`}>
              <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max((p.paise / max) * 100, p.paise > 0 ? 3 : 0)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex min-w-[480px] gap-1 text-[10px] text-on-surface-variant">
          {points.map((p, i) => (
            <span key={p.label} className="flex-1 truncate text-center">
              {points.length > 14 && i % 3 !== 0 ? "" : p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
