import { Check } from "lucide-react";

const STEPS: Array<{ en: string; hi: string; hintEn: string; hintHi: string }> = [
  { en: "Service", hi: "सेवा", hintEn: "Choose what you need", hintHi: "अपनी आवश्यकता की सेवा चुनें" },
  { en: "Package", hi: "पैकेज", hintEn: "Pick a version of the service", hintHi: "सेवा का रूप चुनें" },
  { en: "Plan", hi: "प्लान", hintEn: "Pick the plan and see the price", hintHi: "प्लान चुनें और कीमत देखें" },
  { en: "Offer", hi: "ऑफ़र", hintEn: "Apply a promo code if you have one", hintHi: "प्रोमो कोड हो तो लगाएँ" },
  { en: "Your details", hi: "आपका विवरण", hintEn: "Birth details and call time", hintHi: "जन्म विवरण और कॉल का समय" },
  { en: "Pay", hi: "भुगतान", hintEn: "Pay online, by UPI, QR or bank", hintHi: "ऑनलाइन, UPI, QR या बैंक से भुगतान" },
  { en: "Bill & invoice", hi: "बिल व इनवॉइस", hintEn: "Download your invoice and ticket", hintHi: "इनवॉइस और टिकट डाउनलोड करें" },
];

/**
 * The whole booking journey in one strip: Service > Package > Plan > Offer > Details > Pay > Bill & invoice.
 * `from`..`to` are the steps the visitor is on right now (1 to 7); earlier steps show as done.
 */
export function BookingSteps({ from, to = from, isHindi }: { from: number; to?: number; isHindi: boolean }) {
  const hint = STEPS[from - 1];
  return (
    <nav aria-label={isHindi ? "बुकिंग के चरण" : "Booking steps"} className="mb-6 rounded-lg border border-outline-variant/50 bg-surface p-3 text-left">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < from;
          const here = n >= from && n <= to;
          return (
            <li key={s.en} className="flex items-center gap-1.5" aria-current={here ? "step" : undefined}>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  here ? "bg-brand text-on-brand" : done ? "bg-emerald-600 text-white" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
              </span>
              <span className={`text-xs ${here ? "font-bold text-secondary" : "text-on-surface-variant"}`}>{isHindi ? s.hi : s.en}</span>
              {n < STEPS.length && <span aria-hidden="true" className="mx-1 text-outline">›</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] text-on-surface-variant">
        {isHindi ? `अभी: ${hint.hintHi}` : `Now: ${hint.hintEn}`}
        {to > from ? (isHindi ? ` · फिर ${STEPS[to - 1].hintHi}` : ` · then ${STEPS[to - 1].hintEn.toLowerCase()}`) : ""}
      </p>
    </nav>
  );
}
