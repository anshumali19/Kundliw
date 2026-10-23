import { describe, it, expect } from "vitest";
import { calculateGst, formatPaiseToInr } from "../src/lib/billing/gst";

describe("GST and Billing Calculation", () => {
  it("calculates 18% GST correctly with no discount", () => {
    // ₹1,100 (110,000 paise)
    const result = calculateGst({
      baseAmountPaise: 110000,
      discountAmountPaise: 0,
      gstRateBasisPoints: 1800,
    });

    expect(result.taxableAmountPaise).toBe(110000);
    // 18% of 110,000 = 19,800 paise (₹198)
    expect(result.gstAmountPaise).toBe(19800);
    // Net = 110,000 + 19,800 = 129,800 paise (₹1,298)
    expect(result.netAmountPaise).toBe(129800);
  });

  it("calculates 18% GST correctly with coupon deduction", () => {
    // Base ₹2,100 (210,000 paise) - Discount ₹500 (50,000 paise) = Taxable ₹1,600 (160,000 paise)
    const result = calculateGst({
      baseAmountPaise: 210000,
      discountAmountPaise: 50000,
      gstRateBasisPoints: 1800,
    });

    expect(result.taxableAmountPaise).toBe(160000);
    // 18% of 160,000 = 28,800 paise (₹288)
    expect(result.gstAmountPaise).toBe(28800);
    // Net = 160,000 + 28,800 = 188,800 paise (₹1,888)
    expect(result.netAmountPaise).toBe(188800);
  });

  it("handles 100% discount gracefully without negative values", () => {
    const result = calculateGst({
      baseAmountPaise: 100000,
      discountAmountPaise: 150000,
    });

    expect(result.taxableAmountPaise).toBe(0);
    expect(result.gstAmountPaise).toBe(0);
    expect(result.netAmountPaise).toBe(0);
  });

  it("throws error if negative amounts are passed", () => {
    expect(() =>
      calculateGst({ baseAmountPaise: -100, discountAmountPaise: 0 })
    ).toThrow("Base amount cannot be negative");

    expect(() =>
      calculateGst({ baseAmountPaise: 100, discountAmountPaise: -50 })
    ).toThrow("Discount amount cannot be negative");
  });

  it("formats paise to Indian Rupee strings correctly", () => {
    expect(formatPaiseToInr(210000)).toBe("₹2,100");
    expect(formatPaiseToInr(85000)).toBe("₹850");
    expect(formatPaiseToInr(129850, true)).toBe("₹1,298.50");
  });
});
