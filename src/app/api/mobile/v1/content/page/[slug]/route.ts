import { NextRequest, NextResponse } from "next/server";
import { getCustomPage } from "@/lib/mobile/content";

export const dynamic = "force-dynamic";

/** One custom page made in Admin > Pages (words and blocks, in both languages). Public. */
export async function GET(_request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const page = await getCustomPage(slug);
  if (!page) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(page, { headers: { "Cache-Control": "no-store" } });
}
