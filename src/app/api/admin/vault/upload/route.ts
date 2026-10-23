import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getStorageProvider, validateFileMagicBytes, MAX_FILE_SIZE_BYTES } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (guard.errorResponse) return guard.errorResponse;
    const admin = guard.user;

    const formData = await request.formData();
    const userId = String(formData.get("userId") || "");
    const orderId = formData.get("orderId") ? String(formData.get("orderId")) : null;
    const titleEn = String(formData.get("titleEn") || "").trim();
    const titleHi = String(formData.get("titleHi") || "").trim();
    const file = formData.get("file") as File | null;

    if (!userId || !titleEn || !titleHi || !file) {
      return NextResponse.json(
        { error: "User, bilingual titles (EN & HI), and a PDF file are required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the strict 10 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB).` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { isValid, detectedMime } = validateFileMagicBytes(buffer);

    if (!isValid || detectedMime !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file signature: only authentic PDF documents (%PDF-) are accepted." },
        { status: 400 }
      );
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Selected user does not exist." }, { status: 404 });
    }

    // Save to private vault storage
    const storage = getStorageProvider();
    const stored = await storage.saveFile(buffer, file.name, "application/pdf", "vault");

    const vaultFile = await prisma.$transaction(async (tx) => {
      const record = await tx.vaultFile.create({
        data: {
          userId,
          orderId: orderId || null,
          titleEn,
          titleHi,
          fileName: file.name,
          storageKey: stored.storageKey,
          fileSize: buffer.length,
          mimeType: "application/pdf",
        },
      });

      if (orderId) {
        await tx.orderStatusEvent.create({
          data: {
            orderId,
            status: "KUNDLI_COMPLETE",
            note: `Kundli PDF dossier "${titleEn}" uploaded to customer vault.`,
            changedById: admin.id,
          },
        });
      }

      return record;
    });

    return NextResponse.json({
      success: true,
      vaultFile,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to upload vault file";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
