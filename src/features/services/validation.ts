import { z } from "zod";
import { DiscountType } from "@prisma/client";
import { linksInputSchema } from "@/lib/content/media";


export const serviceInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  titleEn: z.string().trim().min(2, "English title is required"),
  titleHi: z.string().trim().min(2, "Hindi title is required"),
  taglineEn: z.string().trim().optional().nullable(),
  taglineHi: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().min(10, "English description must be at least 10 characters"),
  descriptionHi: z.string().trim().min(10, "Hindi description must be at least 10 characters"),
  highlightsEn: z.array(z.string().trim()).default([]),
  highlightsHi: z.array(z.string().trim()).default([]),
  notesEn: z.string().trim().optional().nullable(),
  notesHi: z.string().trim().optional().nullable(),
  icon: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  itineraryEn: z.string().trim().optional().nullable(),
  itineraryHi: z.string().trim().optional().nullable(),
  samagriEn: z.string().trim().optional().nullable(),
  samagriHi: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const planInputSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  packageId: z.string().trim().min(1).optional().nullable(),
  titleEn: z.string().trim().min(2, "English plan title is required"),
  titleHi: z.string().trim().min(2, "Hindi plan title is required"),
  descriptionEn: z.string().trim().min(10, "English description must be at least 10 characters"),
  descriptionHi: z.string().trim().min(10, "Hindi description must be at least 10 characters"),
  priceRupees: z.coerce.number().int().positive("Price in Rupees must be a positive integer"),
  originalPriceRupees: z.coerce.number().int().positive().optional().nullable(),
  deliveryDays: z.coerce.number().int().min(1, "Delivery turnaround must be at least 1 day").default(3),
  pages: z.coerce.number().int().min(1).optional().nullable(),
  hasCall: z.boolean().default(false),
  callDurationMinutes: z.coerce.number().int().min(5).optional().nullable(),
  featuresEn: z.array(z.string().trim().min(1)).min(1, "At least one English feature is required"),
  featuresHi: z.array(z.string().trim().min(1)).min(1, "At least one Hindi feature is required"),
  programEn: z.string().trim().optional().nullable(),
  programHi: z.string().trim().optional().nullable(),
  preparationEn: z.string().trim().optional().nullable(),
  preparationHi: z.string().trim().optional().nullable(),
  samagriEn: z.string().trim().optional().nullable(),
  samagriHi: z.string().trim().optional().nullable(),
  itineraryEn: z.string().trim().optional().nullable(),
  itineraryHi: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  additionalLinks: linksInputSchema.optional().nullable(),
  isPopular: z.boolean().default(false),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const baseOfferInputSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Coupon code must be at least 3 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase alphanumeric characters"),
  titleEn: z.string().trim().min(2, "English coupon title is required"),
  titleHi: z.string().trim().min(2, "Hindi coupon title is required"),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.coerce.number().int().positive("Discount value must be a positive integer"),
  maxDiscountRupees: z.coerce.number().int().positive().optional().nullable(),
  minOrderValueRupees: z.coerce.number().int().min(0).default(0),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  perUserLimit: z.coerce.number().int().min(0).max(100).default(1),
  serviceSlugs: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
  planIds: z.array(z.string().trim().min(1).max(120)).max(200).default([]),
  showOnPlan: z.boolean().default(false),
  autoApply: z.boolean().default(false),
  showInPopup: z.boolean().default(true),
  validFrom: z.coerce.date().default(() => new Date()),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const offerInputSchema = baseOfferInputSchema
  .refine(
    (data) => {
      if (data.discountType === DiscountType.PERCENTAGE) {
        return data.discountValue >= 1 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1% and 100%",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.validUntil && data.validFrom) {
        return data.validUntil > data.validFrom;
      }
      return true;
    },
    {
      message: "Valid Until date must be later than Valid From date",
      path: ["validUntil"],
    }
  );

export const updateOfferInputSchema = baseOfferInputSchema
  .partial()
  .refine(
    (data) => {
      if (data.discountType === DiscountType.PERCENTAGE && data.discountValue !== undefined) {
        return data.discountValue >= 1 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1% and 100%",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.validUntil && data.validFrom) {
        return data.validUntil > data.validFrom;
      }
      return true;
    },
    {
      message: "Valid Until date must be later than Valid From date",
      path: ["validUntil"],
    }
  );

export const validateOfferQuerySchema = z.object({
  code: z.string().trim().toUpperCase(),
  planId: z.string().min(1),
  // Other plans combined in the same booking (same service)
  extraPlanIds: z.array(z.string().min(1)).max(2).optional(),
});

const dayInputSchema = z.object({
  titleEn: z.string().trim().max(200).default(""),
  titleHi: z.string().trim().max(200).default(""),
  detailsEn: z.string().trim().max(4000).default(""),
  detailsHi: z.string().trim().max(4000).default(""),
});

const listInputSchema = z.array(z.string().trim().min(1).max(300)).max(100).default([]);

export const packageInputSchema = z
  .object({
    serviceId: z.string().min(1, "Service ID is required"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug must be at least 2 characters")
      .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    titleEn: z.string().trim().min(2, "English package name is required"),
    titleHi: z.string().trim().min(2, "Hindi package name is required"),
    descriptionEn: z.string().trim().max(8000).optional().nullable(),
    descriptionHi: z.string().trim().max(8000).optional().nullable(),
    numberOfDays: z.coerce.number().int().min(1).max(365).optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    seats: z.coerce.number().int().min(1).max(100000).optional().nullable(),
    itineraryDays: z.array(dayInputSchema).max(60).optional().nullable(),
    inclusionsEn: listInputSchema,
    inclusionsHi: listInputSchema,
    exclusionsEn: listInputSchema,
    exclusionsHi: listInputSchema,
    materialsEn: listInputSchema,
    materialsHi: listInputSchema,
    youtubeUrl: z.string().trim().max(500).optional().nullable(),
    imageUrl: z.string().trim().max(500).optional().nullable(),
    additionalLinks: linksInputSchema.optional().nullable(),
    orderIndex: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "End date cannot be before the start date",
    path: ["endDate"],
  });
