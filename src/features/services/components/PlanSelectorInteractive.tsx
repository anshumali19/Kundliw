"use client";

import { PackageDetails, type PackageDetailDTO } from "./PackageDetails";
import { useState } from "react";
import Link from "next/link";
import { formatPaiseToInr } from "@/lib/billing/gst";
import {
  Check,
  CheckCircle2,
  Clock,
  FileText,
  PhoneCall,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";

export interface PlanDTO {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  pricePaise: number;
  originalPricePaise: number | null;
  deliveryDays: number;
  pages: number | null;
  hasCall: boolean;
  callDurationMinutes: number | null;
  featuresEn: string[];
  featuresHi: string[];
  isPopular: boolean;
  orderIndex: number;
  packageId?: string | null;
}

export type PackageDTO = PackageDetailDTO;

interface PlanSelectorInteractiveProps {
  plans: PlanDTO[];
  packages?: PackageDTO[];
  serviceSlug: string;
  serviceTitle: string;
  locale: string;
}

interface AppliedCoupon {
  code: string;
  discountPaise: number;
  discountFormatted: string;
  netAmountPaise: number;
  netAmountFormatted: string;
}

export function PlanSelectorInteractive({
  plans: allPlans,
  packages = [],
  serviceSlug,
  serviceTitle,
  locale,
}: PlanSelectorInteractiveProps) {
  const isHindi = locale === "hi";

  // Service > Package > Plan: the customer picks a package first, then one of its plans.
  // Plans that belong to no package are shown under a package of their own.
  const packageList: PackageDTO[] = [...packages];
  if (allPlans.some((p) => !p.packageId || !packages.some((k) => k.id === p.packageId))) {
    packageList.push({ id: "__none", titleEn: "Standard", titleHi: "मानक" });
  }
  const planPackage = (p: PlanDTO) => (p.packageId && packages.some((k) => k.id === p.packageId) ? p.packageId : "__none");
  const pickDefault = (list: PlanDTO[]) => list.find((p) => p.isPopular) || list[0];
  const firstPackage = packageList.find((k) => allPlans.some((p) => planPackage(p) === k.id)) ?? packageList[0];
  const startPlan = pickDefault(allPlans.filter((p) => !firstPackage || planPackage(p) === firstPackage.id));
  const [selectedPackageId, setSelectedPackageId] = useState<string>(firstPackage ? firstPackage.id : "");
  const plans = allPlans.filter((p) => packageList.length === 0 || planPackage(p) === selectedPackageId);
  const defaultPlan = startPlan;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    defaultPlan ? defaultPlan.id : ""
  );

  const [couponInput, setCouponInput] = useState<string>("VEDIC2025");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Helper to re-validate or apply coupon
  const handleApplyCoupon = async (codeToApply?: string, planToUse?: PlanDTO) => {
    const code = (codeToApply ?? couponInput).trim();
    const targetPlan = planToUse ?? selectedPlan;

    if (!code) {
      setCouponError(isHindi ? "कृपया कूपन कोड दर्ज करें।" : "Please enter a coupon code.");
      return;
    }
    if (!targetPlan) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          planId: targetPlan.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.isValid) {
        setAppliedCoupon(null);
        setCouponError(
          data.reason ||
            data.error ||
            (isHindi ? "यह कूपन इस योजना पर मान्य नहीं है।" : "This coupon is not valid for this plan.")
        );
      } else {
        setAppliedCoupon({
          code: data.code,
          discountPaise: data.discountPaise,
          discountFormatted: data.discountFormatted,
          netAmountPaise: data.netAmountPaise,
          netAmountFormatted: data.netAmountFormatted,
        });
        setCouponError(null);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(isHindi ? "सत्यापन विफल रहा। पुनः प्रयास करें।" : "Validation failed. Please retry.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectPlan = (plan: PlanDTO) => {
    setSelectedPlanId(plan.id);
    // If a coupon was already applied, re-validate against newly selected plan
    if (appliedCoupon) {
      handleApplyCoupon(appliedCoupon.code, plan);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Pricing calculation
  const basePricePaise = selectedPlan ? selectedPlan.pricePaise : 0;
  const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const netDakshinaPaise = Math.max(0, basePricePaise - discountPaise);

  const bookingHref = selectedPlan
    ? `/${locale}/booking?service=${encodeURIComponent(serviceSlug)}&plan=${encodeURIComponent(
        selectedPlan.slug
      )}${appliedCoupon ? `&offer=${encodeURIComponent(appliedCoupon.code)}` : ""}`
    : `/${locale}/booking`;

  if (allPlans.length === 0) {
    return (
      <div className="p-8 text-left bg-surface rounded border border-outline-variant/60">
        <AlertCircle className="w-8 h-8 text-outline mb-2" />
        <h3 className="font-serif text-lg font-bold text-secondary">
          {isHindi ? "वर्तमान में कोई संस्करण उपलब्ध नहीं है" : "No plans currently available"}
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">
          {isHindi
            ? "कृपया इस सेवा के नए संस्करणों के लिए शीघ्र जांचें।"
            : "Please check back shortly for updated consultation tiers."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col text-left space-y-12">
      {/* 1. Packages, then the plans inside the chosen package */}
      {packageList.length > 1 || (packageList.length === 1 && packageList[0].id !== "__none") ? (
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-bold mb-3">
            {isHindi ? "चरण 1: पैकेज चुनें" : "Step 1: Choose a package"}
          </div>
          <div className="flex flex-wrap gap-3" role="tablist" aria-label={isHindi ? "पैकेज" : "Packages"}>
            {packageList
              .filter((k) => allPlans.some((p) => planPackage(p) === k.id))
              .map((k) => {
                const on = selectedPackageId === k.id;
                const desc = isHindi ? k.descriptionHi || k.descriptionEn : k.descriptionEn || k.descriptionHi;
                return (
                  <button
                    key={k.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => {
                      setSelectedPackageId(k.id);
                      const pick = pickDefault(allPlans.filter((p) => planPackage(p) === k.id));
                      if (pick) setSelectedPlanId(pick.id);
                    }}
                    className={`text-left min-w-[10rem] max-w-xs px-4 py-3 rounded-lg border transition-colors ${
                      on ? "bg-maroon text-on-maroon border-maroon" : "bg-surface border-outline-variant hover:border-secondary"
                    }`}
                  >
                    <span className="block font-serif font-bold text-base">{isHindi ? k.titleHi : k.titleEn}</span>
                    {k.availability && k.availability.status !== "open" ? (
                      <span className={`block text-xs mt-0.5 font-bold ${on ? "text-on-maroon" : "text-on-error-container"}`}>
                        {k.availability.reason === "full" ? (isHindi ? "सभी स्थान भर चुके हैं" : "Fully booked") : k.availability.reason === "ended" ? (isHindi ? "समाप्त" : "Ended") : isHindi ? "बुकिंग बंद" : "Booking closed"}
                      </span>
                    ) : k.availability?.seatsLeft != null ? (
                      <span className={`block text-xs mt-0.5 font-semibold ${on ? "text-on-maroon" : "text-primary"}`}>
                        {isHindi ? `${k.availability.seatsLeft} स्थान शेष` : `${k.availability.seatsLeft} seats left`}
                      </span>
                    ) : null}
                    {desc && !k.itineraryDays && <span className={`block text-xs mt-0.5 ${on ? "text-on-maroon/90" : "text-on-surface-variant"}`}>{desc}</span>}
                  </button>
                );
              })}
          </div>
          {(() => {
            const chosen = packageList.find((k) => k.id === selectedPackageId);
            return chosen && chosen.id !== "__none" ? <PackageDetails pkg={chosen} isHindi={isHindi} /> : null;
          })()}
          <div className="mt-8 text-xs uppercase tracking-widest text-primary font-bold">
            {isHindi ? "चरण 2: प्लान चुनें" : "Step 2: Choose a plan"}
          </div>
        </div>
      ) : null}

      {/* 1b. Dynamic Plan Cards (Supports any number of plans) */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 text-left">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-bold">
              {isHindi ? "संस्करण तुलना एवं दक्षिणा" : "Consultation Tiers & Dakshina"}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-secondary font-bold mt-1 tracking-tight">
              {isHindi ? "अपनी आवश्यकतानुसार संस्करण चुनें" : "Select Your Preferred Consultation Format"}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
              {isHindi
                ? "डिजिटल फलित प्रतिवेदन से लेकर प्रत्यक्ष केंद्र परामर्श एवं हस्तनिर्मित पोथी ग्रंथ तक — प्रमाणिक वैदिक विकल्प।"
                : "From a digital report to a live consultation with the Kendra team and a printed book."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary bg-surface-container-low px-3 py-1.5 rounded border border-secondary/20 shrink-0 self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4 text-tertiary" />
            <span className="font-semibold">{isHindi ? "सर्वसमावेशक दक्षिणा (No hidden charges)" : "All-inclusive Dakshina"}</span>
          </div>
        </div>

        {/* Dynamic Responsive Grid according to plan count */}
        <div
          className={`grid gap-6 items-stretch ${
            plans.length === 1
              ? "grid-cols-1 max-w-xl"
              : plans.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : plans.length === 3
              ? "grid-cols-1 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const title = isHindi ? plan.titleHi : plan.titleEn;
            const description = isHindi ? plan.descriptionHi : plan.descriptionEn;
            const features = isHindi ? plan.featuresHi : plan.featuresEn;

            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`relative rounded-lg p-6 flex flex-col justify-between transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-surface border-2 border-primary shadow-md ring-1 ring-primary/30"
                    : "bg-surface-container-low/60 border border-outline-variant/60 hover:border-secondary/50 hover:bg-surface"
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-6 bg-brand text-on-brand text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-tertiary-fixed" />
                    <span>{isHindi ? "सर्वाधिक अनुशंसित" : "Most Preferred"}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mt-1">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
                      {plan.hasCall
                        ? isHindi
                          ? "परामर्श + प्रतिवेदन"
                          : "Advisory + Report"
                        : isHindi
                        ? "डिजिटल फलित प्रतिवेदन"
                        : "Digital Report"}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand text-on-brand flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {isHindi ? "चयनित" : "Selected"}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="font-serif text-xl font-bold text-secondary">
                      {title}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-secondary leading-none">
                      {formatPaiseToInr(plan.pricePaise)}
                    </span>
                    {plan.originalPricePaise && plan.originalPricePaise > plan.pricePaise && (
                      <span className="text-sm line-through text-outline">
                        {formatPaiseToInr(plan.originalPricePaise)}
                      </span>
                    )}
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                      {isHindi ? "दक्षिणा" : "Dakshina"}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="mt-6 pt-5 border-t border-outline-variant/30 space-y-2.5 text-xs">
                    {plan.pages && (
                      <div className="flex items-center gap-2 text-on-surface">
                        <FileText className="w-4 h-4 text-secondary shrink-0" />
                        <span>
                          <strong>{plan.pages} {isHindi ? "पृष्ठ" : "Pages"}</strong>{" "}
                          {isHindi ? "विस्तृत फलित प्रतिवेदन" : "Detailed Horoscope"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-on-surface">
                      <Clock className="w-4 h-4 text-secondary shrink-0" />
                      <span>
                        <strong>{plan.deliveryDays} {isHindi ? "कार्यदिवस" : "Working Days"}</strong>{" "}
                        {isHindi ? "वितरण अवधि" : "Turnaround Time"}
                      </span>
                    </div>

                    {plan.hasCall && plan.callDurationMinutes && (
                      <div className="flex items-center gap-2 text-secondary font-medium">
                        <PhoneCall className="w-4 h-4 text-primary shrink-0" />
                        <span>
                          <strong>{plan.callDurationMinutes} {isHindi ? "मिनट" : "Mins"}</strong>{" "}
                          {isHindi ? "प्रत्यक्ष केंद्र दल संवाद" : "Direct Live Kendra Team Consultation"}
                        </span>
                      </div>
                    )}

                    {features.slice(0, 4).map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-on-surface-variant">
                        <Check className="w-3.5 h-3.5 text-tertiary mt-0.5 shrink-0" />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Selection Action */}
                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    className={`w-full min-h-[44px] py-2.5 px-4 rounded font-medium text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-brand text-on-brand font-bold shadow-sm"
                        : "border border-secondary text-secondary hover:bg-brand-hover hover:text-on-brand"
                    }`}
                  >
                    <span>
                      {isSelected
                        ? isHindi
                          ? "योजना चयनित है"
                          : "Selected Plan"
                        : isHindi
                        ? `यह संस्करण चुनें (${formatPaiseToInr(plan.pricePaise)})`
                        : `Select Tier (${formatPaiseToInr(plan.pricePaise)})`}
                    </span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Full Specification Matrix Comparative Table (Dynamic across any plan count) */}
      <div className="w-full text-left">
        <div className="space-y-1 mb-5">
          <div className="text-xs uppercase tracking-widest text-primary font-bold">
            {isHindi ? "विस्तृत तुलनात्मक तालिका" : "Detailed Specification Matrix"}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-secondary font-bold">
            {isHindi ? "संस्करणों का तुलनात्मक शास्त्रीय विवरण" : "Comparative Analysis Across All Editions"}
          </h3>
        </div>

        <div className="overflow-x-auto rounded border border-outline-variant/60 shadow-sm bg-surface">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-brand text-on-brand border-b-2 border-secondary font-serif">
                <th className="py-3 px-4 font-bold tracking-wide w-1/3 text-left">
                  {isHindi ? "शास्त्रीय घटक / विशेषता" : "Canonical Matrix Feature"}
                </th>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    className={`py-3 px-4 text-center font-bold tracking-wide ${
                      p.id === selectedPlanId
                        ? "bg-brand text-on-brand"
                        : ""
                    }`}
                  >
                    <div>{isHindi ? p.titleHi : p.titleEn}</div>
                    <div className="text-[11px] font-normal opacity-90 mt-0.5">
                      {formatPaiseToInr(p.pricePaise)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-on-surface">
              {/* Row: Turnaround Time */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-4 font-medium text-on-surface">
                  {isHindi ? "वितरण कालखंड (Turnaround)" : "Turnaround Time"}
                </td>
                {plans.map((p) => (
                  <td
                    key={p.id}
                    className={`py-3 px-4 text-center ${
                      p.id === selectedPlanId ? "bg-brand/5 font-semibold text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    {p.deliveryDays} {isHindi ? "कार्यदिवस" : "Working Days"}
                  </td>
                ))}
              </tr>

              {/* Row: Report Volume */}
              <tr className="bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-4 font-medium text-on-surface">
                  {isHindi ? "कुल प्रतिवेदन आयतन (Report Volume)" : "Report Pages / Volume"}
                </td>
                {plans.map((p) => (
                  <td
                    key={p.id}
                    className={`py-3 px-4 text-center ${
                      p.id === selectedPlanId ? "bg-brand/5 font-semibold text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    {p.pages ? `${p.pages} ${isHindi ? "पृष्ठ" : "Pages"}` : "—"}
                  </td>
                ))}
              </tr>

              {/* Row: Kendra Team Consultation */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-4 font-medium text-on-surface">
                  {isHindi ? "प्रत्यक्ष केंद्र दल विमर्श (Live Call)" : "Live Kendra Team Discussion"}
                </td>
                {plans.map((p) => (
                  <td
                    key={p.id}
                    className={`py-3 px-4 text-center ${
                      p.id === selectedPlanId ? "bg-brand/5 font-semibold text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    {p.hasCall ? (
                      <span className="inline-flex items-center gap-1 text-secondary font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        {p.callDurationMinutes} {isHindi ? "मिनट" : "Mins"}
                      </span>
                    ) : (
                      <span className="text-outline">{isHindi ? "अनुपलब्ध" : "Not included"}</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Vault Access */}
              <tr className="bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-4 font-medium text-on-surface">
                  {isHindi ? "आजीवन कुण्डली तिजोरी (Vault Access)" : "Lifetime Digital Vault Access"}
                </td>
                {plans.map((p) => (
                  <td
                    key={p.id}
                    className={`py-3 px-4 text-center ${
                      p.id === selectedPlanId ? "bg-brand/5 font-semibold text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 text-tertiary font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isHindi ? "सम्मिलित" : "Included"}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Server-Verified Coupon Promotion Section */}
      <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/40 shadow-sm text-left">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Tag className="w-4 h-4 text-primary" />
            <span>{isHindi ? "विशेष छूट कूपन कोड (Promo Voucher)" : "Promo Voucher Code"}</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "यदि आपके पास वैध कूपन कोड है, तो दर्ज करें। छूट का सत्यापन सर्वर द्वारा तत्काल परिकलित होगा।"
              : "Enter your promotional code to preview verified savings before checkout."}
          </p>

          {/* Input & Apply Button */}
          <div className="flex items-center gap-2 pt-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder={isHindi ? "कूपन कोड" : "Promo code"}
                disabled={couponLoading || appliedCoupon !== null}
                className="w-full bg-surface text-secondary font-mono text-sm font-bold uppercase tracking-widest px-3 py-2.5 rounded border border-dashed border-secondary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
              />
            </div>

            {appliedCoupon ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="min-h-[44px] px-3 py-2 bg-surface hover:bg-surface-container-high border border-outline-variant text-on-error-container text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isHindi ? "हटाएँ" : "Remove"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={couponLoading || !couponInput.trim()}
                className="min-h-[44px] px-4 py-2 bg-brand hover:bg-brand-hover text-on-brand font-medium text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50"
              >
                {couponLoading ? (isHindi ? "जाँच..." : "Checking...") : isHindi ? "लागू करें" : "Apply"}
              </button>
            )}
          </div>

          {/* Coupon Feedback Alerts */}
          {couponError && (
            <div className="flex items-center gap-1.5 text-xs text-on-error-container font-medium pt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{couponError}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium pt-1">
              <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
              <span>
                {isHindi
                  ? `कूपन '${appliedCoupon.code}' सक्रिय! ${appliedCoupon.discountFormatted} छूट प्राप्त हुई।`
                  : `Coupon '${appliedCoupon.code}' applied! Saved ${appliedCoupon.discountFormatted} on this booking.`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Sticky Bottom Checkout Summary Bar */}
      <aside className="sticky bottom-0 z-40 w-full bg-surface-container-high/95 backdrop-blur-md border-t-2 border-secondary shadow-lg py-3 text-left -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Selected Plan Details */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-brand text-on-brand flex items-center justify-center shrink-0 border border-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-base sm:text-lg font-bold text-secondary">
                  {isHindi ? selectedPlan.titleHi : selectedPlan.titleEn}
                </span>
                {appliedCoupon && (
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase">
                    {appliedCoupon.code} (-{appliedCoupon.discountFormatted})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="font-bold text-on-surface text-sm sm:text-base">
                  {isHindi ? "देय दक्षिणा:" : "Dakshina:"} {formatPaiseToInr(netDakshinaPaise)}
                </span>
                {appliedCoupon && (
                  <span className="line-through text-outline">
                    {formatPaiseToInr(basePricePaise)}
                  </span>
                )}
                <span className="text-on-surface-variant hidden sm:inline">
                  • {selectedPlan.deliveryDays} {isHindi ? "कार्यदिवस वितरण" : "days delivery"}
                </span>
              </div>
            </div>
          </div>

          {/* Proceed to Booking Details CTA */}
          <div className="w-full md:w-auto">
            {(() => {
              const chosen = packageList.find((k) => k.id === selectedPackageId);
              const closed = chosen?.availability && chosen.availability.status !== "open";
              return closed ? (
                <span className="w-full md:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 bg-surface-container-high text-on-surface-variant font-bold text-xs uppercase tracking-wider rounded border border-outline-variant text-center">
                  {chosen?.availability?.reason === "full"
                    ? isHindi ? "सभी स्थान भर चुके हैं" : "Fully booked"
                    : isHindi ? "बुकिंग बंद है" : "Booking is closed"}
                </span>
              ) : (
                <Link
                  href={bookingHref}
                  className="w-full md:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded shadow-sm transition-colors border border-primary text-center"
                >
                  <span>{isHindi ? "जन्म विवरण दर्ज करें" : "Proceed to Birth Details"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })()}
          </div>
        </div>
      </aside>
    </div>
  );
}
