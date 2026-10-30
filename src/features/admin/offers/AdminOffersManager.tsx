"use client";

import { useState } from "react";
import { InfoTip } from "@/components/admin/InfoTip";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { paiseToRupees } from "@/lib/billing/money";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  X,
  Calendar,
  Users,
  Percent,
  IndianRupee,
} from "lucide-react";

export interface AdminOfferItem {
  id: string;
  code: string;
  titleEn: string;
  titleHi: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValuePaise: number;
  maxDiscountPaise: number | null;
  minOrderValuePaise: number;
  usageLimit: number | null;
  perUserLimit: number;
  serviceSlugs: string[];
  planIds: string[];
  showOnPlan: boolean;
  autoApply: boolean;
  showInPopup: boolean;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  _count?: {
    orders: number;
  };
}

interface AdminOffersManagerProps {
  initialOffers: AdminOfferItem[];
  services: {
    slug: string;
    titleEn: string;
    titleHi: string;
    packages?: { id: string; titleEn: string; titleHi: string }[];
    plans?: { id: string; packageId?: string | null; titleEn: string; titleHi: string }[];
  }[];
  locale: string;
}

export function AdminOffersManager({
  initialOffers,
  services,
  locale,
}: AdminOffersManagerProps) {
  const isHindi = locale === "hi";
  const [offers, setOffers] = useState<AdminOfferItem[]>(initialOffers);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOfferItem | null>(null);

  const [form, setForm] = useState({
    code: "",
    titleEn: "",
    titleHi: "",
    discountType: "FLAT" as "FLAT" | "PERCENTAGE",
    discountValue: 500, // In rupees for FLAT, percentage integer for PERCENTAGE
    maxDiscountRupees: "" as string | number,
    minOrderValueRupees: 0,
    usageLimit: "" as string | number,
    perUserLimit: 1 as string | number,
    serviceSlugs: [] as string[],
    planIds: [] as string[],
    showOnPlan: false,
    autoApply: false,
    showInPopup: true,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenModal = (offer?: AdminOfferItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (offer) {
      setEditingOffer(offer);
      setForm({
        code: offer.code,
        titleEn: offer.titleEn,
        titleHi: offer.titleHi,
        discountType: offer.discountType,
        discountValue:
          offer.discountType === "PERCENTAGE"
            ? offer.discountValuePaise
            : paiseToRupees(offer.discountValuePaise),
        maxDiscountRupees: offer.maxDiscountPaise
          ? paiseToRupees(offer.maxDiscountPaise)
          : "",
        minOrderValueRupees: paiseToRupees(offer.minOrderValuePaise),
        usageLimit: offer.usageLimit || "",
        perUserLimit: offer.perUserLimit,
        serviceSlugs: offer.serviceSlugs ?? [],
        planIds: offer.planIds ?? [],
        showOnPlan: offer.showOnPlan ?? false,
        autoApply: offer.autoApply ?? false,
        showInPopup: offer.showInPopup ?? true,
        validFrom: offer.validFrom.slice(0, 10),
        validUntil: offer.validUntil ? offer.validUntil.slice(0, 10) : "",
        isActive: offer.isActive,
      });
    } else {
      setEditingOffer(null);
      setForm({
        code: "",
        titleEn: "",
        titleHi: "",
        discountType: "FLAT",
        discountValue: 500,
        maxDiscountRupees: "",
        minOrderValueRupees: 0,
        usageLimit: 1000,
        perUserLimit: 1,
        serviceSlugs: [],
        planIds: [],
        showOnPlan: false,
        autoApply: false,
        showInPopup: true,
        validFrom: new Date().toISOString().slice(0, 10),
        validUntil: "",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        titleEn: form.titleEn.trim(),
        titleHi: form.titleHi.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountRupees: form.maxDiscountRupees
          ? Number(form.maxDiscountRupees)
          : null,
        minOrderValueRupees: Number(form.minOrderValueRupees || 0),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit || 0),
        serviceSlugs: form.serviceSlugs,
        planIds: form.planIds,
        showOnPlan: form.showOnPlan,
        autoApply: form.autoApply,
        showInPopup: form.showInPopup,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
        isActive: Boolean(form.isActive),
      };

      const url = editingOffer
        ? `/api/admin/offers/${editingOffer.id}`
        : `/api/admin/offers`;
      const method = editingOffer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save offer");
      }

      if (editingOffer) {
        setOffers((prev) =>
          prev.map((o) => (o.id === editingOffer.id ? { ...o, ...data.offer } : o))
        );
        setSuccessMsg("Offer updated successfully.");
      } else {
        setOffers((prev) => [data.offer, ...prev]);
        setSuccessMsg("Offer created successfully.");
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving offer";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOfferActive = async (offer: AdminOfferItem) => {
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Removes an offer. Offers already used on orders are switched off instead, so order records stay intact.
  const handleDeleteOffer = async (offer: AdminOfferItem) => {
    if (!window.confirm(isHindi ? `"${offer.code}" हटाएँ?` : `Remove the offer "${offer.code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove offer");
      setOffers((prev) =>
        data.deactivated
          ? prev.map((o) => (o.id === offer.id ? { ...o, isActive: false } : o))
          : prev.filter((o) => o.id !== offer.id)
      );
      if (data.message) window.alert(data.message);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to remove offer");
    }
  };

  return (
    <div className="w-full flex flex-col text-left space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-secondary">
            {isHindi ? "4. ऑफ़र एवं प्रोमो कोड" : "4. Offers & Promo Codes"}{" "}
            <InfoTip text={isHindi ? "ऑफ़र एक छूट या कोड है। इसे किसी भी संख्या में बना सकते हैं और चुने हुए प्लान, पूरे पैकेज या पूरी सेवा से जोड़ सकते हैं। 'प्लान पर दिखाएँ' चुनें तो ऑफ़र प्लान के पास दिखता है, 'अपने आप लगे' चुनें तो कोड डालना नहीं पड़ता।" : "An offer is a discount or a code. Make as many as you like and attach each to chosen plans, a whole package or a whole service. 'Show on plan' lists it next to the plan; 'apply automatically' means no code is typed."} />
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {isHindi
              ? "पर्व एवं अनुष्ठान हेतु कूपन, न्यूनतम आदेश मूल्य एवं अधिकतम छूट सीमा निर्धारित करें।"
              : "Manage seasonal discount vouchers, minimum order thresholds, and usage caps."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="min-h-[44px] px-4 py-2 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? "नया कूपन बनाएँ" : "Create Offer Code"}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-3 bg-surface rounded border border-tertiary-fixed text-xs text-secondary font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-tertiary" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-surface rounded border border-error text-xs text-on-error-container font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Offers Table */}
      <div className="overflow-x-auto rounded-lg border border-outline-variant/60 bg-surface shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/40 text-secondary font-serif uppercase tracking-wider">
              <th className="py-3 px-4 font-bold">कूपन कोड (Code)</th>
              <th className="py-3 px-4 font-bold">शीर्षक (Title)</th>
              <th className="py-3 px-4 font-bold">छूट प्रकार (Type & Value)</th>
              <th className="py-3 px-4 font-bold">न्यूनतम आदेश (Min Order)</th>
              <th className="py-3 px-4 font-bold">उपयोग सीमा (Usage)</th>
              <th className="py-3 px-4 font-bold">स्थिति (Status)</th>
              <th className="py-3 px-4 font-bold text-right">क्रियाएँ (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-on-surface">
            {offers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                  {isHindi ? "कोई कूपन उपलब्ध नहीं है।" : "No offers available."}
                </td>
              </tr>
            ) : (
              offers.map((offer) => {
                const discountDisplay =
                  offer.discountType === "PERCENTAGE"
                    ? `${offer.discountValuePaise}% ${
                        offer.maxDiscountPaise
                          ? `(Max ${formatPaiseToInr(offer.maxDiscountPaise)})`
                          : ""
                      }`
                    : formatPaiseToInr(offer.discountValuePaise);

                return (
                  <tr
                    key={offer.id}
                    className={`hover:bg-surface-container-low/50 transition-colors ${
                      !offer.isActive ? "opacity-60 bg-surface-container-low/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-secondary text-sm">
                      {offer.code}
                      <div className="font-sans font-normal text-[11px] text-on-surface-variant mt-1">
                        {offer.perUserLimit > 0 ? `${offer.perUserLimit}× per customer` : "unlimited per customer"} · {offer.serviceSlugs?.length ? offer.serviceSlugs.join(", ") : "all services"}{offer.planIds?.length ? ` · ${offer.planIds.length} plan(s)` : ""}{offer.showOnPlan ? " · shown on plans" : ""}{offer.autoApply ? " · applies automatically" : ""}{offer.showInPopup ? " · in pop-up" : ""}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-secondary">
                        {isHindi ? offer.titleHi : offer.titleEn}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {offer.titleEn}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-primary">
                        {offer.discountType === "PERCENTAGE" ? (
                          <Percent className="w-3.5 h-3.5" />
                        ) : (
                          <IndianRupee className="w-3.5 h-3.5" />
                        )}
                        <span>{discountDisplay}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {formatPaiseToInr(offer.minOrderValuePaise)}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      <span>{offer.usedCount}</span>
                      {offer.usageLimit ? (
                        <span> / {offer.usageLimit}</span>
                      ) : (
                        <span> (असीमित)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          offer.isActive
                            ? "bg-tertiary-fixed text-on-tertiary-fixed"
                            : "bg-surface-container-high text-outline"
                        }`}
                      >
                        {offer.isActive
                          ? isHindi
                            ? "सक्रिय"
                            : "Active"
                          : isHindi
                          ? "निष्क्रिय"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleOfferActive(offer)}
                          className="min-h-[36px] px-2.5 py-1 text-xs border border-outline-variant rounded hover:bg-surface-container transition-colors"
                        >
                          {offer.isActive
                            ? isHindi
                              ? "अक्षम करें"
                              : "Deactivate"
                            : isHindi
                            ? "सक्रिय करें"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenModal(offer)}
                          className="min-h-[36px] px-2.5 py-1 text-xs bg-surface border border-secondary text-secondary rounded hover:bg-brand-hover hover:text-on-brand transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteOffer(offer)}
                          aria-label={isHindi ? "हटाएँ" : "Remove offer"}
                          className="min-h-[36px] px-2.5 py-1 text-xs bg-surface border border-error text-on-error-container rounded hover:bg-error-container transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Offer Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-surface rounded-lg border border-secondary/30 shadow-xl max-w-xl w-full p-6 text-left max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h2 className="font-serif text-lg font-bold text-secondary">
                {editingOffer
                  ? isHindi
                    ? "कूपन संपादित करें"
                    : "Edit Offer Voucher"
                  : isHindi
                  ? "नया कूपन कोड बनाएँ"
                  : "Create New Offer Voucher"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingOffer}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. VEDIC2025"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target.value as "FLAT" | "PERCENTAGE",
                      })
                    }
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  >
                    <option value="FLAT">Flat ₹ Amount (सपाट रुपया छूट)</option>
                    <option value="PERCENTAGE">Percentage % (प्रतिशत छूट)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    placeholder="Kashi Special Waiver"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    शीर्षक (हिन्दी) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleHi}
                    onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
                    placeholder="काशी महोत्सव विशेष छूट"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low p-3 rounded border border-outline-variant/40">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    {form.discountType === "PERCENTAGE" ? "छूट प्रतिशत (%) *" : "छूट राशि (₹) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    placeholder={form.discountType === "PERCENTAGE" ? "25" : "500"}
                    className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs font-bold text-secondary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderValueRupees}
                    onChange={(e) => setForm({ ...form, minOrderValueRupees: Number(e.target.value) })}
                    placeholder="1500"
                    className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Max Discount (₹ Cap)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscountRupees}
                    onChange={(e) => setForm({ ...form, maxDiscountRupees: e.target.value })}
                    placeholder="e.g. 1000"
                    className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    कुल उपयोग सीमा (Limit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    प्रारंभ तिथि (Valid From)
                  </label>
                  <input
                    type="date"
                    required
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    अंतिम तिथि (Valid Until)
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    प्रति ग्राहक उपयोग (Uses per customer)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.perUserLimit}
                    onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">0 = असीमित (unlimited)</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold uppercase text-secondary mb-1">
                    किन सेवाओं पर मान्य (Valid for){" "}
                    <InfoTip text={isHindi ? "ऑफ़र किन सेवाओं पर चले। कुछ न चुनें तो सब पर।" : "Which services this offer works on. Choose none for all of them."} />
                  </span>
                  <p className="text-[11px] text-on-surface-variant mb-1">कुछ न चुनें तो सभी सेवाओं पर मान्य (none selected = all services)</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((sv) => {
                      const on = form.serviceSlugs.includes(sv.slug);
                      return (
                        <label key={sv.slug} className={`inline-flex items-center gap-2 min-h-[40px] px-3 rounded border text-xs cursor-pointer ${on ? "border-primary bg-primary/10 text-secondary font-semibold" : "border-outline-variant/80"}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              setForm({
                                ...form,
                                serviceSlugs: on ? form.serviceSlugs.filter((x) => x !== sv.slug) : [...form.serviceSlugs, sv.slug],
                              })
                            }
                          />
                          {isHindi ? sv.titleHi : sv.titleEn}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-secondary mb-1">
                  किन प्लान पर मान्य (Valid for these plans){" "}
                  <InfoTip text={isHindi ? "ऑफ़र को चुने हुए प्लान से जोड़ें। 'पूरा पैकेज' दबाएँ तो उस पैकेज के सभी प्लान एक साथ चुन लिए जाते हैं। कुछ न चुनें तो चुनी सेवाओं के सब प्लान पर चलेगा।" : "Attach the offer to chosen plans. Press 'Whole package' to pick every plan of that package at once. Choose none and it works on every plan of the chosen services."} />
                </span>
                <p className="text-[11px] text-on-surface-variant mb-2">
                  कुछ न चुनें तो चुनी हुई सेवाओं के सभी प्लान पर मान्य (none selected = every plan)
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto overscroll-contain border border-outline-variant/60 rounded p-3">
                  {services
                    .filter((sv) => form.serviceSlugs.length === 0 || form.serviceSlugs.includes(sv.slug))
                    .map((sv) => (
                      <div key={sv.slug}>
                        <div className="text-[11px] font-bold text-secondary mb-1">{isHindi ? sv.titleHi : sv.titleEn}</div>
                        {(sv.packages ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(sv.packages ?? []).map((pk) => {
                              const ids = (sv.plans ?? []).filter((p) => p.packageId === pk.id).map((p) => p.id);
                              if (ids.length === 0) return null;
                              const all = ids.every((id) => form.planIds.includes(id));
                              return (
                                <button
                                  key={pk.id}
                                  type="button"
                                  aria-pressed={all}
                                  onClick={() =>
                                    setForm({ ...form, planIds: all ? form.planIds.filter((x) => !ids.includes(x)) : Array.from(new Set([...form.planIds, ...ids])) })
                                  }
                                  className={`min-h-[36px] px-3 rounded-full border text-xs font-semibold ${all ? "border-primary bg-primary text-on-primary" : "border-primary text-primary hover:bg-primary/10"}`}
                                >
                                  {all ? "✓ " : ""}{isHindi ? "पूरा पैकेज: " : "Whole package: "}{isHindi ? pk.titleHi : pk.titleEn}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(sv.plans ?? []).map((pl) => {
                            const on = form.planIds.includes(pl.id);
                            return (
                              <label key={pl.id} className={`inline-flex items-center gap-2 min-h-[36px] px-3 rounded border text-xs cursor-pointer ${on ? "border-primary bg-primary/10 text-secondary font-semibold" : "border-outline-variant/80"}`}>
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() =>
                                    setForm({ ...form, planIds: on ? form.planIds.filter((x) => x !== pl.id) : [...form.planIds, pl.id] })
                                  }
                                />
                                {isHindi ? pl.titleHi : pl.titleEn}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="offerShow"
                  checked={form.showOnPlan}
                  onChange={(e) => setForm({ ...form, showOnPlan: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="offerShow" className="text-xs font-medium text-secondary">
                  {isHindi ? "बुकिंग में प्लान के साथ यह ऑफर दिखाएँ (ग्राहक एक टैप से लगा सकें)" : "Show this offer next to its plans in booking (customer can tap to apply)"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="offerAuto"
                  checked={form.autoApply}
                  onChange={(e) => setForm({ ...form, autoApply: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="offerAuto" className="text-xs font-medium text-secondary">
                  {isHindi ? "बिना कोड डाले अपने आप लागू हो (ग्राहक को कोड टाइप नहीं करना पड़ेगा)" : "Apply automatically, no code needed (the customer does not have to type it)"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="offerPopup"
                  checked={form.showInPopup}
                  onChange={(e) => setForm({ ...form, showInPopup: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="offerPopup" className="text-xs font-medium text-secondary">
                  {isHindi ? "साइट खुलने पर ऑफर पॉप-अप में दिखाएँ" : "Show this offer in the pop-up visitors see when the site opens"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="offerActive" className="text-xs font-medium text-secondary">
                  {isHindi ? "कूपन सक्रिय रखें (Is Active)" : "Coupon is Active"}
                </label>
              </div>

              <div className="sticky bottom-0 z-10 bg-surface -mx-6 -mb-6 px-6 py-3 border-t border-outline-variant/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-medium uppercase tracking-wider"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] px-6 py-2 bg-brand hover:bg-brand-hover text-on-brand rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? (isHindi ? "सहेज रहे हैं..." : "Saving...") : isHindi ? "सहेजें" : "Save Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
