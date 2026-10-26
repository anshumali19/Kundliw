import { NextRequest, NextResponse } from "next/server";
import { getDailyPanchang } from "@/lib/astro/panchangService";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";

export async function GET(request: NextRequest) {
  try {
    const limit = await checkDbRateLimit({
      scope: "ASTRO_PANCHANG_IP",
      identifier: getClientIp(request.headers),
      windowSeconds: 60,
      maxAllowed: 60,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const city = searchParams.get("city") || undefined;

    const panchang = await getDailyPanchang(date, city);
    if (!panchang) {
      return NextResponse.json(
        { error: "Panchang ephemeris calculation currently unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, panchang });
  } catch (error) {
    console.error("Panchang request failed:", error);
    return NextResponse.json({ error: "Panchang request failed" }, { status: 500 });
  }
}
