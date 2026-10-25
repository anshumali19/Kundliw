"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  Languages,
  Search,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface TranslationItem {
  id?: string;
  locale: string;
  namespace: string;
  key: string;
  fullKey: string;
  defaultValue: string;
  currentValue: string;
  isOverridden: boolean;
  updatedAt?: string;
}

export function AdminTranslationsManager({ initialLocale }: { initialLocale: string }) {
  const [locale, setLocale] = useState<"hi" | "en">(initialLocale === "hi" ? "hi" : "en");
  const [namespace, setNamespace] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "overridden" | "default">("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    setNotification(null);
    try {
      const params = new URLSearchParams({
        locale,
        namespace,
        filter,
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`/api/admin/translations?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setItems(data.translations || []);
        if (data.namespaces) {
          setNamespaces(data.namespaces);
        }
        // Initialize draft values
        const drafts: Record<string, string> = {};
        for (const item of data.translations || []) {
          drafts[item.fullKey] = item.currentValue;
        }
        setDraftValues(drafts);
      } else {
        setNotification({ type: "error", text: data.error || "Failed to load translations." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error loading translations." });
    } finally {
      setLoading(false);
    }
  }, [locale, namespace, filter, search]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTranslations();
  };

  const handleValueChange = (fullKey: string, newValue: string) => {
    setDraftValues((prev) => ({
      ...prev,
      [fullKey]: newValue,
    }));
  };

  const handleSaveItem = async (item: TranslationItem) => {
    const value = draftValues[item.fullKey] ?? item.currentValue;
    setSavingKey(item.fullKey);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          namespace: item.namespace,
          key: item.key,
          value,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          text: `"${item.fullKey}" saved. Public site will immediately reflect this change.`,
        });
        startTransition(() => {
          setItems((prev) =>
            prev.map((i) =>
              i.fullKey === item.fullKey
                ? { ...i, currentValue: value, isOverridden: true, updatedAt: new Date().toISOString() }
                : i
            )
          );
        });
      } else {
        setNotification({ type: "error", text: data.error || "Save failed." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error while saving." });
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetItem = async (item: TranslationItem) => {
    if (!confirm(`Reset "${item.fullKey}" back to default text: "${item.defaultValue}"?`)) {
      return;
    }

    setSavingKey(item.fullKey);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/translations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          namespace: item.namespace,
          key: item.key,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          text: `"${item.fullKey}" reset to default.`,
        });
        setDraftValues((prev) => ({
          ...prev,
          [item.fullKey]: item.defaultValue,
        }));
        startTransition(() => {
          setItems((prev) =>
            prev.map((i) =>
              i.fullKey === item.fullKey
                ? { ...i, currentValue: item.defaultValue, isOverridden: false }
                : i
            )
          );
        });
      } else {
        setNotification({ type: "error", text: data.error || "Reset failed." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error while resetting." });
    } finally {
      setSavingKey(null);
    }
  };

  // Bulk save all modified drafts
  const handleBulkSave = async () => {
    const modifiedItems = items.filter((item) => {
      const draft = draftValues[item.fullKey];
      return draft !== undefined && draft !== item.currentValue;
    });

    if (modifiedItems.length === 0) {
      setNotification({ type: "error", text: "No unsaved changes detected." });
      return;
    }

    setBulkSaving(true);
    setNotification(null);

    try {
      const overrides = modifiedItems.map((item) => ({
        locale,
        namespace: item.namespace,
        key: item.key,
        value: draftValues[item.fullKey],
      }));

      const res = await fetch("/api/admin/translations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          text: `Successfully saved ${data.count} translation overrides.`,
        });
        fetchTranslations();
      } else {
        setNotification({ type: "error", text: data.error || "Bulk save failed." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error while bulk saving." });
    } finally {
      setBulkSaving(false);
    }
  };

  // Export current overrides to JSON
  const handleExportJson = () => {
    const overridesOnly = items.filter((i) => i.isOverridden);
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(overridesOnly, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `translations-${locale}-overrides.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const modifiedCount = items.filter((item) => {
    const draft = draftValues[item.fullKey];
    return draft !== undefined && draft !== item.currentValue;
  }).length;

  return (
    <div className="w-full space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Languages className="w-4 h-4" />
            <span>A-to-Z Database String Overrides (Client Condition 2)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-on-surface">
            {locale === "hi" ? "संपूर्ण पोर्टल भाषा एवं टेक्स्ट प्रबंधन" : "Master Translation & UI Text Control"}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
            Edit every title, button, label, navigation item, footer text, or error message across the entire website in both Hindi and English. All edits update the database override layer live with zero code changes required.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchTranslations}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-xs font-semibold hover:bg-surface-container flex items-center gap-1.5 transition-colors"
            title="Reload from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-xs font-semibold hover:bg-surface-container flex items-center gap-1.5 transition-colors"
            title="Export JSON overrides"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Overrides</span>
          </button>
          {modifiedCount > 0 && (
            <button
              onClick={handleBulkSave}
              disabled={bulkSaving}
              className="px-4 py-2 rounded-lg bg-brand text-on-brand text-xs font-bold hover:bg-brand-hover flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All ({modifiedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-xs font-medium border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-error-container text-on-error-container border-error/20"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-on-error-container shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Control Filters Bar */}
      <div className="bg-surface border border-outline-variant/60 rounded-xl p-4 space-y-4">
        {/* Language Tabs & Filter Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
            <button
              onClick={() => setLocale("hi")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                locale === "hi"
                  ? "bg-brand text-on-brand shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                locale === "en"
                  ? "bg-brand text-on-brand shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              English
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-on-surface-variant text-[11px] font-semibold mr-1">Status:</span>
            {(["all", "overridden", "default"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-2.5 py-1 rounded text-xs capitalize font-medium transition-colors ${
                  filter === mode
                    ? "bg-primary-fixed text-on-primary-fixed font-bold"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {mode === "all" ? "All Strings" : mode === "overridden" ? "Custom Overrides" : "Original Defaults"}
              </button>
            ))}
          </div>
        </div>

        {/* Namespace Pills & Search Form */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search by key, default value, or override..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-brand text-on-brand text-[11px] font-semibold hover:bg-brand-hover"
            >
              Search
            </button>
          </form>

          {/* Namespace Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-outline shrink-0" />
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Modules / Namespaces</option>
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Translations Table / Listing */}
      <div className="bg-surface border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-on-surface">
              Translation Entries ({items.length})
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              Locale: [{locale.toUpperCase()}]
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            {items.filter((i) => i.isOverridden).length} active database overrides
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <span>Loading strings from database and dictionaries...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            No translation strings found matching the active filters.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {items.map((item) => {
              const currentDraft = draftValues[item.fullKey] ?? item.currentValue;
              const hasDraftChanges = currentDraft !== item.currentValue;
              const isSavingThis = savingKey === item.fullKey;

              return (
                <div
                  key={item.fullKey}
                  className={`p-5 transition-colors ${
                    item.isOverridden
                      ? "bg-brand/20"
                      : "bg-surface hover:bg-surface-container-lowest"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Metadata & Default Text */}
                    <div className="w-full lg:w-5/12 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary-fixed text-on-secondary-fixed uppercase tracking-wider">
                          {item.namespace}
                        </span>
                        <code className="text-xs font-mono font-semibold text-secondary break-all">
                          {item.key}
                        </code>
                        {item.isOverridden ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/20 text-primary border border-brand flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Database Override</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-on-surface-variant">
                            JSON Default
                          </span>
                        )}
                      </div>

                      {/* Default reference box */}
                      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                          Base JSON Default:
                        </div>
                        <p className="text-xs font-sans text-on-surface-variant whitespace-pre-wrap select-all">
                          {item.defaultValue}
                        </p>
                      </div>

                      {item.updatedAt && (
                        <div className="text-[10px] text-outline font-mono">
                          Last edited: {new Date(item.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Right: Live Text Editor */}
                    <div className="w-full lg:w-7/12 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
                          Active UI Text:
                        </label>
                        {hasDraftChanges && (
                          <span className="text-[11px] font-bold text-primary animate-pulse">
                            Unsaved modification
                          </span>
                        )}
                      </div>

                      <textarea
                        rows={item.defaultValue.length > 80 ? 3 : 2}
                        value={currentDraft}
                        onChange={(e) => handleValueChange(item.fullKey, e.target.value)}
                        className={`w-full p-2.5 rounded-lg border text-xs text-on-surface font-sans focus:outline-none focus:ring-1 focus:ring-primary ${
                          hasDraftChanges
                            ? "border-brand bg-brand/20"
                            : item.isOverridden
                            ? "border-primary/50 bg-surface"
                            : "border-outline-variant bg-surface"
                        }`}
                        placeholder="Enter customized text..."
                      />

                      {/* Actions for this item */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {item.isOverridden && (
                          <button
                            type="button"
                            onClick={() => handleResetItem(item)}
                            disabled={isSavingThis}
                            className="px-3 py-1.5 rounded text-xs font-semibold text-on-error-container hover:bg-error-container/30 border border-transparent hover:border-error/20 flex items-center gap-1 transition-colors"
                            title="Remove database override and revert to base JSON"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Revert to Default</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSaveItem(item)}
                          disabled={isSavingThis}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                            hasDraftChanges
                              ? "bg-brand text-on-brand hover:bg-brand-hover"
                              : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant"
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingThis ? "Saving..." : hasDraftChanges ? "Save Changes" : "Save Live"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
