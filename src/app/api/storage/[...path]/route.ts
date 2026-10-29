import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  try {
    const storageKey = params.path.join("/");

    // Strict access guard on private files (payment proofs and customer vault):
    // Only accessible by administrators or the customer who owns the document
    if (storageKey.startsWith("payment-proofs/") || storageKey.startsWith("vault/")) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      const isAdmin = user.role === Role.ADMIN;
      if (!isAdmin) {
        if (storageKey.startsWith("payment-proofs/")) {
          const order = await prisma.order.findFirst({
            where: {
              userId: user.id,
              manualPaymentProof: {
                in: [storageKey, `/api/storage/${storageKey}`],
              },
            },
          });

          if (!order) {
            return NextResponse.json(
              { error: "Forbidden: Access to this payment proof is restricted to the order owner." },
              { status: 403 }
            );
          }
        } else if (storageKey.startsWith("vault/")) {
          const vaultFile = await prisma.vaultFile.findFirst({
            where: {
              userId: user.id,
              storageKey,
            },
          });

          if (!vaultFile) {
            return NextResponse.json(
              { error: "Forbidden: Access to this vault document is restricted to the document owner." },
              { status: 403 }
            );
          }
        }
      }
    }

    const storage = getStorageProvider();
    const { buffer: original, mimeType } = await storage.getFile(storageKey);
    let buffer = original;

    // Public pictures can be asked for at a smaller size (?w=160): a 330 KB logo becomes a few KB.
    // Private files (payment proofs, vault) are never resized or cached publicly.
    const isPrivate = storageKey.startsWith("payment-proofs/") || storageKey.startsWith("vault/");
    const wanted = Number(request.nextUrl.searchParams.get("w"));
    if (!isPrivate && wanted > 0 && /^image\/(jpeg|png|webp)$/.test(mimeType)) {
      const width = [96, 160, 320, 640, 1024, 1600].find((w) => w >= wanted) ?? 1600;
      try {
        const sharp = (await import("sharp")).default;
        buffer = await sharp(original).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "image/webp",
            "Content-Length": buffer.length.toString(),
            "X-Content-Type-Options": "nosniff",
            // File names carry a timestamp, so a changed picture always has a new address
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        buffer = original; // resizing failed: send the original picture
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": storageKey.startsWith("payment-proofs/") ? "private, max-age=3600" : "public, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
  }
}
