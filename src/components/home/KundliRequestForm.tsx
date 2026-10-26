"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const input =
  "min-h-[48px] w-full border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-saffron";
const label = "flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wide text-secondary";

/** Short birth-detail request. It reaches the Kendra's Enquiries screen; nothing is charged. */
export function KundliRequestForm({ isHindi, whatsappHref }: { isHindi: boolean; whatsappHref: string }) {
  const tr = (en: string, hi: string) => (isHindi ? hi : en);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    const message = [
      `${tr("Kundli request", "कुंडली अनुरोध")}`,
      `${tr("Name", "नाम")}: ${f.get("name")}`,
      `${tr("Date of birth", "जन्म तिथि")}: ${f.get("dob")}`,
      `${tr("Time of birth", "जन्म समय")}: ${f.get("tob")}`,
      `${tr("Place of birth", "जन्म स्थान")}: ${f.get("pob")}`,
    ].join("\n");
    try {
      const res = await fetch("/api/contact/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(f.get("name") || ""),
          phone: String(f.get("phone") || ""),
          subject: "Kundli request",
          message,
          source: "SERVICE_MODAL",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || tr("Could not send. Please try again.", "भेजा नहीं जा सका। कृपया पुनः प्रयास करें।"));
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="p-8 sm:p-10 flex flex-col gap-4 items-start" role="status">
        <CheckCircle2 className="w-9 h-9 text-primary" aria-hidden="true" />
        <h3 className="font-serif text-3xl font-bold text-secondary">{tr("Request received", "अनुरोध प्राप्त हुआ")}</h3>
        <p className="text-sm text-on-surface-variant max-w-md">
          {tr("Thank you. The Kendra will contact you on the number you gave. You can also continue on WhatsApp.", "धन्यवाद। केंद्र आपके दिए नंबर पर संपर्क करेगा। आप व्हाट्सऐप पर भी बात कर सकते हैं।")}
        </p>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[48px] px-6 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider">
          {tr("Continue on WhatsApp", "व्हाट्सऐप पर जारी रखें")}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className={label}>
        {tr("Full name", "पूरा नाम")}
        <input name="name" required minLength={2} maxLength={100} className={input} autoComplete="name" />
      </label>
      <label className={label}>
        {tr("Mobile number", "मोबाइल नंबर")}
        <input name="phone" required minLength={10} maxLength={15} inputMode="tel" className={input} autoComplete="tel" />
      </label>
      <label className={label}>
        {tr("Date of birth", "जन्म तिथि")}
        <input name="dob" type="date" required className={input} />
      </label>
      <label className={label}>
        {tr("Time of birth", "जन्म समय")}
        <input name="tob" type="time" required className={input} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        {tr("Place of birth", "जन्म स्थान")}
        <input name="pob" required minLength={2} maxLength={120} className={input} />
      </label>
      {state === "error" && (
        <p role="alert" className="sm:col-span-2 flex items-center gap-2 text-sm text-on-error-container">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider shadow-[0_12px_28px_rgba(174,55,25,0.24)] disabled:opacity-60">
          {state === "sending" && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {tr("Request Kundli", "कुंडली अनुरोध भेजें")}
        </button>
      </div>
    </form>
  );
}
