import { NextRequest, NextResponse } from "next/server";
import { getAstroProvider } from "@/lib/astro/factory";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";

const personSchema = z.object({
  name: z.string().min(2),
  gender: z.string().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tob: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  pob: z.string().min(2),
});

const matchingSchema = z.object({
  boy: personSchema,
  girl: personSchema,
});

export async function POST(request: NextRequest) {
  try {
    const limit = await checkDbRateLimit({
      scope: "ASTRO_MATCHING_IP",
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
    const parsed = matchingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid matching parameters" }, { status: 400 });
    }

    const provider = getAstroProvider();
    const result = await provider.calculateMatching(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Calculation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
