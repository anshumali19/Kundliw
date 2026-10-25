import { NextRequest, NextResponse } from "next/server";
import { getAstroProvider } from "@/lib/astro/factory";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";

const kundliSchema = z.object({
  name: z.string().min(2),
  gender: z.string().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tob: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  pob: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const limit = await checkDbRateLimit({
      scope: "ASTRO_KUNDLI_IP",
      identifier: getClientIp(request.headers),
      windowSeconds: 60,
      maxAllowed: 20,
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

    const body = await request.json();
    const parsed = kundliSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid birth parameters" }, { status: 400 });
    }

    const provider = getAstroProvider();
    const result = await provider.calculateKundli(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Calculation failed:", error);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
