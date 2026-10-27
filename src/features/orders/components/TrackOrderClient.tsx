"use client";

import { HelpEmail } from "@/components/content/HelpEmail";
import React, { useState } from "react";
import { OrderStatusStepper } from "./OrderStatusStepper";
import { CanonicalOrderStatus } from "@/lib/orders/status";
import { Link } from "@/i18n/routing";
import {
  Search,
  Phone,
  Hash,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Package,
} from "lucide-react";

interface TrackedOrderData {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: CanonicalOrderStatus;
  courierName?: string | null;
  trackingNumber?: string | null;
  paymentStatus: string;
  serviceTitleEn: string;
  serviceTitleHi: string;
  planTitleEn: string;
  planTitleHi: string;
  jatakaName: string;
  statusEvents: Array<{
    id: string;
    status: string;
    note?: string | null;
    createdAt: string;
    changedByName?: string | null;
  }>;
}

interface TrackOrderClientProps {
  locale: string;
  isLoggedIn: boolean;
}

export function TrackOrderClient({
  locale,
  isLoggedIn,
}: TrackOrderClientProps) {
  const isHindi = locale === "hi";

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<TrackedOrderData | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError(
        isHindi
          ? "कृपया आदेश संख्या और १०-अंकीय मोबाइल नंबर दोनों प्रविष्ट करें।"
          : "Please enter both order number and registered 10-digit mobile number."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setOrderResult(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrderResult(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error tracking order";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 text-left space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {isHindi ? "शुद्ध दृग्गणित ट्रैकिंग" : "Canonical Kundli Tracker"}
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "परामर्श एवं कुण्डली स्थिति ट्रैकर" : "Track Your Astrological Order"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "आदेश संख्या एवं पंजीकृत मोबाइल नंबर प्रविष्ट कर अपनी पत्रिका निर्माण व परामर्श की वास्तविक स्थिति जानें।"
            : "Enter your order number and registered phone number to verify real-time astrological progress."}
        </p>
      </div>

      {isLoggedIn && (
        <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-on-surface">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
            <span>
              {isHindi
                ? "आप लॉग इन हैं। अपने समस्त परामर्श आदेश अपने खाते में भी देख सकते हैं।"
                : "You are logged in. View all your active and past consultations in your account."}
            </span>
          </div>
          <Link
            href="/account"
            className="text-xs font-bold text-primary hover:underline shrink-0 ml-3"
          >
            {isHindi ? "डैशबोर्ड पर जाएँ →" : "View Dashboard →"}
          </Link>
        </div>
      )}

      {/* Tracker Lookup Form Card */}
      <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-5">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "आदेश संख्या (Order Number) *" : "Order Number *"}
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MKJK-2026-0001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs sm:text-sm font-mono focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "पंजीकृत मोबाइल नंबर (10 Digits) *" : "Registered Mobile Number *"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-on-surface-variant" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9827991224"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs sm:text-sm font-mono focus:border-secondary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? (isHindi ? "खोज जारी..." : "Tracking...") : (isHindi ? "स्थिति ट्रैक करें" : "Track Order Status")}</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-on-surface-variant">
          * {isHindi
            ? "गोपनीयता नियम: जातक की कुण्डली विवरण सुरक्षा हेतु आदेश संख्या के साथ पंजीकृत मोबाइल नंबर का सत्यापन अनिवार्य है।"
            : "Privacy requirement: Order verification strictly requires both Order Number and verified mobile number."}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-error-container/20 border border-error text-on-error-container text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Track Result Display */}
      {orderResult && (
        <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-primary/40 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div>
              <span className="font-mono text-xs font-bold text-secondary">
                {orderResult.orderNumber}
              </span>
              <h2 className="font-serif text-xl font-bold text-on-surface mt-0.5">
                {isHindi ? orderResult.serviceTitleHi : orderResult.serviceTitleEn}
              </h2>
              <p className="text-xs text-primary font-medium">
                {isHindi ? orderResult.planTitleHi : orderResult.planTitleEn} • {isHindi ? "जातक:" : "Customer:"} {orderResult.jatakaName}
              </p>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tertiary-fixed text-on-tertiary-fixed">
                {orderResult.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div>
            <h3 className="font-serif text-sm font-bold text-secondary mb-3">
              {isHindi ? "प्रक्रिया के ६ चरण" : "6-Stage Canonical Progress"}
            </h3>
            <OrderStatusStepper
              currentStatus={orderResult.status}
              events={orderResult.statusEvents}
              courierName={orderResult.courierName}
              trackingNumber={orderResult.trackingNumber}
              locale={locale}
            />
          </div>
        </div>
      )}
      <HelpEmail isHindi={isHindi} className="mt-4" />
    </div>
  );
}
