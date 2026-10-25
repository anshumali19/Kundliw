import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import {
  getAllTranslationsWithOverrides,
  saveTranslationOverride,
  deleteTranslationOverride,
} from "@/lib/i18n/translationService";
import { z } from "zod";

const saveOverrideSchema = z.object({
  locale: z.enum(["hi", "en"]),
  namespace: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
});

const deleteOverrideSchema = z.object({
  locale: z.enum(["hi", "en"]),
  namespace: z.string().min(1),
  key: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "hi";
  const namespace = searchParams.get("namespace");
  const search = searchParams.get("search")?.toLowerCase().trim();
  const filter = searchParams.get("filter"); // "all" | "overridden" | "default"

  try {
    let items = await getAllTranslationsWithOverrides(locale);

    if (namespace && namespace !== "all") {
      items = items.filter((item) => item.namespace === namespace);
    }

    if (filter === "overridden") {
      items = items.filter((item) => item.isOverridden);
    } else if (filter === "default") {
      items = items.filter((item) => !item.isOverridden);
    }

    if (search) {
      items = items.filter(
        (item) =>
          item.fullKey.toLowerCase().includes(search) ||
          item.defaultValue.toLowerCase().includes(search) ||
          item.currentValue.toLowerCase().includes(search)
      );
    }

    // Extract unique namespaces for filter tabs
    const allNamespaces = Array.from(new Set(items.map((i) => i.namespace))).sort();

    return NextResponse.json({
      locale,
      total: items.length,
      namespaces: allNamespaces,
      translations: items,
    });
  } catch (error) {
    console.error("[API Translations GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve translations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    const body = await req.json();
    const parsed = saveOverrideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveTranslationOverride(parsed.data);
    return NextResponse.json({ success: true, override: saved });
  } catch (error) {
    console.error("[API Translations POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save translation override" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    const body = await req.json();
    const parsed = deleteOverrideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await deleteTranslationOverride(parsed.data);
    return NextResponse.json({ success: true, message: "Translation reset to default" });
  } catch (error) {
    console.error("[API Translations DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset translation override" },
      { status: 500 }
    );
  }
}
