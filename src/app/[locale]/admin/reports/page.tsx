import { Download } from "lucide-react";
import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { loadGstMonth, resolveMonth, shiftMonth } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Monthly GST and revenue report with a download for the accountant. */
export default async function AdminReportsPage(props: { params: Promise<{ locale: string }>; searchParams: Promise<{ month?: string }> }) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  await requireAdmin("/admin/reports", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const month = resolveMonth(sp.month);
  const data = await loadGstMonth(month);
  const title = new Date(`${month}-01T00:00:00Z`).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
  const nav = "inline-flex min-h-[44px] items-center rounded border border-outline-variant px-3 text-sm font-semibold hover:bg-surface-container-high";

  const totals = [
    { label: t("Taxable amount", "करयोग्य राशि"), value: rupees(data.taxablePaise) },
    { label: "CGST", value: rupees(data.gstPaise / 2) },
    { label: "SGST", value: rupees(data.gstPaise / 2) },
    { label: t("Total GST", "कुल GST"), value: rupees(data.gstPaise) },
    { label: t("Total received", "कुल प्राप्त"), value: rupees(data.totalPaise) },
    { label: t("Paid orders", "भुगतान हुए ऑर्डर"), value: String(data.rows.length) },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("GST & revenue report", "GST व आय रिपोर्ट")}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t("Every paid order of the month with its tax split. Download it for your accountant.", "महीने के हर भुगतान हुए ऑर्डर का कर-विवरण। अपने अकाउंटेंट के लिए डाउनलोड करें।")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={{ pathname: "/admin/reports", query: { month: shiftMonth(month, -1) } }} className={nav}>‹ {t("Previous", "पिछला")}</Link>
          <span className="min-w-[8rem] text-center font-serif font-bold text-secondary">{title}</span>
          <Link href={{ pathname: "/admin/reports", query: { month: shiftMonth(month, 1) } }} className={nav}>{t("Next", "अगला")} ›</Link>
          <a href={`/api/admin/reports/gst?month=${month}`} className="inline-flex min-h-[44px] items-center gap-2 rounded bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-hover">
            <Download className="h-4 w-4" aria-hidden="true" /> {t("Download for Excel", "Excel के लिए डाउनलोड")}
          </a>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {totals.map((c) => (
          <div key={c.label} className="rounded border border-outline-variant/60 bg-surface p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{c.label}</div>
            <div className="mt-1 font-serif text-xl font-bold text-secondary">{c.value}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: t("By service", "सेवा अनुसार"), rows: data.byService },
          { title: t("By plan", "प्लान अनुसार"), rows: data.byPlan },
        ].map((g) => (
          <div key={g.title} className="rounded border border-outline-variant/60 bg-surface">
            <h2 className="border-b border-outline-variant/50 px-4 py-3 font-serif text-lg font-bold text-secondary">{g.title}</h2>
            {g.rows.length === 0 ? (
              <p className="p-4 text-sm text-on-surface-variant">{t("No paid orders this month.", "इस महीने कोई भुगतान नहीं।")}</p>
            ) : (
              <ul className="divide-y divide-outline-variant/40 text-sm">
                {g.rows.map((r) => (
                  <li key={r.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span>{r.name} <span className="text-xs text-on-surface-variant">({r.count})</span></span>
                    <span className="font-bold text-secondary">{rupees(r.totalPaise)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <div className="overflow-x-auto rounded border border-outline-variant/60 bg-surface">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface-container text-xs uppercase tracking-wider text-on-surface-variant">
            <tr>
              <th className="px-3 py-2 text-left">{t("Invoice", "इनवॉइस")}</th>
              <th className="px-3 py-2 text-left">{t("Date", "दिनांक")}</th>
              <th className="px-3 py-2 text-left">{t("Client", "ग्राहक")}</th>
              <th className="px-3 py-2 text-left">{t("Service / plan", "सेवा / प्लान")}</th>
              <th className="px-3 py-2 text-right">{t("Taxable", "करयोग्य")}</th>
              <th className="px-3 py-2 text-right">GST</th>
              <th className="px-3 py-2 text-right">{t("Total", "कुल")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {data.rows.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-on-surface-variant">{t("No paid orders this month.", "इस महीने कोई भुगतान नहीं।")}</td></tr>
            ) : (
              data.rows.map((r) => (
                <tr key={r.orderNumber}>
                  <td className="px-3 py-2 font-mono text-xs">{r.invoiceNumber ?? r.orderNumber}</td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{r.client}</td>
                  <td className="px-3 py-2">{r.service} · {r.plan}</td>
                  <td className="px-3 py-2 text-right">{rupees(r.taxablePaise)}</td>
                  <td className="px-3 py-2 text-right">{rupees(r.gstPaise)} <span className="text-xs text-on-surface-variant">({r.gstRatePercent}%)</span></td>
                  <td className="px-3 py-2 text-right font-bold text-secondary">{rupees(r.totalPaise)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
