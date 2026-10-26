"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Pencil, Plus, Trash2, X, ExternalLink } from "lucide-react";
import { CREDENTIAL_KINDS, CREDENTIAL_LABEL, CredentialKind } from "@/lib/content/credentials";
import { SelectedFilePreview } from "@/components/content/FileViewer";

interface CredentialItem {
  id: string;
  kind: CredentialKind;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string | null;
  descriptionHi?: string | null;
  documentNumber?: string | null;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  isActive: boolean;
  orderIndex: number;
}

interface FormState {
  kind: CredentialKind;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  documentNumber: string;
  isActive: boolean;
  orderIndex: number;
}

const EMPTY: FormState = {
  kind: "GST",
  titleEn: "",
  titleHi: "",
  descriptionEn: "",
  descriptionHi: "",
  documentNumber: "",
  isActive: true,
  orderIndex: 0,
};

const field =
  "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none";
const label = "block text-xs font-bold uppercase text-on-surface-variant mb-1";

export default function AdminCredentialsPage() {
  const [items, setItems] = useState<CredentialItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [existing, setExisting] = useState<CredentialItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const load = async () => {
    try {
      const res = await fetch("/api/admin/credentials");
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
      else setError(data.error || "Failed to load documents");
    } catch {
      setError("Error loading documents");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(EMPTY);
    setFile(null);
    setExisting(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (c: CredentialItem) => {
    setExisting(c);
    setFile(null);
    setForm({
      kind: c.kind,
      titleEn: c.titleEn,
      titleHi: c.titleHi,
      descriptionEn: c.descriptionEn || "",
      descriptionHi: c.descriptionHi || "",
      documentNumber: c.documentNumber || "",
      isActive: c.isActive,
      orderIndex: c.orderIndex,
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file && !existing) {
      setError("Please choose the document file (PDF, PNG, JPG or WEBP).");
      return;
    }
    setSaving(true);
    try {
      let fileInfo: { fileUrl: string; fileName: string; mimeType: string } | null = null;
      if (file) {
        const body = new FormData();
        body.append("file", file);
        body.append("subfolder", "media");
        const up = await fetch("/api/admin/media/upload", { method: "POST", body });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error || "Upload failed");
        fileInfo = { fileUrl: upData.url, fileName: file.name, mimeType: upData.mimeType };
      }

      const payload = {
        ...form,
        descriptionEn: form.descriptionEn || null,
        descriptionHi: form.descriptionHi || null,
        documentNumber: form.documentNumber || null,
        ...(fileInfo ?? {}),
      };
      const res = await fetch(existing ? `/api/admin/credentials/${existing.id}` : "/api/admin/credentials", {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save document");
      setSuccess(existing ? "Document updated." : "Document added.");
      reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: CredentialItem) => {
    const res = await fetch(`/api/admin/credentials/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) setItems((prev) => prev.map((i) => (i.id === c.id ? { ...i, isActive: !i.isActive } : i)));
    else setError("Failed to update document");
  };

  const remove = async (c: CredentialItem) => {
    if (!confirm(`Remove "${c.titleEn}"?`)) return;
    const res = await fetch(`/api/admin/credentials/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== c.id));
      if (existing?.id === c.id) reset();
      setSuccess("Document removed.");
    } else {
      setError("Failed to remove document");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">प्रमाणपत्र एवं दस्तावेज़ • Credentials</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Upload GST, MSME, trademark, ISO and other documents. Visitors can view, download and print them on the Credentials page.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-error-container/20 border border-error text-on-error-container text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
            {existing ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
            {existing ? "Edit document" : "Add document"}
          </h2>
          {existing && (
            <button type="button" onClick={reset} className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded border border-maroon text-xs font-bold">
              <X className="w-4 h-4" /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Type</label>
                <select value={form.kind} onChange={(e) => set("kind", e.target.value as CredentialKind)} className={field}>
                  {CREDENTIAL_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {CREDENTIAL_LABEL[k].en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Document number (optional)</label>
                <input type="text" value={form.documentNumber} onChange={(e) => set("documentNumber", e.target.value)} className={field + " font-mono"} />
              </div>
              <div>
                <label className={label}>Title (English) *</label>
                <input type="text" required value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} className={field} />
              </div>
              <div>
                <label className={label}>शीर्षक (हिन्दी) *</label>
                <input type="text" required value={form.titleHi} onChange={(e) => set("titleHi", e.target.value)} className={field} />
              </div>
              <div>
                <label className={label}>Short note (English)</label>
                <LinkTextarea rows={2} value={form.descriptionEn} onChange={(v) => set("descriptionEn", v)} className={field} />
              </div>
              <div>
                <label className={label}>संक्षिप्त टिप्पणी (हिन्दी)</label>
                <LinkTextarea rows={2} value={form.descriptionHi} onChange={(v) => set("descriptionHi", v)} className={field} />
              </div>
            </div>

            <div>
              <label className={label}>{existing ? "Replace the file (optional)" : "Document file *"}</label>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-xs"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">PDF, PNG, JPG or WEBP, up to 10 MB.</p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4" />
                Active (shown on the website)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                Order
                <input type="number" value={form.orderIndex} onChange={(e) => set("orderIndex", Number(e.target.value))} className="w-20 min-h-[44px] px-2 rounded border border-outline-variant bg-surface-container-low" />
              </label>
            </div>
          </div>

          <SelectedFilePreview
            file={file}
            emptyText={existing ? `Current file: ${existing.fileName}. Choose a new file to replace it.` : "The document you choose appears here before you save."}
          />
        </div>

        <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
          <button type="submit" disabled={saving} className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" />
            <span>{saving ? "Saving..." : existing ? "Save changes" : "Add document"}</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-secondary">Documents ({items.length})</h2>
        {items.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-outline-variant text-center text-xs text-outline">No documents yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((c) => (
              <div key={c.id} className={`p-4 rounded-lg bg-surface border space-y-3 ${c.isActive ? "border-outline-variant/40" : "border-dashed border-outline-variant opacity-75"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{CREDENTIAL_LABEL[c.kind]?.en ?? c.kind}</span>
                    <h3 className="font-bold text-sm text-secondary">{c.titleEn}</h3>
                    <p className="text-xs text-on-surface-variant">{c.titleHi}</p>
                    {c.documentNumber && <p className="text-[11px] font-mono text-outline mt-1">{c.documentNumber}</p>}
                  </div>
                  <div className="flex">
                    <button onClick={() => startEdit(c)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-brand/20 text-secondary" aria-label="Edit document">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(c)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-error-container/20 text-on-error-container" aria-label="Remove document">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button onClick={() => toggle(c)} className={`min-h-[44px] px-3 rounded text-[11px] font-bold uppercase ${c.isActive ? "bg-brand text-on-brand" : "bg-surface-container text-outline"}`}>
                    {c.isActive ? "Active" : "Hidden"}
                  </button>
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Open file <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
