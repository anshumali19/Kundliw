"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaiseToInr } from "@/lib/billing/gst";

type Tab = "associates" | "rules" | "payouts";
type AssociateStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

interface AssociateRow {
  id: string;
  status: AssociateStatus;
  referralCode: string;
  rejectionReason: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null; phone: string | null };
  orders: number;
  earnedPaise: number;
  paidPaise: number;
  pendingPaise: number;
}

interface RuleRow {
  id: string;
  serviceId: string | null;
  planId: string | null;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  isActive: boolean;
}

interface ServiceOption {
  id: string;
  titleEn: string;
  titleHi: string;
  plans: Array<{ id: string; titleEn: string; titleHi: string }>;
}

interface PayoutRow {
  id: string;
  amountPaise: number;
  status: "REQUESTED" | "PAID" | "REJECTED";
  note: string | null;
  paymentReference: string | null;
  createdAt: string;
  associate: { referralCode: string; user: { name: string | null; email: string | null; phone: string | null } };
}

const input =
  "bg-surface-container-lowest px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]";
const btn =
  "min-h-[44px] px-3 rounded text-xs font-bold uppercase tracking-wider border border-maroon bg-brand hover:bg-brand-hover text-on-brand disabled:opacity-50";
const btnGhost =
  "min-h-[44px] px-3 rounded text-xs font-bold uppercase tracking-wider border border-error text-on-error-container hover:bg-error-container disabled:opacity-50";

export function AdminAssociatesManager({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const [tab, setTab] = useState<Tab>("associates");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [associates, setAssociates] = useState<AssociateRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);

  // New / updated commission rule form
  const [ruleService, setRuleService] = useState("");
  const [rulePlan, setRulePlan] = useState("");
  const [ruleType, setRuleType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [ruleValue, setRuleValue] = useState("10");

  const call = useCallback(
    async (url: string, init?: RequestInit) => {
      const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Request failed.");
      return json;
    },
    []
  );

  const loadAssociates = useCallback(async () => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const json = await call(`/api/admin/associates${qs}`);
    setAssociates(json.associates);
  }, [call, statusFilter]);

  const loadRules = useCallback(async () => {
    const json = await call("/api/admin/commission-rules");
    setRules(json.rules);
    setServices(json.services);
  }, [call]);

  const loadPayouts = useCallback(async () => {
    const json = await call("/api/admin/payouts");
    setPayouts(json.payouts);
  }, [call]);

  useEffect(() => {
    const run = async () => {
      try {
        if (tab === "associates") await loadAssociates();
        if (tab === "rules") await loadRules();
        if (tab === "payouts") await loadPayouts();
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load." });
      }
    };
    run();
  }, [tab, loadAssociates, loadRules, loadPayouts]);

  const act = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessage({ type: "ok", text: okText });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Action failed." });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (row: AssociateRow, status: AssociateStatus) => {
    let rejectionReason: string | undefined;
    if (status === "REJECTED") {
      const reason = window.prompt(t("Reason for rejection:", "अस्वीकृति का कारण:"));
      if (!reason) return;
      rejectionReason = reason;
    }
    return act(async () => {
      await call(`/api/admin/associates/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
      await loadAssociates();
    }, t("Associate updated.", "एसोसिएट अपडेट हुआ।"));
  };

  const saveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(ruleValue);
    if (!Number.isFinite(numeric) || numeric < 0) {
      setMessage({ type: "error", text: t("Enter a valid value.", "मान्य मान दर्ज करें।") });
      return;
    }
    // Percent is stored as basis points (x100) and rupees as paise (x100).
    const value = Math.round(numeric * 100);
    return act(async () => {
      await call("/api/admin/commission-rules", {
        method: "POST",
        body: JSON.stringify({
          serviceId: ruleService || null,
          planId: rulePlan || null,
          type: ruleType,
          value,
        }),
      });
      await loadRules();
    }, t("Commission rule saved.", "कमीशन नियम सहेजा गया।"));
  };

  const toggleRule = (rule: RuleRow) =>
    act(async () => {
      await call(`/api/admin/commission-rules/${rule.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      await loadRules();
    }, t("Rule updated.", "नियम अपडेट हुआ।"));

  const deleteRule = (rule: RuleRow) => {
    if (!window.confirm(t("Delete this commission rule?", "यह कमीशन नियम हटाएँ?"))) return;
    return act(async () => {
      await call(`/api/admin/commission-rules/${rule.id}`, { method: "DELETE" });
      await loadRules();
    }, t("Rule deleted.", "नियम हटाया गया।"));
  };

  const decidePayout = (row: PayoutRow, decision: "PAID" | "REJECTED") => {
    let paymentReference: string | undefined;
    let note: string | undefined;
    if (decision === "PAID") {
      const ref = window.prompt(
        t("Payment reference (UPI/bank transaction ID). Mark paid only after you have paid the associate:", "भुगतान संदर्भ (UPI/बैंक ट्रांज़ैक्शन ID)। एसोसिएट को भुगतान करने के बाद ही चिह्नित करें:")
      );
      if (ref === null) return;
      paymentReference = ref;
    } else {
      const reason = window.prompt(t("Reason for declining:", "अस्वीकार करने का कारण:"));
      if (!reason) return;
      note = reason;
    }
    return act(async () => {
      await call(`/api/admin/payouts/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision, paymentReference, note }),
      });
      await loadPayouts();
    }, decision === "PAID" ? t("Payout marked as paid.", "भुगतान चिह्नित हुआ।") : t("Payout declined.", "भुगतान अस्वीकृत हुआ।"));
  };

  const ruleScopeLabel = (r: RuleRow) => {
    if (r.planId) {
      for (const s of services) {
        const p = s.plans.find((x) => x.id === r.planId);
        if (p) return `${isHindi ? s.titleHi : s.titleEn} / ${isHindi ? p.titleHi : p.titleEn}`;
      }
      return t("Plan", "प्लान");
    }
    if (r.serviceId) {
      const s = services.find((x) => x.id === r.serviceId);
      return s ? (isHindi ? s.titleHi : s.titleEn) : t("Service", "सेवा");
    }
    return t("All services (default)", "सभी सेवाएँ (सामान्य)");
  };

  const statusText: Record<AssociateStatus, string> = {
    PENDING: t("Pending", "लंबित"),
    APPROVED: t("Approved", "स्वीकृत"),
    REJECTED: t("Rejected", "अस्वीकृत"),
    SUSPENDED: t("Suspended", "निलंबित"),
  };

  const selectedService = services.find((s) => s.id === ruleService);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-5">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Associates", "एसोसिएट")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t(
            "Approve associates, set commission rules and review payout requests.",
            "एसोसिएट स्वीकृत करें, कमीशन नियम तय करें और भुगतान अनुरोध देखें।"
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            ["associates", t("Associates", "एसोसिएट")],
            ["rules", t("Commission rules", "कमीशन नियम")],
            ["payouts", t("Payout requests", "भुगतान अनुरोध")],
          ] as Array<[Tab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setMessage(null);
              setTab(id);
            }}
            className={`min-h-[44px] px-4 rounded text-sm font-bold border ${
              tab === id ? "bg-brand text-on-brand border-maroon" : "bg-surface text-secondary border-outline-variant hover:bg-brand/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div
          role="status"
          className={`p-3 rounded border text-sm ${message.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}
        >
          {message.text}
        </div>
      )}

      {tab === "associates" && (
        <div className="space-y-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={input}
            aria-label={t("Filter by status", "स्थिति से छाँटें")}
          >
            <option value="">{t("All statuses", "सभी स्थितियाँ")}</option>
            {(Object.keys(statusText) as AssociateStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusText[s]}
              </option>
            ))}
          </select>
          <div className="overflow-x-auto bg-surface border border-outline-variant/60 rounded">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left">
                <tr>
                  <th className="px-3 py-2.5">{t("Associate", "एसोसिएट")}</th>
                  <th className="px-3 py-2.5">{t("Code", "कोड")}</th>
                  <th className="px-3 py-2.5">{t("Status", "स्थिति")}</th>
                  <th className="px-3 py-2.5">{t("Bookings", "बुकिंग")}</th>
                  <th className="px-3 py-2.5">{t("Earned", "अर्जित")}</th>
                  <th className="px-3 py-2.5">{t("Paid", "भुगतान")}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {associates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-on-surface-variant">
                      {t("No associates found.", "कोई एसोसिएट नहीं मिला।")}
                    </td>
                  </tr>
                )}
                {associates.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-secondary">{a.user.name || "-"}</div>
                      <div className="text-xs text-on-surface-variant">{a.user.phone || ""} {a.user.email || ""}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{a.referralCode}</td>
                    <td className="px-3 py-2.5">{statusText[a.status]}</td>
                    <td className="px-3 py-2.5">{a.orders}</td>
                    <td className="px-3 py-2.5">{formatPaiseToInr(a.earnedPaise)}</td>
                    <td className="px-3 py-2.5">{formatPaiseToInr(a.paidPaise)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {a.status !== "APPROVED" && (
                          <button type="button" disabled={busy} className={btn} onClick={() => setStatus(a, "APPROVED")}>
                            {t("Approve", "स्वीकृत करें")}
                          </button>
                        )}
                        {a.status === "PENDING" && (
                          <button type="button" disabled={busy} className={btnGhost} onClick={() => setStatus(a, "REJECTED")}>
                            {t("Reject", "अस्वीकृत करें")}
                          </button>
                        )}
                        {a.status === "APPROVED" && (
                          <button type="button" disabled={busy} className={btnGhost} onClick={() => setStatus(a, "SUSPENDED")}>
                            {t("Suspend", "निलंबित करें")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "rules" && (
        <div className="space-y-4">
          <form onSubmit={saveRule} className="bg-surface border border-outline-variant/60 rounded p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {t("Service", "सेवा")}
              <select
                value={ruleService}
                onChange={(e) => {
                  setRuleService(e.target.value);
                  setRulePlan("");
                }}
                className={`${input} w-full mt-1 normal-case`}
              >
                <option value="">{t("All services", "सभी सेवाएँ")}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isHindi ? s.titleHi : s.titleEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {t("Plan", "प्लान")}
              <select
                value={rulePlan}
                onChange={(e) => setRulePlan(e.target.value)}
                disabled={!selectedService}
                className={`${input} w-full mt-1 normal-case`}
              >
                <option value="">{t("All plans", "सभी प्लान")}</option>
                {selectedService?.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isHindi ? p.titleHi : p.titleEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {t("Type", "प्रकार")}
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as "PERCENTAGE" | "FLAT")}
                className={`${input} w-full mt-1 normal-case`}
              >
                <option value="PERCENTAGE">{t("Percentage", "प्रतिशत")}</option>
                <option value="FLAT">{t("Fixed amount (Rs.)", "निश्चित राशि (Rs.)")}</option>
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {ruleType === "PERCENTAGE" ? t("Percent", "प्रतिशत") : t("Amount (Rs.)", "राशि (Rs.)")}
              <input
                type="number"
                min="0"
                step="0.01"
                value={ruleValue}
                onChange={(e) => setRuleValue(e.target.value)}
                className={`${input} w-full mt-1`}
                required
              />
            </label>
            <button type="submit" disabled={busy} className={btn}>
              {t("Save rule", "नियम सहेजें")}
            </button>
          </form>
          <p className="text-xs text-on-surface-variant">
            {t(
              "A plan rule overrides a service rule, which overrides the default. Commission is calculated on the booking amount before GST.",
              "प्लान का नियम सेवा के नियम को, और सेवा का नियम सामान्य नियम को बदलता है। कमीशन GST से पहले की बुकिंग राशि पर गिना जाता है।"
            )}
          </p>
          <div className="overflow-x-auto bg-surface border border-outline-variant/60 rounded">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left">
                <tr>
                  <th className="px-3 py-2.5">{t("Applies to", "लागू")}</th>
                  <th className="px-3 py-2.5">{t("Commission", "कमीशन")}</th>
                  <th className="px-3 py-2.5">{t("Active", "सक्रिय")}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-on-surface-variant">
                      {t("No rules yet. Associates earn nothing until a rule is set.", "अभी कोई नियम नहीं। नियम तय होने तक एसोसिएट को कमीशन नहीं मिलता।")}
                    </td>
                  </tr>
                )}
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2.5">{ruleScopeLabel(r)}</td>
                    <td className="px-3 py-2.5 font-semibold">
                      {r.type === "PERCENTAGE" ? `${r.value / 100}%` : formatPaiseToInr(r.value)}
                    </td>
                    <td className="px-3 py-2.5">{r.isActive ? t("Yes", "हाँ") : t("No", "नहीं")}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2 justify-end">
                        <button type="button" disabled={busy} className={btn} onClick={() => toggleRule(r)}>
                          {r.isActive ? t("Deactivate", "निष्क्रिय") : t("Activate", "सक्रिय करें")}
                        </button>
                        <button type="button" disabled={busy} className={btnGhost} onClick={() => deleteRule(r)}>
                          {t("Delete", "हटाएँ")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "payouts" && (
        <div className="overflow-x-auto bg-surface border border-outline-variant/60 rounded">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-left">
              <tr>
                <th className="px-3 py-2.5">{t("Associate", "एसोसिएट")}</th>
                <th className="px-3 py-2.5">{t("Amount", "राशि")}</th>
                <th className="px-3 py-2.5">{t("Requested", "अनुरोध")}</th>
                <th className="px-3 py-2.5">{t("Status", "स्थिति")}</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-on-surface-variant">
                    {t("No payout requests.", "कोई भुगतान अनुरोध नहीं।")}
                  </td>
                </tr>
              )}
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-secondary">{p.associate.user.name || p.associate.referralCode}</div>
                    <div className="text-xs text-on-surface-variant">{p.associate.user.phone || p.associate.user.email || ""}</div>
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{formatPaiseToInr(p.amountPaise)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-2.5">
                    {p.status === "REQUESTED" ? t("Requested", "अनुरोधित") : p.status === "PAID" ? `${t("Paid", "भुगतान किया गया")}${p.paymentReference ? ` (${p.paymentReference})` : ""}` : `${t("Declined", "अस्वीकृत")}${p.note ? `: ${p.note}` : ""}`}
                  </td>
                  <td className="px-3 py-2.5">
                    {p.status === "REQUESTED" && (
                      <div className="flex gap-2 justify-end">
                        <button type="button" disabled={busy} className={btn} onClick={() => decidePayout(p, "PAID")}>
                          {t("Mark paid", "भुगतान चिह्नित करें")}
                        </button>
                        <button type="button" disabled={busy} className={btnGhost} onClick={() => decidePayout(p, "REJECTED")}>
                          {t("Decline", "अस्वीकार")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
