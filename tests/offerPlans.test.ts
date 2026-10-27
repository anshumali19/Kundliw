import { describe, it, expect } from "vitest";
import { applyOffer } from "../src/lib/offers/apply";
import { themeCss } from "../src/lib/siteConfig/theme";

const base = { code: "PLAN10", discountType: "PERCENTAGE" as const, discountValuePaise: 10, isActive: true, perUserLimit: 0 };

describe("offers scoped to plans", () => {
  it("accepts the chosen plan", () => {
    const r = applyOffer({ ...base, planIds: ["p1"] }, 100000, new Date(), { planId: "p1" });
    expect(r.isValid).toBe(true);
    expect(r.discountPaise).toBe(10000);
  });
  it("refuses another plan with a clear reason", () => {
    const r = applyOffer({ ...base, planIds: ["p1"] }, 100000, new Date(), { planId: "p2" });
    expect(r.isValid).toBe(false);
    expect(r.reason).toMatch(/selected plan/);
  });
  it("an offer without plans works for every plan", () => {
    expect(applyOffer({ ...base, planIds: [] }, 100000, new Date(), { planId: "p9" }).isValid).toBe(true);
  });
});

describe("theme extras", () => {
  it("writes text, heading, footer and font settings", () => {
    const css = themeCss({ text: "#111111", heading: "#222222", footerBg: "#333333", bodyFont: "Poppins", headingFont: "Georgia" });
    expect(css).toContain("--on-surface:#111111");
    expect(css).toContain("--secondary:#222222");
    expect(css).toContain("--footer-bg:#333333");
    expect(css).toContain("var(--font-poppins)");
    expect(css).toContain('"Georgia"');
  });
  it("ignores unsafe font names", () => {
    expect(themeCss({ bodyFont: "x;}body{display:none" })).toBe("");
  });
});
