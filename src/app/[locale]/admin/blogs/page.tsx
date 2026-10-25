"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  Eye,
} from "lucide-react";

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
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [excerptHi, setExcerptHi] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      } else {
        setError(data.error || "Failed to load posts");
      }
    } catch {
      setError("Error fetching blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "blogs");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setCoverImage(data.url);
        setSuccess("Cover image uploaded");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Error uploading cover image");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          titleEn,
          titleHi,
          excerptEn: excerptEn || null,
          excerptHi: excerptHi || null,
          contentEn,
          contentHi,
          coverImage: coverImage || null,
          isPublished,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Blog post published");
        setSlug("");
        setTitleEn("");
        setTitleHi("");
        setExcerptEn("");
        setExcerptHi("");
        setContentEn("");
        setContentHi("");
        setCoverImage("");
        fetchPosts();
      } else {
        setError(data.error || "Failed to save post");
      }
    } catch {
      setError("Error saving post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSuccess("Post deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting post");
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
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, isPublished: !p.isPublished } : p))
        );
      }
    } catch {
      setError("Error toggling publish state");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          वैदिक लेख प्रबंधन • Astrological Articles & Blog CMS
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Publish bilingual astronomical insights, transit analyses, and canonical essays.
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

      {/* Create Post Form */}
      <div className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>नया लेख लिखें • New Vedic Article</span>
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                URL Slug (e.g. jupiter-transit-2026) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="jupiter-transit-2026"
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Cover Image (Upload or URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="/images/blog1.jpg"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
                <label className="min-h-[44px] px-3 py-2 border border-outline-variant rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer hover:bg-surface-container shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? "..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Navamsha D9: The Secret Navigational Chart of Destiny"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                शीर्षक (हिन्दी) *
              </label>
              <input
                type="text"
                required
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="उदा: नवमांश कुण्डली (डी-९): भाग्य एवं सूक्ष्म संस्कार का रहस्य"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Excerpt (English)
              </label>
              <textarea
                rows={2}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                placeholder="Summary for article card..."
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                संक्षिप्त सारांश (हिन्दी)
              </label>
              <textarea
                rows={2}
                value={excerptHi}
                onChange={(e) => setExcerptHi(e.target.value)}
                placeholder="लेख का मुख्य सार..."
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Article Body (English - Markdown) *
              </label>
              <textarea
                required
                rows={8}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="## Section Title&#10;&#10;Detailed astrological discussion..."
                className="w-full p-3 font-mono text-xs bg-surface-container-low border border-outline-variant rounded focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                लेख का मुख्य पाठ (हिन्दी - Markdown) *
              </label>
              <textarea
                required
                rows={8}
                value={contentHi}
                onChange={(e) => setContentHi(e.target.value)}
                placeholder="## विषय प्रवेश&#10;&#10;शास्त्रीय विश्लेषण..."
                className="w-full p-3 font-mono text-xs bg-surface-container-low border border-outline-variant rounded focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-secondary"
              />
              <span>Publish Immediately (सार्वजनिक रूप से प्रकाशित करें)</span>
            </label>
          </div>

          <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Publishing..." : "Save Article"}</span>
          </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">
          प्रकाशित एवं प्रारूप लेख • Articles ({posts.length})
        </h2>

        {loading ? (
          <p className="text-xs text-outline">Loading articles...</p>
        ) : posts.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-outline-variant text-center text-xs text-outline">
            No articles created yet. Use the form above to author an article.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-outline block">
                      /{post.slug}
                    </span>
                    <h3 className="font-bold text-sm text-secondary mt-0.5">
                      {post.titleEn}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-serif">
                      {post.titleHi}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 rounded hover:bg-error-container/20 text-on-error-container transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                      post.isPublished
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </button>

                  <Link
                    href={`/blogs/${post.slug}`}
                    className="text-primary hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
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
