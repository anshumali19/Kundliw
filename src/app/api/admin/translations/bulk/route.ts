import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { bulkSaveTranslationOverrides } from "@/lib/i18n/translationService";
import { z } from "zod";

const bulkSchema = z.object({
  overrides: z.array(
    z.object({
      locale: z.enum(["hi", "en"]),
      namespace: z.string().min(1),
      key: z.string().min(1),
      value: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await bulkSaveTranslationOverrides(parsed.data.overrides);
    return NextResponse.json({ success: true, count: saved.length });
  } catch (error) {
    console.error("[API Translations Bulk POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to bulk update translations" },
      { status: 500 }
    );
  }
}
