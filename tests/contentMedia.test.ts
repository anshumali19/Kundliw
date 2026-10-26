import { describe, it, expect } from "vitest";
import {
  blocksInputSchema,
  isSafeImageSrc,
  isWebUrl,
  linksInputSchema,
  normalizeBlocks,
  normalizeLinks,
  youtubeEmbedUrl,
} from "@/lib/content/media";
import { isCorePageSlug } from "@/lib/content/pages";

describe("web address checks", () => {
  it("accepts only http and https", () => {
    expect(isWebUrl("https://example.com/a")).toBe(true);
    expect(isWebUrl("http://example.com")).toBe(true);
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
    expect(isWebUrl("data:text/html;base64,AAAA")).toBe(false);
    expect(isWebUrl("//evil.example")).toBe(false);
    expect(isWebUrl(undefined)).toBe(false);
  });

  it("allows own uploads and web images, never other schemes", () => {
    expect(isSafeImageSrc("/api/storage/media/x.png")).toBe(true);
    expect(isSafeImageSrc("https://cdn.example.com/x.png")).toBe(true);
    expect(isSafeImageSrc("//evil.example/x.png")).toBe(false);
    expect(isSafeImageSrc("javascript:alert(1)")).toBe(false);
    expect(isSafeImageSrc("")).toBe(false);
    expect(isSafeImageSrc(null)).toBe(false);
  });
});

describe("YouTube addresses", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/live/dQw4w9WgXcQ?feature=share", "dQw4w9WgXcQ"],
  ])("embeds %s", (url, id) => {
    expect(youtubeEmbedUrl(url)).toBe(`https://www.youtube-nocookie.com/embed/${id}`);
  });

  it("rejects look-alike hosts and non-video pages", () => {
    expect(youtubeEmbedUrl("https://evil-youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeEmbedUrl("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeEmbedUrl("https://www.youtube.com/@channel")).toBeNull();
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=<script>")).toBeNull();
    expect(youtubeEmbedUrl("not a link")).toBeNull();
    expect(youtubeEmbedUrl(null)).toBeNull();
  });
});

describe("additional links", () => {
  it("upgrades the older { title, url } shape", () => {
    const links = normalizeLinks([{ title: "Guide", url: "https://example.com/g", description: "x" }]);
    expect(links).toEqual([{ labelEn: "Guide", labelHi: "Guide", url: "https://example.com/g" }]);
  });

  it("keeps Hindi labels and drops unsafe or incomplete links", () => {
    const links = normalizeLinks([
      { labelEn: "Portal", labelHi: "पोर्टल", url: "https://example.com" },
      { labelEn: "Bad", labelHi: "Bad", url: "javascript:alert(1)" },
      { labelEn: "", labelHi: "", url: "https://example.com/no-label" },
      "garbage",
      null,
    ]);
    expect(links).toHaveLength(1);
    expect(links[0].labelHi).toBe("पोर्टल");
  });

  it("returns an empty list for anything that is not a list", () => {
    expect(normalizeLinks(null)).toEqual([]);
    expect(normalizeLinks({})).toEqual([]);
  });

  it("rejects unsafe links when saving", () => {
    expect(linksInputSchema.safeParse([{ labelEn: "A", labelHi: "A", url: "javascript:1" }]).success).toBe(false);
    expect(linksInputSchema.safeParse([{ labelEn: "A", labelHi: "A", url: "https://ok.example" }]).success).toBe(true);
    expect(linksInputSchema.safeParse(Array.from({ length: 31 }, () => ({ labelEn: "A", labelHi: "A", url: "https://ok.example" }))).success).toBe(false);
  });
});

describe("content blocks", () => {
  const base = { id: "b1", isActive: true, textEn: "", textHi: "", url: "", labelEn: "", labelHi: "" };

  it("accepts each block type with valid data", () => {
    const ok = [
      { ...base, type: "text", textEn: "Hello" },
      { ...base, type: "text", textHi: "नमस्ते" },
      { ...base, type: "image", url: "/api/storage/media/a.png" },
      { ...base, type: "image", url: "https://cdn.example.com/a.png" },
      { ...base, type: "youtube", url: "https://youtu.be/dQw4w9WgXcQ" },
      { ...base, type: "link", url: "https://example.com", labelEn: "Open" },
    ];
    expect(blocksInputSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects empty or unsafe blocks", () => {
    expect(blocksInputSchema.safeParse([{ ...base, type: "text" }]).success).toBe(false);
    expect(blocksInputSchema.safeParse([{ ...base, type: "image", url: "javascript:alert(1)" }]).success).toBe(false);
    expect(blocksInputSchema.safeParse([{ ...base, type: "youtube", url: "https://example.com/video" }]).success).toBe(false);
    expect(blocksInputSchema.safeParse([{ ...base, type: "link", url: "https://example.com" }]).success).toBe(false);
    expect(blocksInputSchema.safeParse([{ ...base, type: "iframe", url: "https://example.com" }]).success).toBe(false);
  });

  it("keeps only valid stored blocks", () => {
    const blocks = normalizeBlocks([
      { ...base, type: "text", textEn: "ok" },
      { ...base, type: "image", url: "javascript:alert(1)" },
      "junk",
    ]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
  });
});

describe("built-in pages", () => {
  it("protects the pages the site links to", () => {
    expect(isCorePageSlug("about")).toBe(true);
    expect(isCorePageSlug("terms")).toBe(true);
    expect(isCorePageSlug("guide-admin")).toBe(true);
    expect(isCorePageSlug("legal/privacy")).toBe(true);
    expect(isCorePageSlug("our-process")).toBe(false);
  });
});
