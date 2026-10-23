import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { formatPaiseToInr } from "@/lib/billing/gst";
import {
  CheckCircle2,
  Calendar,
  Clock,
  PhoneCall,
  User,
  MapPin,
  Layers,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Sparkles,
} from "lucide-react";

interface BookingSuccessPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  params: { locale, id },
}: BookingSuccessPageProps) {
  // 1. Authentication required
  const user = await requireUser(`/booking/success/${id}`, locale);
  const isHindi = locale === "hi";

  // 2. Query order from database
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      plan: true,
      slot: true,
      offer: true,
      statusEvents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // 3. Security guard: only visible to order owner or ADMIN
  if (!order) {
    notFound();
  }

  const isOwner = order.userId === user.id;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    notFound();
  }

  const jataka = order.jatakaDetails as Record<string, unknown>;
  const partner = jataka.partnerDetails as Record<string, unknown> | undefined;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left text-on-surface">
      {/* Success Banner */}
      <div className="bg-surface-container rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-primary font-bold">
                {isHindi ? "आदेश सफलतापूर्वक दर्ज" : "Order Placed Successfully"}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
                {order.orderNumber}
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-on-surface-variant block">
              {isHindi ? "प्रक्रिया स्थिति:" : "Status:"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tertiary-fixed text-on-tertiary-fixed mt-1">
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {isHindi
            ? "आपका वैदिक ज्योतिष परामर्श आदेश सुरक्षित रूप से पंजीकृत कर लिया गया है। आचार्यगण शीघ्र ही आपकी कुण्डली गणना प्रारंभ करेंगे।"
            : "Your Vedic astrological order has been securely registered in our system. Astrological calculations will commence shortly."}
        </p>
      </div>

      {/* Main Order Receipt Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left">
        {/* Left 7 cols: Service & Jataka Details */}
        <div className="md:col-span-7 space-y-6 text-left">
          {/* Service & Plan Box */}
          <div className="bg-surface p-5 rounded-lg border border-outline-variant/60 shadow-sm space-y-2 text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-outline-variant/30 pb-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>{isHindi ? "चयनित सेवा एवं संस्करण" : "Service & Tier"}</span>
            </div>

            <div className="pt-1">
              <div className="font-serif font-bold text-base text-secondary">
                {order.service
                  ? isHindi
                    ? order.service.titleHi
                    : order.service.titleEn
                  : "Astrological Consultation"}
              </div>
              <div className="text-xs text-primary font-medium mt-0.5">
                {order.plan
                  ? isHindi
                    ? order.plan.titleHi
                    : order.plan.titleEn
                  : "Standard Tier"}
              </div>
            </div>

            {order.slot && (
              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/40 mt-3 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong>{isHindi ? "परामर्श कालखंड:" : "Reserved Time:"}</strong>{" "}
                  {order.slot.date.toISOString().slice(0, 10)} ({order.slot.startTime} - {order.slot.endTime} IST)
                </span>
              </div>
            )}
          </div>

          {/* Jataka Birth Particulars */}
          <div className="bg-surface p-5 rounded-lg border border-outline-variant/60 shadow-sm space-y-3 text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-outline-variant/30 pb-2">
              <User className="w-4 h-4 text-primary" />
              <span>{isHindi ? "जातक जन्म विवरण" : "Jataka Natal Particulars"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface">
              <div>
                <span className="text-on-surface-variant">{isHindi ? "नाम:" : "Name:"}</span>{" "}
                <strong>{String(jataka.name || "")}</strong> ({String(jataka.gender || "")})
              </div>
              <div>
                <span className="text-on-surface-variant">{isHindi ? "जन्म तिथि:" : "DOB:"}</span>{" "}
                <strong>{String(jataka.dob || "")}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant">{isHindi ? "समय:" : "Time:"}</span>{" "}
                <strong>{jataka.isTimeUnknown ? "Unknown" : String(jataka.tob || "")}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant">{isHindi ? "स्थान:" : "POB:"}</span>{" "}
                <strong>{String(jataka.pob || "")}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant">{isHindi ? "संपर्क:" : "Contact:"}</span>{" "}
                <strong>{String(jataka.phone || "")}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant">{isHindi ? "भाषा:" : "Language:"}</span>{" "}
                <strong>{jataka.language === "hi" ? "हिन्दी" : "English"}</strong>
              </div>
            </div>

            {partner && (
              <div className="pt-3 border-t border-outline-variant/30 text-xs">
                <div className="font-bold text-secondary mb-1">
                  {isHindi ? "साझेदार विवरण:" : "Partner Details:"}
                </div>
                <div>
                  {String(partner.name || "")} • {String(partner.dob || "")} {String(partner.tob || "")} ({String(partner.pob || "")})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Verified Billing Ledger Snapshot */}
        <div className="md:col-span-5 bg-surface-container-low p-5 rounded-lg border border-secondary/30 space-y-4 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-outline-variant/40 pb-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span>{isHindi ? "प्रमाणित दक्षिणा गणना" : "Verified Billing Summary"}</span>
          </div>

          <div className="space-y-2 text-xs text-on-surface">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{isHindi ? "आधार दक्षिणा:" : "Base Amount:"}</span>
              <span>{formatPaiseToInr(order.baseAmountPaise)}</span>
            </div>

            {order.discountAmountPaise > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>
                  {isHindi ? "कूपन छूट:" : "Coupon Discount:"} ({order.offerCode})
                </span>
                <span>-{formatPaiseToInr(order.discountAmountPaise)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-on-surface-variant">{isHindi ? "कर योग्य दक्षिणा:" : "Taxable Amount:"}</span>
              <span>{formatPaiseToInr(order.taxableAmountPaise)}</span>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>{isHindi ? "वस्तु एवं सेवा कर (GST):" : "GST (18%):"}</span>
              <span>{formatPaiseToInr(order.gstAmountPaise)}</span>
            </div>

            {order.gstin && (
              <div className="text-[11px] text-on-surface-variant pt-1">
                GSTIN: <span className="font-mono">{order.gstin}</span>
              </div>
            )}

            <div className="pt-3 border-t border-outline-variant/40 flex justify-between items-baseline font-bold">
              <span className="font-serif text-sm text-secondary">
                {isHindi ? "कुल देय दक्षिणा:" : "Net Payable:"}
              </span>
              <span className="font-serif text-xl text-secondary">
                {formatPaiseToInr(order.netAmountPaise)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/30 space-y-2">
            <Link
              href="/"
              className="w-full min-h-[44px] px-4 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <span>{isHindi ? "मुख्य पृष्ठ पर लौटें" : "Return to Home"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
