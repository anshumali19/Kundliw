import * as fs from "fs";
import * as path from "path";
import { assertPlaceholderAllowed, isDemoMode } from "@/lib/config/demo";

export interface StoredFileResult {
  storageKey: string;
  publicUrl?: string;
  fileSize: number;
  mimeType: string;
}

export interface StorageProvider {
  name: string;
  saveFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    subfolder?: string
  ): Promise<StoredFileResult>;
  getFile(storageKey: string): Promise<{ buffer: Buffer; mimeType: string }>;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB strict limit

export const ALLOWED_STORAGE_SUBFOLDERS = ["uploads", "media", "payment-proofs", "vault"] as const;

function assertAllowedSubfolder(subfolder: string): void {
  if (!(ALLOWED_STORAGE_SUBFOLDERS as readonly string[]).includes(subfolder)) {
    throw new Error(
      `Invalid storage subfolder "${subfolder}". Allowed: ${ALLOWED_STORAGE_SUBFOLDERS.join(", ")}.`
    );
  }
}

/**
 * Resolves a path relative to the storage base and asserts the result stays
 * inside it. Rejects absolute paths, `..` segments and Windows/Unix variants.
 */
function resolveWithinBase(baseDir: string, relativePath: string): string {
  const base = path.resolve(baseDir);
  const target = path.resolve(base, relativePath);
  const relative = path.relative(base, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid storage path: traversal outside the storage directory is forbidden.");
  }

  return target;
}

/**
 * Validates file magic bytes against accepted types (PDF, PNG, JPEG, WEBP).
 */
export function validateFileMagicBytes(buffer: Buffer): { isValid: boolean; detectedMime: string | null } {
  if (buffer.length < 4) {
    return { isValid: false, detectedMime: null };
  }

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { isValid: true, detectedMime: "application/pdf" };
  }

  // PNG: 0x89 0x50 0x4E 0x47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { isValid: true, detectedMime: "image/png" };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedMime: "image/jpeg" };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { isValid: true, detectedMime: "image/webp" };
  }

  return { isValid: false, detectedMime: null };
}

/**
 * Local Disk implementation for development and client demo MVP.
 */
export class LocalDiskStorageProvider implements StorageProvider {
  name = "LocalDiskStorageProvider";
  private baseDir: string;

  constructor(baseDir?: string) {
    assertPlaceholderAllowed("LocalDiskStorageProvider");
    this.baseDir = baseDir || path.join(process.cwd(), "storage");
  }

  async saveFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    subfolder = "uploads"
  ): Promise<StoredFileResult> {
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size (${fileBuffer.length} bytes) exceeds 10MB limit.`);
    }

    const { isValid, detectedMime } = validateFileMagicBytes(fileBuffer);
    if (!isValid) {
      throw new Error("Invalid file content: signature does not match allowed types (PDF, PNG, JPEG, WEBP).");
    }

    const safeName = path.basename(originalFilename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeName}`;
    assertAllowedSubfolder(subfolder);
    const targetDir = resolveWithinBase(this.baseDir, subfolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, uniqueName);
    fs.writeFileSync(filePath, fileBuffer);

    const relativeKey = path.join(subfolder, uniqueName).replace(/\\/g, "/");
    return {
      storageKey: relativeKey,
      publicUrl: `/api/storage/${relativeKey}`,
      fileSize: fileBuffer.length,
      mimeType: detectedMime || mimeType,
    };
  }

  async getFile(storageKey: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const fullPath = resolveWithinBase(this.baseDir, storageKey);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${storageKey}`);
    }

    const buffer = fs.readFileSync(fullPath);
    const { detectedMime } = validateFileMagicBytes(buffer);

    return {
      buffer,
      mimeType: detectedMime || "application/octet-stream",
    };
  }
}

/**
 * Production AWS S3 Storage Provider stub.
 * Fails loudly when production S3 bucket is not configured.
 */
export class S3StorageProvider implements StorageProvider {
  name = "S3StorageProvider";
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || "";
    this.region = process.env.AWS_REGION || "ap-south-1";

    if (!this.bucket) {
      throw new Error(
        "CRITICAL STORAGE CONFIGURATION ERROR: AWS_S3_BUCKET is not set in environment variables."
      );
    }
  }

  async saveFile(): Promise<StoredFileResult> {
    throw new Error("S3StorageProvider requires AWS SDK installation and S3 credentials.");
  }

  async getFile(): Promise<{ buffer: Buffer; mimeType: string }> {
    throw new Error("S3StorageProvider requires AWS SDK installation and S3 credentials.");
  }
}

/**
 * Factory for storage provider.
 */
export function getStorageProvider(): StorageProvider {
  if (process.env.NODE_ENV === "production" && !isDemoMode()) {
    return new S3StorageProvider();
  }
  return new LocalDiskStorageProvider();
}
