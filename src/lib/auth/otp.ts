import * as crypto from "crypto";

export const MAX_OTP_ATTEMPTS = 3;
export const OTP_VALIDITY_MINUTES = 10;
export const MAX_HOURLY_OTP_REQUESTS = 5;

/**
 * Generates a cryptographically secure 6-digit numeric OTP string.
 */
export function generateNumericOtp(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  const num = crypto.randomInt(min, max + 1);
  return num.toString();
}

/**
 * Hashes an OTP with SHA256 before database storage.
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Timing-safe comparison of provided OTP against stored hash.
 */
export function verifyOtpHash(otp: string, storedHash: string): boolean {
  const candidateHash = hashOtp(otp);
  if (candidateHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(candidateHash, "utf-8"),
    Buffer.from(storedHash, "utf-8")
  );
}

/**
 * Checks if OTP expiration timestamp has passed.
 */
export function isOtpExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > expiresAt.getTime();
}

/**
 * Verifies whether the attempts limit has been reached.
 */
export function canAttemptOtpVerification(
  currentAttempts: number,
  maxAttempts: number = MAX_OTP_ATTEMPTS
): boolean {
  return currentAttempts < maxAttempts;
}

/**
 * Rate-limiting check based on recent OTP send requests within an hour.
 */
export function isOtpSendRateLimited(
  requestsInLastHour: number,
  maxAllowed: number = MAX_HOURLY_OTP_REQUESTS
): boolean {
  return requestsInLastHour >= maxAllowed;
}
