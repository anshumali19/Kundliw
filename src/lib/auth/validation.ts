import { z } from "zod";

/**
 * Normalizes any Indian phone input to pure 10 digits for matching.
 */
export function normalizePhoneNumber(val: string): string {
  const digits = val.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+?91[\-\s]?)?[6-9]\d{9}$/,
    "Please enter a valid 10-digit Indian mobile number (+91)"
  )
  .transform((val) => {
    // Standardize to +91XXXXXXXXXX
    const digits = val.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    return val;
  });

export const otpSchema = z
  .string()
  .trim()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .toLowerCase();

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters");

const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

/**
 * Public self-registration is limited to USER and ASSOCIATE accounts.
 * ADMIN (Super Admin) accounts are never created through this schema.
 */
export const registerSchema = z
  .object({
    accountType: z.enum(["USER", "ASSOCIATE"]).default("USER"),
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema.optional(),
  })
  .refine((v) => v.accountType !== "ASSOCIATE" || !!v.password, {
    message: "Password is required for Associate accounts",
    path: ["password"],
  });

export const loginPortalSchema = z.enum(["user", "associate", "super-admin"]);

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const emailPasswordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
