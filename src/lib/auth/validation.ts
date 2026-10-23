import { z } from "zod";

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

export const registerSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

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
