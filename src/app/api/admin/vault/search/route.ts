import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { VAULT_SEARCH_FIELDS, VaultSearchField, searchVault } from "@/lib/vault/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const q = (request.nextUrl.searchParams.get("q") || "").slice(0, 120);
  const raw = request.nextUrl.searchParams.get("field") || "all";
  const field = (VAULT_SEARCH_FIELDS as readonly string[]).includes(raw) ? (raw as VaultSearchField) : "all";
  try {
    return NextResponse.json({ success: true, ...(await searchVault(q, field)) });
  } catch (error) {
    console.error("[API Admin Vault Search]", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
