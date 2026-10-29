import { describe, expect, it } from "vitest";
import { applyOffer, type OfferDefinition } from "@/lib/offers/apply";
import { bundleTitle } from "@/lib/booking/bundle";
import { createBookingOrderSchema } from "@/features/booking/validation";

const offer = (planIds: string[]): OfferDefinition => ({
  code: "T10",
  discountType: "PERCENTAGE",
  discountValuePaise: 10,
  isActive: true,
  perUserLimit: 0,
  planIds,
});

describe("combined plan bookings", () => {
  it("10% off applies to the combined total", () => {
    const r = applyOffer(offer([]), 220000, new Date(), { planId: "a", planIds: ["a", "b"] });
    expect(r.isValid).toBe(true);
    expect(r.discountPaise).toBe(22000);
  });

  it("a code limited to some plans must cover every plan in the booking", () => {
    expect(applyOffer(offer(["a", "b"]), 100, new Date(), { planId: "a", planIds: ["a", "b"] }).isValid).toBe(true);
    const r = applyOffer(offer(["a"]), 100, new Date(), { planId: "a", planIds: ["a", "b"] });
    expect(r.isValid).toBe(false);
    expect(r.reason).toMatch(/every plan/);
  });

  it("a single plan still works the old way", () => {
    expect(applyOffer(offer(["a"]), 100, new Date(), { planId: "a" }).isValid).toBe(true);
    expect(applyOffer(offer(["a"]), 100, new Date(), { planId: "x" }).isValid).toBe(false);
  });

  it("joins plan names with a plus sign, in English and Hindi", () => {
    const map = new Map([
      ["b", { titleEn: "Video Basic", titleHi: "वीडियो बेसिक" }],
      ["c", { titleEn: "PDF Basic", titleHi: "पीडीएफ बेसिक" }],
    ]);
    const order = { plan: { titleEn: "Audio Basic", titleHi: "ऑडियो बेसिक" }, extraPlanIds: ["b", "c"] };
    expect(bundleTitle(order, map, false)).toBe("Audio Basic + Video Basic + PDF Basic");
    expect(bundleTitle(order, map, true)).toBe("ऑडियो बेसिक + वीडियो बेसिक + पीडीएफ बेसिक");
    expect(bundleTitle({ plan: null, extraPlanIds: [] }, map, false, "Standard")).toBe("Standard");
  });

  it("the booking form accepts at most two extra plans", () => {
    const base = {
      serviceSlug: "varshphal",
      planSlug: "a",
      jatakaDetails: { name: "Test User", gender: "MALE", dob: "1990-01-01", tob: "10:00", pob: "Delhi", phone: "9876543210" },
    };
    expect(createBookingOrderSchema.safeParse({ ...base, extraPlanSlugs: ["b", "c"] }).success).toBe(true);
    expect(createBookingOrderSchema.safeParse({ ...base, extraPlanSlugs: ["b", "c", "d"] }).success).toBe(false);
  });
});
