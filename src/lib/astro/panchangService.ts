import { prisma } from "@/lib/prisma";
import { computePanchang } from "./ephemeris";
import { PanchangResult } from "./types";
import { Prisma } from "@prisma/client";

export async function getDailyPanchang(
  dateString?: string,
  city = "Varanasi"
): Promise<PanchangResult | null> {
  const normalizedCity = (city || "Varanasi").toLowerCase().trim();
  const effectiveDate =
    dateString ||
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  try {
    // 1. Try reading from database cache to avoid redundant calls
    let cached = null;
    try {
      cached = await prisma.panchangCache.findUnique({
        where: {
          dateString_city: {
            dateString: effectiveDate,
            city: normalizedCity,
          },
        },
      });
    } catch {
      // DB cache read failed (e.g. in offline unit test or DB restart); proceed to calculate
    }

    // Older cached sample (demo) entries are ignored and replaced by the real calculation.
    if (cached && cached.dataJson && (cached.dataJson as { isDemo?: boolean }).isDemo !== true) {
      return cached.dataJson as unknown as PanchangResult;
    }

    // 2. Calculate from the Sun and Moon positions (no outside service needed)
    const result = computePanchang(effectiveDate);

    // 3. Try saving result in database cache
    try {
      await prisma.panchangCache.upsert({
        where: {
          dateString_city: {
            dateString: effectiveDate,
            city: normalizedCity,
          },
        },
        create: {
          dateString: effectiveDate,
          city: normalizedCity,
          dataJson: result as unknown as Prisma.InputJsonValue,
        },
        update: {
          dataJson: result as unknown as Prisma.InputJsonValue,
        },
      });
    } catch {
      // DB cache write failed; still return the computed result
    }

    return result;
  } catch (error) {
    // If provider fails or is unconfigured, do not crash; return null for neutral fallback
    console.warn(
      `[PanchangService] Warning: Panchang calculation unavailable for ${effectiveDate} (${normalizedCity}):`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}
