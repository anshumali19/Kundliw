/**
 * Strict integer conversion between Rupees and Paise.
 * Never uses floating-point arithmetic for financial storage.
 */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new Error("Rupee amount must be a positive integer or zero.");
  }
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new Error("Paise amount must be a non-negative integer.");
  }
  return Number((paise / 100).toFixed(2));
}

export function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}
