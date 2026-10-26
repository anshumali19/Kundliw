import { NextRequest, NextResponse } from "next/server";
import { guardApiUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { checkDbRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { detectDocumentType, MAX_DOCUMENT_UPLOAD_BYTES } from "@/lib/storage/fileTypes";

export const dynamic = "force-dynamic";

/**
 * A signed-in customer, associate or administrator uploads their own file (for example a Kundli)
 * into their private vault. Only that person and administrators can open it again.
 */
export async function POST(request: NextRequest) {
  const guard = await guardApiUser();
  if (!guard.ok) return guard.errorResponse;
  const user = guard.user;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const limit = await checkDbRateLimit({
    scope: "VAULT_USER_UPLOAD",
    identifier: user.id,
    windowSeconds: 3600,
    maxAllowed: 20,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const title = String(form.get("title") || "").trim().slice(0, 160);
    if (!file) return NextResponse.json({ error: "Please choose a file." }, { status: 400 });

    if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). The limit is 4 MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectDocumentType(buffer, file.name);
    if (!detected.ok || !detected.mime) {
      return NextResponse.json(
        {
          error:
            "This file type is not accepted. Use PDF, an image, video, audio, Word, Excel, PowerPoint, RTF or a text file.",
        },
        { status: 400 }
      );
    }

    const stored = await getStorageProvider().saveFile(buffer, file.name, detected.mime, "vault");
    const displayTitle = title || file.name.replace(/\.[^.]+$/, "");

    const vaultFile = await prisma.vaultFile.create({
      data: {
        userId: user.id,
        titleEn: displayTitle,
        titleHi: displayTitle,
        fileName: file.name.slice(0, 200),
        storageKey: stored.storageKey,
        fileSize: buffer.length,
        mimeType: detected.mime,
        uploadedByRole: user.role,
      },
      select: { id: true, titleEn: true, fileName: true, fileSize: true, mimeType: true, uploadedAt: true },
    });

    return NextResponse.json({ success: true, vaultFile }, { status: 201 });
  } catch (error) {
    console.error("[API Vault Upload] Error:", error);
    return NextResponse.json({ error: "Failed to upload the file." }, { status: 500 });
  }
}
