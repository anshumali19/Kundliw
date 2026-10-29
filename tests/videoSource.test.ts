import { describe, expect, it } from "vitest";
import { videoSource } from "@/lib/content/media";

describe("videoSource", () => {
  it("embeds YouTube, Vimeo and Google Drive links", () => {
    expect(videoSource("https://youtu.be/dQw4w9WgXcQ")).toEqual({ kind: "iframe", src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" });
    expect(videoSource("https://vimeo.com/123456789")).toEqual({ kind: "iframe", src: "https://player.vimeo.com/video/123456789" });
    expect(videoSource("https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view?usp=sharing")).toEqual({
      kind: "iframe",
      src: "https://drive.google.com/file/d/1AbCdEfGhIjKlMn/preview",
    });
  });

  it("plays direct video files", () => {
    expect(videoSource("https://example.com/media/puja.mp4")?.kind).toBe("file");
    expect(videoSource("https://example.com/a/b.WEBM?x=1")?.kind).toBe("file");
  });

  it("rejects everything else", () => {
    expect(videoSource("javascript:alert(1)")).toBeNull();
    expect(videoSource("https://example.com/page")).toBeNull();
    expect(videoSource("")).toBeNull();
    expect(videoSource(null)).toBeNull();
  });
});
