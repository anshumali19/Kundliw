import { NextRequest, NextResponse } from "next/server";
import { getAstroProvider } from "@/lib/astro/factory";
import { z } from "zod";

export const dynamic = "force-dynamic";

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
