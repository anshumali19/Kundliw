"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { User, Phone, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export type AccountType = "USER" | "ASSOCIATE";

export function RegisterForm({ accountType }: { accountType: AccountType }) {
  const isAssociate = accountType === "ASSOCIATE";
  const portal = isAssociate ? "associate" : "user";
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          name,
          phone,
          email,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically redirect to Sign In with the phone pre-filled
      router.push(
        `/${locale}/auth/signin/${portal}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to register account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Left Editorial Info */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded border border-secondary/30 self-start text-secondary text-xs font-serif font-semibold italic mb-3">
            {tCommon("sanskritInvocation")}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary tracking-tight mb-2">
            {tAuth(isAssociate ? "associateRegisterTitle" : "userRegisterTitle")}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            {tAuth(isAssociate ? "associateRegisterSubtitle" : "registerSubtitle")}
          </p>

          <div className="bg-surface-container-low p-4 rounded border border-outline-variant/60 space-y-2 text-xs mb-6 max-w-md">
            <div className="flex items-center gap-2 text-secondary font-semibold">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>{tAuth("privacyTitle")}</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              {tAuth("privacyDesc")}
            </p>
          </div>

          <div className="text-xs text-on-surface-variant space-y-2">
            <div>
              <span>{tAuth("haveAccount")} </span>
              <Link
                href={`/auth/signin/${portal}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-primary hover:underline uppercase tracking-wider"
              >
                {tAuth(isAssociate ? "associateLoginTitle" : "userLoginTitle")} →
              </Link>
            </div>
            <div>
              <Link
                href="/auth/register"
                className="font-bold text-secondary hover:underline uppercase tracking-wider"
              >
                ← {tAuth("chooseRegisterType")}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-6 bg-surface p-6 sm:p-8 rounded border border-secondary/30">
          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container/40 border border-error/30 rounded text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                Full Name (पूरा नाम) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. आदित्य नारायण शर्मा"
                  className="w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                {tAuth("phoneLabel")} *
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
              <span className="block text-[11px] text-on-surface-variant mt-0.5">
                Baseline mobile number required for OTP verification and order tracking.
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                {tAuth("emailLabel")} *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                {tAuth("passwordLabel")} {isAssociate ? "*" : "(Optional)"}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required={isAssociate}
                  className="w-full bg-surface-container-lowest text-on-surface px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
                />
              </div>
              <span className="block text-[11px] text-on-surface-variant mt-0.5">
                {isAssociate
                  ? "Associates sign in with email and password, or Mobile OTP."
                  : "You can always sign in instantly via Mobile OTP without a password."}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-container hover:bg-primary text-on-primary text-xs uppercase tracking-wider font-bold rounded transition-colors border border-primary flex items-center justify-center gap-2 min-h-[44px] mt-2"
            >
              <span>
                {loading
                  ? tCommon("loading")
                  : tAuth(isAssociate ? "associateRegisterTitle" : "userRegisterTitle")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
