import { z } from "zod";
import { isKundliService } from "@/lib/content/ownKundli";

export const jatakaDetailsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD"),
  tob: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time of birth must be HH:mm"),
  isTimeUnknown: z.boolean().default(false),
  pob: z.string().trim().min(2, "Place of birth must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Valid 10-digit Indian mobile number required"),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  language: z.enum(["hi", "en"]).default("hi"),
  queries: z.string().trim().max(1000, "Queries cannot exceed 1000 characters").optional(),
  // Family details the Kendra needs to prepare a Kundli (required for the Kundli services, see createBookingOrderSchema)
  fatherName: z.string().trim().max(120).optional().or(z.literal("")),
  motherName: z.string().trim().max(120).optional().or(z.literal("")),
  grandfatherName: z.string().trim().max(120).optional().or(z.literal("")),
  gotra: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  partnerDetails: z
    .object({
      name: z.string().trim().min(2, "Partner name must be at least 2 characters"),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("FEMALE"),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Partner date of birth must be YYYY-MM-DD"),
      tob: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Partner time of birth must be HH:mm"),
      isTimeUnknown: z.boolean().default(false),
      pob: z.string().trim().min(2, "Partner place of birth must be at least 2 characters"),
    })
    .optional(),
});

export const createBookingOrderSchema = z.object({
  serviceSlug: z.string().min(1, "Service is required"),
  planSlug: z.string().min(1, "Plan tier is required"),
  offerCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
  referralCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
  slotId: z.string().optional().or(z.literal("")),
  idempotencyKey: z.string().trim().optional(),
  jatakaDetails: jatakaDetailsSchema,
  // Note: Client cannot provide prices or discounts. Any price passed is ignored!
}).superRefine((v, ctx) => {
  if (!isKundliService(v.serviceSlug)) return;
  const need: Array<[keyof typeof v.jatakaDetails, string]> = [
    ["fatherName", "Father's name is required"],
    ["motherName", "Mother's name is required"],
    ["grandfatherName", "Grandfather's name is required"],
    ["gotra", "Gotra is required"],
    ["address", "Address is required"],
  ];
  for (const [key, message] of need) {
    if (!String(v.jatakaDetails[key] ?? "").trim()) {
      ctx.addIssue({ code: "custom", path: ["jatakaDetails", key], message });
    }
  }
});

export type CreateBookingOrderInput = z.infer<typeof createBookingOrderSchema>;
export type JatakaDetails = z.infer<typeof jatakaDetailsSchema>;
