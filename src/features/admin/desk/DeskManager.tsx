"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { DeskKind } from "@/lib/admin/desks";
import { DESK_CONFIG, type DeskField, type Option } from "./deskConfig";

type Item = Record<string, unknown> & { id: string };
type Values = Record<string, string | boolean>;

interface Props {
  kind: DeskKind;
  items: Item[];
  isHindi: boolean;
  /** Vehicles to pick from (only for the travel list) */
  vehicles?: Array<{ id: string; label: string }>;
}

const input = "w-full min-h-[44px] rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-secondary focus:outline-none";

function toValues(fields: DeskField[], item?: Item): Values {
  const out: Values = {};
  for (const f of fields) {
    const raw = item?.[f.key];
    if (f.type === "checkbox") out[f.key] = item ? Boolean(raw) : Boolean(f.defaultValue);
    else if (f.type === "date") out[f.key] = typeof raw === "string" ? raw.slice(0, 10) : "";
    else out[f.key] = raw == null ? String(f.defaultValue ?? "") : String(raw);
  }
  return out;
}

/** One neat list with add / edit / delete, a quick status select and filter tabs; driven by DESK_CONFIG. */
export function DeskManager({ kind, items, isHindi, vehicles = [] }: Props) {
  const router = useRouter();
  const cfg = DESK_CONFIG[kind];
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const label = (o: { en: string; hi: string }) => (isHindi ? o.hi : o.en);
  const statusField = cfg.fields.find((f) => f.key === cfg.statusKey);

  const [editing, setEditing] = useState<{ id: string | null; values: Values } | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsOf = (f: DeskField): Option[] =>
    f.fromVehicles ? [{ value: "", en: "Not assigned", hi: "तय नहीं" }, ...vehicles.map((v) => ({ value: v.id, en: v.label, hi: v.label }))] : f.options ?? [];
  const display = (f: DeskField, item: Item): string => {
    const raw = item[f.key];
    if (f.type === "checkbox") return raw ? t("Yes", "हाँ") : t("No", "नहीं");
    if (raw == null || raw === "") return "";
    if (f.type === "date") return new Date(String(raw)).toLocaleDateString("en-IN");
    if (f.type === "select") {
      const o = optionsOf(f).find((x) => x.value === raw);
      return o ? label(o) : "";
    }
    return String(raw);
  };

  async function call(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/desk/${kind}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("Could not save.", "सहेजा नहीं जा सका।"));
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const payload: Record<string, unknown> = {};
    for (const f of cfg.fields) payload[f.key] = editing.values[f.key];
    if (await call(editing.id ? `/${editing.id}` : "", editing.id ? "PUT" : "POST", payload)) setEditing(null);
  }

  const shown = statusField && filter !== "ALL" ? items.filter((i) => i[statusField.key] === filter) : items;
  const countOf = (v: string) => items.filter((i) => statusField && i[statusField.key] === v).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statusField &&
            [{ value: "ALL", en: "All", hi: "सभी" }, ...(statusField.options ?? [])].map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFilter(o.value)}
                className={`min-h-[40px] rounded px-3 text-xs font-bold uppercase tracking-wider ${
                  filter === o.value ? "bg-brand text-on-brand" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {label(o)} ({o.value === "ALL" ? items.length : countOf(o.value)})
              </button>
            ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing({ id: null, values: toValues(cfg.fields) })}
          className="inline-flex min-h-[44px] items-center gap-2 rounded bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isHindi ? cfg.addHi : cfg.addEn}
        </button>
      </div>

      {error && !editing && <p role="alert" className="rounded border border-error bg-error-container/20 p-3 text-xs text-on-error-container">{error}</p>}

      {shown.length === 0 ? (
        <p className="rounded border border-outline-variant/50 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
          {t("Nothing here yet.", "अभी कुछ नहीं है।")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {shown.map((item) => (
            <li key={item.id} className="space-y-2 rounded-lg border border-outline-variant/60 bg-surface p-4 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="font-serif text-base font-bold text-secondary">{String(item[cfg.titleKey] ?? "")}</span>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={t("Delete", "हटाएँ")}
                  onClick={() => window.confirm(t("Delete this entry?", "यह प्रविष्टि हटाएँ?")) && call(`/${item.id}`, "DELETE")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <dl className="space-y-0.5 text-xs">
                {cfg.fields.filter((f) => f.show).map((f) => {
                  const v = display(f, item);
                  return v ? (
                    <div key={f.key}>
                      <dt className="inline text-on-surface-variant">{label(f)}: </dt>
                      <dd className="inline font-semibold text-on-surface whitespace-pre-line">{v}</dd>
                    </div>
                  ) : null;
                })}
              </dl>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {statusField && (
                  <select
                    aria-label={label(statusField)}
                    value={String(item[statusField.key] ?? "")}
                    disabled={busy}
                    onChange={(e) => call(`/${item.id}`, "PUT", { [statusField.key]: e.target.value })}
                    className="min-h-[40px] rounded border border-outline-variant bg-surface px-2 text-xs font-semibold"
                  >
                    {(statusField.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>{label(o)}</option>
                    ))}
                  </select>
                )}
                {cfg.quick?.filter((q) => !q.when || item[q.when.key] === q.when.is).map((q) => (
                  <button
                    key={q.en}
                    type="button"
                    disabled={busy}
                    onClick={() => call(`/${item.id}`, "PUT", q.patch)}
                    className="min-h-[40px] rounded border border-outline-variant px-3 text-xs font-bold text-secondary hover:bg-surface-container-high"
                  >
                    {label(q)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setEditing({ id: item.id, values: toValues(cfg.fields, item) })}
                  className="min-h-[40px] rounded border border-outline-variant px-3 text-xs font-bold text-primary hover:bg-surface-container-high"
                >
                  {t("Edit", "बदलें")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true">
          <form onSubmit={save} className="my-8 w-full max-w-lg space-y-3 rounded-lg bg-surface p-5 text-left shadow-xl">
            <h2 className="font-serif text-lg font-bold text-secondary">{editing.id ? t("Edit", "बदलें") : isHindi ? cfg.addHi : cfg.addEn}</h2>
            {cfg.fields.map((f) => (
              <label key={f.key} className={f.type === "checkbox" ? "flex min-h-[44px] items-center gap-2 text-sm font-semibold" : "block text-xs font-bold uppercase text-secondary"}>
                {f.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={Boolean(editing.values[f.key])}
                    onChange={(e) => setEditing({ ...editing, values: { ...editing.values, [f.key]: e.target.checked } })}
                    className="h-5 w-5"
                  />
                ) : null}
                <span>{label(f)}{f.required ? " *" : ""}</span>
                {f.type === "textarea" ? (
                  <textarea rows={3} value={String(editing.values[f.key])} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, [f.key]: e.target.value } })} className={`${input} mt-1 normal-case font-normal`} />
                ) : f.type === "select" ? (
                  <select value={String(editing.values[f.key])} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, [f.key]: e.target.value } })} className={`${input} mt-1 normal-case font-normal`}>
                    {optionsOf(f).map((o) => (
                      <option key={o.value} value={o.value}>{label(o)}</option>
                    ))}
                  </select>
                ) : f.type !== "checkbox" ? (
                  <input
                    type={f.type}
                    required={f.required}
                    min={f.type === "number" ? 1 : undefined}
                    value={String(editing.values[f.key])}
                    onChange={(e) => setEditing({ ...editing, values: { ...editing.values, [f.key]: e.target.value } })}
                    className={`${input} mt-1 normal-case font-normal`}
                  />
                ) : null}
              </label>
            ))}
            {error && <p role="alert" className="text-xs text-on-error-container">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setEditing(null); setError(null); }} className="min-h-[44px] rounded border border-outline-variant px-4 text-sm font-semibold">
                {t("Cancel", "रद्द करें")}
              </button>
              <button type="submit" disabled={busy} className="min-h-[44px] rounded bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover disabled:opacity-50">
                {busy ? t("Saving…", "सहेज रहे हैं…") : t("Save", "सहेजें")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
