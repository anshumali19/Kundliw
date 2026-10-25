export const PAYMENT_PROOF_URL_PREFIX = "/api/storage/payment-proofs/";

/**
 * Manual payment proofs are uploaded by our own API and referenced by the
 * public storage URL it returns. Arbitrary external URLs (or paths to other
 * storage areas such as the customer vault) must never be accepted.
 */
export function isServerGeneratedPaymentProofUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed.startsWith(PAYMENT_PROOF_URL_PREFIX)) return false;

  const key = trimmed.slice(PAYMENT_PROOF_URL_PREFIX.length);
  if (!key || key.includes("..")) return false;
  if (key.includes("/") || key.includes("\\")) return false;

  return /^[A-Za-z0-9._-]+$/.test(key);
}
