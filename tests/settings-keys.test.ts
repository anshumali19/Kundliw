import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
} from "@/lib/security/crypto";
import {
  getCredential,
  getMaskedCredentialsSummary,
} from "@/lib/config/credentials";
import { prisma } from "@/lib/prisma";

describe("Phase 16: Settings Keys Security & AES-256-GCM Vault", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("Cryptographic Primitive (crypto.ts)", () => {
    it("should encrypt and decrypt a plaintext secret reliably", () => {
      const secret = "rzp_live_supersecret_key_987654321";
      const encrypted = encryptSecret(secret);

      expect(encrypted).not.toBeNull();
      expect(encrypted).not.toBe(secret);
      expect(encrypted).toContain(":"); // iv:authTag:ciphertext format

      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(secret);
    });

    it("should return null when encrypting null or undefined", () => {
      expect(encryptSecret(null)).toBeNull();
      expect(encryptSecret(undefined)).toBeNull();
      expect(encryptSecret("")).toBeNull();
    });

    it("should return null when decrypting corrupted ciphertext", () => {
      expect(decryptSecret("corrupted:data:here")).toBeNull();
      expect(decryptSecret("invalidformat")).toBeNull();
      expect(decryptSecret(null)).toBeNull();
    });

    it("should correctly mask secrets with maskSecret()", () => {
      const maskedLong = maskSecret("rzp_test_1234567890abcd");
      expect(maskedLong.isSet).toBe(true);
      expect(maskedLong.masked).toContain("abcd");

      const maskedShort = maskSecret("short");
      expect(maskedShort.isSet).toBe(true);
      expect(maskedShort.masked).toContain("t");

      const maskedEmpty = maskSecret("");
      expect(maskedEmpty.isSet).toBe(false);

      const maskedNull = maskSecret(null);
      expect(maskedNull.isSet).toBe(false);
    });
  });

  describe("Two-Tier Credential Resolution (credentials.ts)", () => {
    it("should resolve from database if set in AdminSettings", async () => {
      const mockSettings = {
        id: "default",
        encRazorpayKeyId: encryptSecret("rzp_live_db_val_1234"),
        encRazorpayKeySecret: encryptSecret("db_secret_5678"),
      };

      vi.spyOn(prisma.adminSettings, "findUnique").mockResolvedValue(
        mockSettings as any
      );

      // Even if env has a different value, DB takes precedence
      process.env.RAZORPAY_KEY_ID = "rzp_env_fallback_id";

      const resolved = await getCredential("RAZORPAY_KEY_ID");
      expect(resolved).toBe("rzp_live_db_val_1234");
    });

    it("should fallback to environment variable if database column is null", async () => {
      vi.spyOn(prisma.adminSettings, "findUnique").mockResolvedValue({
        id: "default",
        encRazorpayKeyId: null,
      } as any);

      process.env.RAZORPAY_KEY_ID = "rzp_env_fallback_9999";

      const resolved = await getCredential("RAZORPAY_KEY_ID");
      expect(resolved).toBe("rzp_env_fallback_9999");
    });

    it("should produce masked summary with correct source and isSet flags", async () => {
      vi.spyOn(prisma.adminSettings, "findUnique").mockResolvedValue({
        id: "default",
        encRazorpayKeyId: encryptSecret("rzp_live_test_1111"),
        encRazorpayKeySecret: null,
      } as any);

      process.env.RAZORPAY_KEY_SECRET = "env_secret_9999";
      delete process.env.ASTROSAGE_API_KEY;

      const summary = await getMaskedCredentialsSummary();
      const keyIdItem = summary.find((s) => s.key === "RAZORPAY_KEY_ID");
      const keySecretItem = summary.find((s) => s.key === "RAZORPAY_KEY_SECRET");

      expect(keyIdItem?.source).toBe("DATABASE");
      expect(keyIdItem?.isSet).toBe(true);
      expect(keyIdItem?.masked).toContain("1111");

      expect(keySecretItem?.source).toBe("ENVIRONMENT");
      expect(keySecretItem?.isSet).toBe(true);
      expect(keySecretItem?.masked).toContain("9999");
    });
  });
});
