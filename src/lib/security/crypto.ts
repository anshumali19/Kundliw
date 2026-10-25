import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Checks whether the master credentials encryption key is configured.
 */
export function hasMasterEncryptionKey(): boolean {
  return !!(process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.ENCRYPTION_SECRET);
}

/**
 * Derives a 32-byte key deterministically from application secrets.
 * In production, fails closed if CREDENTIALS_ENCRYPTION_KEY is not configured.
 */
function getDerivedKey(): Buffer {
  const secret =
    process.env.CREDENTIALS_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: CREDENTIALS_ENCRYPTION_KEY is not set in production. " +
        "You must generate a 32-byte key (e.g. `openssl rand -base64 32`) and set CREDENTIALS_ENCRYPTION_KEY " +
        "in your hosting environment (Vercel) to encrypt credentials at rest."
      );
    }
    const devFallback = process.env.NEXTAUTH_SECRET || "kanad-dev-only-secret-key-32chars";
    return crypto.createHash("sha256").update(devFallback).digest();
  }

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a sensitive string using AES-256-GCM at rest.
 * Output format: <iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encryptSecret(plainText: string | null | undefined): string | null {
  if (!plainText || typeof plainText !== "string") {
    return null;
  }

  const trimmed = plainText.trim();
  if (!trimmed) return null;

  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(trimmed, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Returns null if decryption fails or input is malformed.
 */
export function decryptSecret(cipherPayload: string | null | undefined): string | null {
  if (!cipherPayload || typeof cipherPayload !== "string") {
    return null;
  }

  const parts = cipherPayload.split(":");
  if (parts.length !== 3) {
    return null;
  }

  const [ivHex, tagHex, encryptedHex] = parts;

  try {
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");

    if (iv.length !== 12 || authTag.length !== 16) {
      return null;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Masks a secret string for safe display in administrative GET endpoints.
 * Never exposes the full plaintext. Shows only set status and trailing 4 characters.
 */
export function maskSecret(value: string | null | undefined): {
  isSet: boolean;
  masked: string;
} {
  if (!value || typeof value !== "string" || !value.trim()) {
    return { isSet: false, masked: "Not Configured" };
  }

  // If encrypted with AES-256-GCM (3 colon-separated hex segments), decrypt first
  let plain = value;
  if (value.includes(":") && value.split(":").length === 3) {
    const decrypted = decryptSecret(value);
    if (!decrypted) {
      return { isSet: false, masked: "Not Configured" };
    }
    plain = decrypted;
  }

  const trimmed = plain.trim();
  if (!trimmed) {
    return { isSet: false, masked: "Not Configured" };
  }

  const visibleCount = Math.min(4, Math.max(1, Math.floor(trimmed.length / 3)));
  const lastChars = trimmed.slice(-visibleCount);
  const maskPrefix = "•".repeat(Math.min(8, Math.max(4, trimmed.length - visibleCount)));

  return {
    isSet: true,
    masked: `${maskPrefix}${lastChars}`,
  };
}
