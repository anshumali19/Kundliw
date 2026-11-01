"use client";

import { Plus, Trash2 } from "lucide-react";
import { ImageUrlField, VideoField } from "@/components/admin/MediaFields";
import { InfoTip } from "@/components/admin/InfoTip";
import type { DemoItem, DemoKind } from "@/lib/content/demos";

const KIND_LABEL: Record<DemoKind, string> = {
  link: "Demo link",
  image: "Demo picture",
  video: "Demo video",
  social: "Demo social media account",
};

const field = "w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface min-h-[40px]";

/** Add or remove demos of any kind. There is no limit on how many. */
export function DemosEditor({ demos, onChange }: { demos: DemoItem[]; onChange: (demos: DemoItem[]) => void }) {
  const set = (i: number, patch: Partial<DemoItem>) => onChange(demos.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  return (
    <div className="space-y-3 rounded-lg border border-outline-variant/60 bg-surface-container-low p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase text-secondary">
          Demos{" "}
          <InfoTip text="Show visitors what this service looks like: a link, a picture, a short video (a few seconds is fine for now, longer later) or a social media account. Add as many as you want and remove any time." />
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(KIND_LABEL) as DemoKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChange([...demos, { kind: k, labelEn: "", labelHi: "", url: "" }])}
              className="inline-flex min-h-[40px] items-center gap-1 rounded border border-outline-variant px-2.5 text-xs font-semibold text-secondary hover:bg-surface-container"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>
      {demos.length === 0 && <p className="text-xs text-on-surface-variant">No demos yet.</p>}
      {demos.map((d, i) => (
        <div key={i} className="space-y-2 rounded border border-outline-variant/50 bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">{KIND_LABEL[d.kind]}</span>
            <button type="button" aria-label="Remove this demo" onClick={() => onChange(demos.filter((_, k) => k !== i))} className="inline-flex h-9 w-9 items-center justify-center rounded text-outline hover:bg-surface-container">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input type="text" placeholder="Name (English), e.g. Sample report" value={d.labelEn} onChange={(e) => set(i, { labelEn: e.target.value })} className={field} />
            <input type="text" placeholder="नाम (हिन्दी)" value={d.labelHi} onChange={(e) => set(i, { labelHi: e.target.value })} className={field} />
          </div>
          {d.kind === "image" ? (
            <ImageUrlField label="Picture (link or upload)" value={d.url} onChange={(url) => set(i, { url })} folder="demos" />
          ) : d.kind === "video" ? (
            <VideoField label="Video (link or upload)" value={d.url} onChange={(url) => set(i, { url })} />
          ) : (
            <input type="url" placeholder={d.kind === "social" ? "https://instagram.com/..., https://facebook.com/..." : "https://..."} value={d.url} onChange={(e) => set(i, { url: e.target.value })} className={field} />
          )}
        </div>
      ))}
    </div>
  );
}
