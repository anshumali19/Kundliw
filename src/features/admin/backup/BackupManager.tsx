"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Download, DatabaseBackup, Trash2 } from "lucide-react";

type Kind = "MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY";

interface BackupRow {
  id: string;
  kind: Kind;
  sizeBytes: number;
  tables: number;
  rows: number;
  createdAt: string;
}

interface Settings {
  autoEnabled: boolean;
  keepDaily: number;
  keepWeekly: number;
  keepMonthly: number;
}

const field = "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-sm";
const btn =
  "min-h-[44px] px-4 rounded text-xs font-bold uppercase tracking-wider border border-maroon bg-brand hover:bg-brand-hover text-on-brand disabled:opacity-50 inline-flex items-center justify-center gap-2";

function size(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function BackupManager({ isHindi }: { isHindi: boolean }) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [backups, setBackups] = useState<BackupRow[]>([]);
  const [settings, setSettings] = useState<Settings>({ autoEnabled: true, keepDaily: 7, keepWeekly: 4, keepMonthly: 12 });
  const [filter, setFilter] = useState<"ALL" | Kind>("ALL");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const kindLabel: Record<Kind, string> = {
    MANUAL: t("Manual", "मैन्युअल"),
    DAILY: t("Daily", "दैनिक"),
    WEEKLY: t("Weekly", "साप्ताहिक"),
    MONTHLY: t("Monthly", "मासिक"),
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backups");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setBackups(data.backups);
      setSettings(data.settings);
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to load" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setMsg(null);
    try {
      const text = await fn();
      setMsg({ type: "ok", text });
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setBusy(false);
    }
  };

  const backupNow = () =>
    run(async () => {
      const res = await fetch("/api/admin/backups", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backup failed");
      return t("Backup created.", "बैकअप बन गया।");
    });

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    return run(async () => {
      const res = await fetch("/api/admin/backups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoEnabled: settings.autoEnabled,
          keepDaily: Number(settings.keepDaily),
          keepWeekly: Number(settings.keepWeekly),
          keepMonthly: Number(settings.keepMonthly),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      return data.removed
        ? t(`Settings saved. ${data.removed} older backup(s) removed.`, `सेटिंग्स सहेजी गईं। ${data.removed} पुराने बैकअप हटाए गए।`)
        : t("Settings saved.", "सेटिंग्स सहेजी गईं।");
    });
  };

  const remove = (b: BackupRow) => {
    if (!window.confirm(t("Delete this backup?", "यह बैकअप हटाएँ?"))) return;
    return run(async () => {
      const res = await fetch(`/api/admin/backups/${b.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      return t("Backup deleted.", "बैकअप हटाया गया।");
    });
  };

  const shown = backups.filter((b) => filter === "ALL" || b.kind === filter);
  const latestAuto = backups.find((b) => b.kind !== "MANUAL");

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Backup manager", "बैकअप प्रबंधक")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t(
            "A copy of your content and records is made every day automatically. A weekly copy is added on Sundays and a monthly copy on the 1st. You can also back up at any moment and download any copy.",
            "आपकी सामग्री और रिकॉर्ड की प्रति हर दिन अपने आप बनती है। रविवार को साप्ताहिक और 1 तारीख को मासिक प्रति भी जुड़ती है। आप कभी भी बैकअप ले सकते हैं और किसी भी प्रति को डाउनलोड कर सकते हैं।"
          )}
        </p>
      </div>

      {msg && (
        <div role="status" className={`p-3 rounded border text-sm flex items-center gap-2 ${msg.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-surface border border-outline-variant/60 rounded-lg p-5 space-y-3">
          <h2 className="font-bold text-secondary flex items-center gap-2">
            <DatabaseBackup className="w-5 h-5 text-primary" />
            {t("Manual backup", "मैन्युअल बैकअप")}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {t("Saves a copy now. It is kept until you delete it.", "अभी एक प्रति सहेजता है। इसे आप हटाएँ तब तक रखा जाता है।")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={backupNow} disabled={busy} className={btn}>
              {busy ? t("Working...", "हो रहा है...") : t("Back up now", "अभी बैकअप लें")}
            </button>
            {/* File download from an API route, not a page navigation */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/backup" download className={`${btn} !bg-surface !text-secondary`}>
              <Download className="w-4 h-4" />
              {t("Download current data", "वर्तमान डेटा डाउनलोड करें")}
            </a>
          </div>
          {latestAuto && (
            <p className="text-xs text-on-surface-variant">
              {t("Latest automatic backup:", "नवीनतम स्वचालित बैकअप:")} {new Date(latestAuto.createdAt).toLocaleString(isHindi ? "hi-IN" : "en-IN")}
            </p>
          )}
        </div>

        <form onSubmit={saveSettings} className="bg-surface border border-outline-variant/60 rounded-lg p-5 space-y-3">
          <h2 className="font-bold text-secondary">{t("Automatic backups", "स्वचालित बैकअप")}</h2>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input type="checkbox" checked={settings.autoEnabled} onChange={(e) => setSettings({ ...settings, autoEnabled: e.target.checked })} className="w-5 h-5" />
            {t("Back up automatically every day", "हर दिन अपने आप बैकअप लें")}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {t("Keep daily", "दैनिक रखें")}
              <input type="number" min={1} max={60} value={settings.keepDaily} onChange={(e) => setSettings({ ...settings, keepDaily: Number(e.target.value) })} className={`${field} mt-1`} />
            </label>
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {t("Keep weekly", "साप्ताहिक रखें")}
              <input type="number" min={1} max={52} value={settings.keepWeekly} onChange={(e) => setSettings({ ...settings, keepWeekly: Number(e.target.value) })} className={`${field} mt-1`} />
            </label>
            <label className="text-xs font-bold uppercase text-on-surface-variant">
              {t("Keep monthly", "मासिक रखें")}
              <input type="number" min={1} max={60} value={settings.keepMonthly} onChange={(e) => setSettings({ ...settings, keepMonthly: Number(e.target.value) })} className={`${field} mt-1`} />
            </label>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {t("Older copies beyond these numbers are removed automatically.", "इन संख्याओं से पुरानी प्रतियाँ अपने आप हट जाती हैं।")}
          </p>
          <button type="submit" disabled={busy} className={btn}>
            {t("Save settings", "सेटिंग्स सहेजें")}
          </button>
        </form>
      </div>

      <div className="bg-surface border border-outline-variant/60 rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-outline-variant/60">
          <h2 className="font-bold text-secondary">
            {t("Saved backups", "सहेजे गए बैकअप")} ({backups.length})
          </h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value as "ALL" | Kind)} className="min-h-[44px] px-3 rounded border border-outline-variant bg-surface-container-low text-sm" aria-label={t("Filter", "छाँटें")}>
            <option value="ALL">{t("All", "सभी")}</option>
            {(Object.keys(kindLabel) as Kind[]).map((k) => (
              <option key={k} value={k}>
                {kindLabel[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-left">
              <tr>
                <th className="px-4 py-2.5">{t("Type", "प्रकार")}</th>
                <th className="px-4 py-2.5">{t("Date and time", "तारीख और समय")}</th>
                <th className="px-4 py-2.5">{t("Records", "रिकॉर्ड")}</th>
                <th className="px-4 py-2.5">{t("Size", "आकार")}</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                    {t("No backups yet. The first automatic one is made tonight, or press Back up now.", "अभी कोई बैकअप नहीं। पहला स्वचालित बैकअप आज रात बनेगा, या अभी बैकअप लें दबाएँ।")}
                  </td>
                </tr>
              )}
              {shown.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-brand/15 text-primary">{kindLabel[b.kind]}</span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{new Date(b.createdAt).toLocaleString(isHindi ? "hi-IN" : "en-IN")}</td>
                  <td className="px-4 py-2.5">{b.rows.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2.5">{size(b.sizeBytes)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2 justify-end">
                      <a href={`/api/admin/backups/${b.id}`} download className="min-h-[44px] px-3 inline-flex items-center gap-1.5 rounded border border-maroon text-xs font-bold text-secondary hover:bg-brand/20">
                        <Download className="w-4 h-4" />
                        {t("Download", "डाउनलोड")}
                      </a>
                      <button type="button" onClick={() => remove(b)} disabled={busy} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded border border-error text-on-error-container hover:bg-error-container" aria-label={t("Delete", "हटाएँ")}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant">
        {t(
          "Backups hold content and records only. They do not contain API keys, passwords or the files you uploaded. Keep downloaded copies somewhere safe, because they contain customer details.",
          "बैकअप में केवल सामग्री और रिकॉर्ड रहते हैं। इनमें API कुंजियाँ, पासवर्ड या अपलोड की गई फाइलें नहीं होतीं। डाउनलोड की प्रतियाँ सुरक्षित रखें, क्योंकि उनमें ग्राहकों का विवरण होता है।"
        )}
      </p>
    </div>
  );
}
