import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { siteConfig: { findUnique: db.find } } }));

import { forViewer, normalizeAudience, shownTo, visibleItems } from "@/lib/audience";

beforeEach(() => vi.clearAllMocks());

describe("audience map", () => {
  it("keeps only known kinds and the two real choices", () => {
    expect(normalizeAudience(null)).toEqual({});
    expect(normalizeAudience("x")).toEqual({});
    expect(normalizeAudience({ offer: { a: "WEB", b: "APP", c: "BOTH", d: 5 }, nonsense: { z: "WEB" }, faq: {} })).toEqual({ offer: { a: "WEB", b: "APP" } });
  });

  it("shows an item to both unless the admin limited it", () => {
    const map = normalizeAudience({ offer: { web1: "WEB", app1: "APP" } });
    expect(shownTo(map, "offer", "free", "web")).toBe(true);
    expect(shownTo(map, "offer", "free", "app")).toBe(true);
    expect(shownTo(map, "offer", "web1", "web")).toBe(true);
    expect(shownTo(map, "offer", "web1", "app")).toBe(false);
    expect(shownTo(map, "offer", "app1", "web")).toBe(false);
    expect(shownTo(map, "offer", "app1", "app")).toBe(true);
    expect(shownTo(map, "blog", "web1", "app")).toBe(true); // another kind is not affected
  });

  it("filters a list for a viewer", () => {
    const map = normalizeAudience({ gallery: { g2: "APP", g3: "WEB" } });
    const items = [{ id: "g1" }, { id: "g2" }, { id: "g3" }];
    expect(visibleItems(map, "gallery", "web", items).map((i) => i.id)).toEqual(["g1", "g3"]);
    expect(visibleItems(map, "gallery", "app", items).map((i) => i.id)).toEqual(["g1", "g2"]);
    expect(visibleItems(map, "faq", "app", items)).toBe(items);
  });
});

describe("forViewer", () => {
  it("reads the saved choices and filters", async () => {
    db.find.mockResolvedValue({ value: { testimonial: { t1: "APP" } } });
    const out = await forViewer("testimonial", "web", [{ id: "t1" }, { id: "t2" }]);
    expect(out.map((i) => i.id)).toEqual(["t2"]);
  });

  it("shows everything when nothing is saved or the read fails, and does not read for an empty list", async () => {
    db.find.mockRejectedValue(new Error("down"));
    expect(await forViewer("offer", "app", [{ id: "a" }])).toEqual([{ id: "a" }]);
    db.find.mockClear();
    expect(await forViewer("offer", "app", [])).toEqual([]);
    expect(db.find).not.toHaveBeenCalled();
  });
});
