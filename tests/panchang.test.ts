import { describe, expect, it } from "vitest";
import { computePanchang } from "@/lib/astro/ephemeris";

describe("panchang calculation", () => {
  it("finds Sharad Purnima on 26 Oct 2026 at sunrise", () => {
    const p = computePanchang("2026-10-26");
    expect(p.isDemo).toBe(false);
    expect(p.tithi).toContain("Purnima");
    expect(p.paksha).toContain("Shukla");
    expect(p.vaar).toContain("Somvar");
  });

  it("ends the Chaitra amavasya on 19 Mar 2026 around 6:54 am and keeps the old Samvat before it", () => {
    const p = computePanchang("2026-03-19");
    expect(p.tithi).toContain("Amavasya");
    expect(p.tithiEndTime).toMatch(/^06:(5\d|4\d) AM$/);
    expect(p.samvat).toContain("2082");
  });

  it("starts Samvat 2083 later in the year", () => {
    expect(computePanchang("2026-10-26").samvat).toContain("2083");
  });

  it("gives sensible sunrise for Varanasi", () => {
    expect(computePanchang("2026-06-21").sunrise).toMatch(/^05:/);
    expect(computePanchang("2026-12-21").sunrise).toMatch(/^06:/);
  });
});

describe("panchang one-line bar data", () => {
  it("names the lunar month, paksha and samvat", () => {
    const p = computePanchang("2026-10-26");
    expect(p.parts?.masaEn).toBe("Ashwin");
    expect(p.parts?.pakshaHi).toBe("शुक्ल पक्ष");
    expect(p.parts?.samvat).toBe(2083);
  });
});
