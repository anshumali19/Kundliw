"use client";

import { useState } from "react";
import { Download, Eye, EyeOff, Printer, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import { formatPaiseToInr } from "@/lib/billing/gst";
import type { PackageDetailDTO } from "./PackageDetails";
import type { PlanDTO } from "./PlanSelectorInteractive";

export interface PackagePolicy {
  cancelEn: string;
  cancelHi: string;
  refundEn: string;
  refundHi: string;
  upgradeEn: string;
  upgradeHi: string;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function policyRows(policy: PackagePolicy | null | undefined, hi: boolean) {
  if (!policy) return [] as { key: string; title: string; text: string }[];
  const pick = (en: string, h: string) => (hi ? h || en : en || h).trim();
  return [
    { key: "cancel", title: hi ? "सेवा / पैकेज रद्दीकरण" : "Service & package cancellation", text: pick(policy.cancelEn, policy.cancelHi) },
    { key: "refund", title: hi ? "धनवापसी" : "Refund", text: pick(policy.refundEn, policy.refundHi) },
    { key: "upgrade", title: hi ? "प्लान अपग्रेड" : "Plan upgrade", text: pick(policy.upgradeEn, policy.upgradeHi) },
  ].filter((r) => r.text);
}

/** The three rules a customer should see before paying: cancellation, refund and plan upgrade. */
export function PolicyBlock({ policy, isHindi }: { policy?: PackagePolicy | null; isHindi: boolean }) {
  const rows = policyRows(policy, isHindi);
  if (rows.length === 0) return null;
  const icon = { cancel: XCircle, refund: ShieldCheck, upgrade: RefreshCcw } as const;
  return (
    <section aria-label={isHindi ? "रद्दीकरण, धनवापसी और अपग्रेड" : "Cancellation, refund and upgrade"} className="rounded-lg border border-outline-variant/50 bg-surface p-5 text-left">
      <h3 className="font-serif text-lg font-bold text-secondary mb-3">
        {isHindi ? "रद्दीकरण, धनवापसी और प्लान अपग्रेड" : "Cancellation, refund & plan upgrade"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rows.map((r) => {
          const Icon = icon[r.key as keyof typeof icon];
          return (
            <div key={r.key} className="text-sm">
              <div className="flex items-center gap-2 font-semibold text-secondary mb-1">
                <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                {r.title}
              </div>
              <p className="text-on-surface-variant leading-relaxed">{r.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface Day {
  title: string;
  details: string;
}

function buildHtml(opts: {
  pkg: PackageDetailDTO | null;
  plan: PlanDTO;
  serviceTitle: string;
  isHindi: boolean;
  policy?: PackagePolicy | null;
}): string {
  const { pkg, plan, serviceTitle, isHindi: hi, policy } = opts;
  const pick = (en?: string | null, h?: string | null) => ((hi ? h || en : en || h) || "").toString();
  const list = (en?: string[], h?: string[]) => ((hi && h?.length ? h : en) ?? []).filter(Boolean);
  const rows: string[] = [];
  const row = (k: string, v: string) => v && rows.push(`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`);
  row(hi ? "सेवा" : "Service", serviceTitle);
  if (pkg) row(hi ? "पैकेज" : "Package", pick(pkg.titleEn, pkg.titleHi));
  row(hi ? "प्लान" : "Plan", pick(plan.titleEn, plan.titleHi));
  row(hi ? "दक्षिणा" : "Dakshina", formatPaiseToInr(plan.pricePaise));
  row(hi ? "वितरण अवधि" : "Delivery", `${plan.deliveryDays} ${hi ? "कार्यदिवस" : "working days"}`);
  if (plan.pages) row(hi ? "पृष्ठ" : "Pages", String(plan.pages));
  if (plan.hasCall && plan.callDurationMinutes) row(hi ? "परामर्श" : "Consultation", `${plan.callDurationMinutes} ${hi ? "मिनट" : "minutes"}`);
  if (pkg?.numberOfDays) row(hi ? "अवधि" : "Duration", `${pkg.numberOfDays} ${hi ? "दिन" : "days"}`);
  if (pkg?.startDate) {
    const f = (d: string) => new Date(d).toLocaleDateString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    row(hi ? "तिथि" : "Dates", f(pkg.startDate) + (pkg.endDate ? ` → ${f(pkg.endDate)}` : ""));
  }

  const section = (title: string, body: string) => (body ? `<h2>${esc(title)}</h2>${body}` : "");
  const ul = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "");
  const features = hi ? plan.featuresHi : plan.featuresEn;
  const itin: Day[] = Array.isArray(pkg?.itineraryDays)
    ? (pkg!.itineraryDays as Record<string, unknown>[]).map((d) => ({
        title: pick(String(d?.titleEn ?? ""), String(d?.titleHi ?? "")),
        details: pick(String(d?.detailsEn ?? ""), String(d?.detailsHi ?? "")),
      }))
    : [];

  const body = [
    `<table>${rows.join("")}</table>`,
    pkg ? section(hi ? "पैकेज विवरण" : "About this package", pick(pkg.descriptionEn, pkg.descriptionHi) ? `<p>${esc(pick(pkg.descriptionEn, pkg.descriptionHi))}</p>` : "") : "",
    section(hi ? "प्लान विवरण" : "About this plan", pick(plan.descriptionEn, plan.descriptionHi) ? `<p>${esc(pick(plan.descriptionEn, plan.descriptionHi))}</p>` : ""),
    section(hi ? "प्लान में क्या मिलेगा" : "What this plan includes", ul(features ?? [])),
    itin.length
      ? section(
          hi ? "दिन-वार कार्यक्रम" : "Day by day itinerary",
          `<ol>${itin.map((d) => `<li><strong>${esc(d.title)}</strong> ${esc(d.details)}</li>`).join("")}</ol>`,
        )
      : "",
    pkg ? section(hi ? "सम्मिलित" : "Inclusions", ul(list(pkg.inclusionsEn, pkg.inclusionsHi))) : "",
    pkg ? section(hi ? "सम्मिलित नहीं" : "Exclusions", ul(list(pkg.exclusionsEn, pkg.exclusionsHi))) : "",
    pkg ? section(hi ? "सामग्री सूची" : "Material list", ul(list(pkg.materialsEn, pkg.materialsHi))) : "",
    ...policyRows(policy, hi).map((r) => section(r.title, `<p>${esc(r.text)}</p>`)),
  ].join("");

  const title = `${serviceTitle} – ${pick(plan.titleEn, plan.titleHi)}`;
  return `<!doctype html><html lang="${hi ? "hi" : "en"}"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
body{font-family:Georgia,'Noto Serif Devanagari',serif;max-width:760px;margin:24px auto;padding:0 16px;color:#222;line-height:1.55}
h1{font-size:22px;border-bottom:2px solid #7a1f1f;padding-bottom:8px;color:#7a1f1f}h2{font-size:16px;margin:18px 0 6px;color:#7a1f1f}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;font-size:14px}th{background:#f6efe6;width:32%}
ul,ol{padding-left:22px;font-size:14px}p{font-size:14px;margin:4px 0}.foot{margin-top:24px;font-size:12px;color:#666}
</style></head><body><h1>${esc(title)}</h1>${body}<p class="foot">${esc(hi ? "महर्षि कणाद ज्योतिष केंद्र" : "Maharshi Kanad Jyotish Kendra")}</p></body></html>`;
}

/** View package details, download them as a file, or print them. */
export function PackageActions({
  pkg,
  plan,
  serviceTitle,
  isHindi,
  policy,
}: {
  pkg: PackageDetailDTO | null;
  plan: PlanDTO;
  serviceTitle: string;
  isHindi: boolean;
  policy?: PackagePolicy | null;
}) {
  const [open, setOpen] = useState(false);
  const html = () => buildHtml({ pkg, plan, serviceTitle, isHindi, policy });

  const download = () => {
    const blob = new Blob([html()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.slug || "package"}-details.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const print = () => {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    frame.srcdoc = html();
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 3000);
    };
    document.body.appendChild(frame);
  };

  const btn =
    "min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-secondary text-secondary hover:bg-brand-hover hover:text-on-brand text-xs font-semibold uppercase tracking-wider transition-colors";
  const preview = html();

  return (
    <div className="mt-6 text-left print:hidden">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={btn}>
          {open ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          {open ? (isHindi ? "विवरण छिपाएँ" : "Hide package details") : isHindi ? "पैकेज विवरण देखें" : "View package details"}
        </button>
        <button type="button" onClick={download} className={btn}>
          <Download className="w-4 h-4" aria-hidden="true" />
          {isHindi ? "डाउनलोड" : "Download"}
        </button>
        <button type="button" onClick={print} className={btn}>
          <Printer className="w-4 h-4" aria-hidden="true" />
          {isHindi ? "प्रिंट" : "Print"}
        </button>
      </div>
      {open && (
        <iframe
          title={isHindi ? "पैकेज विवरण" : "Package details"}
          srcDoc={preview}
          className="mt-3 w-full h-[28rem] rounded-lg border border-outline-variant/60 bg-white"
        />
      )}
    </div>
  );
}
