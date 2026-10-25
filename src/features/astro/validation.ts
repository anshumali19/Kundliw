import { z } from "zod";

const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long");

const dobField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD");

const tobField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time of birth must be HH:mm");

const pobField = z
  .string()
  .trim()
  .min(2, "Place of birth must be at least 2 characters")
  .max(200, "Place of birth is too long");

const genderField = z.enum(["MALE", "FEMALE", "OTHER"]).optional();

const birthDetailsSchema = z
  .object({
    name: nameField,
    gender: genderField,
    dob: dobField,
    tob: tobField,
    pob: pobField,
  })
  .strict();

export const astroKundliDetailsSchema = birthDetailsSchema;

export const astroMatchingDetailsSchema = z
  .object({
    boy: birthDetailsSchema,
    girl: birthDetailsSchema,
  })
  .strict();

export const astroPrashnaDetailsSchema = z
  .object({
    name: nameField,
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:\+91|91)?[6-9]\d{9}$/,
        "Valid 10-digit Indian mobile number required"
      ),
    email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
    category: z.enum([
      "CAREER",
      "MARRIAGE",
      "HEALTH",
      "LEGAL",
      "FINANCE",
      "PROPERTY",
      "GENERAL",
    ]),
    questionText: z
      .string()
      .trim()
      .min(5, "Please describe your question")
      .max(2000, "Question cannot exceed 2000 characters"),
    queryTimestamp: z
      .string()
      .trim()
      .regex(
        /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
        "Query date and time must be a valid timestamp"
      ),
    placeOfQuery: z
      .string()
      .trim()
      .min(2, "Place of query must be at least 2 characters")
      .max(200, "Place of query is too long"),
  })
  .strict();

/**
 * Public astro request payload. Each request type has a distinct, validated
 * shape; free-form JSON is never persisted into the order record.
 */
export const astroRequestSchema = z.discriminatedUnion("requestType", [
  z
    .object({
      requestType: z.literal("KUNDLI_REQUEST"),
      jatakaDetails: astroKundliDetailsSchema,
    })
    .strict(),
  z
    .object({
      requestType: z.literal("KUNDLI_MATCHING"),
      jatakaDetails: astroMatchingDetailsSchema,
    })
    .strict(),
  z
    .object({
      requestType: z.literal("PRASHNA_KUNDLI"),
      jatakaDetails: astroPrashnaDetailsSchema,
    })
    .strict(),
]);

export type AstroRequestInput = z.infer<typeof astroRequestSchema>;
