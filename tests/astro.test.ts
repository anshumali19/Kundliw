import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DemoAstroProvider } from "@/lib/astro/demo";
import { AstroSageProvider } from "@/lib/astro/astrosage";
import { getAstroProvider } from "@/lib/astro/factory";

describe("Phase 9 - AstroProvider Subsystem & Vedic Calculations", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DEMO_MODE: "true", NODE_ENV: "development" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("DemoAstroProvider calculates Kundli with explicit isDemo flag and planetary details", async () => {
    const provider = new DemoAstroProvider();
    const result = await provider.calculateKundli({
      name: "Aditya Sharma",
      gender: "MALE",
      dob: "1995-05-14",
      tob: "08:30",
      pob: "Varanasi, UP",
    });

    expect(result.isDemo).toBe(true);
    expect(result.ascendant).toContain("Scorpio");
    expect(result.planetaryPositions).toHaveLength(9);
    expect(result.vimshottariDasha.currentMahadasha).toContain("Jupiter");
    expect(result.sampleDisclaimer).toBeTruthy();
  });

  it("DemoAstroProvider calculates Ashtakoot Matching with 8 kootas, Manglik and Nadi status", async () => {
    const provider = new DemoAstroProvider();
    const result = await provider.calculateMatching({
      boy: { name: "Aarav", dob: "1994-06-12", tob: "07:15", pob: "Varanasi" },
      girl: { name: "Pooja", dob: "1996-09-24", tob: "14:40", pob: "Patna" },
    });

    expect(result.isDemo).toBe(true);
    expect(result.totalScore).toBe(28);
    expect(result.maxScore).toBe(36);
    expect(result.kootas).toHaveLength(8);
    expect(result.kootas.map((k) => k.name)).toEqual([
      "Varna",
      "Vashya",
      "Tara",
      "Yoni",
      "Graha Maitri",
      "Gana",
      "Bhakoot",
      "Nadi",
    ]);
    expect(result.manglikStatus.isBoyManglik).toBe(false);
    expect(result.nadiDosha).toBe(false);
    expect(result.verdictEn).toBeTruthy();
    expect(result.verdictHi).toBeTruthy();
  });

  it("DemoAstroProvider calculates Panchang with authentic tithi, nakshatra, and muhurats", async () => {
    const provider = new DemoAstroProvider();
    const result = await provider.calculatePanchang({
      date: "2026-10-24",
      city: "Varanasi",
    });

    expect(result.isDemo).toBe(true);
    expect(result.date).toBe("2026-10-24");
    expect(result.tithi).toBeTruthy();
    expect(result.nakshatra).toBeTruthy();
    expect(result.vaar).toBeTruthy();
    expect(result.abhijitMuhurat).toBeTruthy();
    expect(result.rahuKaal).toBeTruthy();
  });

  it("AstroSageProvider throws clear error when unconfigured in production", () => {
    delete process.env.ASTROSAGE_API_KEY;
    delete process.env.ASTROSAGE_USER_ID;

    expect(() => new AstroSageProvider()).toThrow(/not configured/i);
  });

  it("DemoAstroProvider throws loudly at startup if NODE_ENV=production and DEMO_MODE != true", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.DEMO_MODE;

    expect(() => new DemoAstroProvider()).toThrow(/cannot be initialized in production/i);
  });

  it("getAstroProvider factory resolves DemoAstroProvider in demo mode", () => {
    process.env.DEMO_MODE = "true";
    delete process.env.ASTROSAGE_API_KEY;

    const provider = getAstroProvider();
    expect(provider.name).toBe("DemoAstroProvider");
  });
});
