import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { getStorageProvider, validateFileMagicBytes, MAX_FILE_SIZE_BYTES } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardApiAdmin();
    if (!guard.ok) return guard.errorResponse;

    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateFileMagicBytes(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, PNG, JPEG, and WEBP files are accepted." },
        { status: 400 }
      );
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
    const msg = error instanceof Error ? error.message : "Media upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
