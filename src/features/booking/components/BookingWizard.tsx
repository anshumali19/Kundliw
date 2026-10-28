"use client";

import { useState, useEffect, useRef } from "react";
import { isKundliService } from "@/lib/content/ownKundli";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatPaiseToInr } from "@/lib/billing/gst";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  PhoneCall,
  X,
} from "lucide-react";

export interface BookingServiceSummary {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  packages?: { id: string; titleEn: string; titleHi: string; descriptionEn?: string | null; descriptionHi?: string | null; availability?: { status: "open" | "full" | "closed"; seatsLeft: number | null; reason?: "full" | "started" | "ended" } }[];
  plans: {
    id: string;
    packageId?: string | null;
    slug: string;
    titleEn: string;
    titleHi: string;
    pricePaise: number;
    originalPricePaise: number | null;
    deliveryDays: number;
    pages: number | null;
    hasCall: boolean;
    callDurationMinutes: number | null;
  }[];
}

export interface AvailableSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: number;
}

interface BookingWizardProps {
  services: BookingServiceSummary[];
  initialServiceSlug: string;
  initialPlanSlug: string;
  initialOfferCode?: string;
  initialReferralCode?: string;
  gstRateBasisPoints?: number;
  initialSlots: AvailableSlot[];
  userPhone?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  locale: string;
  /** Payment the customer chose in the Booking menu: GATEWAY, UPI or BANK */
  initialPay?: string;
  initialJataka?: {
    name?: string;
    phone?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dob?: string;
    tob?: string;
    pob?: string;
    partnerName?: string;
    partnerDob?: string;
    partnerTob?: string;
    partnerPob?: string;
  };
}

const STORAGE_KEY = "mkjk_booking_draft_v1";

const REASONS_HI: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/^Minimum order value of ₹([d,]+) required/, (m) => `इस कोड के लिए न्यूनतम ₹${m[1]} का ऑर्डर आवश्यक है`],
  [/^This code is not valid for the selected service/, () => "यह कोड चुनी गई सेवा पर मान्य नहीं है"],
  [/^You have already used this code/, () => "आप यह कोड पहले ही उपयोग कर चुके हैं"],
  [/^Offer has expired/, () => "इस ऑफर की अवधि समाप्त हो चुकी है"],
  [/^Offer is not yet valid/, () => "यह ऑफर अभी शुरू नहीं हुआ है"],
  [/^Offer usage limit exceeded/, () => "इस ऑफर की उपयोग सीमा पूरी हो चुकी है"],
];

/** Shows the exact reason a coupon does not apply, in the customer's language. */
function reasonText(reason: string | undefined, isHindi: boolean): string | undefined {
  if (!reason || !isHindi) return reason;
  for (const [re, fn] of REASONS_HI) {
    const m = reason.match(re);
    if (m) return fn(m);
  }
  return "अमान्य अथवा अनुपलब्ध कूपन कोड।";
}

export function BookingWizard({
  services,
  initialServiceSlug,
  initialPlanSlug,
  initialOfferCode = "",
  initialReferralCode = "",
  gstRateBasisPoints = 1800,
  initialSlots,
  userPhone = "",
  userName = "",
  userEmail = "",
  locale,
  initialJataka,
  initialPay,
}: BookingWizardProps) {
  const router = useRouter();
  const tBooking = useTranslations("booking");
  const tCommon = useTranslations("common");
  const isHindi = locale === "hi";

  // Step 1: Selection, Step 2: Jataka Details, Step 3: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Service & Plan selection
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(
    initialServiceSlug || (services[0]?.slug ?? "")
  );
  const activeService =
    services.find((s) => s.slug === selectedServiceSlug) || services[0];

  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>(
    initialPlanSlug || (activeService?.plans[0]?.slug ?? "")
  );
  const activePlan =
    activeService?.plans.find((p) => p.slug === selectedPlanSlug) ||
    activeService?.plans[0];

  // Service > Package > Plan: the plans shown are those of the chosen package
  const [selectedPackageId, setSelectedPackageId] = useState<string>(activePlan?.packageId ?? "");
  const packageOptions = [
    ...(activeService?.packages ?? []).filter((k) => activeService?.plans.some((p) => p.packageId === k.id)),
    ...(activeService?.plans.some((p) => !p.packageId) ? [{ id: "", titleEn: "Standard", titleHi: "मानक", descriptionEn: null, descriptionHi: null, availability: undefined }] : []),
  ];
  const showPackages = packageOptions.length > 1 || (packageOptions.length === 1 && packageOptions[0].id !== "");
  // Kundli services: select Kundli > fill the form > choose a plan > pay (the plan comes after the form)
  const kundliMode = isKundliService(activeService?.slug);
  const visiblePlans = (activeService?.plans ?? []).filter((p) => !showPackages || (p.packageId ?? "") === selectedPackageId);

  // Appointment Slot
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  // Offer Code
  const [offerCodeInput, setOfferCodeInput] = useState<string>(
    initialOfferCode || ""
  );
  const [appliedOffer, setAppliedOffer] = useState<{
    code: string;
    discountPaise: number;
    discountFormatted: string;
    netAmountPaise: number;
    netAmountFormatted: string;
  } | null>(null);
  // true while the applied offer is the one the Kendra applies by itself (no code typed)
  const [offerIsAuto, setOfferIsAuto] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Referral code (associate) - entered here or remembered from a referral link
  const [referralInput, setReferralInput] = useState<string>(initialReferralCode || "");
  const [referralApplied, setReferralApplied] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);

  const appliedOfferRef = useRef<unknown>(null);
  const offerCodeRef = useRef("");
  const handleValidateOfferRef = useRef<((code?: string, auto?: boolean) => Promise<void>) | null>(null);
  // Offers the admin chose to show next to this plan
  const [planOffers, setPlanOffers] = useState<Array<{ code: string; titleEn: string; titleHi: string; discountFormatted: string }>>([]);
  useEffect(() => {
    if (!activePlan?.id) return;
    let cancelled = false;
    fetch(`/api/offers/available?planId=${encodeURIComponent(activePlan.id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setPlanOffers(Array.isArray(d.offers) ? d.offers : []);
        // Offers that apply by themselves are put on straight away when the customer has typed nothing
        if (d.auto?.code && !appliedOfferRef.current && !offerCodeRef.current.trim()) {
          void handleValidateOfferRef.current?.(d.auto.code, true);
        }
      })
      .catch(() => {
        if (!cancelled) setPlanOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activePlan?.id]);

  const handleCheckReferral = async () => {
    const code = referralInput.trim().toUpperCase();
    if (!code) return;
    setReferralLoading(true);
    setReferralError(null);
    try {
      const res = await fetch("/api/associate/referral-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setReferralApplied(code);
      } else {
        setReferralApplied(null);
        setReferralError(data.error || (isHindi ? "यह रेफरल कोड सही नहीं है।" : "This referral code is not valid."));
      }
    } catch {
      setReferralError(isHindi ? "जाँच नहीं हो सकी, दोबारा प्रयास करें।" : "Could not check the code. Please try again.");
    } finally {
      setReferralLoading(false);
    }
  };

  // A code remembered from a referral link is checked once on arrival
  useEffect(() => {
    if (initialReferralCode) handleCheckReferral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jataka Details Form
  const [formData, setFormData] = useState({
    name: initialJataka?.name || userName || "",
    gender: (initialJataka?.gender || "MALE") as "MALE" | "FEMALE" | "OTHER",
    dob: initialJataka?.dob || "1995-01-01",
    tob: initialJataka?.tob || "10:30",
    isTimeUnknown: false,
    pob: initialJataka?.pob || "",
    phone: (initialJataka?.phone || "").replace(/\D/g, "").slice(-10) || userPhone || "",
    email: userEmail || "",
    language: (locale === "en" ? "en" : "hi") as "hi" | "en",
    queries: "",
    partnerName: initialJataka?.partnerName || "",
    partnerGender: "FEMALE" as "MALE" | "FEMALE" | "OTHER",
    partnerDob: initialJataka?.partnerDob || "1996-01-01",
    partnerTob: initialJataka?.partnerTob || "11:30",
    partnerIsTimeUnknown: false,
    partnerPob: initialJataka?.partnerPob || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Restore draft from sessionStorage on mount (WebView Safe)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }));
        if (parsed.selectedSlotId) setSelectedSlotId(parsed.selectedSlotId);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      }
    } catch (err) {
      // Ignore sessionStorage restrictions in private/restricted WebViews
    }
  }, []);

  // Persist draft to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formData,
          selectedSlotId,
          selectedServiceSlug,
          selectedPlanSlug,
          currentStep,
        })
      );
    } catch (err) {
      // Ignore
    }
  }, [formData, selectedSlotId, selectedServiceSlug, selectedPlanSlug, currentStep]);

  // Apply offer validation
  const handleValidateOffer = async (codeToTry?: string, auto = false) => {
    const code = (codeToTry ?? offerCodeInput).trim();
    if (!code || !activePlan) return;

    setOfferLoading(true);
    setOfferError(null);

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          planId: activePlan.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.isValid) {
        setAppliedOffer(null);
        setOfferError(
          reasonText(data.reason, isHindi) ||
            (isHindi
              ? "अमान्य अथवा अनुपलब्ध कूपन कोड।"
              : "Invalid or unavailable coupon code.")
        );
      } else {
        setOfferIsAuto(auto);
        setAppliedOffer({
          code: data.code,
          discountPaise: data.discountPaise,
          discountFormatted: data.discountFormatted,
          netAmountPaise: data.netAmountPaise,
          netAmountFormatted: data.netAmountFormatted,
        });
        setOfferError(null);
      }
    } catch (err) {
      setAppliedOffer(null);
      setOfferError(
        isHindi
          ? "अमान्य अथवा अनुपलब्ध कूपन कोड।"
          : "Invalid or unavailable coupon code."
      );
    } finally {
      setOfferLoading(false);
    }
  };

  useEffect(() => {
    appliedOfferRef.current = appliedOffer;
    offerCodeRef.current = offerCodeInput;
    handleValidateOfferRef.current = handleValidateOffer;
  });

  // Re-validate coupon if user changes plan
  useEffect(() => {
    if (appliedOffer && activePlan) {
      handleValidateOffer(appliedOffer.code, offerIsAuto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlan?.id]);

  // Submit Order
  const handleCreateOrder = async () => {
    if (!activeService || !activePlan) return;
    if (kundliMode && activePlan.hasCall && initialSlots.length > 0 && !selectedSlotId) {
      setSubmissionError(
        isHindi ? "कृपया परामर्श हेतु एक समय स्लॉट चुनें।" : "Please select an appointment slot for the consultation call."
      );
      return;
    }
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        serviceSlug: activeService.slug,
        planSlug: activePlan.slug,
        offerCode: appliedOffer ? appliedOffer.code : undefined,
        referralCode: referralApplied || undefined,
        slotId: activePlan.hasCall ? selectedSlotId : undefined,
        jatakaDetails: {
          name: formData.name.trim(),
          gender: formData.gender,
          dob: formData.dob,
          tob: formData.isTimeUnknown ? "12:00" : formData.tob,
          isTimeUnknown: formData.isTimeUnknown,
          pob: formData.pob.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          language: formData.language,
          queries: formData.queries.trim() || undefined,
          ...(activeService.slug === "kundli-matching" && {
            partnerDetails: {
              name: formData.partnerName.trim(),
              gender: formData.partnerGender,
              dob: formData.partnerDob,
              tob: formData.partnerIsTimeUnknown ? "12:00" : formData.partnerTob,
              isTimeUnknown: formData.partnerIsTimeUnknown,
              pob: formData.partnerPob.trim(),
            },
          }),
        },
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order.");
      }

      // Clear draft on successful order creation
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Ignore
      }

      // Navigate to checkout payment page
      router.push(`/${locale}/booking/checkout/${data.orderId}${initialPay ? `?pay=${encodeURIComponent(initialPay)}` : ""}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Order creation failed.";
      setSubmissionError(msg);
      setSubmitting(false);
    }
  };

  const isMatchingService = activeService?.slug === "kundli-matching";

  // Calculations
  const basePricePaise = activePlan ? activePlan.pricePaise : 0;
  const discountPaise = appliedOffer ? appliedOffer.discountPaise : 0;
  const taxablePaise = Math.max(0, basePricePaise - discountPaise);
  const gstPaise = Math.round((taxablePaise * gstRateBasisPoints) / 10000);
  const gstPercentLabel = String(gstRateBasisPoints / 100);
  const netPayablePaise = taxablePaise + gstPaise;

  // Package + plan choice and the call slot picker, shown in step 1 for other services and in step 3 for Kundli
  const planChoiceJsx = (
    <>
              {/* Package options (for example Sadharan, Madhyam, Uttam) */}
              {activeService && showPackages && (
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-2">
                    {isHindi ? "पैकेज (Package)" : "Package"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {packageOptions.map((k) => {
                      const on = k.id === selectedPackageId;
                      const desc = isHindi ? k.descriptionHi || k.descriptionEn : k.descriptionEn || k.descriptionHi;
                      const shut = k.availability && k.availability.status !== "open";
                      return (
                        <button
                          key={k.id || "standard"}
                          type="button"
                          disabled={Boolean(shut)}
                          onClick={() => {
                            setSelectedPackageId(k.id);
                            const first = activeService.plans.find((p) => (p.packageId ?? "") === k.id);
                            if (first) setSelectedPlanSlug(first.slug);
                          }}
                          className={`min-h-[44px] p-3 rounded text-left border transition-all text-xs ${
                            on
                              ? "bg-surface border-2 border-primary ring-1 ring-primary/20 font-bold text-secondary"
                              : "bg-surface-container-low border-outline-variant/60 hover:bg-surface text-on-surface"
                          } ${shut ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <span className="block font-semibold">{isHindi ? k.titleHi : k.titleEn}</span>
                          {k.availability && (shut || k.availability.seatsLeft != null) && (
                            <span className={`block text-[11px] font-bold mt-0.5 ${shut ? "text-on-error-container" : "text-primary"}`}>
                              {shut
                                ? k.availability.reason === "full"
                                  ? isHindi ? "सभी स्थान भर चुके हैं" : "Fully booked"
                                  : isHindi ? "बुकिंग बंद" : "Booking closed"
                                : isHindi ? `${k.availability.seatsLeft} स्थान शेष` : `${k.availability.seatsLeft} seats left`}
                            </span>
                          )}
                          {desc && <span className="block text-[11px] font-normal text-on-surface-variant mt-0.5">{desc}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plan Options */}
              {activeService && (
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-2">
                    {isHindi ? "परामर्श संस्करण (Consultation Tier)" : "Available Tiers"}
                  </label>
                  <div className="space-y-3">
                    {visiblePlans.map((p) => {
                      const isSelected = p.slug === selectedPlanSlug;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlanSlug(p.slug)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                            isSelected
                              ? "bg-surface border-2 border-primary shadow-sm ring-1 ring-primary/20"
                              : "bg-surface-container-low/60 border-outline-variant/60 hover:bg-surface"
                          }`}
                        >
                          <div>
                            <div className="font-serif font-bold text-sm text-secondary flex items-center gap-2">
                              <span>{isHindi ? p.titleHi : p.titleEn}</span>
                              {isSelected && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand text-on-brand">
                                  {isHindi ? "चयनित" : "Selected"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-1.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-secondary" />
                                {p.deliveryDays} {isHindi ? "कार्यदिवस" : "days delivery"}
                              </span>
                              {p.pages && (
                                <span>• {p.pages} {isHindi ? "पृष्ठ" : "pages"}</span>
                              )}
                              {p.hasCall && (
                                <span className="flex items-center gap-1 text-primary font-medium">
                                  <PhoneCall className="w-3 h-3" />
                                  {p.callDurationMinutes} {isHindi ? "मिनट परामर्श" : "mins call"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="font-serif font-bold text-lg text-secondary shrink-0">
                            {formatPaiseToInr(p.pricePaise)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

    </>
  );

  const slotPickerJsx = (
    <>
              {/* Appointment Slot Selection (Required if plan has live call) */}
              {activePlan?.hasCall && (
                <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                  <div className="font-serif font-bold text-sm text-secondary flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-primary" />
                    <span>
                      {isHindi
                        ? "परामर्श काल खंड आरक्षित करें (Appointment Slot) *"
                        : "Select Consultation Appointment Slot *"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {isHindi
                      ? "केंद्र परामर्श दल के साथ ३० मिनट प्रत्यक्ष वार्ता हेतु उपलब्ध समय चुनें।"
                      : "Choose a reserved timeframe for your live Kendra team consultation."}
                  </p>

                  {initialSlots.length === 0 ? (
                    <div className="p-4 bg-surface-container-low rounded border border-outline-variant text-xs text-secondary">
                      {isHindi
                        ? "आगामी स्लॉट आदेश उपरांत केंद्र दल द्वारा निर्धारित किए जाएंगे।"
                        : "Slots will be allocated directly after consultation booking."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {initialSlots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`p-3 rounded border cursor-pointer transition-all text-xs flex items-center justify-between ${
                              isSelected
                                ? "bg-surface border-2 border-primary font-bold text-secondary shadow-sm"
                                : "bg-surface-container-low border-outline-variant/60 hover:bg-surface text-on-surface"
                            }`}
                          >
                            <div>
                              <div>{slot.date}</div>
                              <div className="font-mono text-primary mt-0.5">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

    </>
  );

  return (
    <div className="w-full flex flex-col text-left space-y-8">
      {/* Broadsheet Stepper Header */}
      <div className="w-full bg-surface-container rounded-lg p-4 border border-outline-variant/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary bg-brand/20 px-2.5 py-1 rounded">
              {isHindi ? `चरण ${currentStep} / ३` : `Step ${currentStep} of 3`}
            </span>
            <span className="font-serif font-bold text-sm sm:text-base text-secondary">
              {kundliMode
                ? currentStep === 1
                  ? isHindi
                    ? "१. कुण्डली चुनें"
                    : "1. Select Kundli"
                  : currentStep === 2
                  ? isHindi
                    ? "२. फ़ॉर्म भरें"
                    : "2. Form filling"
                  : isHindi
                  ? "३. प्लान चुनें और भुगतान"
                  : "3. Plan selection & payment"
                : currentStep === 1
                ? isHindi
                  ? "१. सेवा एवं संस्करण चयन"
                  : "1. Service & Plan Confirmation"
                : currentStep === 2
                ? isHindi
                  ? "२. जातक जन्म विवरण"
                  : "2. Jataka Birth Details"
                : isHindi
                ? "३. दक्षिणा विवरण एवं पुष्टि"
                : "3. Review & Order Confirmation"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? "सत्यापित वैदिक परामर्श" : "Verified Consultation"}</span>
          </div>
        </div>
      </div>

      {/* Booking path: Service > Plan > Details > Offer > Referral > Payment > Confirmation */}
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-semibold text-on-surface-variant" aria-label="Booking steps">
        {(
          (kundliMode
            ? [
                [isHindi ? "कुण्डली चुनें" : "Select Kundli", 1],
                [isHindi ? "फ़ॉर्म भरें" : "Form filling", 2],
                [isHindi ? "प्लान चुनें" : "Plan selection", 3],
                [isHindi ? "ऑफर" : "Offer", 3],
                [isHindi ? "रेफरल कोड" : "Referral code", 3],
                [isHindi ? "भुगतान (Razorpay / UPI)" : "Payment (Razorpay / UPI)", 4],
                [isHindi ? "जमा" : "Submitted", 4],
                [isHindi ? "पुष्टि" : "Confirmation", 4],
              ]
            : [
                [isHindi ? "सेवा" : "Service", 1],
                [isHindi ? "पैकेज" : "Package", 1],
                [isHindi ? "प्लान" : "Plan", 1],
                [isHindi ? "विवरण" : "Details", 2],
                [isHindi ? "ऑफर" : "Offer", 3],
                [isHindi ? "रेफरल कोड" : "Referral code", 3],
                [isHindi ? "भुगतान (Razorpay / UPI)" : "Payment (Razorpay / UPI)", 4],
                [isHindi ? "पुष्टि" : "Confirmation", 4],
              ]) as Array<[string, number]>
        ).map(([label, at], i, arr) => (
          <li key={label} className="inline-flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full border ${currentStep >= at && at < 4 ? "bg-brand text-on-brand border-brand" : "border-outline-variant/60"}`}>{label}</span>
            {i < arr.length - 1 && <span aria-hidden="true">&rsaquo;</span>}
          </li>
        ))}
      </ol>

      {submissionError && (
        <div className="p-4 bg-surface rounded border border-error text-xs text-on-error-container font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Main Asymmetric Layout (7 Cols Left / 5 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
          {/* STEP 1: Service & Plan Selection */}
          {currentStep === 1 && (
            <div className="bg-surface p-6 rounded-lg border border-outline-variant/60 shadow-sm space-y-6 text-left">
              <div>
                <h2 className="font-serif text-xl font-bold text-secondary">
                  {isHindi ? "सेवा एवं संस्करण चुनें" : "Select Service & Consultation Tier"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isHindi
                    ? "अपनी आवश्यकतानुसार शास्त्रसम्मत सेवा और उसका प्रारूप चुनें।"
                    : "Confirm your astrological service and consultation format."}
                </p>
              </div>

              {/* Service Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase text-secondary mb-2">
                  {isHindi ? "सेवा (Service)" : "Astrological Service"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSelected = s.slug === selectedServiceSlug;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceSlug(s.slug);
                          if (s.plans[0]) {
                            setSelectedPlanSlug(s.plans[0].slug);
                            setSelectedPackageId(s.plans[0].packageId ?? "");
                          }
                        }}
                        className={`min-h-[44px] p-3 rounded text-left border transition-all text-xs flex items-center justify-between ${
                          isSelected
                            ? "bg-surface border-2 border-primary ring-1 ring-primary/20 font-bold text-secondary"
                            : "bg-surface-container-low border-outline-variant/60 hover:bg-surface text-on-surface"
                        }`}
                      >
                        <span>{isHindi ? s.titleHi : s.titleEn}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!kundliMode && planChoiceJsx}

              {/* Action */}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2"
                >
                  <span>{isHindi ? (kundliMode ? "अगला: फ़ॉर्म भरें" : "अगला: जन्म विवरण दर्ज करें") : kundliMode ? "Next: Fill the form" : "Next: Jataka Birth Details"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Jataka Details & Appointment Slot */}
          {currentStep === 2 && (
            <div className="bg-surface p-6 rounded-lg border border-outline-variant/60 shadow-sm space-y-6 text-left">
              <div>
                <h2 className="font-serif text-xl font-bold text-secondary">
                  {isHindi ? "जातक जन्म विवरण" : "Jataka Natal & Birth Details"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isHindi
                    ? "कुण्डली गणितीय गणना हेतु सही जन्म तिथि, समय व स्थान आवश्यक है।"
                    : "Accurate date, time, and coordinates are required for computational ephemeris scrutiny."}
                </p>
              </div>

              {/* Primary Jataka Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "जातक का नाम *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Aditya Sharma"
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "लिंग *" : "Gender *"}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as "MALE" | "FEMALE" | "OTHER",
                        })
                      }
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    >
                      <option value="MALE">{isHindi ? "पुरुष (Male)" : "Male"}</option>
                      <option value="FEMALE">{isHindi ? "महिला (Female)" : "Female"}</option>
                      <option value="OTHER">{isHindi ? "अन्य (Other)" : "Other"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "जन्म तिथि *" : "Date of Birth *"}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase text-secondary">
                        {isHindi ? "जन्म समय *" : "Time of Birth *"}
                      </label>
                      <label className="flex items-center gap-1 text-[11px] text-on-surface-variant cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isTimeUnknown}
                          onChange={(e) =>
                            setFormData({ ...formData, isTimeUnknown: e.target.checked })
                          }
                          className="w-3.5 h-3.5 text-primary rounded"
                        />
                        <span>{isHindi ? "समय अज्ञात" : "Unknown Time"}</span>
                      </label>
                    </div>
                    <input
                      type="time"
                      disabled={formData.isTimeUnknown}
                      value={formData.tob}
                      onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "जन्म स्थान (शहर / जिला) *" : "Place of Birth (City/State) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pob}
                      onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                      placeholder="City, State"
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "संपर्क मोबाइल नंबर *" : "Contact Mobile *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91-9827991224"
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "ईमेल (वैकल्पिक)" : "Email Address (Optional)"}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@example.com"
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      {isHindi ? "परामर्श भाषा *" : "Consultation Language *"}
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          language: e.target.value as "hi" | "en",
                        })
                      }
                      className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                    >
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                {/* Specific Queries */}
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    {isHindi
                      ? "विशिष्ट प्रश्न / जीवन जिज्ञासाएँ (वैकल्पिक)"
                      : "Specific Life Inquiries / Concerns (Optional)"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.queries}
                    onChange={(e) => setFormData({ ...formData, queries: e.target.value })}
                    placeholder={
                      isHindi
                        ? "उदा. विवाह का समय, व्यापार विस्तार, पदोन्नति की संभावना..."
                        : "e.g. Vocational career milestones, marital timing, venture feasibility..."
                    }
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Partner Details for Matching Service */}
              {isMatchingService && (
                <div className="pt-4 border-t border-outline-variant/30 space-y-4">
                  <div className="font-serif font-bold text-sm text-secondary">
                    {isHindi ? "वर / वधू (साझेदार) विवरण • Partner Details" : "Partner / Spouse Details (Matching)"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-secondary mb-1">
                        {isHindi ? "साझेदार का नाम *" : "Partner Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.partnerName}
                        onChange={(e) =>
                          setFormData({ ...formData, partnerName: e.target.value })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-secondary mb-1">
                        {isHindi ? "साझेदार जन्म तिथि *" : "Partner Date of Birth *"}
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.partnerDob}
                        onChange={(e) =>
                          setFormData({ ...formData, partnerDob: e.target.value })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-secondary mb-1">
                        {isHindi ? "साझेदार जन्म समय *" : "Partner Time of Birth *"}
                      </label>
                      <input
                        type="time"
                        value={formData.partnerTob}
                        onChange={(e) =>
                          setFormData({ ...formData, partnerTob: e.target.value })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-secondary mb-1">
                        {isHindi ? "साझेदार जन्म स्थान *" : "Partner Place of Birth *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.partnerPob}
                        onChange={(e) =>
                          setFormData({ ...formData, partnerPob: e.target.value })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!kundliMode && slotPickerJsx}

              {/* Actions */}
              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHindi ? "पीछे" : "Back"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name || !formData.pob || !formData.phone) {
                      setSubmissionError(
                        isHindi
                          ? "कृपया नाम, जन्म स्थान और मोबाइल नंबर दर्ज करें।"
                          : "Please fill in Name, Place of Birth, and Mobile Number."
                      );
                      return;
                    }
                    if (isMatchingService && (!formData.partnerName.trim() || !formData.partnerPob.trim())) {
                      setSubmissionError(
                        isHindi
                          ? "कृपया साथी का नाम और जन्म स्थान दर्ज करें।"
                          : "Please fill in the partner's Name and Place of Birth."
                      );
                      return;
                    }
                    if (!kundliMode && activePlan?.hasCall && initialSlots.length > 0 && !selectedSlotId) {
                      setSubmissionError(
                        isHindi
                          ? "कृपया परामर्श हेतु एक समय स्लॉट चुनें।"
                          : "Please select an appointment slot for the consultation call."
                      );
                      return;
                    }
                    setSubmissionError(null);
                    setCurrentStep(3);
                  }}
                  className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2"
                >
                  <span>{isHindi ? (kundliMode ? "अगला: प्लान चुनें" : "समीक्षा एवं पुष्टि करें") : kundliMode ? "Next: Choose your plan" : "Review & Summary"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Review & Confirmation */}
          {currentStep === 3 && (
            <div className="bg-surface p-6 rounded-lg border border-outline-variant/60 shadow-sm space-y-6 text-left">
              <div>
                <h2 className="font-serif text-xl font-bold text-secondary">
                  {isHindi ? "जातक विवरण एवं आदेश समीक्षा" : "Order Summary & Review"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isHindi
                    ? "कृपया आदेश पुष्टि से पूर्व अपने जन्म विवरण की पुनः जाँच कर लें।"
                    : "Please review your birth epoch details before creating the order."}
                </p>
              </div>

              {kundliMode && (
                <div className="space-y-4 pb-5 border-b border-outline-variant/30">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-secondary">{isHindi ? "प्लान चुनें" : "Plan selection"}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {isHindi ? "अपना फ़ॉर्म भरने के बाद अब पैकेज और प्लान चुनें।" : "Your form is filled. Now choose the package and plan for your Kundli."}
                    </p>
                  </div>
                  {planChoiceJsx}
                  {slotPickerJsx}
                </div>
              )}

              {/* Jataka Summary Card */}
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/40 space-y-2 text-xs">
                <div className="font-serif font-bold text-sm text-secondary border-b border-outline-variant/30 pb-2 flex items-center justify-between">
                  <span>{isHindi ? "जातक विवरण" : "Jataka Particulars"}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-primary font-sans hover:underline text-[11px]"
                  >
                    {isHindi ? "संशोधन करें (Edit)" : "Edit"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface">
                  <div>
                    <span className="text-on-surface-variant">{isHindi ? "नाम:" : "Name:"}</span>{" "}
                    <strong>{formData.name}</strong> ({formData.gender})
                  </div>
                  <div>
                    <span className="text-on-surface-variant">{isHindi ? "जन्म तिथि:" : "DOB:"}</span>{" "}
                    <strong>{formData.dob}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">{isHindi ? "जन्म समय:" : "Time:"}</span>{" "}
                    <strong>{formData.isTimeUnknown ? "Unknown" : formData.tob}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">{isHindi ? "जन्म स्थान:" : "POB:"}</span>{" "}
                    <strong>{formData.pob}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">{isHindi ? "मोबाइल:" : "Mobile:"}</span>{" "}
                    <strong>{formData.phone}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">{isHindi ? "भाषा:" : "Language:"}</span>{" "}
                    <strong>{formData.language === "hi" ? "हिन्दी" : "English"}</strong>
                  </div>
                </div>

                {formData.queries && (
                  <div className="pt-2 border-t border-outline-variant/30">
                    <span className="text-on-surface-variant">{isHindi ? "प्रश्न:" : "Query:"}</span>{" "}
                    <span className="text-on-surface">{formData.queries}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHindi ? "विवरण संशोधित करें" : "Edit Details"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={submitting}
                  className="min-h-[44px] px-8 py-3 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {submitting
                      ? isHindi
                        ? "आदेश प्रविष्ट हो रहा है..."
                        : "Placing Order..."
                      : isHindi
                      ? `आदेश सुरक्षित करें (${formatPaiseToInr(netPayablePaise)})`
                      : `Confirm & Create Order (${formatPaiseToInr(netPayablePaise)})`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Verified Billing Math & Snapshot */}
        <div className="lg:col-span-5 bg-surface-container-low p-6 rounded-lg border border-secondary/30 sticky top-28 space-y-6 text-left">
          <div className="border-b border-outline-variant/50 pb-3">
            <div className="text-xs uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{isHindi ? "दक्षिणा गणना विवरण" : "Dakshina Billing Breakdown"}</span>
            </div>
          </div>

          {/* Selected Plan Details */}
          {activeService && activePlan && (
            <div className="p-3 bg-surface rounded border border-outline-variant/40 text-left space-y-1">
              <div className="font-serif font-bold text-sm text-secondary">
                {isHindi ? activeService.titleHi : activeService.titleEn}
              </div>
              <div className="text-xs text-primary font-medium">
                {isHindi ? activePlan.titleHi : activePlan.titleEn}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant pt-1">
                <Clock className="w-3 h-3 text-secondary" />
                <span>{activePlan.deliveryDays} {isHindi ? "कार्यदिवस वितरण" : "days delivery"}</span>
              </div>
            </div>
          )}

          {/* Promotional Coupon Input */}
          <div className="space-y-2 text-left">
            <label className="block text-xs font-bold uppercase text-secondary">
              {isHindi ? "छूट कूपन (Promo Code)" : "Promo Code"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={offerCodeInput}
                onChange={(e) => setOfferCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. VEDIC2025"
                disabled={offerLoading || (appliedOffer !== null && !offerIsAuto)}
                className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-xs font-mono font-bold uppercase min-h-[44px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {appliedOffer && !offerIsAuto ? (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedOffer(null);
                    setOfferCodeInput("");
                  }}
                  className="min-h-[44px] px-3 bg-surface border border-outline-variant text-on-error-container rounded hover:bg-surface-container"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleValidateOffer()}
                  disabled={offerLoading || !offerCodeInput.trim()}
                  className="min-h-[44px] px-4 bg-brand text-on-brand rounded text-xs uppercase font-bold hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  {offerLoading ? "..." : isHindi ? "लागू" : "Apply"}
                </button>
              )}
            </div>

            {offerError && (
              <div className="text-[11px] text-on-error-container font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{offerError}</span>
              </div>
            )}

            {appliedOffer && (
              <div className="text-[11px] text-secondary font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                <span>
                  {offerIsAuto
                    ? isHindi
                      ? `ऑफर '${appliedOffer.code}' अपने आप लागू हुआ (-${appliedOffer.discountFormatted})`
                      : `Offer '${appliedOffer.code}' applied automatically (-${appliedOffer.discountFormatted})`
                    : isHindi
                      ? `'${appliedOffer.code}' लागू (-${appliedOffer.discountFormatted})`
                      : `'${appliedOffer.code}' applied (-${appliedOffer.discountFormatted})`}
                </span>
              </div>
            )}
          </div>

          {/* Offers for this plan */}
          {planOffers.length > 0 && (!appliedOffer || offerIsAuto) && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-secondary">{isHindi ? "इस प्लान के ऑफर" : "Offers on this plan"}</div>
              <ul className="space-y-1.5">
                {planOffers.map((o) => (
                  <li key={o.code} className="flex items-center justify-between gap-2 rounded border border-outline-variant/60 bg-surface px-3 py-2">
                    <div className="min-w-0 text-[11px]">
                      <div className="font-semibold text-secondary truncate">{isHindi ? o.titleHi : o.titleEn}</div>
                      <div className="font-mono text-on-surface-variant">{o.code} · -{o.discountFormatted}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOfferCodeInput(o.code);
                        handleValidateOffer(o.code, false);
                      }}
                      className="shrink-0 min-h-[36px] px-3 bg-brand text-on-brand rounded text-[11px] font-bold uppercase hover:bg-brand-hover"
                    >
                      {isHindi ? "लगाएँ" : "Apply"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Referral code */}
          <div className="space-y-2 text-left">
            <label className="block text-xs font-bold uppercase text-secondary">
              {isHindi ? "रेफरल कोड (Referral Code)" : "Referral Code"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => {
                  setReferralInput(e.target.value.toUpperCase());
                  setReferralApplied(null);
                  setReferralError(null);
                }}
                placeholder={isHindi ? "सहयोगी का कोड (वैकल्पिक)" : "Associate code (optional)"}
                disabled={referralLoading}
                className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-xs font-mono font-bold uppercase min-h-[44px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {referralApplied ? (
                <button
                  type="button"
                  onClick={() => {
                    setReferralApplied(null);
                    setReferralInput("");
                  }}
                  aria-label={isHindi ? "रेफरल कोड हटाएँ" : "Remove referral code"}
                  className="min-h-[44px] px-3 bg-surface border border-outline-variant text-on-error-container rounded hover:bg-surface-container"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckReferral}
                  disabled={referralLoading || !referralInput.trim()}
                  className="min-h-[44px] px-4 bg-brand text-on-brand rounded text-xs uppercase font-bold hover:bg-brand-hover disabled:opacity-50"
                >
                  {referralLoading ? "..." : isHindi ? "जाँचें" : "Check"}
                </button>
              )}
            </div>
            {referralError && (
              <div className="text-[11px] text-on-error-container font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{referralError}</span>
              </div>
            )}
            {referralApplied && (
              <div className="text-[11px] text-secondary font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                <span>{isHindi ? `रेफरल कोड '${referralApplied}' जुड़ गया` : `Referral code '${referralApplied}' added`}</span>
              </div>
            )}
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2 text-xs border-t border-outline-variant/40 pt-4 text-on-surface">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">
                {isHindi ? "आधार दक्षिणा (Base Dakshina):" : "Base Dakshina:"}
              </span>
              <span className="font-medium">{formatPaiseToInr(basePricePaise)}</span>
            </div>

            {discountPaise > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>{isHindi ? "कूपन छूट (Coupon Discount):" : "Offer Discount:"}</span>
                <span>-{formatPaiseToInr(discountPaise)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-on-surface-variant">
                {isHindi ? "कर योग्य दक्षिणा (Taxable):" : "Taxable Dakshina:"}
              </span>
              <span>{formatPaiseToInr(taxablePaise)}</span>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>{isHindi ? `वस्तु एवं सेवा कर (GST @ ${gstPercentLabel}%):` : `GST @ ${gstPercentLabel}%:`}</span>
              <span>{formatPaiseToInr(gstPaise)}</span>
            </div>

            <div className="pt-3 border-t border-outline-variant/40 flex justify-between items-baseline font-bold">
              <span className="font-serif text-sm text-secondary">
                {isHindi ? "कुल देय दक्षिणा:" : "Net Auspicious Dakshina:"}
              </span>
              <span className="font-serif text-xl text-secondary">
                {formatPaiseToInr(netPayablePaise)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
