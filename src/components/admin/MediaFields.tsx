"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import { useEffect, useRef, useState } from "react";
import { upload as uploadToBlob } from "@vercel/blob/client";
import { ArrowDown, ArrowUp, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { BLOCK_TYPES, BlockType, ContentBlock, LinkItem } from "@/lib/content/media";

const inputCls =
  "w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]";
const labelCls = "block text-xs font-bold uppercase text-secondary mb-1";
const smallBtn =
  "inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded border border-maroon bg-surface hover:bg-gold text-xs font-bold text-secondary disabled:opacity-40";

/** Image address field: paste a link or upload a file. */
export function ImageUrlField({
  label,
  value,
  onChange,
  folder = "media",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("subfolder", folder);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste an image link, or upload a file"
        className={inputCls}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
          className="text-xs"
        />
        {uploading && <span className="text-xs text-on-surface-variant">Uploading...</span>}
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs underline text-on-surface-variant">
            Remove image
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-on-error-container">{error}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Preview"
          className="mt-2 h-24 w-auto rounded border border-outline-variant/60 object-cover"
        />
      )}
    </div>
  );
}

export function YouTubeUrlField({
  value,
  onChange,
  label = "Video link (optional): YouTube, Vimeo, Google Drive or a direct .mp4 link",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className={inputCls}
      />
    </div>
  );
}

/**
 * Video field: paste a link (YouTube, Vimeo, Google Drive, direct .mp4) or upload the full video file.
 * Uploads go straight to the video store, so large files work.
 */
export function VideoField({
  value,
  onChange,
  label = "Video",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [maxMb, setMaxMb] = useState(500);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/admin/media/video-upload")
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        setEnabled(!!d.enabled);
        if (d.maxMb) setMaxMb(d.maxMb);
      })
      .catch(() => live && setEnabled(false));
    return () => {
      live = false;
    };
  }, []);

  const send = async (file: File) => {
    setError(null);
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Video is larger than ${maxMb} MB. Upload it to YouTube and paste the link instead.`);
      return;
    }
    setProgress(0);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await uploadToBlob(`videos/${safe}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/media/video-upload",
        multipart: true,
        contentType: file.type || undefined,
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      onChange(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a YouTube, Vimeo, Google Drive or .mp4 link, or upload a video below"
        className={inputCls}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v"
          disabled={progress !== null || enabled === false}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void send(f);
          }}
          className="text-xs"
        />
        {progress !== null && <span className="text-xs text-on-surface-variant">Uploading… {progress}%</span>}
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs underline text-on-surface-variant">
            Remove video
          </button>
        )}
      </div>
      {progress !== null && (
        <div className="mt-2 h-2 w-full max-w-xs rounded bg-surface-container-high overflow-hidden" aria-hidden="true">
          <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      )}
      {enabled === false && (
        <p className="mt-1 text-xs text-on-surface-variant">
          Video upload is not switched on yet. Paste a link for now (the developer sets up the video store once).
        </p>
      )}
      {enabled && <p className="mt-1 text-[11px] text-on-surface-variant">MP4, WebM or MOV, up to {maxMb} MB.</p>}
      {error && <p className="mt-1 text-xs text-on-error-container">{error}</p>}
    </div>
  );
}

/** Editable list of extra links with a Hindi and an English label each. */
export function LinksEditor({
  links,
  onChange,
  label = "Additional links",
}: {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
  label?: string;
}) {
  const update = (i: number, patch: Partial<LinkItem>) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={labelCls + " mb-0"}>{label}</span>
        <button
          type="button"
          onClick={() => onChange([...links, { labelEn: "", labelHi: "", url: "" }])}
          className={smallBtn}
        >
          <Plus className="w-4 h-4" /> Add link
        </button>
      </div>
      {links.length === 0 && <p className="text-xs text-on-surface-variant">No extra links yet.</p>}
      {links.map((l, i) => (
        <div
          key={i}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr_auto] gap-2 items-start p-2 rounded border border-outline-variant/50"
        >
          <input
            type="text"
            value={l.labelEn}
            onChange={(e) => update(i, { labelEn: e.target.value })}
            placeholder="Label (English)"
            aria-label="Link label in English"
            className={inputCls}
          />
          <input
            type="text"
            value={l.labelHi}
            onChange={(e) => update(i, { labelHi: e.target.value })}
            placeholder="लेबल (हिंदी)"
            aria-label="Link label in Hindi"
            className={inputCls}
          />
          <input
            type="url"
            value={l.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://..."
            aria-label="Link address"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, idx) => idx !== i))}
            className={smallBtn}
            aria-label="Remove link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

const TYPE_LABEL: Record<BlockType, string> = {
  text: "Text",
  image: "Image",
  youtube: "YouTube video",
  link: "Link button",
};

function newBlock(type: BlockType): ContentBlock {
  return {
    id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type,
    isActive: true,
    textEn: "",
    textHi: "",
    url: "",
    labelEn: "",
    labelHi: "",
  };
}

/**
 * Page content builder: add text, image, YouTube and link blocks between the
 * main content, reorder them, switch each on or off, edit or remove them.
 */
export function BlocksEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const update = (i: number, patch: Partial<ContentBlock>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={labelCls + " mb-0 mr-2"}>Content blocks</span>
        {BLOCK_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => onChange([...blocks, newBlock(t)])} className={smallBtn}>
            <Plus className="w-4 h-4" /> {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      {blocks.length === 0 && (
        <p className="text-xs text-on-surface-variant">
          No blocks yet. Add text, an image, a YouTube video or a link. They appear below the page text.
        </p>
      )}
      {blocks.map((b, i) => (
        <div
          key={b.id}
          className={`p-3 rounded-lg border space-y-2 ${b.isActive ? "border-outline-variant/60 bg-surface" : "border-dashed border-outline-variant bg-surface-container-low opacity-80"}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {i + 1}. {TYPE_LABEL[b.type]} {b.isActive ? "" : "(hidden)"}
            </span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={smallBtn} aria-label="Move up">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
                className={smallBtn}
                aria-label="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => update(i, { isActive: !b.isActive })}
                className={smallBtn}
                aria-pressed={b.isActive}
              >
                {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {b.isActive ? "Active" : "Inactive"}
              </button>
              <button
                type="button"
                onClick={() => onChange(blocks.filter((_, idx) => idx !== i))}
                className={smallBtn}
                aria-label="Remove block"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>

          {b.type === "image" && (
            <ImageUrlField label="Image" value={b.url} onChange={(url) => update(i, { url })} />
          )}
          {b.type === "youtube" && <YouTubeUrlField label="YouTube link" value={b.url} onChange={(url) => update(i, { url })} />}
          {b.type === "link" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={b.labelEn}
                onChange={(e) => update(i, { labelEn: e.target.value })}
                placeholder="Button label (English)"
                className={inputCls}
              />
              <input
                type="text"
                value={b.labelHi}
                onChange={(e) => update(i, { labelHi: e.target.value })}
                placeholder="बटन लेबल (हिंदी)"
                className={inputCls}
              />
              <input
                type="url"
                value={b.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <LinkTextarea
              rows={b.type === "text" ? 4 : 2}
              value={b.textEn}
              onChange={(v) => update(i, { textEn: v })}
              placeholder={b.type === "text" ? "Text (English)" : "Caption (English, optional)"}
              className={inputCls}
              label={b.type === "text" ? "English" : undefined}
            />
            <LinkTextarea
              rows={b.type === "text" ? 4 : 2}
              value={b.textHi}
              onChange={(v) => update(i, { textHi: v })}
              placeholder={b.type === "text" ? "पाठ (हिंदी)" : "कैप्शन (हिंदी, वैकल्पिक)"}
              className={inputCls}
              label={b.type === "text" ? "हिंदी" : undefined}
              isHindi
            />
          </div>
        </div>
      ))}
    </div>
  );
}
