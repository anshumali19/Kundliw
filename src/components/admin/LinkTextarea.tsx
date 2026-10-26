"use client";

import { useRef, useState } from "react";
import { Link2, X } from "lucide-react";
import { safeHref } from "@/lib/content/richText";

const input = "w-full min-h-[40px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-sm";

/**
 * A text box with an "Add link" button. The admin selects words (or just clicks where the link should go),
 * presses the button, types the address and the link is written into the text. No code needed.
 */
export function LinkTextarea({
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder,
  className,
  label,
  isHindi = false,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  label?: string;
  isHindi?: boolean;
  required?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const range = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const tr = (en: string, hi: string) => (isHindi ? hi : en);

  const openDialog = () => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    range.current = { start, end };
    setWords(value.slice(start, end));
    setUrl("");
    setErr("");
    setOpen(true);
  };

  const insert = () => {
    const ok = safeHref(url);
    if (!ok) {
      setErr(tr("Enter a full web address (https://...), a page like /services, a phone link (tel:+91...) or a mail link (mailto:...).", "पूरा वेब पता (https://...), या /services जैसा पेज, tel:+91... या mailto:... डालें।"));
      return;
    }
    const text = words.trim() || ok.href;
    const piece = `[${text.replace(/[\[\]]/g, "")}](${ok.href})`;
    const { start, end } = range.current;
    onChange(value.slice(0, start) + piece + value.slice(end));
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {label ? <span className="text-sm font-semibold text-secondary">{label}</span> : <span />}
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-1.5 min-h-[34px] px-2.5 rounded border border-outline-variant text-xs font-semibold text-secondary hover:bg-surface-container-high"
        >
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          {tr("Add link", "लिंक जोड़ें")}
        </button>
      </div>
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className || input}
      />
      {open && (
        <div role="dialog" aria-label={tr("Add link", "लिंक जोड़ें")} className="rounded-lg border border-primary/40 bg-surface-container-lowest p-3 space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <strong className="text-sm text-secondary">{tr("Add a link", "लिंक जोड़ें")}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label={tr("Close", "बंद करें")} className="p-1 rounded hover:bg-surface-container-high">
              <X className="w-4 h-4" />
            </button>
          </div>
          <label className="block text-xs font-semibold text-secondary space-y-1">
            {tr("Words people will click", "जिन शब्दों पर क्लिक होगा")}
            <input className={input} value={words} onChange={(e) => setWords(e.target.value)} placeholder={tr("e.g. Book now", "जैसे: अभी बुक करें")} />
          </label>
          <label className="block text-xs font-semibold text-secondary space-y-1">
            {tr("Where it goes", "कहाँ जाएगा")}
            <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://...   /services   tel:+919827991224" inputMode="url" />
          </label>
          {err && <p className="text-xs text-on-error-container" role="alert">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={insert} className="min-h-[38px] px-4 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider">
              {tr("Insert link", "लिंक डालें")}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="min-h-[38px] px-4 rounded border border-outline-variant text-xs font-semibold">
              {tr("Cancel", "रद्द करें")}
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {tr("In the text it appears as [words](address). Bold: **words**. New paragraph: a blank line.", "टेक्स्ट में यह [शब्द](पता) की तरह दिखेगा। मोटे अक्षर: **शब्द**। नया अनुच्छेद: खाली पंक्ति।")}
          </p>
        </div>
      )}
    </div>
  );
}
