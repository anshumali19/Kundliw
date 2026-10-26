import { describe, expect, it } from "vitest";
import { SECTIONS, cleanSocialUrl, completeSocial, normalizeSection, normalizeSocial } from "@/lib/siteConfig/definitions";

describe("site config definitions", () => {
  it("turns a WhatsApp number into a wa.me link", () => {
    expect(cleanSocialUrl("whatsapp", "9827991224")).toBe("https://wa.me/919827991224");
    expect(cleanSocialUrl("whatsapp", "+91 98279 91224")).toBe("https://wa.me/919827991224");
  });

  it("refuses non-web social links", () => {
    expect(cleanSocialUrl("facebook", "javascript:alert(1)")).toBe("");
    const r = normalizeSocial({ items: [{ id: "facebook", name: "Facebook", url: "javascript:alert(1)", active: true }] });
    expect(r.ok).toBe(false);
  });

  it("rejects unknown platforms and keeps valid rows", () => {
    expect(normalizeSocial({ items: [{ id: "tiktok", url: "" }] }).ok).toBe(false);
    const ok = normalizeSocial({ items: [{ id: "youtube", name: "YouTube", url: "https://youtube.com/@x", active: true }] });
    expect(ok.ok && ok.items[0].active).toBe(true);
  });

  it("always lists every platform", () => {
    expect(completeSocial([]).map((p) => p.id)).toEqual(["youtube", "whatsapp", "facebook", "instagram", "twitter", "linkedin", "telegram"]);
  });

  it("validates fields by type", () => {
    const seo = SECTIONS.find((s) => s.id === "seo")!;
    expect(normalizeSection(seo, { shareImage: "http://insecure.example/x.png" }).ok).toBe(false);
    expect(normalizeSection(seo, { shareImage: "/api/storage/media/x.png", metaTitleEn: "Hi" }).ok).toBe(true);
    expect(normalizeSection(seo, { metaTitleEn: "x".repeat(200) }).ok).toBe(false);
    const anim = SECTIONS.find((s) => s.id === "heroAnimation")!;
    expect(normalizeSection(anim, { accent: "red" }).ok).toBe(false);
  });

  it("ignores unknown keys", () => {
    const home = SECTIONS.find((s) => s.id === "home")!;
    const r = normalizeSection(home, { evil: "<script>", showSocialStrip: true });
    expect(r.ok && "evil" in r.values).toBe(false);
  });
});
