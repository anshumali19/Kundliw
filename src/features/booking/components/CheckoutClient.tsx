"use client";

import React, { useState } from "react";
import { SelectedFilePreview } from "@/components/content/FileViewer";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Upload,
} from "lucide-react";
import { formatPaiseToInr } from "@/lib/billing/gst";

interface CheckoutClientProps {
  order: {
    id: string;
    orderNumber: string;
    baseAmountPaise: number;
    discountAmountPaise: number;
    gstAmountPaise: number;
    netAmountPaise: number;
    offerCode?: string | null;
    serviceTitle: string;
    planTitle: string;
    jatakaName: string;
    rejectionReason?: string | null;
    slotTime?: string | null;
  };
  adminSettings: {
    upiVpa?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankIfsc?: string | null;
    bankName?: string | null;
    qrCodeUrl?: string | null;
  };
  locale: string;
  /** "demo" only on a developer machine; a live site shows manual UPI / bank payment until a real gateway is connected. */
  gatewayMode?: "demo" | "off";
}

export function CheckoutClient({
  order,
  adminSettings,
  locale,
  gatewayMode = "off",
}: CheckoutClientProps) {
  const router = useRouter();
  const tCheckout = useTranslations("checkout");
  const tBooking = useTranslations("booking");
  const isHindi = locale === "hi";

  const [paymentMethod, setPaymentMethod] = useState<"GATEWAY" | "UPI" | "BANK">(
    gatewayMode === "demo" ? "GATEWAY" : adminSettings.upiVpa || adminSettings.qrCodeUrl ? "UPI" : "BANK"
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Manual payment form fields
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleCopyVpa = () => {
    if (adminSettings.upiVpa) {
      navigator.clipboard.writeText(adminSettings.upiVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
    }
  };

  const handleSimulatePayment = async (action: "SIMULATE_SUCCESS" | "SIMULATE_FAILURE") => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/payments/demo/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment simulation failed.");
      }

      if (action === "SIMULATE_SUCCESS") {
        router.push(`/${locale}/booking/success/${order.id}`);
      } else {
        setErrorMessage(
          isHindi
            ? "भुगतान अनुकरण विफल रहा। आप पुनः प्रयास कर सकते हैं अथवा बैंक/यूपीआई विकल्प चुन सकते हैं।"
            : "Simulated payment was declined. You can retry or choose direct UPI/Bank transfer."
        );
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const handleManualSubmit = async (mode: "MANUAL_UPI" | "MANUAL_BANK") => {
    if (!referenceNumber.trim()) {
      setErrorMessage(
        isHindi
          ? "कृपया भुगतान संदर्भ संख्या (UTR / Transaction ID) प्रविष्ट करें।"
          : "Please enter the payment transaction reference number (UTR / Ref ID)."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("paymentMode", mode);
      formData.append("manualPaymentRef", referenceNumber.trim());
      if (proofFile) {
        formData.append("proofFile", proofFile);
      }

      const res = await fetch("/api/payments/manual/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit manual payment.");
      }

      router.push(`/${locale}/booking/success/${order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 text-left text-on-surface">
      {/* Header Stepper Banner */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
          <span>{isHindi ? "चरण ३: दक्षिणा भुगतान" : "Step 3: Dakshina Payment"}</span>
          <span className="text-primary font-bold">{order.orderNumber}</span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div className="bg-brand h-full w-full"></div>
        </div>
      </div>

      {order.rejectionReason && (
        <div className="mb-6 p-4 rounded-lg bg-brand/20 border-2 border-brand text-primary flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-primary">
              {isHindi ? "पूर्व मैनुअल भुगतान अस्वीकृत किया गया" : "Previous Manual Payment Verification Failed"}
            </h4>
            <p className="text-xs text-primary mt-0.5">
              <strong>{isHindi ? "कारण:" : "Reason:"}</strong> {order.rejectionReason}
            </p>
            <p className="text-[11px] text-primary mt-1">
              {isHindi
                ? "कृपया सही संदर्भ (UTR) दर्ज कर पुनः विवरण भेजें अथवा ऑनलाइन गेटवे का उपयोग करें।"
                : "Please resubmit with a valid UTR transaction reference, or complete your contribution via the online gateway."}
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-error-container/20 border border-error text-on-error-container flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Asymmetric 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-surface-container rounded-lg p-5 border border-outline-variant/60 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-primary font-bold block">
                {isHindi ? "परामर्श सेवा विवरण" : "Service & Dakshina Summary"}
              </span>
              <h2 className="font-serif text-lg font-bold text-secondary mt-0.5">
                {order.serviceTitle}
              </h2>
              <p className="text-xs text-on-surface-variant">{order.planTitle}</p>
            </div>

            <div className="border-t border-b border-outline-variant/40 py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  {isHindi ? "जातक नाम:" : "Jataka Name:"}
                </span>
                <span className="font-semibold text-on-surface">{order.jatakaName}</span>
              </div>
              {order.slotTime && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">
                    {isHindi ? "परामर्श काल:" : "Consultation Slot:"}
                  </span>
                  <span className="font-semibold text-primary">{order.slotTime}</span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>{isHindi ? "मूल दक्षिणा:" : "Base Dakshina:"}</span>
                <span>{formatPaiseToInr(order.baseAmountPaise)}</span>
              </div>

              {order.discountAmountPaise > 0 && (
                <div className="flex justify-between text-secondary font-medium">
                  <span>
                    {isHindi ? "अनुदान छूट" : "Offer Discount"} ({order.offerCode}):
                  </span>
                  <span>- {formatPaiseToInr(order.discountAmountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between text-on-surface-variant">
                <span>{isHindi ? "जीएसटी (GST @ 18%):" : "GST (18%):"}</span>
                <span>{formatPaiseToInr(order.gstAmountPaise)}</span>
              </div>

              <div className="pt-2 border-t border-outline-variant/40 flex items-baseline justify-between bg-surface-container-lowest p-3 rounded">
                <div>
                  <span className="text-xs uppercase font-bold text-secondary block">
                    {isHindi ? "कुल देय दक्षिणा" : "Net Auspicious Dakshina"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    {isHindi ? "भारतीय रुपये (INR)" : "Indian Rupees"}
                  </span>
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  {formatPaiseToInr(order.netAmountPaise)}
                </span>
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2.5 text-xs text-on-surface-variant bg-surface-container-low p-3 rounded border border-outline-variant/30">
            <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
            <span>
              {isHindi
                ? "२५६-बिट सुरक्षित भुगतान प्रणाली। सम्पूर्ण दक्षिणा वैदिक केंद्र न्यास के अधिकृत खाते में संचित होती है।"
                : "256-bit secure transaction. All auspicious contributions flow directly to the official Kendra Trust."}
            </span>
          </div>
        </div>

        {/* Right Column: Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-serif text-lg font-bold text-secondary">
            {isHindi ? "भुगतान प्रणाली चयन" : "Select Auspicious Payment Mode"}
          </h2>

          {gatewayMode === "demo" && (
          <>
          {/* Mode 1: Online Gateway (Demo) */}
          <div
            onClick={() => setPaymentMethod("GATEWAY")}
            className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
              paymentMethod === "GATEWAY"
                ? "border-primary bg-surface-container-lowest shadow-sm"
                : "border-outline-variant/60 bg-surface-container-low hover:border-outline"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === "GATEWAY"}
                  onChange={() => setPaymentMethod("GATEWAY")}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-on-surface">
                      {isHindi
                        ? "त्वरित ऑनलाइन गेटवे (UPI / Card / Netbanking)"
                        : "Instant Online Gateway (UPI / Card / Netbanking)"}
                    </span>
                    <span className="px-2 py-0.5 bg-brand/20 text-primary border border-brand rounded text-[10px] font-bold uppercase tracking-wider">
                      Demo
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {isHindi
                      ? "ग्राहक डेमो परीक्षण हेतु त्वरित सिमुलेशन मोड। वास्तविक गेटवे (Razorpay) केवल एक फाइल कॉन्फ़िगरेशन से सक्रिय हो जाता है।"
                      : "Simulation mode for client MVP demonstration. Real Razorpay gateway is ready behind the lib/payments adapter."}
                  </p>
                </div>
              </div>
              <CreditCard className="w-6 h-6 text-primary shrink-0" />
            </div>

            {paymentMethod === "GATEWAY" && (
              <div className="mt-5 pt-4 border-t border-outline-variant/40 space-y-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSimulatePayment("SIMULATE_SUCCESS")}
                  className="w-full min-h-[44px] px-5 py-3 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isHindi
                      ? `सिमुलेट सफल भुगतान (${formatPaiseToInr(order.netAmountPaise)})`
                      : `Simulate Payment Success (${formatPaiseToInr(order.netAmountPaise)})`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSimulatePayment("SIMULATE_FAILURE")}
                  className="w-full min-h-[44px] px-5 py-2.5 bg-surface hover:bg-surface-container border border-error text-on-error-container font-semibold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {isHindi ? "सिमुलेट भुगतान विफलता" : "Simulate Payment Failure"}
                  </span>
                </button>
              </div>
            )}
          </div>
          </>
          )}

          {/* Mode 2: Direct UPI */}
          <div
            onClick={() => setPaymentMethod("UPI")}
            className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
              paymentMethod === "UPI"
                ? "border-primary bg-surface-container-lowest shadow-sm"
                : "border-outline-variant/60 bg-surface-container-low hover:border-outline"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === "UPI"}
                  onChange={() => setPaymentMethod("UPI")}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-on-surface">
                      {isHindi
                        ? "प्रत्यक्ष केंद्र यूपीआई (Direct Kendra UPI VPA)"
                        : "Direct Kendra UPI VPA"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {isHindi
                      ? "केंद्र के अधिकृत यूपीआई पते पर सीधे दक्षिणा प्रेषित कर संदर्भ संख्या दर्ज करें।"
                      : "Send auspicious dakshina directly to the Kendra UPI address and submit the UTR."}
                  </p>
                </div>
              </div>
              <QrCode className="w-6 h-6 text-secondary shrink-0" />
            </div>

            {paymentMethod === "UPI" && (
              <div className="mt-5 pt-4 border-t border-outline-variant/40 space-y-4">
                <div className="bg-surface-container p-3 rounded flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-outline block">
                      {isHindi ? "केंद्र यूपीआई आईडी" : "Kendra UPI VPA"}
                    </span>
                    <span className="font-mono font-bold text-sm text-primary select-all">
                      {adminSettings.upiVpa || "kanadjyotish@sbi"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="min-h-[44px] px-3 py-1.5 bg-surface-container-highest text-on-surface text-xs font-semibold rounded flex items-center gap-1.5 hover:bg-surface-container-high"
                  >
                    {copiedVpa ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-secondary" />
                        <span>{isHindi ? "प्रतिलिपि बन गई" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isHindi ? "कॉपी करें" : "Copy"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      {isHindi
                        ? "यूपीआई संदर्भ / UTR संख्या *"
                        : "UPI UTR / Reference Number *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 439281928410"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-sm font-mono focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      {isHindi
                        ? "भुगतान स्क्रीनशॉट / रसीद (वैकल्पिक)"
                        : "Payment Screenshot / Proof (Optional)"}
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-container-high file:text-on-surface hover:file:bg-surface-container-highest"
                    />
                    </div>
                    <SelectedFilePreview
                      file={proofFile}
                      emptyText={isHindi ? "चुनी हुई रसीद यहाँ दिखेगी।" : "The receipt you choose appears here."}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleManualSubmit("MANUAL_UPI")}
                    className="w-full min-h-[44px] px-5 py-3 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {isHindi ? "यूपीआई विवरण जमा करें" : "Submit UPI Details for Verification"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode 3: Bank Transfer */}
          <div
            onClick={() => setPaymentMethod("BANK")}
            className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
              paymentMethod === "BANK"
                ? "border-primary bg-surface-container-lowest shadow-sm"
                : "border-outline-variant/60 bg-surface-container-low hover:border-outline"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === "BANK"}
                  onChange={() => setPaymentMethod("BANK")}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-on-surface">
                      {isHindi
                        ? "बैंक अंतरण (NEFT / RTGS / IMPS)"
                        : "Bank Wire Transfer (NEFT / RTGS / IMPS)"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {isHindi
                      ? "बृहद परामर्श अथवा प्रवासी ग्राहकों हेतु केंद्र का बैंक खाता।"
                      : "Direct bank transfer for major Vedic consultations and overseas clients."}
                  </p>
                </div>
              </div>
              <Building className="w-6 h-6 text-secondary shrink-0" />
            </div>

            {paymentMethod === "BANK" && (
              <div className="mt-5 pt-4 border-t border-outline-variant/40 space-y-4">
                <div className="bg-surface-container p-3 rounded space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {isHindi ? "खाता धारक:" : "Account Name:"}
                    </span>
                    <span className="font-semibold text-on-surface">
                      {adminSettings.bankAccountName || "Maharshi Kanad Jyotish Trust"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {isHindi ? "बैंक व शाखा:" : "Bank & Branch:"}
                    </span>
                    <span className="font-semibold text-on-surface">
                      {adminSettings.bankName || ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {isHindi ? "खाता संख्या:" : "Account Number:"}
                    </span>
                    <span className="font-mono font-bold text-on-surface select-all">
                      {adminSettings.bankAccountNumber || "389201928410"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {isHindi ? "आईएफएससी (IFSC):" : "IFSC Code:"}
                    </span>
                    <span className="font-mono font-bold text-primary select-all">
                      {adminSettings.bankIfsc || "SBIN0000201"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      {isHindi
                        ? "बैंक अंतरण संदर्भ / ट्रांजैक्शन संख्या *"
                        : "Bank Wire Reference / Transaction ID *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN4928192841"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-sm font-mono focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      {isHindi
                        ? "बैंक अंतरण रसीद (वैकल्पिक)"
                        : "Bank Transfer Receipt / Slip (Optional)"}
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-container-high file:text-on-surface hover:file:bg-surface-container-highest"
                    />
                    </div>
                    <SelectedFilePreview
                      file={proofFile}
                      emptyText={isHindi ? "चुनी हुई रसीद यहाँ दिखेगी।" : "The receipt you choose appears here."}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleManualSubmit("MANUAL_BANK")}
                    className="w-full min-h-[44px] px-5 py-3 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {isHindi ? "बैंक विवरण जमा करें" : "Submit Bank Details for Verification"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
