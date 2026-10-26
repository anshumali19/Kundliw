import { z } from "zod";

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const slotBatchSchema = z
  .object({
    fromDate: z.string().regex(DAY, "Start date must be YYYY-MM-DD"),
    toDate: z.string().regex(DAY, "End date must be YYYY-MM-DD"),
    /** 0 = Sunday ... 6 = Saturday. */
    weekdays: z.array(z.number().int().min(0).max(6)).min(1, "Choose at least one weekday").max(7),
    startTime: z.string().regex(TIME, "Start time must be HH:mm"),
    endTime: z.string().regex(TIME, "End time must be HH:mm"),
    durationMinutes: z.coerce.number().int().min(10).max(240),
    capacity: z.coerce.number().int().min(1).max(20).default(1),
  })
  .refine((v) => v.fromDate <= v.toDate, { message: "End date must not be before start date", path: ["toDate"] })
  .refine((v) => v.startTime < v.endTime, { message: "End time must be after start time", path: ["endTime"] });

export const slotUpdateSchema = z.object({
  capacity: z.coerce.number().int().min(1).max(20).optional(),
  isActive: z.boolean().optional(),
});

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Splits a daily window into back-to-back slots, e.g. 11:00-13:00 by 30 minutes gives four slots. */
export function windowToSlots(startTime: string, endTime: string, durationMinutes: number) {
  const out: Array<{ startTime: string; endTime: string }> = [];
  for (let m = toMinutes(startTime); m + durationMinutes <= toMinutes(endTime); m += durationMinutes) {
    out.push({ startTime: toTime(m), endTime: toTime(m + durationMinutes) });
  }
  return out;
}

/** All dates (UTC midnight) between two YYYY-MM-DD days that fall on the chosen weekdays. */
export function datesInRange(fromDate: string, toDate: string, weekdays: number[]) {
  const out: Date[] = [];
  const start = new Date(`${fromDate}T00:00:00.000Z`);
  const end = new Date(`${toDate}T00:00:00.000Z`);
  for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
    if (weekdays.includes(d.getUTCDay())) out.push(d);
  }
  return out;
}

export const MAX_SLOTS_PER_BATCH = 400;
