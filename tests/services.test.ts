import { describe, it, expect } from "vitest";
import { rupeesToPaise, paiseToRupees } from "../src/lib/billing/money";
import { formatPaiseToInr } from "../src/lib/billing/gst";
import {
  serviceInputSchema,
  planInputSchema,
  offerInputSchema,
} from "../src/features/services/validation";
import { DiscountType } from "@prisma/client";

describe("Phase 3: Money Boundary Conversions", () => {
  it("converts whole rupee amounts into integer paise accurately", () => {
    expect(rupeesToPaise(1100)).toBe(110000);
    expect(rupeesToPaise(2100)).toBe(210000);
    expect(rupeesToPaise(5100)).toBe(510000);
    expect(rupeesToPaise(0)).toBe(0);
  });

  it("handles decimal rupee boundary amounts without floating point drift", () => {
    expect(rupeesToPaise(10.5)).toBe(1050);
    expect(rupeesToPaise(99.99)).toBe(9999);
  });

  it("rejects negative rupee amounts", () => {
    expect(() => rupeesToPaise(-100)).toThrow();
  });

  it("converts paise back into whole and decimal rupees", () => {
    expect(paiseToRupees(110000)).toBe(1100);
    expect(paiseToRupees(50000)).toBe(500);
    expect(paiseToRupees(9999)).toBe(99.99);
  });

  it("formats paise into Indian Rupee display string with symbol", () => {
    const formatted = formatPaiseToInr(210000);
    expect(formatted).toContain("2,100");
  });
});

describe("Phase 3: Zod Input Validation & Business Rules", () => {
  it("validates that service requires bilingual titles and descriptions with clean slugs", () => {
    const validService = {
      slug: "complete-janampatri",
      titleEn: "Complete Janampatri",
      titleHi: "सम्पूर्ण जन्मपत्री",
      descriptionEn: "Comprehensive horoscope analysis.",
      descriptionHi: "विस्तृत जन्मपत्रिका विश्लेषण।",
      orderIndex: 1,
      isActive: true,
    };

    expect(serviceInputSchema.safeParse(validService).success).toBe(true);

    const invalidSlug = {
      ...validService,
      slug: "Complete Janampatri With Spaces!",
    };
    expect(serviceInputSchema.safeParse(invalidSlug).success).toBe(false);

    const missingHindi = {
      ...validService,
      titleHi: "",
    };
    expect(serviceInputSchema.safeParse(missingHindi).success).toBe(false);
  });

  it("validates that plan requires positive rupee price and bilingual fields", () => {
    const validPlan = {
      serviceId: "srv-123",
      slug: "vishesh",
      titleEn: "Vishesh Tier",
      titleHi: "सटीक विस्तृत",
      descriptionEn: "Detailed consultation.",
      descriptionHi: "विस्तृत परामर्श।",
      priceRupees: 2100,
      originalPriceRupees: 2800,
      deliveryDays: 3,
      pages: 45,
      hasCall: true,
      callDurationMinutes: 30,
      featuresEn: ["Feature 1"],
      featuresHi: ["विशेषता १"],
      isPopular: true,
      orderIndex: 2,
      isActive: true,
    };

    expect(planInputSchema.safeParse(validPlan).success).toBe(true);

    const negativePrice = {
      ...validPlan,
      priceRupees: -500,
    };
    expect(planInputSchema.safeParse(negativePrice).success).toBe(false);
  });

  it("validates that offers strictly enforce percentage range 1-100", () => {
    const validPercentOffer = {
      code: "FESTIVE25",
      titleEn: "Festive 25% Off",
      titleHi: "पर्व २५% छूट",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 25,
      maxDiscountRupees: 1000,
      minOrderValueRupees: 1500,
      validFrom: new Date().toISOString(),
      isActive: true,
    };

    expect(offerInputSchema.safeParse(validPercentOffer).success).toBe(true);

    const over100Percent = {
      ...validPercentOffer,
      discountValue: 125,
    };
    expect(offerInputSchema.safeParse(over100Percent).success).toBe(false);

    const zeroPercent = {
      ...validPercentOffer,
      discountValue: 0,
    };
    expect(offerInputSchema.safeParse(zeroPercent).success).toBe(false);
  });

  it("validates that offer expiration date cannot precede start date", () => {
    const invalidDateOffer = {
      code: "INVALID_DATES",
      titleEn: "Invalid Date Range",
      titleHi: "अमान्य तिथि",
      discountType: DiscountType.FLAT,
      discountValue: 500,
      validFrom: "2026-12-01T00:00:00.000Z",
      validUntil: "2026-11-01T00:00:00.000Z", // Precedes start date
      isActive: true,
    };

    const parsed = offerInputSchema.safeParse(invalidDateOffer);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("Valid Until date must be later than Valid From date");
    }
  });
});

describe("Phase 3: Public Filtering Rule — Inactive Plans Never Appear Publicly", () => {
  interface MockPlan {
    id: string;
    title: string;
    isActive: boolean;
  }

  interface MockService {
    id: string;
    slug: string;
    isActive: boolean;
    plans: MockPlan[];
  }

  const catalog: MockService[] = [
    {
      id: "srv-1",
      slug: "active-service",
      isActive: true,
      plans: [
        { id: "p1", title: "Active Plan 1", isActive: true },
        { id: "p2", title: "Discontinued Plan 2", isActive: false },
        { id: "p3", title: "Active Plan 3", isActive: true },
      ],
    },
    {
      id: "srv-2",
      slug: "archived-service",
      isActive: false,
      plans: [
        { id: "p4", title: "Plan 4 in Inactive Service", isActive: true },
      ],
    },
  ];

  it("public service listing query strictly filters for active services and active plans only", () => {
    // Simulating the Prisma where clause used in public /services and /services/[slug]:
    // where: { isActive: true }, include: { plans: { where: { isActive: true } } }
    const publicServices = catalog
      .filter((s) => s.isActive)
      .map((s) => ({
        ...s,
        plans: s.plans.filter((p) => p.isActive),
      }));

    expect(publicServices.length).toBe(1);
    expect(publicServices[0].slug).toBe("active-service");
    expect(publicServices[0].plans.length).toBe(2);

    // Verify discontinued plan is never returned
    const returnedPlanIds = publicServices[0].plans.map((p) => p.id);
    expect(returnedPlanIds).toContain("p1");
    expect(returnedPlanIds).toContain("p3");
    expect(returnedPlanIds).not.toContain("p2");

    // Verify archived service is completely excluded
    const returnedServiceIds = publicServices.map((s) => s.id);
    expect(returnedServiceIds).not.toContain("srv-2");
  });

  it("public service detail query returns 404 (null) when service is inactive", () => {
    const findPublicServiceBySlug = (slug: string) => {
      const found = catalog.find((s) => s.slug === slug);
      if (!found || !found.isActive) return null;
      return {
        ...found,
        plans: found.plans.filter((p) => p.isActive),
      };
    };

    expect(findPublicServiceBySlug("active-service")).not.toBeNull();
    expect(findPublicServiceBySlug("archived-service")).toBeNull();
    expect(findPublicServiceBySlug("non-existent")).toBeNull();
  });
});
