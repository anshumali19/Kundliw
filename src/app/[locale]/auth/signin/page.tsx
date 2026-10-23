"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Phone, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  // Mode: "OTP" | "ADMIN"
  const [authMode, setAuthMode] = useState<"OTP" | "ADMIN">("OTP");

  // OTP Form States
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Admin Form States
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isWebView, setIsWebView] = useState(false);

  // Detect Android WebView
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent || "";
      const isWv = /wv|Android.*Version\/[0-9].[0-9]/i.test(ua);
      setIsWebView(isWv);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      setResendCooldown(60);
      setSuccessMsg("One-time password dispatched. Check your messages.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signIn("mobile-otp", {
        redirect: false,
        phone,
        otp,
        callbackUrl,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Admin Email/Password Sign In
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signIn("email-password", {
        redirect: false,
        email: adminEmail,
        password: adminPassword,
        callbackUrl,
      });

      if (res?.error) {
        throw new Error("Invalid administrative credentials");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Asymmetric Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Column (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-start text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded border border-secondary/30 self-start text-secondary text-xs font-serif font-semibold italic mb-3">
            {tCommon("sanskritInvocation")}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary tracking-tight mb-2">
            {tAuth("signInTitle")}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            Sign in to access your consultations, track your handcrafted Janampatri progress, and access your private Kundli Vault.
          </p>

          <div className="bg-surface-container-low p-4 rounded border border-outline-variant/60 space-y-3 text-xs mb-6 max-w-md">
            <div className="flex items-center gap-2 text-secondary font-semibold">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Mobile-First Instant Verification</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Fast, zero-password login designed specifically for seamless mobile usage and in-app web views.
            </p>
          </div>

          <div className="text-xs text-on-surface-variant">
            <span>{tAuth("noAccount")} </span>
            <Link
              href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-bold text-primary hover:underline uppercase tracking-wider"
            >
              {tAuth("registerTitle")} →
            </Link>
          </div>
        </div>

        {/* Right Form Pane (6 cols) */}
        <div className="lg:col-span-6 bg-surface p-6 sm:p-8 rounded border border-secondary/30 text-left">
          {/* Segmented Auth Mode Switcher */}
          <div className="flex border-b border-outline-variant/40 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode("OTP");
                setErrorMsg(null);
              }}
              className={`pb-3 px-4 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${
                authMode === "OTP"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Mobile OTP (मोबाइल ओटीपी)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("ADMIN");
                setErrorMsg(null);
              }}
              className={`pb-3 px-4 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors min-h-[44px] flex items-center gap-2 ${
                authMode === "ADMIN"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Login (प्रशासक)</span>
            </button>
          </div>

          {/* Feedback Notices */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container/40 border border-error/30 rounded text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-surface-container-high border border-primary/40 rounded text-primary text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: MOBILE OTP FLOW */}
          {authMode === "OTP" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                      {tAuth("phoneLabel")}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
                        required
                      />
                    </div>
                    <span className="block text-[11px] text-on-surface-variant mt-1">
                      Enter 10-digit mobile number to receive a 6-digit verification code.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary-container hover:bg-primary text-on-primary text-xs uppercase tracking-wider font-bold rounded transition-colors border border-primary flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span>{loading ? tCommon("loading") : tAuth("sendOtp")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs uppercase tracking-wider font-bold text-secondary">
                        {tAuth("enterOtp")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full bg-surface-container-lowest font-mono tracking-widest text-center text-lg text-secondary px-3 py-2.5 rounded border border-secondary focus:outline-none min-h-[44px]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Code sent to {phone}</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleRequestOtp}
                      className="text-primary font-bold hover:underline disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 px-4 bg-primary-container hover:bg-primary text-on-primary text-xs uppercase tracking-wider font-bold rounded transition-colors border border-primary flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  >
                    <span>{loading ? tCommon("loading") : tAuth("verifyOtp")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* WebView Notice & Google Divider */}
              <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                <div className="relative text-center">
                  <span className="bg-surface px-3 text-xs text-on-surface-variant uppercase">
                    {tAuth("orDivider")}
                  </span>
                  <div className="absolute inset-0 flex items-center -z-10">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                </div>

                {isWebView ? (
                  <div className="p-3 bg-surface-container-high rounded text-xs text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-secondary">Note for App Users:</span> External Google sign-in is disabled in in-app web views. Please use <strong>Mobile OTP</strong> above for direct login.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 bg-surface hover:bg-surface-container text-on-surface text-xs font-bold rounded border border-outline-variant/80 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{tAuth("googleSignIn")}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: ADMIN EMAIL & PASSWORD */}
          {authMode === "ADMIN" && (
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                  {tAuth("emailLabel")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@kanad-jyotish.in"
                    className="w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                  {tAuth("passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-secondary hover:bg-secondary/90 text-on-secondary text-xs uppercase tracking-wider font-bold rounded transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>{loading ? tCommon("loading") : tAuth("signInTitle")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
