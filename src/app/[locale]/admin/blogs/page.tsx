"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, Pencil, X } from "lucide-react";
import { LinkItem, normalizeLinks } from "@/lib/content/media";
import { ImageUrlField, LinksEditor, YouTubeUrlField } from "@/components/admin/MediaFields";

interface BlogPostItem {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  excerptEn?: string | null;
  excerptHi?: string | null;
  contentEn: string;
  contentHi: string;
  coverImage?: string | null;
  youtubeUrl?: string | null;
  additionalLinks?: unknown;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

interface FormState {
  slug: string;
  titleEn: string;
  titleHi: string;
  excerptEn: string;
  excerptHi: string;
  contentEn: string;
  contentHi: string;
  coverImage: string;
  youtubeUrl: string;
  additionalLinks: LinkItem[];
  isPublished: boolean;
}

const EMPTY: FormState = {
  slug: "",
  titleEn: "",
  titleHi: "",
  excerptEn: "",
  excerptHi: "",
  contentEn: "",
  contentHi: "",
  coverImage: "",
  youtubeUrl: "",
  additionalLinks: [],
  isPublished: true,
};

const field =
  "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none";
const area = "w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none";
const label = "block text-xs font-bold uppercase text-on-surface-variant mb-1";

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
      else setError(data.error || "Failed to load posts");
    } catch {
      setError("Error fetching blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const startEdit = (p: BlogPostItem) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      titleEn: p.titleEn,
      titleHi: p.titleHi,
      excerptEn: p.excerptEn || "",
      excerptHi: p.excerptHi || "",
      contentEn: p.contentEn,
      contentHi: p.contentHi,
      coverImage: p.coverImage || "",
      youtubeUrl: p.youtubeUrl || "",
      additionalLinks: normalizeLinks(p.additionalLinks),
      isPublished: p.isPublished,
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          titleEn: form.titleEn,
          titleHi: form.titleHi,
          excerptEn: form.excerptEn || null,
          excerptHi: form.excerptHi || null,
          contentEn: form.contentEn,
          contentHi: form.contentHi,
          coverImage: form.coverImage.trim() || null,
          youtubeUrl: form.youtubeUrl.trim() || null,
          additionalLinks: form.additionalLinks.filter((l) => l.url.trim()),
          isPublished: form.isPublished,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? "Article updated." : "Article created.");
        cancelEdit();
        fetchPosts();
      } else {
        setError(data.error || "Failed to save article");
      }
    } catch {
      setError("Error saving article");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        if (editingId === id) cancelEdit();
        setSuccess("Article deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting article");
    }
  };

  const handleTogglePublish = async (post: BlogPostItem) => {
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, isPublished: !p.isPublished } : p)));
      }
    } catch {
      setError("Error updating status");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">वैदिक लेख प्रबंधन • Astrological Articles & Blog CMS</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Write, edit, publish or remove articles. Each article can have a cover image, a YouTube video and extra links.
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
            <span>{editingId ? "लेख संपादित करें • Edit Article" : "नया लेख लिखें • New Article"}</span>
          </h2>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded border border-maroon text-xs font-bold">
              <X className="w-4 h-4" /> Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>URL slug *</label>
              <input type="text" required value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="jupiter-transit-2026" className={field + " font-mono"} />
            </div>
            <div />
            <div>
              <label className={label}>Title (English) *</label>
              <input type="text" required value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>शीर्षक (हिन्दी) *</label>
              <input type="text" required value={form.titleHi} onChange={(e) => set("titleHi", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>Excerpt (English)</label>
              <textarea rows={2} value={form.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} className={area} />
            </div>
            <div>
              <label className={label}>सार (हिन्दी)</label>
              <textarea rows={2} value={form.excerptHi} onChange={(e) => set("excerptHi", e.target.value)} className={area} />
            </div>
            <div>
              <label className={label}>Content (English) *</label>
              <textarea required rows={8} value={form.contentEn} onChange={(e) => set("contentEn", e.target.value)} className={area} />
            </div>
            <div>
              <label className={label}>सामग्री (हिन्दी) *</label>
              <textarea required rows={8} value={form.contentHi} onChange={(e) => set("contentHi", e.target.value)} className={area} />
            </div>
          </div>

          <ImageUrlField label="Cover image (link or upload)" value={form.coverImage} onChange={(v) => set("coverImage", v)} folder="blogs" />
          <YouTubeUrlField value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} />
          <LinksEditor links={form.additionalLinks} onChange={(v) => set("additionalLinks", v)} />

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 rounded text-secondary" />
            <span>Publish (visible on the website)</span>
          </label>

          <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
            <button type="submit" disabled={submitting} className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" />
              <span>{submitting ? "Saving..." : editingId ? "Save changes" : "Publish article"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">प्रकाशित एवं प्रारूप लेख • Articles ({posts.length})</h2>

        {loading ? (
          <p className="text-xs text-outline">Loading articles...</p>
        ) : posts.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-outline-variant text-center text-xs text-outline">
            No articles created yet. Use the form above to write one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-outline block">/{post.slug}</span>
                    <h3 className="font-bold text-sm text-secondary mt-0.5">{post.titleEn}</h3>
                    <p className="text-xs text-on-surface-variant font-serif">{post.titleHi}</p>
                  </div>
                  <div className="flex">
                    <button onClick={() => startEdit(post)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-gold text-secondary" aria-label="Edit article">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-error-container/20 text-on-error-container" aria-label="Delete article">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`min-h-[36px] px-2.5 py-1 rounded text-[11px] font-bold uppercase ${post.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-surface-container text-outline"}`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </button>
                  <Link href={`/blogs/${post.slug}`} className="text-primary hover:underline inline-flex items-center gap-1 text-[11px]">
                    <span>View Public</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
