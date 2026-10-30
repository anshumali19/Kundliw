"use client";

import { useId, useState } from "react";

/** A small (i) in a circle. Tap or hover it to read a short note about what an option does. */
export function InfoTip({ text, label = "What is this?", className = "" }: { text: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className={`relative inline-flex align-middle ${className}`} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary text-[11px] font-bold italic leading-none text-primary hover:bg-primary hover:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-6 z-[80] w-64 max-w-[80vw] rounded-lg border border-outline-variant bg-surface p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-on-surface shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
