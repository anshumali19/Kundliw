"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export default function DemoGatePage() {
  const t = useTranslations("demoGate");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/demo-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t("invalidPassword"));
      }

      // Success: redirect to requested destination
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("invalidPassword"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface-container-low border-2 border-secondary/40 rounded p-6 sm:p-8 shadow-xl text-left">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded border border-secondary flex items-center justify-center bg-surface text-secondary font-serif text-xl font-bold">
            ॐ
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-secondary leading-tight">
              {t("title")}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              Client Evaluation Portal
            </span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
          {t("subtitle")}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container/20 border border-error text-on-error-container rounded flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="demo-password"
              className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1"
            >
              Demo Passkey (सुरक्षा कोड)
            </label>
            <div className="relative">
              <input
                id="demo-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded text-sm text-on-surface focus:outline-none focus:border-primary min-h-[44px]"
              />
              <Lock className="w-4 h-4 text-outline absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand text-on-brand font-bold text-xs uppercase tracking-wider rounded hover:opacity-95 transition-opacity disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>{t("submit")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant/40 flex items-center gap-2 text-[11px] text-on-surface-variant">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{t("helper")}</span>
        </div>
      </div>
    </div>
  );
}
