import { describe, expect, it } from "vitest";
import { datesInRange, slotBatchSchema, windowToSlots } from "@/lib/booking/slots";

describe("appointment slot generation", () => {
  it("splits a window into back-to-back slots", () => {
    expect(windowToSlots("11:00", "12:30", 30)).toEqual([
      { startTime: "11:00", endTime: "11:30" },
      { startTime: "11:30", endTime: "12:00" },
      { startTime: "12:00", endTime: "12:30" },
    ]);
  });

  it("drops a last slot that would run past the end", () => {
    expect(windowToSlots("11:00", "12:00", 45)).toHaveLength(1);
    expect(windowToSlots("11:00", "11:20", 30)).toHaveLength(0);
  });

  it("lists only the chosen weekdays in a range", () => {
    // 2026-10-26 is a Monday; Monday and Wednesday over one week
    const days = datesInRange("2026-10-26", "2026-11-01", [1, 3]).map((d) => d.toISOString().slice(0, 10));
    expect(days).toEqual(["2026-10-26", "2026-10-28"]);
  });

  it("validates the batch form", () => {
    const base = { fromDate: "2026-10-26", toDate: "2026-10-30", weekdays: [1], startTime: "11:00", endTime: "13:00", durationMinutes: 30, capacity: 1 };
    expect(slotBatchSchema.safeParse(base).success).toBe(true);
    expect(slotBatchSchema.safeParse({ ...base, toDate: "2026-10-01" }).success).toBe(false);
    expect(slotBatchSchema.safeParse({ ...base, endTime: "10:00" }).success).toBe(false);
    expect(slotBatchSchema.safeParse({ ...base, weekdays: [] }).success).toBe(false);
    expect(slotBatchSchema.safeParse({ ...base, durationMinutes: 5 }).success).toBe(false);
  });
});
