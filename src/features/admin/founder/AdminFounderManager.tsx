"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Video,
  Save,
  Globe,
} from "lucide-react";

interface LinkItem {
  labelEn: string;
  labelHi: string;
  url: string;
}

export function AdminFounderManager({ isHindi }: { isHindi: boolean }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [nameEn, setNameEn] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [designationEn, setDesignationEn] = useState("");
  const [designationHi, setDesignationHi] = useState("");
  const [roleEn, setRoleEn] = useState("");
  const [roleHi, setRoleHi] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioHi, setBioHi] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [additionalLinks, setAdditionalLinks] = useState<LinkItem[]>([]);
  const [footerNoteEn, setFooterNoteEn] = useState("");
  const [footerNoteHi, setFooterNoteHi] = useState("");
  const [isActive, setIsActive] = useState(true);

  // New Link input temporary state
  const [newLabelEn, setNewLabelEn] = useState("");
  const [newLabelHi, setNewLabelHi] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const fetchFounderProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/founder");
      const data = await res.json();
      if (res.ok && data.profile) {
        const p = data.profile;
        setNameEn(p.nameEn || "");
        setNameHi(p.nameHi || "");
        setDesignationEn(p.designationEn || "");
        setDesignationHi(p.designationHi || "");
        setRoleEn(p.roleEn || "");
        setRoleHi(p.roleHi || "");
        setPhotoUrl(p.photoUrl || "");
        setBioEn(p.bioEn || "");
        setBioHi(p.bioHi || "");
        setYoutubeUrl(p.youtubeUrl || "");
        setAdditionalLinks(Array.isArray(p.additionalLinks) ? p.additionalLinks : []);
        setFooterNoteEn(p.footerNoteEn || "");
        setFooterNoteHi(p.footerNoteHi || "");
        setIsActive(p.isActive ?? true);
      }
    } catch {
      setStatus({ type: "error", text: "Failed to load founder profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFounderProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "founder");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPhotoUrl(data.url);
        setStatus({ type: "success", text: "Founder portrait uploaded successfully." });
      } else {
        setStatus({ type: "error", text: data.error || "Upload failed." });
      }
    } catch {
      setStatus({ type: "error", text: "Error uploading image." });
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = () => {
    if (!newLabelEn || !newLabelHi || !newUrl) {
      alert("Please fill in both labels and a valid URL for the link.");
      return;
    }
    setAdditionalLinks((prev) => [
      ...prev,
      { labelEn: newLabelEn.trim(), labelHi: newLabelHi.trim(), url: newUrl.trim() },
    ]);
    setNewLabelEn("");
    setNewLabelHi("");
    setNewUrl("");
  };

  const handleRemoveLink = (index: number) => {
    setAdditionalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const payload = {
      nameEn,
      nameHi,
      designationEn,
      designationHi,
      roleEn,
      roleHi,
      photoUrl: photoUrl || null,
      bioEn,
      bioHi,
      youtubeUrl: youtubeUrl || null,
      additionalLinks,
      footerNoteEn: footerNoteEn || null,
      footerNoteHi: footerNoteHi || null,
      isActive,
    };

    try {
      const res = await fetch("/api/admin/founder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          type: "success",
          text: isHindi
            ? "संस्थापक पृष्ठ विवरण सफलतापूर्वक सहेजा गया।"
            : "Founder page details saved successfully.",
        });
      } else {
        setStatus({ type: "error", text: data.error || "Failed to update founder profile." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error saving founder profile." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-on-surface-variant">Loading founder details...</div>;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Founder Page CMS Control</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          Founder Profile & Lineage (संस्थापक परिचय प्रबंधन)
        </h1>
        <p className="text-xs text-on-surface-variant">
          Upload photo, edit designation, scholarly role, video links, sister portal links, and ethical footer notes.
        </p>
      </div>

      {status && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              : "bg-red-500/10 text-red-700 border border-red-500/20"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Identity & Designation */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 shadow-sm">
          <div className="font-serif font-bold text-sm text-secondary">
            Identity & Designation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Founder Name (English) *</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Founder Name"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Founder Name (Hindi) *</label>
              <input
                type="text"
                required
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                placeholder="उदा. संस्थापक का नाम"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Designation (English) *</label>
              <input
                type="text"
                required
                value={designationEn}
                onChange={(e) => setDesignationEn(e.target.value)}
                placeholder="e.g. Founder & Chief Astrologer"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Designation (Hindi) *</label>
              <input
                type="text"
                required
                value={designationHi}
                onChange={(e) => setDesignationHi(e.target.value)}
                placeholder="उदा. संस्थापक एवं मुख्य ज्योतिषाचार्य"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Role / Tradition Tagline (English)</label>
              <input
                type="text"
                value={roleEn}
                onChange={(e) => setRoleEn(e.target.value)}
                placeholder="e.g. Astrologer and founder"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Role / Tradition Tagline (Hindi)</label>
              <input
                type="text"
                value={roleHi}
                onChange={(e) => setRoleHi(e.target.value)}
                placeholder="उदा. काशी वेदांग ज्योतिष परंपरा • ४० से अधिक वर्षों का अनुभव"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>
          </div>
        </div>

        {/* Media: Photo & YouTube Video */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 shadow-sm">
          <div className="font-serif font-bold text-sm text-secondary">
            Portrait Photo & Video Link
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Portrait Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="/images/founder.jpg or URL"
                  className="flex-1 p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                />
                <label className="p-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 text-on-surface-variant" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[10px] text-outline">Upload device image or enter URL</span>
            </div>

            <div>
              <label className="font-semibold block mb-1">YouTube Video Link (Discourse / Interview)</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
              <span className="text-[10px] text-outline">Will be displayed as an embedded video on the Founder page</span>
            </div>
          </div>
        </div>

        {/* Long Biography */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 shadow-sm">
          <div className="font-serif font-bold text-sm text-secondary">
            Scholarly Biography & Lineage Narrative
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold block mb-1">Biography (English) *</label>
              <textarea
                required
                rows={5}
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                placeholder="Detailed background, degrees, lineage, and experience in English..."
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface leading-relaxed"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Biography (Hindi) *</label>
              <textarea
                required
                rows={5}
                value={bioHi}
                onChange={(e) => setBioHi(e.target.value)}
                placeholder="विस्तृत परिचय, विश्वविद्यालय उपाधियां, अनुभव एवं परंपरा हिंदी में..."
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Additional External Links */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 shadow-sm">
          <div className="font-serif font-bold text-sm text-secondary">
            Additional Links & Affiliations
          </div>

          <div className="space-y-2">
            {additionalLinks.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs"
              >
                <div>
                  <span className="font-semibold text-secondary">{link.labelEn}</span> /{" "}
                  <span className="text-primary">{link.labelHi}</span>
                  <div className="text-[10px] text-outline truncate max-w-md">{link.url}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="p-1 rounded text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20">
            <input
              type="text"
              value={newLabelEn}
              onChange={(e) => setNewLabelEn(e.target.value)}
              placeholder="Label (English)"
              className="p-2 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
            <input
              type="text"
              value={newLabelHi}
              onChange={(e) => setNewLabelHi(e.target.value)}
              placeholder="Label (Hindi)"
              className="p-2 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 p-2 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-2 rounded-xl bg-secondary text-on-secondary font-semibold hover:bg-secondary/90 transition-colors shrink-0"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>

        {/* Ethical Footer Note */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 shadow-sm">
          <div className="font-serif font-bold text-sm text-secondary">
            Ethical Footer Note
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Footer Note (English)</label>
              <textarea
                rows={2}
                value={footerNoteEn}
                onChange={(e) => setFooterNoteEn(e.target.value)}
                placeholder="Note on Dakshina, ethics, or disclaimer in English..."
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Footer Note (Hindi)</label>
              <textarea
                rows={2}
                value={footerNoteHi}
                onChange={(e) => setFooterNoteHi(e.target.value)}
                placeholder="दक्षिणा, आचार संहिता अथवा अस्वीकरण हिंदी में..."
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Save Founder Profile Live"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
