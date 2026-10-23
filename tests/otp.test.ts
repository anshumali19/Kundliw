import { describe, it, expect } from "vitest";
import {
  generateNumericOtp,
  hashOtp,
  verifyOtpHash,
  isOtpExpired,
  canAttemptOtpVerification,
  isOtpSendRateLimited,
} from "../src/lib/auth/otp";

describe("OTP Security and Expiry Logic", () => {
  it("generates a 6-digit numeric string", () => {
    const otp = generateNumericOtp(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it("hashes OTP and verifies matches securely", () => {
    const otp = "849201";
    const hash = hashOtp(otp);

    expect(verifyOtpHash(otp, hash)).toBe(true);
    expect(verifyOtpHash("849202", hash)).toBe(false);
  });

  it("detects expired OTP correctly", () => {
    const past = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago
    const future = new Date(Date.now() + 10 * 60 * 1000); // in 10 mins

    expect(isOtpExpired(past)).toBe(true);
    expect(isOtpExpired(future)).toBe(false);
  });

  it("limits verification attempts to maximum 3", () => {
    expect(canAttemptOtpVerification(0)).toBe(true);
    expect(canAttemptOtpVerification(1)).toBe(true);
    expect(canAttemptOtpVerification(2)).toBe(true);
    expect(canAttemptOtpVerification(3)).toBe(false);
    expect(canAttemptOtpVerification(4)).toBe(false);
  });

  it("rate limits OTP generation if max hourly requests exceeded", () => {
    expect(isOtpSendRateLimited(3, 5)).toBe(false);
    expect(isOtpSendRateLimited(5, 5)).toBe(true);
    expect(isOtpSendRateLimited(6, 5)).toBe(true);
  });
});
