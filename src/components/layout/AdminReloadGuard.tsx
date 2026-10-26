"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";

/** Security: reloading the browser tab while in the Admin Panel signs the admin out. */
export function AdminReloadGuard() {
  const locale = useLocale();
  useEffect(() => {
    let type = "";
    try {
      type = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type ?? "";
    } catch {
      /* ignore */
    }
    if (type === "reload") {
      void signOut({ callbackUrl: `/${locale}/auth/signin?callbackUrl=${encodeURIComponent("/admin")}` });
    }
  }, [locale]);
  return null;
}
