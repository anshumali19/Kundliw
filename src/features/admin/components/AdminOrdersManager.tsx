"use client";

import React, { useState } from "react";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { CanonicalOrderStatus } from "@/lib/orders/status";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Truck,
} from "lucide-react";

export interface SerializedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: CanonicalOrderStatus;
  paymentMode: string;
  paymentStatus: string;
  manualPaymentRef?: string | null;
  manualPaymentProof?: string | null;
  baseAmountPaise: number;
  discountAmountPaise: number;
  netAmountPaise: number;
  invoiceNumber?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  appointmentStatus?: string | null;
  appointmentNote?: string | null;
  appointmentSlot?: string | null;
  associateId?: string | null;
  jatakaName: string;
  jatakaPhone: string;
  serviceTitle: string;
  planTitle: string;
  statusEvents: Array<{
    id: string;
    status: string;
    note?: string | null;
    createdAt: string;
    changedByName?: string | null;
  }>;
}

interface AdminOrdersManagerProps {
  orders: SerializedOrder[];
  locale: string;
  associates?: Array<{ id: string; label: string }>;
}

const ALL_STATUSES: CanonicalOrderStatus[] = [
  "ORDER_RECEIVED",
  "KUNDLI_IN_PROGRESS",
  "KUNDLI_COMPLETE",
  "DISPATCHED",
  "DELIVERED",
  "EXECUTION_COMPLETE",
];

export function AdminOrdersManager({
  orders: initialOrders,
  locale,
  associates = [],
}: AdminOrdersManagerProps) {
  const isHindi = locale === "hi";
  const [orders, setOrders] = useState<SerializedOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "AWAITING" | "PAID" | "PROGRESS" | "COMPLETE">("ALL");

  const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(null);
  const [nextStatus, setNextStatus] = useState<CanonicalOrderStatus>("KUNDLI_IN_PROGRESS");
  const [statusNote, setStatusNote] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter orders
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.jatakaName.toLowerCase().includes(q) ||
      o.jatakaPhone.includes(q);

    if (!matchesSearch) return false;

    if (filter === "AWAITING") return o.paymentStatus === "AWAITING_VERIFICATION";
    if (filter === "PAID") return o.paymentStatus === "PAID";
    if (filter === "PROGRESS") return ["ORDER_RECEIVED", "KUNDLI_IN_PROGRESS", "KUNDLI_COMPLETE", "DISPATCHED"].includes(o.status);
    if (filter === "COMPLETE") return ["DELIVERED", "EXECUTION_COMPLETE"].includes(o.status);
    return true;
  });

  const handleVerifyPayment = async (orderId: string, action: "APPROVE" | "REJECT") => {
    let reason = "";
    if (action === "REJECT") {
      const promptReason = window.prompt(
        isHindi
          ? "कृपया अस्वीकृति का कारण प्रविष्ट करें:"
          : "Please enter the rejection reason:"
      );
      if (!promptReason) return;
      reason = promptReason;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify payment");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                paymentStatus: action === "APPROVE" ? "PAID" : "FAILED",
              }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, paymentStatus: action === "APPROVE" ? "PAID" : "FAILED" } : null
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying payment";
      setActionError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppointment = async (orderId: string, status: "APPROVED" | "REJECTED" | "COMPLETED") => {
    let note = "";
    if (status === "REJECTED") {
      const reason = window.prompt(
        isHindi ? "अस्वीकृति का कारण लिखें:" : "Please enter the reason for rejecting this appointment:"
      );
      if (!reason) return;
      note = reason;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/appointment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update appointment");
      const patch = { appointmentStatus: status, appointmentNote: note || null };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, ...patch } : prev));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error updating appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAssociate = async (orderId: string, associateId: string | null) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign-associate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ associateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign associate");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, associateId } : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, associateId } : prev));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error assigning associate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!statusNote.trim()) {
      setActionError(
        isHindi
          ? "स्थिति परिवर्तन हेतु प्रशासनिक टिप्पणी (Note) अनिवार्य है।"
          : "An administrative note is required for every status transition."
      );
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus,
          note: statusNote.trim(),
          courierName: courierName.trim() || undefined,
          trackingNumber: trackingNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: nextStatus,
                courierName: courierName.trim() || o.courierName,
                trackingNumber: trackingNumber.trim() || o.trackingNumber,
              }
            : o
        )
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus,
              courierName: courierName.trim() || prev.courierName,
              trackingNumber: trackingNumber.trim() || prev.trackingNumber,
              statusEvents: [
                {
                  id: `temp_${Date.now()}`,
                  status: nextStatus,
                  note: statusNote.trim(),
                  createdAt: new Date().toISOString(),
                  changedByName: "Admin",
                },
                ...prev.statusEvents,
              ],
            }
          : null
      );

      setStatusNote("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      setActionError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full text-left space-y-6">
      {/* Top Bar: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={
              isHindi
                ? "आदेश संख्या, जातक नाम या मोबाइल से खोजें..."
                : "Search by Order Number, Jataka Name, or Phone..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-surface border border-outline-variant rounded-md text-xs sm:text-sm focus:border-secondary focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", labelEn: "All Orders", labelHi: "सभी आदेश" },
            { id: "AWAITING", labelEn: "Awaiting Verification", labelHi: "सत्यापन शेष" },
            { id: "PAID", labelEn: "Paid", labelHi: "भुगतान प्राप्त" },
            { id: "PROGRESS", labelEn: "In Progress", labelHi: "प्रगति में" },
            { id: "COMPLETE", labelEn: "Completed", labelHi: "सम्पन्न" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`min-h-[44px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === tab.id
                  ? "bg-brand text-on-brand"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {isHindi ? tab.labelHi : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded bg-error-container/20 border border-error text-on-error-container text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Grid: Order List (Left) + Detail & Action Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Orders Table / Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-surface-container rounded-lg border border-outline-variant/40 text-on-surface-variant text-sm">
              {isHindi ? "कोई आदेश नहीं मिला।" : "No matching orders found."}
            </div>
          ) : (
            filtered.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? "border-primary bg-surface shadow-sm"
                      : "border-outline-variant/50 bg-surface-container-low hover:border-outline"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/30">
                    <div>
                      <span className="font-mono text-xs font-bold text-secondary">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-on-surface-variant ml-2">
                        {new Date(order.createdAt).toLocaleDateString(
                          isHindi ? "hi-IN" : "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Payment Status Badge */}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.paymentStatus === "AWAITING_VERIFICATION"
                            ? "bg-brand/20 text-primary border border-brand"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>

                      {/* Order Status Badge */}
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-tertiary-fixed text-on-tertiary-fixed">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-on-surface-variant block">
                        {isHindi ? "जातक:" : "Jataka:"}
                      </span>
                      <span className="font-semibold text-on-surface">
                        {order.jatakaName} ({order.jatakaPhone})
                      </span>
                    </div>

                    <div>
                      <span className="text-on-surface-variant block">
                        {isHindi ? "सेवा / संस्करण:" : "Service & Plan:"}
                      </span>
                      <span className="font-semibold text-secondary truncate block">
                        {order.serviceTitle} • {order.planTitle}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">
                      {order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED" ? (isHindi ? "भुगतान बाकी" : "Not paid yet") : order.paymentMode.replace(/_/g, " ")} • {formatPaiseToInr(order.netAmountPaise)}
                    </span>

                    {order.paymentStatus === "AWAITING_VERIFICATION" && (
                      <span className="text-primary font-bold flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Ref: {order.manualPaymentRef}</span>
                      </span>
                    )}

                    {order.invoiceNumber && (
                      <span className="text-[11px] font-mono text-outline">
                        {order.invoiceNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Order Details & Action Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="bg-surface p-5 rounded-lg border-2 border-secondary/30 shadow-sm space-y-6 text-left">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {isHindi ? "प्रशासनिक कार्यशाला" : "Order Administration"}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-secondary mt-1">
                  {selectedOrder.serviceTitle}
                </h3>
                <p className="text-xs text-on-surface-variant">{selectedOrder.planTitle}</p>
              </div>

              {/* Payment Verification Section if Awaiting */}
              {selectedOrder.paymentStatus === "AWAITING_VERIFICATION" && (
                <div className="p-4 rounded-lg bg-brand/20 border-2 border-brand space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{isHindi ? "मैनुअल भुगतान सत्यापन" : "Verify Manual Payment"}</span>
                  </div>

                  <div className="text-xs text-primary space-y-1">
                    <div className="flex justify-between">
                      <span className="text-primary">{isHindi ? "मोड:" : "Mode:"}</span>
                      <span className="font-semibold">{selectedOrder.paymentMode.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary">{isHindi ? "संदर्भ संख्या:" : "Reference:"}</span>
                      <span className="font-mono font-bold">{selectedOrder.manualPaymentRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary">{isHindi ? "शुद्ध दक्षिणा:" : "Amount:"}</span>
                      <span className="font-bold">{formatPaiseToInr(selectedOrder.netAmountPaise)}</span>
                    </div>
                  </div>

                  {selectedOrder.manualPaymentProof && (
                    <a
                      href={selectedOrder.manualPaymentProof}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-secondary font-bold underline hover:text-primary pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isHindi ? "अपलोड की गई रसीद देखें" : "View Uploaded Receipt Proof"}</span>
                    </a>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleVerifyPayment(selectedOrder.id, "APPROVE")}
                      className="min-h-[44px] px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? "स्वीकृत (Approve)" : "Approve"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleVerifyPayment(selectedOrder.id, "REJECT")}
                      className="min-h-[44px] px-3 py-2 bg-surface hover:bg-surface-container border border-error text-on-error-container text-xs font-bold uppercase rounded flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isHindi ? "अस्वीकृत (Reject)" : "Reject"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Appointment approval (orders with a booked slot) */}
              {selectedOrder.appointmentStatus && (
                <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-secondary">
                      {isHindi ? "अपॉइंटमेंट" : "Appointment"}
                    </span>
                    <span className="font-bold text-primary">{selectedOrder.appointmentStatus}</span>
                  </div>
                  {selectedOrder.appointmentSlot && (
                    <p className="text-xs text-on-surface">{selectedOrder.appointmentSlot}</p>
                  )}
                  {selectedOrder.appointmentNote && (
                    <p className="text-xs text-on-surface-variant">{selectedOrder.appointmentNote}</p>
                  )}
                  {(selectedOrder.appointmentStatus === "PENDING" ||
                    selectedOrder.appointmentStatus === "APPROVED") && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedOrder.appointmentStatus === "PENDING" && (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleAppointment(selectedOrder.id, "APPROVED")}
                          className="min-h-[44px] px-2 py-2 bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase rounded disabled:opacity-50"
                        >
                          {isHindi ? "स्वीकृत" : "Approve"}
                        </button>
                      )}
                      {selectedOrder.appointmentStatus === "APPROVED" && (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleAppointment(selectedOrder.id, "COMPLETED")}
                          className="min-h-[44px] px-2 py-2 bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase rounded disabled:opacity-50"
                        >
                          {isHindi ? "पूर्ण" : "Complete"}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleAppointment(selectedOrder.id, "REJECTED")}
                        className="min-h-[44px] px-2 py-2 bg-surface border border-error text-on-error-container text-xs font-bold uppercase rounded disabled:opacity-50"
                      >
                        {isHindi ? "अस्वीकृत" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Associate assignment */}
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary block">
                  {isHindi ? "एसोसिएट" : "Associate"}
                </span>
                <select
                  value={selectedOrder.associateId || ""}
                  disabled={submitting}
                  onChange={(e) => handleAssignAssociate(selectedOrder.id, e.target.value || null)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs font-semibold"
                >
                  <option value="">{isHindi ? "कोई नहीं" : "None"}</option>
                  {associates.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdate} className="space-y-4 pt-3 border-t border-outline-variant/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {isHindi ? "प्रक्रिया स्थिति अद्यतन" : "Update Canonical Status"}
                  </span>
                  <span className="text-[11px] text-primary font-bold">
                    {selectedOrder.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "अगली स्थिति चुनें *" : "Select Next Status *"}
                  </label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as CanonicalOrderStatus)}
                    className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs font-semibold focus:border-secondary focus:outline-none"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {nextStatus === "DISPATCHED" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                        {isHindi ? "कूरियर / सेवा प्रदाता नाम" : "Courier / Carrier Name"}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. India Post, Blue Dart, DTDC"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                        {isHindi ? "कूरियर ट्रैकिंग / कंसाइनमेंट संख्या" : "Tracking / Consignment ID"}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ED123456789IN"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "प्रशासनिक टिप्पणी (अनिवार्य) *" : "Administrative Note (Required) *"}
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder={
                      isHindi
                        ? "जैसे: षोडशवर्ग चक्र गणना पूर्ण, दैवज्ञ समीक्षा हेतु प्रेषित।"
                        : "e.g., Shodashvarga calculations verified by senior Jyotishi."
                    }
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isHindi ? "स्थिति अद्यतन सुरक्षित करें" : "Commit Status Transition"}</span>
                </button>
              </form>

              {/* Status Event Timeline */}
              <div className="pt-3 border-t border-outline-variant/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
                  {isHindi ? "इतिहास एवं घटनाक्रम (Audit Trail)" : "Status Audit Trail"}
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto overscroll-contain pr-1">
                  {selectedOrder.statusEvents.length === 0 ? (
                    <span className="text-xs text-on-surface-variant">No events logged yet.</span>
                  ) : (
                    selectedOrder.statusEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-2.5 rounded bg-surface-container-low text-xs border border-outline-variant/30 space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] text-outline">
                          <span className="font-bold text-secondary">
                            {evt.status.replace(/_/g, " ")}
                          </span>
                          <span>
                            {new Date(evt.createdAt).toLocaleString(
                              isHindi ? "hi-IN" : "en-IN"
                            )}
                          </span>
                        </div>
                        {evt.note && <p className="text-on-surface mt-0.5">{evt.note}</p>}
                        {evt.changedByName && (
                          <span className="text-[10px] text-primary block">
                            By: {evt.changedByName}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-container rounded-lg border border-outline-variant/40 text-on-surface-variant text-sm">
              {isHindi
                ? "विवरण देखने अथवा स्थिति बदलने हेतु बाएँ से कोई आदेश चुनें।"
                : "Select an order from the list to view particulars or advance its status."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
