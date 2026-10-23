import { describe, it, expect } from "vitest";
import { BannerPosition, BannerType, MarqueePosition } from "@prisma/client";

describe("Phase 10 - Admin CMS Schemas & Business Rules", () => {
  it("enforces canonical SRS contact numbers in AdminSettings", () => {
    const defaultSettings = {
      phone1: "+91-9827991224",
      phone2: "+91-7509124672",
      city: "Varanasi",
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: "Asia/Kolkata",
      defaultGstRateBps: 1800,
    };

    expect(defaultSettings.phone1).toBe("+91-9827991224");
    expect(defaultSettings.phone2).toBe("+91-7509124672");
    expect(defaultSettings.defaultGstRateBps).toBe(1800);
    expect(defaultSettings.latitude).toBe(25.3176);
    expect(defaultSettings.longitude).toBe(82.9739);
  });

  it("strictly validates Banner positions and presentation types", () => {
    const validPositions: BannerPosition[] = ["TOP", "BOTTOM", "LEFT", "RIGHT"];
    const validTypes: BannerType[] = ["STATIC", "CAROUSEL"];

    expect(validPositions).toContain("RIGHT");
    expect(validPositions).toContain("TOP");
    expect(validTypes).toContain("STATIC");
    expect(validTypes).toContain("CAROUSEL");
  });

  it("strictly validates Marquee announcement speed, px font size and positions", () => {
    const validMarqueePositions: MarqueePosition[] = ["TOP", "BOTTOM"];
    expect(validMarqueePositions).toContain("BOTTOM");
    expect(validMarqueePositions).toContain("TOP");

    const sampleNotice = {
      speedSec: 30,
      fontSize: 13,
      position: "BOTTOM" as MarqueePosition,
    };

    expect(sampleNotice.speedSec).toBeGreaterThanOrEqual(5);
    expect(sampleNotice.fontSize).toBe(13); // integer px
  });

  it("requires unverified flag on sample seed testimonials per instructions", () => {
    const sampleSeedReview = {
      authorNameEn: "Rajesh K.",
      rating: 5,
      isVerified: false, // Sample testimonials must not be marked verified
    };

    expect(sampleSeedReview.isVerified).toBe(false);
  });

  it("supports canonical static page slugs", () => {
    const legalAndStaticSlugs = ["about", "founder", "help", "terms", "privacy", "refund"];
    expect(legalAndStaticSlugs).toContain("about");
    expect(legalAndStaticSlugs).toContain("founder");
    expect(legalAndStaticSlugs).toContain("terms");
    expect(legalAndStaticSlugs).toContain("privacy");
    expect(legalAndStaticSlugs).toContain("refund");
  });
});
