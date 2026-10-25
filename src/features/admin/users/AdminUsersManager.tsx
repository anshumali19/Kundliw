"use client";

import { useCallback, useEffect, useState } from "react";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "USER" | "ADMIN" | "ASSOCIATE";
  createdAt: string;
  _count: { orders: number };
}

const ROLE_FILTERS = ["", "USER", "ASSOCIATE", "ADMIN"] as const;

export function AdminUsersManager({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<(typeof ROLE_FILTERS)[number]>("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (role) params.set("role", role);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users.");
      setUsers(data.users);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load users." });
    } finally {
      setLoading(false);
    }
  }, [query, role]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const changeRole = async (user: UserRow, next: "USER" | "ASSOCIATE") => {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user.");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: next } : u)));
      setMessage({ type: "ok", text: t("Role updated.", "भूमिका बदल दी गई।") });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update user." });
    }
  };

  const roleLabel = (r: string) =>
    r === "ADMIN" ? t("Super Admin", "सुपर एडमिन") : r === "ASSOCIATE" ? t("Associate", "एसोसिएट") : t("User", "यूज़र");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-5">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Users", "उपयोगकर्ता")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t(
            "Customers and associates who have registered. You can move an account between User and Associate.",
            "पंजीकृत ग्राहक और एसोसिएट। आप किसी खाते को यूज़र और एसोसिएट के बीच बदल सकते हैं।"
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search name, email or phone", "नाम, ईमेल या फ़ोन खोजें")}
          className="flex-1 min-w-[220px] bg-surface-container-lowest px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof ROLE_FILTERS)[number])}
          className="bg-surface-container-lowest px-3 py-2.5 rounded border border-outline-variant text-sm min-h-[44px]"
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r || "all"} value={r}>
              {r ? roleLabel(r) : t("All roles", "सभी भूमिकाएँ")}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          role="status"
          className={`p-3 rounded border text-sm ${
            message.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto bg-surface border border-outline-variant/60 rounded">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low text-left">
            <tr>
              <th className="px-3 py-2.5">{t("Name", "नाम")}</th>
              <th className="px-3 py-2.5">{t("Contact", "संपर्क")}</th>
              <th className="px-3 py-2.5">{t("Role", "भूमिका")}</th>
              <th className="px-3 py-2.5">{t("Orders", "ऑर्डर")}</th>
              <th className="px-3 py-2.5">{t("Joined", "जुड़े")}</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-on-surface-variant">
                  {t("Loading...", "लोड हो रहा है...")}
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-on-surface-variant">
                  {t("No users found.", "कोई उपयोगकर्ता नहीं मिला।")}
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2.5 font-semibold text-secondary">{user.name || "-"}</td>
                  <td className="px-3 py-2.5">
                    <div>{user.phone || "-"}</div>
                    <div className="text-xs text-on-surface-variant">{user.email || ""}</div>
                  </td>
                  <td className="px-3 py-2.5">{roleLabel(user.role)}</td>
                  <td className="px-3 py-2.5">{user._count.orders}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {user.role === "USER" && (
                      <button
                        type="button"
                        onClick={() => changeRole(user, "ASSOCIATE")}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline min-h-[44px]"
                      >
                        {t("Make associate", "एसोसिएट बनाएँ")}
                      </button>
                    )}
                    {user.role === "ASSOCIATE" && (
                      <button
                        type="button"
                        onClick={() => changeRole(user, "USER")}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline min-h-[44px]"
                      >
                        {t("Make user", "यूज़र बनाएँ")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
