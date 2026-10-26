"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { Copy, Share2, Wallet, FileDown } from "lucide-react";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { PayoutDetails } from "./PayoutDetails";

interface Summary {
  profile: { status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"; referralCode: string; rejectionReason: string | null };
  earnings: { pendingPaise: number; availablePaise: number; requestedPaise: number; paidPaise: number; referredOrders: number };
  commissions: Array<{
    id: string;
    amountPaise: number;
    status: "PENDING" | "EARNED" | "PAID" | "CANCELLED";
    order: { orderNumber: string; createdAt: string; service: { titleEn: string; titleHi: string } | null };
  }>;
  payouts: Array<{
    id: string;
    amountPaise: number;
    status: "REQUESTED" | "PAID" | "REJECTED";
    createdAt: string;
    paymentReference: string | null;
    note: string | null;
  }>;
}

export function AssociateDashboard({ locale, siteUrl }: { locale: string; siteUrl: string }) {
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/associate/summary");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load.");
      setData(json);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const referralLink = data ? `${siteUrl}/r/${data.profile.referralCode}` : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({ type: "error", text: t("Could not copy. Please copy the link manually.", "कॉपी नहीं हो सका। कृपया लिंक स्वयं कॉपी करें।") });
    }
  };

  const requestPayout = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/associate/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed.");
      setMessage({ type: "ok", text: t("Payout request sent. The Kendra will review it.", "भुगतान अनुरोध भेज दिया गया। केंद्र इसकी समीक्षा करेगा।") });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Request failed." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-on-surface-variant">{t("Loading...", "लोड हो रहा है...")}</div>;
  }
  if (!data) {
    return <div className="py-16 text-center text-on-surface-variant">{message?.text}</div>;
  }

  const { profile, earnings } = data;
  const approved = profile.status === "APPROVED";
  const statusLabel: Record<string, string> = {
    PENDING: t("Awaiting approval", "स्वीकृति की प्रतीक्षा"),
    APPROVED: t("Approved", "स्वीकृत"),
    REJECTED: t("Not approved", "स्वीकृत नहीं"),
    SUSPENDED: t("Suspended", "निलंबित"),
  };
  const commissionLabel: Record<string, string> = {
    PENDING: t("Pending payment", "भुगतान प्रतीक्षित"),
    EARNED: t("Earned", "अर्जित"),
    PAID: t("Paid", "भुगतान किया गया"),
    CANCELLED: t("Cancelled", "रद्द"),
  };
  const payoutLabel: Record<string, string> = {
    REQUESTED: t("Under review", "समीक्षाधीन"),
    PAID: t("Paid", "भुगतान किया गया"),
    REJECTED: t("Declined", "अस्वीकृत"),
  };

  const card = "bg-surface border border-outline-variant/60 rounded-lg p-4";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
            {t("Associate Dashboard", "एसोसिएट डैशबोर्ड")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t("Share your link, track referred bookings and request payouts.", "अपना लिंक साझा करें, रेफ़र किए गए बुकिंग देखें और भुगतान का अनुरोध करें।")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 rounded-full border-2 border-maroon bg-brand text-on-brand text-sm font-bold">
            {statusLabel[profile.status]}
          </span>
          <SignOutButton label={t("Log out", "लॉग आउट")} />
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={`p-3 rounded border text-sm ${message.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}
        >
          {message.text}
        </div>
      )}

      {!approved && (
        <div className={`${card} border-2 border-brand`}>
          <p className="text-sm">
            {profile.status === "PENDING" &&
              t(
                "Your account is created. The Kendra will review and approve it. Your referral link and earnings will be active after approval.",
                "आपका खाता बन गया है। केंद्र इसकी समीक्षा कर स्वीकृत करेगा। स्वीकृति के बाद आपका रेफ़रल लिंक और आय सक्रिय हो जाएगी।"
              )}
            {profile.status === "REJECTED" &&
              `${t("Your application was not approved.", "आपका आवेदन स्वीकृत नहीं हुआ।")} ${profile.rejectionReason || ""}`}
            {profile.status === "SUSPENDED" &&
              t("Your associate account is suspended. Please contact the Kendra.", "आपका एसोसिएट खाता निलंबित है। कृपया केंद्र से संपर्क करें।")}
          </p>
        </div>
      )}

      {approved && (
        <div className={card}>
          <h2 className="font-bold text-secondary mb-2">{t("Your referral link", "आपका रेफ़रल लिंक")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-[220px] px-3 py-2.5 rounded bg-surface-container text-sm break-all">{referralLink}</code>
            <button
              type="button"
              onClick={copyLink}
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold border border-maroon"
            >
              <Copy className="w-4 h-4" />
              {copied ? t("Copied", "कॉपी हुआ") : t("Copy", "कॉपी")}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded border border-maroon text-sm font-bold text-secondary hover:bg-gold"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            {t("Code:", "कोड:")} <strong>{profile.referralCode}</strong>.{" "}
            {t(
              "A booking made within 30 days of someone opening your link is credited to you.",
              "आपका लिंक खोलने के 30 दिनों के भीतर किया गया बुकिंग आपके नाम दर्ज होगा।"
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [t("Referred bookings", "रेफ़र किए बुकिंग"), String(earnings.referredOrders)],
          [t("Pending", "लंबित"), formatPaiseToInr(earnings.pendingPaise)],
          [t("Available", "उपलब्ध"), formatPaiseToInr(earnings.availablePaise)],
          [t("Paid so far", "अब तक भुगतान"), formatPaiseToInr(earnings.paidPaise)],
        ].map(([label, value]) => (
          <div key={label} className={`${card} border-t-4 border-t-signal`}>
            <div className="text-xs uppercase tracking-wider text-on-surface-variant">{label}</div>
            <div className="text-xl font-bold text-secondary mt-1">{value}</div>
          </div>
        ))}
      </div>

      {approved && (
        <div className={`${card} flex flex-wrap items-center justify-between gap-3`}>
          <div className="text-sm">
            <div className="font-bold text-secondary flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {t("Payout", "भुगतान")}
            </div>
            <p className="text-on-surface-variant mt-1">
              {earnings.requestedPaise > 0
                ? `${t("Requested", "अनुरोधित")}: ${formatPaiseToInr(earnings.requestedPaise)}. ${t("The Kendra reviews it and pays you directly.", "केंद्र समीक्षा कर सीधे आपको भुगतान करेगा।")}`
                : t("The Kendra pays you directly after reviewing your request.", "केंद्र आपके अनुरोध की समीक्षा के बाद सीधे भुगतान करता है।")}
            </p>
          </div>
          <button
            type="button"
            onClick={requestPayout}
            disabled={busy || earnings.availablePaise <= 0}
            className="min-h-[44px] px-5 rounded bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold border border-maroon disabled:opacity-50"
          >
            {t("Request payout", "भुगतान का अनुरोध करें")} ({formatPaiseToInr(earnings.availablePaise)})
          </button>
        </div>
      )}

      {approved && <PayoutDetails isHindi={isHindi} />}

      <div className={card}>
        <h2 className="font-bold text-secondary mb-3">{t("Referred bookings and commission", "रेफ़र किए बुकिंग और कमीशन")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-surface-container-low">
              <tr>
                <th className="px-3 py-2">{t("Order", "ऑर्डर")}</th>
                <th className="px-3 py-2">{t("Service", "सेवा")}</th>
                <th className="px-3 py-2">{t("Date", "तारीख")}</th>
                <th className="px-3 py-2">{t("Commission", "कमीशन")}</th>
                <th className="px-3 py-2">{t("Status", "स्थिति")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {data.commissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-on-surface-variant">
                    {t("No referred bookings yet.", "अभी कोई रेफ़र किया हुआ बुकिंग नहीं।")}
                  </td>
                </tr>
              )}
              {data.commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 font-mono text-xs">{c.order.orderNumber}</td>
                  <td className="px-3 py-2">{c.order.service ? (isHindi ? c.order.service.titleHi : c.order.service.titleEn) : "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(c.order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-2 font-semibold">{formatPaiseToInr(c.amountPaise)}</td>
                  <td className="px-3 py-2">{commissionLabel[c.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-bold text-secondary mb-3">{t("Payout history", "भुगतान इतिहास")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-surface-container-low">
              <tr>
                <th className="px-3 py-2">{t("Date", "तारीख")}</th>
                <th className="px-3 py-2">{t("Amount", "राशि")}</th>
                <th className="px-3 py-2">{t("Status", "स्थिति")}</th>
                <th className="px-3 py-2">{t("Reference", "संदर्भ")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {data.payouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-on-surface-variant">
                    {t("No payout requests yet.", "अभी कोई भुगतान अनुरोध नहीं।")}
                  </td>
                </tr>
              )}
              {data.payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-2 font-semibold">{formatPaiseToInr(p.amountPaise)}</td>
                  <td className="px-3 py-2">{payoutLabel[p.status]}</td>
                  <td className="px-3 py-2">{p.paymentReference || p.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <a
        href={`/${locale}/guides/associate`}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded border border-maroon text-sm font-bold text-secondary hover:bg-gold"
      >
        <FileDown className="w-4 h-4" />
        {t("Download the Associate guide (PDF)", "एसोसिएट मार्गदर्शिका (PDF) डाउनलोड करें")}
      </a>
    </div>
  );
}
