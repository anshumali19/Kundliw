"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle, Pencil, X } from "lucide-react";
import { ImageUrlField } from "@/components/admin/MediaFields";

interface Member {
  id: string;
  nameEn: string;
  nameHi: string;
  roleEn: string;
  roleHi: string;
  bioEn?: string | null;
  bioHi?: string | null;
  photoUrl?: string | null;
  orderIndex: number;
  isActive: boolean;
}

const EMPTY = { nameEn: "", nameHi: "", roleEn: "Assistant Astrologer", roleHi: "सहायक ज्योतिषी", bioEn: "", bioHi: "", photoUrl: "", orderIndex: 0, isActive: true };

const field =
  "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none";
const label = "block text-xs font-bold uppercase text-on-surface-variant mb-1";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (res.ok) setMembers(data.members || []);
      else setError(data.error || "Failed to load the team");
    } catch {
      setError("Error loading the team");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setForm({ nameEn: m.nameEn, nameHi: m.nameHi, roleEn: m.roleEn, roleHi: m.roleHi, bioEn: m.bioEn || "", bioHi: m.bioHi || "", photoUrl: m.photoUrl || "", orderIndex: m.orderIndex, isActive: m.isActive });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancel = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload = { ...form, bioEn: form.bioEn.trim() || null, bioHi: form.bioHi.trim() || null, photoUrl: form.photoUrl.trim() || null, orderIndex: Number(form.orderIndex) || 0 };
    try {
      const res = await fetch(editingId ? `/api/admin/team/${editingId}` : "/api/admin/team", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? "Team member updated" : "Team member added");
        cancel();
        load();
      } else setError(data.error || "Failed to save");
    } catch {
      setError("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((p) => p.filter((m) => m.id !== id));
      if (editingId === id) cancel();
      setSuccess("Team member removed");
    } else setError("Failed to remove");
  };

  const toggle = async (m: Member) => {
    const res = await fetch(`/api/admin/team/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    if (res.ok) setMembers((p) => p.map((x) => (x.id === m.id ? { ...x, isActive: !x.isActive } : x)));
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">सहायक एवं टीम • Team and Assistants</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Add assistants and other team members with their role. They are shown under the Founder on the Founder page. Lower number = shown first.
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

      <div className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
            <span>{editingId ? "Edit team member" : "Add a team member"}</span>
          </h2>
          {editingId && (
            <button type="button" onClick={cancel} className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded border border-maroon text-xs font-bold">
              <X className="w-4 h-4" /> Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Name (English) *</label>
              <input type="text" required value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>नाम (हिन्दी) *</label>
              <input type="text" required value={form.nameHi} onChange={(e) => set("nameHi", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>Role (English) *</label>
              <input type="text" required value={form.roleEn} onChange={(e) => set("roleEn", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>भूमिका (हिन्दी) *</label>
              <input type="text" required value={form.roleHi} onChange={(e) => set("roleHi", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>About (English, optional)</label>
              <LinkTextarea rows={3} value={form.bioEn} onChange={(v) => set("bioEn", v)} className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none" />
            </div>
            <div>
              <label className={label}>परिचय (हिन्दी, वैकल्पिक)</label>
              <LinkTextarea rows={3} value={form.bioHi} onChange={(v) => set("bioHi", v)} className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none" />
            </div>
            <div>
              <label className={label}>Order (lower shows first)</label>
              <input type="number" value={form.orderIndex} onChange={(e) => set("orderIndex", Number(e.target.value))} className={field} />
            </div>
          </div>
          <ImageUrlField label="Photo (optional)" value={form.photoUrl} onChange={(v) => set("photoUrl", v)} />
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4" />
            <span>Show on the website</span>
          </label>
          <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
            <button type="submit" disabled={saving} className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" />
              <span>{saving ? "Saving..." : editingId ? "Save changes" : "Add team member"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">Team ({members.length})</h2>
        {loading ? (
          <p className="text-xs text-outline">Loading...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-on-surface-variant">No team members yet. Add the first one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m) => (
              <div key={m.id} className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {m.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-outline-variant/60" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-secondary">{m.nameEn}</div>
                      <div className="text-[11px] text-outline">{m.roleEn}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(m)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-gold text-secondary" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(m.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-error-container/20 text-on-error-container" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => toggle(m)}
                  className={`min-h-[36px] px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.isActive ? "bg-brand text-on-brand" : "bg-surface-container text-outline"}`}
                >
                  {m.isActive ? "Shown" : "Hidden"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
