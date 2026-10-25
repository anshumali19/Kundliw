export interface GstCalculationInput {
  baseAmountPaise: number;
  discountAmountPaise: number;
  gstRateBasisPoints?: number; // e.g., 1800 for 18.00%
}

export interface GstCalculationResult {
  baseAmountPaise: number;
  discountAmountPaise: number;
  taxableAmountPaise: number;
  gstRateBasisPoints: number;
  gstAmountPaise: number;
  netAmountPaise: number;
}

/**
 * Calculates taxable amount, GST amount, and net payable amount in paise.
 * All inputs and outputs are integers (paise).
 * Formula:
 * - Taxable = max(0, Base - Discount)
 * - GST = round((Taxable * gstRateBps) / 10000)
 * - Net = Taxable + GST
 */
export function calculateGst({
  baseAmountPaise,
  discountAmountPaise,
  gstRateBasisPoints = 1800,
}: GstCalculationInput): GstCalculationResult {
  if (baseAmountPaise < 0) {
    throw new Error("Base amount cannot be negative");
  }
  if (discountAmountPaise < 0) {
    throw new Error("Discount amount cannot be negative");
  }

  const taxableAmountPaise = Math.max(0, baseAmountPaise - discountAmountPaise);
  const gstAmountPaise = Math.round(
    (taxableAmountPaise * gstRateBasisPoints) / 10000
  );
  const netAmountPaise = taxableAmountPaise + gstAmountPaise;

  return {
    baseAmountPaise,
    discountAmountPaise,
    taxableAmountPaise,
    gstRateBasisPoints,
    gstAmountPaise,
    netAmountPaise,
  };
}

/**
 * Formats a GST rate expressed in basis points as a percentage string.
 * Examples: 1800 -> "18", 500 -> "5", 1250 -> "12.5".
 */
export function formatGstRateBasisPoints(basisPoints: number): string {
  if (!Number.isFinite(basisPoints) || basisPoints < 0) return "0";
  return String(basisPoints / 100);
}

/**
 * Format paise into Indian Rupee string with symbol (e.g. 210000 -> "₹2,100")
 */
export function formatPaiseToInr(paise: number, showPaise = false): string {
  const rupees = paise / 100;
  if (!showPaise && Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
