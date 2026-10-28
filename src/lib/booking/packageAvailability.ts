import { prisma } from "@/lib/prisma";

export type PackageStatus = "open" | "full" | "closed";

export interface PackageAvailability {
  status: PackageStatus;
  /** Seats still free, or null when the package has no limit. */
  seatsLeft: number | null;
  /** Why it is not open: all seats taken, the programme has started, or it has ended. */
  reason?: "full" | "started" | "ended";
}

/** Today's date in India (IST) as YYYY-MM-DD, so "today" matches the Kendra's calendar. */
export function todayInIndia(now: Date = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * How a package can be booked:
 *  - once it has ended, or its start date has passed, it is closed;
 *  - when it has a seat limit and every seat is taken (paid, awaiting verification or being paid), it is full;
 *  - otherwise it is open.
 * Orders that failed, expired or were refunded do not hold a seat.
 */
export function computeAvailability(
  pkg: { seats?: number | null; startDate?: Date | null; endDate?: Date | null },
  booked: number,
  now: Date = new Date()
): PackageAvailability {
  const today = todayInIndia(now);
  const seatsLeft = pkg.seats == null ? null : Math.max(0, pkg.seats - booked);
  if (pkg.endDate && pkg.endDate.toISOString().slice(0, 10) < today) return { status: "closed", seatsLeft, reason: "ended" };
  if (pkg.startDate && pkg.startDate.toISOString().slice(0, 10) < today) return { status: "closed", seatsLeft, reason: "started" };
  if (seatsLeft === 0) return { status: "full", seatsLeft, reason: "full" };
  return { status: "open", seatsLeft };
}

/** Orders that hold a seat in each package (by package id). */
export async function bookedSeatsByPackage(packageIds: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  await Promise.all(
    packageIds.map(async (id) => {
      out[id] = await prisma.order.count({
        where: { plan: { packageId: id }, paymentStatus: { notIn: ["FAILED", "REFUNDED"] } },
      });
    })
  );
  return out;
}

export function availabilityMessage(a: PackageAvailability, hi: boolean): string {
  if (a.reason === "full") return hi ? "सभी स्थान भर चुके हैं" : "Fully booked";
  if (a.reason === "started") return hi ? "बुकिंग बंद (आरंभ हो चुका)" : "Booking closed (already started)";
  if (a.reason === "ended") return hi ? "समाप्त" : "Ended";
  if (a.seatsLeft != null) return hi ? `${a.seatsLeft} स्थान शेष` : `${a.seatsLeft} seat${a.seatsLeft === 1 ? "" : "s"} left`;
  return "";
}
