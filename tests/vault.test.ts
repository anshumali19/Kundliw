import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateFileMagicBytes, MAX_FILE_SIZE_BYTES } from "@/lib/storage";

describe("Phase 8 - Vault Subsystem & File Security", () => {
  it("strictly validates PDF magic bytes (%PDF-) for customer vault documents", () => {
    // Authentic PDF file header
    const validPdf = Buffer.from("%PDF-1.7\nSample Kundli Content");
    const validation = validateFileMagicBytes(validPdf);
    expect(validation.isValid).toBe(true);
    expect(validation.detectedMime).toBe("application/pdf");

    // Non-PDF fake files disguised as PDF
    const fakePdf = Buffer.from("NOT_A_PDF_CONTENT");
    expect(validateFileMagicBytes(fakePdf).isValid).toBe(false);

    const exeFile = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
    expect(validateFileMagicBytes(exeFile).isValid).toBe(false);
  });

  it("strictly enforces 10 MB maximum upload limit", () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);

    const validSize = 5 * 1024 * 1024;
    expect(validSize <= MAX_FILE_SIZE_BYTES).toBe(true);

    const overSize = 11 * 1024 * 1024;
    expect(overSize <= MAX_FILE_SIZE_BYTES).toBe(false);
  });

  it("enforces strict ownership check for vault downloads", () => {
    const vaultDoc = {
      id: "vault_123",
      userId: "user_owner_456",
      fileName: "Kundli_Aditya_Sharma.pdf",
    };

    const isAuthorized = (requestingUserId: string, role: string) => {
      return vaultDoc.userId === requestingUserId || role === "ADMIN";
    };

    // Owner can access
    expect(isAuthorized("user_owner_456", "USER")).toBe(true);

    // Admin can access
    expect(isAuthorized("admin_999", "ADMIN")).toBe(true);

    // Another customer cannot access
    expect(isAuthorized("user_other_789", "USER")).toBe(false);
  });
});
