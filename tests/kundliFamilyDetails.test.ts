import { describe, expect, it } from "vitest";
import { createBookingOrderSchema } from "@/features/booking/validation";

const jataka = {
  name: "Ravi Tiwari",
  gender: "MALE" as const,
  dob: "1995-01-01",
  tob: "10:30",
  pob: "Raipur, CG",
  phone: "9827991224",
};

const family = {
  fatherName: "Mohan Tiwari",
  motherName: "Sushila Tiwari",
  grandfatherName: "Ganesh Tiwari",
  gotra: "Kashyap",
  address: "Ward 5, Gevra, Korba",
};

describe("Kundli family details", () => {
  it("are required for the Kundli services", () => {
    const r = createBookingOrderSchema.safeParse({ serviceSlug: "janam-kundli", planSlug: "p", jatakaDetails: jataka });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = r.error.issues.map((i) => i.path.join("."));
      expect(fields).toEqual(
        expect.arrayContaining([
          "jatakaDetails.fatherName",
          "jatakaDetails.motherName",
          "jatakaDetails.grandfatherName",
          "jatakaDetails.gotra",
          "jatakaDetails.address",
        ])
      );
    }
  });

  it("pass when all five are given", () => {
    const r = createBookingOrderSchema.safeParse({ serviceSlug: "kundli-matching", planSlug: "p", jatakaDetails: { ...jataka, ...family } });
    expect(r.success).toBe(true);
  });

  it("are not asked for other services", () => {
    const r = createBookingOrderSchema.safeParse({ serviceSlug: "puja", planSlug: "p", jatakaDetails: jataka });
    expect(r.success).toBe(true);
  });
});
