"use client";

import { Printer } from "lucide-react";

/** Opens the browser print dialog, where "Save as PDF" produces the PDF (works for Hindi text too). */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden min-h-[44px] px-4 inline-flex items-center gap-2 rounded border border-maroon bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}
