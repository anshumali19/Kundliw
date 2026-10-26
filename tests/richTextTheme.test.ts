import { describe, expect, it } from "vitest";
import { parseInline, parseRich, safeHref, stripRich } from "@/lib/content/richText";
import { themeCss } from "@/lib/siteConfig/theme";
import { SECTIONS, normalizeLinkList, normalizeSection } from "@/lib/siteConfig/definitions";

describe("links typed by the admin", () => {
  it("accepts web, phone, mail and in-site addresses only", () => {
    expect(safeHref("https://example.com/a?b=1")?.external).toBe(true);
    expect(safeHref("/services")?.external).toBe(false);
    expect(safeHref("tel:+91 98279 91224")?.href).toBe("tel:+9198279 91224".replace(" ", ""));
    expect(safeHref("mailto:a@b.in")).not.toBeNull();
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,x")).toBeNull();
    expect(safeHref("//evil.example")).toBeNull();
    expect(safeHref("")).toBeNull();
  });

  it("turns [words](address) into a link and keeps unsafe markup as plain text", () => {
    const ok = parseInline("Call [us](tel:+919827991224) or **now**");
    expect(ok.map((p) => p.type)).toEqual(["text", "link", "text", "bold"]);
    const bad = parseInline("[click](javascript:alert(1))");
    expect(bad.every((p) => p.type === "text")).toBe(true);
  });

  it("splits paragraphs on blank lines and strips markup for plain use", () => {
    expect(parseRich("one\ntwo\n\nthree")).toHaveLength(2);
    expect(stripRich("Hello [world](https://x.in) **bold**")).toBe("Hello world bold");
  });
});

describe("site colours", () => {
  it("builds CSS only from valid #rrggbb colours", () => {
    expect(themeCss({})).toBe("");
    expect(themeCss({ brand: "red" })).toBe("");
    const css = themeCss({ brand: "#C0481B", dark: "#40241C" });
    expect(css).toContain("--brand:#C0481B");
    expect(css).toContain("--maroon-rgb:64 36 28");
    expect(css).not.toContain("</style>");
  });
});

describe("new admin sections and link lists", () => {
  it("has the sections the client asked to control", () => {
    for (const id of ["homeSections", "homeHero", "homeCards", "homeServices", "homeProcess", "homeContact", "topbar", "floating", "intro", "theme", "menu", "footerLinks"]) {
      expect(SECTIONS.some((s) => s.id === id)).toBe(true);
    }
  });

  it("validates link fields", () => {
    const hero = SECTIONS.find((s) => s.id === "homeHero")!;
    expect(normalizeSection(hero, { cta1Url: "/services" }).ok).toBe(true);
    expect(normalizeSection(hero, { cta1Url: "javascript:alert(1)" }).ok).toBe(false);
  });

  it("validates menu items", () => {
    expect(normalizeLinkList({ items: [{ labelEn: "Home", labelHi: "होम", href: "/", show: true }] }).ok).toBe(true);
    expect(normalizeLinkList({ items: [{ labelEn: "Bad", labelHi: "", href: "javascript:x", show: true }] }).ok).toBe(false);
    expect(normalizeLinkList({ items: [{ labelEn: "", labelHi: "", href: "", show: true }] })).toEqual({ ok: true, items: [] });
  });
});
