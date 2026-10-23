import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDailyPanchang } from "@/lib/astro/panchangService";
import { prisma } from "@/lib/prisma";

describe("Phase 11 - Panchang Subsystem & Database Caching", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DEMO_MODE: "true", NODE_ENV: "development" };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("calculates Panchang with sample demo data carrying isDemo flag", async () => {
    vi.spyOn(prisma.panchangCache, "findUnique").mockResolvedValue(null as any);
    vi.spyOn(prisma.panchangCache, "upsert").mockResolvedValue({} as any);

    const panchang = await getDailyPanchang("2026-10-24", "Varanasi");
    expect(panchang).not.toBeNull();
    expect(panchang?.isDemo).toBe(true);
    expect(panchang?.date).toBe("2026-10-24");
    expect(panchang?.tithi).toBeTruthy();
    expect(panchang?.nakshatra).toBeTruthy();
    expect(panchang?.vaar).toBeTruthy();
    expect(panchang?.abhijitMuhurat).toBeTruthy();
    expect(panchang?.rahuKaal).toBeTruthy();
  });

  it("caches Panchang calculation in the database to prevent duplicate provider calls", async () => {
    const testDate = "2026-11-15";
    const testCity = "Varanasi";

    const cachedSample = {
      isDemo: true,
      date: testDate,
      samvat: "Vikram Samvat 2083",
      tithi: "Shukla Dashami",
      tithiEndTime: "04:30 PM",
      paksha: "Shukla",
      nakshatra: "Rohini",
      yoga: "Harshana",
      karana: "Gara",
      vaar: "Somvar",
      abhijitMuhurat: "11:45 AM - 12:35 PM",
      rahuKaal: "07:30 AM - 09:00 AM",
      sunrise: "06:10 AM",
      sunset: "05:35 PM",
    };

    // First call: cache miss, upsert called
    vi.spyOn(prisma.panchangCache, "findUnique").mockResolvedValueOnce(null as any);
    const upsertSpy = vi.spyOn(prisma.panchangCache, "upsert").mockResolvedValue({} as any);

    const result1 = await getDailyPanchang(testDate, testCity);
    expect(result1).not.toBeNull();
    expect(upsertSpy).toHaveBeenCalledTimes(1);

    // Second call: cache hit returns cached JSON
    vi.spyOn(prisma.panchangCache, "findUnique").mockResolvedValueOnce({
      id: "cache_1",
      dateString: testDate,
      city: testCity.toLowerCase(),
      dataJson: cachedSample,
      cachedAt: new Date(),
    } as any);

    const result2 = await getDailyPanchang(testDate, testCity);
    expect(result2).toEqual(cachedSample);
  });

  it("returns null gracefully when provider is unconfigured in production, without crashing", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.DEMO_MODE;
    delete process.env.ASTROSAGE_API_KEY;

    vi.spyOn(prisma.panchangCache, "findUnique").mockResolvedValue(null as any);

    // Must not throw, but return null
    const result = await getDailyPanchang("2099-01-01", "NonExistentCity");
    expect(result).toBeNull();
  });
});
