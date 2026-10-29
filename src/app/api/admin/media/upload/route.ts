import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import {
  getStorageProvider,
  validateFileMagicBytes,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_STORAGE_SUBFOLDERS,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    // Admin screens label uploads by feature (banners, gallery, ...). Storage only allows a fixed
    // set of folders, so anything else is stored under "media" rather than failing the upload.
    const requestedFolder = (formData.get("subfolder") as string) || "media";
    const subfolder = (ALLOWED_STORAGE_SUBFOLDERS as readonly string[]).includes(requestedFolder) &&
      requestedFolder !== "vault" &&
      requestedFolder !== "payment-proofs"
      ? requestedFolder
      : "media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);

    const validation = validateFileMagicBytes(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, PNG, JPEG, and WEBP files are accepted." },
        { status: 400 }
      );
    }

    // Photos are shrunk before they are stored (at most 2000 px on the long side, tuned quality), so pages load fast.
    // The result is only used when it is really smaller; anything that cannot be read as an image is kept as it was.
    const mime = validation.detectedMime || file.type;
    if (/^image\/(jpeg|png|webp)$/.test(mime || "")) {
      try {
        const base = sharp(buffer, { failOn: "none" }).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true });
        const shrunk =
          mime === "image/jpeg"
            ? await base.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
            : mime === "image/webp"
              ? await base.webp({ quality: 82 }).toBuffer()
              : await base.png({ compressionLevel: 9, palette: true }).toBuffer();
        if (shrunk.length < buffer.length) buffer = shrunk;
      } catch (error) {
        console.error("Image compression skipped:", error);
      }
    }

    const storage = getStorageProvider();
    const result = await storage.saveFile(
      buffer,
      file.name,
      validation.detectedMime || file.type,
      subfolder
    );

    return NextResponse.json({
      success: true,
      url: result.publicUrl,
      storageKey: result.storageKey,
      mimeType: result.mimeType,
      fileSize: result.fileSize,
    });
  } catch (error) {
    console.error("Media upload failed:", error);
    return NextResponse.json({ error: "Media upload failed" }, { status: 500 });
  }
}
