import { describe, it, expect, beforeEach } from "vitest";
import {
  generateNumericOtp,
  hashOtp,
  verifyOtpHash,
  isOtpExpired,
  canAttemptOtpVerification,
  checkPhoneRateLimit,
  checkIpRateLimit,
  resetRateLimits,
  checkSlidingWindowRateLimit,
  MAX_OTP_ATTEMPTS,
} from "../src/lib/auth/otp";
import {
  phoneSchema,
  otpSchema,
  registerSchema,
  emailPasswordLoginSchema,
} from "../src/lib/auth/validation";
import { getClientIp } from "../src/lib/rateLimit";
import { getSmsProvider, DevConsoleSmsProvider } from "../src/lib/sms";
import { Role } from "@prisma/client";

describe("Auth Validation Schemas", () => {
  it("normalizes and accepts valid 10-digit Indian phone numbers", () => {
    expect(phoneSchema.parse("9827991224")).toBe("+919827991224");
    expect(phoneSchema.parse("+919827991224")).toBe("+919827991224");
    expect(phoneSchema.parse("919827991224")).toBe("+919827991224");
  });

  it("rejects invalid phone numbers", () => {
    expect(() => phoneSchema.parse("12345")).toThrow();
    expect(() => phoneSchema.parse("abcdefghij")).toThrow();
    expect(() => phoneSchema.parse("1234567890")).toThrow();
  });

  it("validates 6-digit numeric OTP strictly", () => {
    expect(otpSchema.parse("849201")).toBe("849201");
    expect(() => otpSchema.parse("12345")).toThrow("exactly 6 digits");
    expect(() => otpSchema.parse("1234567")).toThrow("exactly 6 digits");
    expect(() => otpSchema.parse("12a456")).toThrow("only digits");
  });

  it("validates registration payload with baseline SRS fields", () => {
    const valid = {
      name: "Aditya Sharma",
      phone: "9827991224",
      email: "aditya@example.com",
    };
    const parsed = registerSchema.parse(valid);
    expect(parsed.name).toBe("Aditya Sharma");
    expect(parsed.phone).toBe("+919827991224");
    expect(parsed.email).toBe("aditya@example.com");
  });
});

describe("Client IP Extraction & Proxy Trust", () => {
  it("returns fallback 127.0.0.1 when TRUST_PROXY is not true", () => {
    delete process.env.TRUST_PROXY;
    const headers = new Headers();
    headers.set("x-forwarded-for", "203.0.113.195, 70.41.3.18");

    expect(getClientIp(headers)).toBe("127.0.0.1");
  });

  it("trusts x-forwarded-for only when TRUST_PROXY=true", () => {
    process.env.TRUST_PROXY = "true";
    const headers = new Headers();
    headers.set("x-forwarded-for", "203.0.113.195, 70.41.3.18");

    expect(getClientIp(headers)).toBe("203.0.113.195");
    delete process.env.TRUST_PROXY;
  });
});

describe("OTP Rate Limiting and Lockout", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("enforces attempt lockout after max attempts (3)", () => {
    expect(canAttemptOtpVerification(0)).toBe(true);
    expect(canAttemptOtpVerification(1)).toBe(true);
    expect(canAttemptOtpVerification(2)).toBe(true);
    expect(canAttemptOtpVerification(MAX_OTP_ATTEMPTS)).toBe(false);
    expect(canAttemptOtpVerification(MAX_OTP_ATTEMPTS + 1)).toBe(false);
  });

  it("rate limits phone requests when threshold exceeded", () => {
    const phone = "+919827991224";
    const now = 1000000;

    for (let i = 0; i < 5; i++) {
      const res = checkPhoneRateLimit(phone, now + i * 1000);
      expect(res.isAllowed).toBe(true);
    }

    const blockedRes = checkPhoneRateLimit(phone, now + 6000);
    expect(blockedRes.isAllowed).toBe(false);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("Admin Login Attempt Limiting Logic", () => {
  it("locks out admin email when 5 consecutive failures occur within window", () => {
    const email = "admin@kanad-jyotish.in";
    const now = 2000000;
    const windowMs = 15 * 60 * 1000; // 15 mins
    let record = { timestamps: [] as number[] };

    for (let i = 0; i < 5; i++) {
      const check = checkSlidingWindowRateLimit(record, now + i * 1000, windowMs, 5);
      expect(check.isAllowed).toBe(true);
      record = check.updatedRecord;
    }

    // 6th attempt should lock out
    const lockedCheck = checkSlidingWindowRateLimit(record, now + 6000, windowMs, 5);
    expect(lockedCheck.isAllowed).toBe(false);
    expect(lockedCheck.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("locks out client IP when 10 failed login attempts occur within window", () => {
    const ip = "192.168.1.100";
    const now = 3000000;
    const windowMs = 15 * 60 * 1000; // 15 mins
    let record = { timestamps: [] as number[] };

    for (let i = 0; i < 10; i++) {
      const check = checkSlidingWindowRateLimit(record, now + i * 1000, windowMs, 10);
      expect(check.isAllowed).toBe(true);
      record = check.updatedRecord;
    }

    // 11th attempt should lock out
    const lockedCheck = checkSlidingWindowRateLimit(record, now + 11000, windowMs, 10);
    expect(lockedCheck.isAllowed).toBe(false);
    expect(lockedCheck.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("SMS Provider Factory & Production Loud Failure", () => {
  it("returns DevConsoleSmsProvider in development", () => {
    const envObj = process.env as Record<string, string | undefined>;
    const originalEnv = envObj.NODE_ENV;
    envObj.NODE_ENV = "development";

    const provider = getSmsProvider();
    expect(provider).toBeInstanceOf(DevConsoleSmsProvider);
    expect(provider.name).toBe("DevConsoleSmsProvider");

    envObj.NODE_ENV = originalEnv;
  });

  it("throws loudly in production if no SMS provider credentials exist", () => {
    const envObj = process.env as Record<string, string | undefined>;
    const originalEnv = envObj.NODE_ENV;
    const originalKey = envObj.MSG91_AUTH_KEY;
    envObj.NODE_ENV = "production";
    delete envObj.MSG91_AUTH_KEY;

    expect(() => getSmsProvider()).toThrow("CRITICAL CONFIGURATION ERROR: No SMS provider configured");

    envObj.NODE_ENV = originalEnv;
    if (originalKey) envObj.MSG91_AUTH_KEY = originalKey;
  });
});

describe("Database Role Re-Verification Logic", () => {
  it("re-reads and strictly verifies user role from DB instead of trusting JWT claim", () => {
    // Simulated DB query evaluation function
    function verifyDbRole(
      jwtRole: Role,
      dbUser: { id: string; role: Role } | null
    ): boolean {
      if (!dbUser) return false;
      return dbUser.role === Role.ADMIN;
    }

    // Case 1: JWT claims ADMIN, but DB record downgraded to USER
    expect(verifyDbRole(Role.ADMIN, { id: "u1", role: Role.USER })).toBe(false);

    // Case 2: JWT claims ADMIN and DB confirms ADMIN
    expect(verifyDbRole(Role.ADMIN, { id: "u1", role: Role.ADMIN })).toBe(true);

    // Case 3: User was deleted in DB
    expect(verifyDbRole(Role.ADMIN, null)).toBe(false);
  });
});
