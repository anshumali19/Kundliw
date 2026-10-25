import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getStorageProvider, validateFileMagicBytes, MAX_FILE_SIZE_BYTES } from "@/lib/storage";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { OrderStatus } from "@prisma/client";
import {
  isValidStatusTransition,
  type CanonicalOrderStatus,
} from "@/lib/orders/status";

export const dynamic = "force-dynamic";

class VaultUploadError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "VaultUploadError";
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;
    const admin = guard.user;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

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

    // An attached order must belong to the selected customer, and the document
    // upload is a completion action that must follow the order lifecycle.
    if (orderId) {
      const targetOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, userId: true, status: true },
      });

      if (!targetOrder) {
        return NextResponse.json({ error: "Selected order does not exist." }, { status: 404 });
      }

      if (targetOrder.userId !== userId) {
        return NextResponse.json(
          { error: "Selected order does not belong to this customer." },
          { status: 403 }
        );
      }

      if (
        !isValidStatusTransition(
          targetOrder.status as CanonicalOrderStatus,
          "KUNDLI_COMPLETE",
          true
        )
      ) {
        return NextResponse.json(
          {
            error:
              "This order cannot be marked complete from its current status. Move it to KUNDLI_IN_PROGRESS first.",
          },
          { status: 409 }
        );
      }
    }

    // Save to private vault storage
    const storage = getStorageProvider();
    const stored = await storage.saveFile(buffer, file.name, "application/pdf", "vault");

    const vaultFile = await prisma.$transaction(async (tx) => {
      if (orderId) {
        // Re-check inside the transaction so ownership and lifecycle cannot
        // change between authorization and the status write.
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: { id: true, userId: true, status: true },
        });

        if (!order) {
          throw new VaultUploadError("Selected order does not exist.", 404);
        }

        if (order.userId !== userId) {
          throw new VaultUploadError(
            "Selected order does not belong to this customer.",
            403
          );
        }

        if (
          !isValidStatusTransition(
            order.status as CanonicalOrderStatus,
            "KUNDLI_COMPLETE",
            true
          )
        ) {
          throw new VaultUploadError(
            "This order cannot be marked complete from its current status.",
            409
          );
        }

        if (order.status !== OrderStatus.KUNDLI_COMPLETE) {
          await tx.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.KUNDLI_COMPLETE },
          });
        }

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            status: OrderStatus.KUNDLI_COMPLETE,
            note: `Kundli PDF dossier "${titleEn}" uploaded to customer vault.`,
            changedById: admin.id,
          },
        });
      }

      return tx.vaultFile.create({
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
    });

    return NextResponse.json({
      success: true,
      vaultFile,
    });
  } catch (error) {
    if (error instanceof VaultUploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Vault upload failed:", error);
    return NextResponse.json({ error: "Failed to upload vault file" }, { status: 500 });
  }
}
