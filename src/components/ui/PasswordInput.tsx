"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useLocale } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

/** Password box with a show / hide button. Takes the same props as an input. */
export function PasswordInput({ className = "", ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const isHindi = useLocale() === "hi";
  const [shown, setShown] = useState(false);
  const label = shown ? (isHindi ? "पासवर्ड छिपाएँ" : "Hide password") : isHindi ? "पासवर्ड दिखाएँ" : "Show password";
  return (
    <div className="relative">
      <input {...rest} type={shown ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={label}
        aria-pressed={shown}
        title={label}
        className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-on-surface-variant hover:text-primary"
      >
        {shown ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
