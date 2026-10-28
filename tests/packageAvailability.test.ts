import { describe, it, expect } from "vitest";
import { computeAvailability, todayInIndia } from "../src/lib/booking/packageAvailability";

const now = new Date("2026-11-10T06:00:00Z"); // 11:30 in India, 10 November 2026
const day = (s: string) => new Date(`${s}T00:00:00Z`);

describe("package availability", () => {
  it("is open with no limits", () => {
    expect(computeAvailability({}, 5, now)).toEqual({ status: "open", seatsLeft: null });
  });

  it("counts seats left and closes when full", () => {
    expect(computeAvailability({ seats: 10 }, 7, now)).toEqual({ status: "open", seatsLeft: 3 });
    expect(computeAvailability({ seats: 10 }, 10, now)).toMatchObject({ status: "full", seatsLeft: 0, reason: "full" });
    expect(computeAvailability({ seats: 10 }, 14, now).seatsLeft).toBe(0);
  });

  it("stays open on the start day itself, closes the day after", () => {
    expect(computeAvailability({ startDate: day("2026-11-10") }, 0, now).status).toBe("open");
    expect(computeAvailability({ startDate: day("2026-11-09") }, 0, now)).toMatchObject({ status: "closed", reason: "started" });
    expect(computeAvailability({ startDate: day("2026-11-20") }, 0, now).status).toBe("open");
  });

  it("closes after the end date", () => {
    expect(computeAvailability({ endDate: day("2026-11-09") }, 0, now)).toMatchObject({ status: "closed", reason: "ended" });
    expect(computeAvailability({ endDate: day("2026-11-10") }, 0, now).status).toBe("open");
  });

  it("uses the Indian date, not the UTC date", () => {
    expect(todayInIndia(new Date("2026-11-09T20:00:00Z"))).toBe("2026-11-10");
  });
});
