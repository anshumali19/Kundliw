import { NextRequest, NextResponse } from "next/server";
import { getDailyPanchang } from "@/lib/astro/panchangService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const city = searchParams.get("city") || "Varanasi";

    const panchang = await getDailyPanchang(date, city);
    if (!panchang) {
      return NextResponse.json(
        { error: "Panchang ephemeris calculation currently unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, panchang });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Panchang request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
