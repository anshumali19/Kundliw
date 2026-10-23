import React from "react";
import { CanonicalOrderStatus, ORDER_STATUS_ORDER } from "@/lib/orders/status";
import {
  CheckCircle2,
  Clock,
  Circle,
  Truck,
  CheckCheck,
  FileCheck,
  Package,
} from "lucide-react";

interface StatusEventItem {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
  changedByName?: string | null;
}

interface OrderStatusStepperProps {
  currentStatus: CanonicalOrderStatus;
  events?: StatusEventItem[];
  trackingNumber?: string | null;
  locale: string;
}

const STEP_DEFINITIONS: Array<{
  status: CanonicalOrderStatus;
  labelEn: string;
  labelHi: string;
  descEn: string;
  descHi: string;
  icon: typeof CheckCircle2;
}> = [
  {
    status: "ORDER_RECEIVED",
    labelEn: "Order Received",
    labelHi: "आदेश प्राप्त",
    descEn: "Dakshina confirmed and registered in Kendra ledger.",
    descHi: "दक्षिणा प्राप्त एवं आश्रम बही में सुरक्षित दर्ज।",
    icon: Clock,
  },
  {
    status: "KUNDLI_IN_PROGRESS",
    labelEn: "Kundli In Progress",
    labelHi: "कुण्डली गणना प्रारंभ",
    descEn: "Mathematical calculations and planetary degrees underway.",
    descHi: "शुद्ध दृग्गणित एवं ग्रह-स्पष्ट गणना कार्य प्रगति पर।",
    icon: FileCheck,
  },
  {
    status: "KUNDLI_COMPLETE",
    labelEn: "Kundli Complete",
    labelHi: "पत्रिका निर्मित",
    descEn: "Pandit verification and chart audit finalized.",
    descHi: "दैवज्ञ समीक्षा एवं षोडशवर्ग चक्र संकलन सम्पन्न।",
    icon: CheckCircle2,
  },
  {
    status: "DISPATCHED",
    labelEn: "Dispatched",
    labelHi: "सुरक्षित प्रेषित",
    descEn: "Dispatched via Speed Post / Vault upload initiated.",
    descHi: "डाक द्वारा प्रेषित अथवा डिजिटल वॉल्ट में अपलोड।",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    labelEn: "Delivered",
    labelHi: "यजमान को प्राप्त",
    descEn: "Pothi received by Yajman / Vault dossier ready.",
    descHi: "पत्रिका यजमान को ससम्मान प्राप्त।",
    icon: Package,
  },
  {
    status: "EXECUTION_COMPLETE",
    labelEn: "Execution Complete",
    labelHi: "परामर्श सम्पन्न",
    descEn: "Vedic consultation session and remedies completed.",
    descHi: "व्यक्तिगत वार्ता एवं शास्त्रीय उपाय विधान सम्पन्न।",
    icon: CheckCheck,
  },
];

export function OrderStatusStepper({
  currentStatus,
  events = [],
  trackingNumber,
  locale,
}: OrderStatusStepperProps) {
  const isHindi = locale === "hi";
  const currentIndex = ORDER_STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full text-left space-y-6">
      {/* Visual Stepper Track */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEP_DEFINITIONS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div
                key={step.status}
                className={`p-3 rounded border text-left flex flex-col justify-between transition-colors ${
                  isCurrent
                    ? "bg-surface-container-highest border-primary-container ring-1 ring-primary-container"
                    : isCompleted
                    ? "bg-surface-container-low border-secondary/40"
                    : "bg-surface border-outline-variant/30 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-outline">
                      {isHindi ? `चरण ०${idx + 1}` : `Stage 0${idx + 1}`}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-outline" />
                    )}
                  </div>

                  <h4
                    className={`font-serif text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-secondary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {isHindi ? step.labelHi : step.labelEn}
                  </h4>
                </div>

                <p className="text-[10px] text-on-surface-variant mt-2 leading-snug line-clamp-2">
                  {isHindi ? step.descHi : step.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Number Callout (if dispatched) */}
      {trackingNumber && (
        <div className="p-3 bg-surface-container-low rounded border border-secondary/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-secondary shrink-0" />
            <span>
              <strong>{isHindi ? "स्पीड पोस्ट ट्रैकिंग:" : "Speed Post Tracking:"}</strong>{" "}
              <span className="font-mono font-bold text-primary">{trackingNumber}</span>
            </span>
          </div>
          <a
            href={`https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-secondary underline hover:text-primary"
          >
            {isHindi ? "इंडिया पोस्ट पर ट्रैक करें" : "Track on India Post"}
          </a>
        </div>
      )}

      {/* Events Timeline Log */}
      {events.length > 0 && (
        <div className="pt-2 border-t border-outline-variant/40 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-outline block">
            {isHindi ? "आदेश प्रक्रिया इतिहास" : "Status Transition Log"}
          </span>

          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 bg-surface-container rounded text-xs border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div>
                  <span className="font-bold text-secondary">
                    {evt.status.replace(/_/g, " ")}:
                  </span>{" "}
                  <span className="text-on-surface">{evt.note || "Status updated"}</span>
                  {evt.changedByName && (
                    <span className="text-[10px] text-primary block mt-0.5">
                      Verified by: {evt.changedByName}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono shrink-0">
                  {new Date(evt.createdAt).toLocaleString(isHindi ? "hi-IN" : "en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
