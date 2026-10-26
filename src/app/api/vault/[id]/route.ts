import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getStorageProvider } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const fileId = params.id;
    const vaultFile = await prisma.vaultFile.findUnique({
      where: { id: fileId },
    });

    if (!vaultFile) {
      return NextResponse.json({ error: "Vault document not found" }, { status: 404 });
    }

    // Strict ownership verification: only owner or ADMIN
    const isOwner = vaultFile.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Access denied to this vault document" }, { status: 403 });
    }

    const storage = getStorageProvider();
    const { buffer, mimeType } = await storage.getFile(vaultFile.storageKey);

    // Only types a browser can show safely are opened inline; Word, Excel and the rest download.
    const type = mimeType || vaultFile.mimeType || "application/octet-stream";
    const showInline =
      type === "application/pdf" ||
      (type.startsWith("image/") && type !== "image/svg+xml") ||
      type.startsWith("video/") ||
      type.startsWith("audio/") ||
      type === "text/plain";
    const asDownload = new URL(request.url).searchParams.get("download") === "1";
    const safeName = vaultFile.fileName.replace(/[^\w.\- ]+/g, "_");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "Content-Disposition": `${showInline && !asDownload ? "inline" : "attachment"}; filename="${safeName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error retrieving vault document:", error);
    return NextResponse.json({ error: "Error retrieving vault document" }, { status: 500 });
  }
}
