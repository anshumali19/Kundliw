import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({ findMany: vi.fn(), findUnique: vi.fn(), site: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { staticPage: { findMany: db.findMany, findUnique: db.findUnique }, siteConfig: { findUnique: db.site } },
}));
vi.mock("@/lib/siteConfig/service", () => ({ getSection: vi.fn(async () => ({})), getActiveSocialLinks: vi.fn(async () => []) }));

import { getCustomPage, loadContent } from "@/lib/mobile/content";

const page = (over: Record<string, unknown> = {}) => ({ id: "p1", slug: "gemstones", titleEn: "Gemstones", titleHi: "रत्न", contentEn: "Words", contentHi: "शब्द", isActive: true, blocks: [], ...over });

beforeEach(() => {
  vi.clearAllMocks();
  db.site.mockResolvedValue(null);
});

describe("custom pages in the app", () => {
  it("lists only the admin's own pages, not the built-in ones, and not the ones for the website only", async () => {
    db.site.mockResolvedValue({ value: { page: { p3: "WEB" } } });
    db.findMany.mockResolvedValue([page(), page({ id: "p2", slug: "about" }), page({ id: "p4", slug: "legal/x" })]);
    const out = (await loadContent("pages")) as { items: { slug: string }[] };
    expect(out.items.map((i) => i.slug)).toEqual(["gemstones"]);
    expect(db.findMany.mock.calls[0][0].where).toMatchObject({ isActive: true, id: { notIn: ["p3"] } });
  });

  it("opens a custom page with its words in both languages", async () => {
    db.findUnique.mockResolvedValue(page());
    expect(await getCustomPage("gemstones")).toMatchObject({ slug: "gemstones", titleHi: "रत्न", contentEn: "Words", blocks: [] });
  });

  it("does not open a built-in page, a page that is off, or one meant for the website only", async () => {
    expect(await getCustomPage("terms")).toBeNull();
    db.findUnique.mockResolvedValue(page({ isActive: false }));
    expect(await getCustomPage("gemstones")).toBeNull();
    db.findUnique.mockResolvedValue(page());
    db.site.mockResolvedValue({ value: { page: { p1: "WEB" } } });
    expect(await getCustomPage("gemstones")).toBeNull();
    db.findUnique.mockResolvedValue(null);
    expect(await getCustomPage("nope")).toBeNull();
  });
});
