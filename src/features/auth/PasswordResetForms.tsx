"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { KeyRound, MailCheck, CheckCircle2, AlertCircle } from "lucide-react";

const box = "w-full max-w-md mx-auto my-10 px-4 text-left";
const card = "bg-surface border border-outline-variant/60 rounded-xl p-6 shadow-sm space-y-4";
const input =
  "w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]";
const label = "block text-xs uppercase tracking-wider font-bold text-secondary mb-1";
const primary =
  "w-full py-3 px-4 bg-brand hover:bg-brand-hover text-on-brand text-xs uppercase tracking-wider font-bold rounded transition-colors min-h-[44px] disabled:opacity-60";

/** Step 1: the user types the email on the account and gets a reset link by email. */
export function ForgotPasswordForm() {
  const hi = useLocale() === "hi";
  const locale = hi ? "hi" : "en";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setSent(true);
      else setError(data.error || (hi ? "कुछ गलत हुआ। फिर प्रयास करें।" : "Something went wrong. Please try again."));
    } catch {
      setError(hi ? "नेटवर्क त्रुटि। फिर प्रयास करें।" : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={box}>
      <div className={card}>
        <h1 className="font-serif text-2xl font-bold text-secondary flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-primary" />
          {hi ? "पासवर्ड भूल गए" : "Forgot password"}
        </h1>
        {sent ? (
          <div className="space-y-3 text-sm text-on-surface">
            <p className="flex items-start gap-2">
              <MailCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>
                {hi
                  ? "यदि यह ईमेल हमारे यहाँ पंजीकृत है, तो पासवर्ड रीसेट का लिंक भेज दिया गया है। कृपया अपना Gmail / ईमेल जाँचें (स्पैम फ़ोल्डर भी देखें)। लिंक 60 मिनट तक चलेगा।"
                  : "If this email is registered with us, a password reset link has been sent. Please check your Gmail / inbox (and the spam folder). The link works for 60 minutes."}
              </span>
            </p>
            <Link href="/auth/signin" className="inline-block text-primary font-semibold hover:underline">
              {hi ? "साइन इन पर लौटें" : "Back to sign in"}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              {hi
                ? "अपने खाते का ईमेल लिखें। हम उस पर पासवर्ड रीसेट का लिंक भेजेंगे।"
                : "Enter the email of your account. We will send a password reset link to it."}
            </p>
            <div>
              <label className={label} htmlFor="fp-email">{hi ? "ईमेल" : "Email"}</label>
              <input id="fp-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="name@gmail.com" />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-on-error-container" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
            <button type="submit" disabled={loading || !email.trim()} className={primary}>
              {loading ? (hi ? "भेज रहे हैं…" : "Sending…") : hi ? "रीसेट लिंक भेजें" : "Send reset link"}
            </button>
            <Link href="/auth/signin" className="block text-center text-xs text-primary font-semibold hover:underline">
              {hi ? "साइन इन पर लौटें" : "Back to sign in"}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

/** Step 2: opened from the email link; sets the new password. */
export function ResetPasswordForm({ token }: { token: string }) {
  const hi = useLocale() === "hi";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(hi ? "पासवर्ड कम से कम 8 अक्षर का हो।" : "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError(hi ? "दोनों पासवर्ड एक जैसे नहीं हैं।" : "The two passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(true);
      else setError(data.error || (hi ? "कुछ गलत हुआ।" : "Something went wrong."));
    } catch {
      setError(hi ? "नेटवर्क त्रुटि। फिर प्रयास करें।" : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={box}>
      <div className={card}>
        <h1 className="font-serif text-2xl font-bold text-secondary flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-primary" />
          {hi ? "नया पासवर्ड बनाएँ" : "Set a new password"}
        </h1>
        {done ? (
          <div className="space-y-3 text-sm text-on-surface">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
              <span>{hi ? "आपका पासवर्ड बदल गया है। अब नए पासवर्ड से साइन इन करें।" : "Your password has been changed. You can now sign in with the new password."}</span>
            </p>
            <Link href="/auth/signin" className={`${primary} inline-flex items-center justify-center`}>
              {hi ? "साइन इन करें" : "Sign in"}
            </Link>
          </div>
        ) : !token ? (
          <div className="space-y-3 text-sm text-on-surface">
            <p>{hi ? "यह लिंक सही नहीं है।" : "This link is not valid."}</p>
            <Link href="/auth/forgot-password" className="text-primary font-semibold hover:underline">
              {hi ? "नया लिंक मँगवाएँ" : "Ask for a new link"}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={label} htmlFor="rp-pass">{hi ? "नया पासवर्ड" : "New password"}</label>
              <input id="rp-pass" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
              <p className="mt-1 text-[11px] text-on-surface-variant">{hi ? "कम से कम 8 अक्षर।" : "At least 8 characters."}</p>
            </div>
            <div>
              <label className={label} htmlFor="rp-confirm">{hi ? "पासवर्ड दोबारा लिखें" : "Confirm password"}</label>
              <input id="rp-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
            </div>
            {error && (
              <p className="text-xs text-on-error-container" role="alert">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </span>
                {error.includes("valid any more") && (
                  <Link href="/auth/forgot-password" className="mt-1 inline-block text-primary font-semibold hover:underline">
                    {hi ? "नया लिंक मँगवाएँ" : "Ask for a new link"}
                  </Link>
                )}
              </p>
            )}
            <button type="submit" disabled={loading} className={primary}>
              {loading ? (hi ? "सहेज रहे हैं…" : "Saving…") : hi ? "पासवर्ड बदलें" : "Change password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
