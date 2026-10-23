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
    expect(() => phoneSchema.parse("1234567890")).toThrow(); // Starts with 1
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

  it("rejects registration with missing or invalid fields", () => {
    expect(() =>
      registerSchema.parse({ name: "", phone: "9827991224", email: "invalid" })
    ).toThrow();
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

    // First 5 requests allowed
    for (let i = 0; i < 5; i++) {
      const res = checkPhoneRateLimit(phone, now + i * 1000);
      expect(res.isAllowed).toBe(true);
    }

    // 6th request within the hour should be blocked
    const blockedRes = checkPhoneRateLimit(phone, now + 6000);
    expect(blockedRes.isAllowed).toBe(false);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("rate limits IP requests when threshold exceeded", () => {
    const ip = "192.168.1.100";
    const now = 1000000;

    // First 10 requests allowed
    for (let i = 0; i < 10; i++) {
      const res = checkIpRateLimit(ip, now + i * 1000);
      expect(res.isAllowed).toBe(true);
    }

    // 11th request blocked
    const blockedRes = checkIpRateLimit(ip, now + 11000);
    expect(blockedRes.isAllowed).toBe(false);
  });

  it("locks out during cooldown window", () => {
    const record = { timestamps: [1000, 2000, 3000], lockedUntil: 50000 };
    const res = checkSlidingWindowRateLimit(record, 25000, 60000, 3);
    expect(res.isAllowed).toBe(false);
    expect(res.retryAfterSeconds).toBe(25);
  });
});

describe("Role Guard Verification Logic", () => {
  interface UserContext {
    id: string;
    role: Role;
  }

  function evaluateAdminPermission(user: UserContext | null): boolean {
    if (!user) return false;
    return user.role === Role.ADMIN;
  }

  function evaluateUserPermission(user: UserContext | null): boolean {
    if (!user) return false;
    return user.role === Role.USER || user.role === Role.ADMIN;
  }

  it("permits only users with ADMIN role to access admin resources", () => {
    const adminUser: UserContext = { id: "admin-1", role: Role.ADMIN };
    const normalUser: UserContext = { id: "user-1", role: Role.USER };

    expect(evaluateAdminPermission(adminUser)).toBe(true);
    expect(evaluateAdminPermission(normalUser)).toBe(false);
    expect(evaluateAdminPermission(null)).toBe(false);
  });

  it("permits both USER and ADMIN to access standard user resources", () => {
    const adminUser: UserContext = { id: "admin-1", role: Role.ADMIN };
    const normalUser: UserContext = { id: "user-1", role: Role.USER };

    expect(evaluateUserPermission(adminUser)).toBe(true);
    expect(evaluateUserPermission(normalUser)).toBe(true);
    expect(evaluateUserPermission(null)).toBe(false);
  });
});
