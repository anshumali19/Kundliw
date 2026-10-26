import { z } from "zod";

export const CREDENTIAL_KINDS = ["GST", "MSME", "TRADEMARK", "ISO", "OTHER"] as const;
export type CredentialKind = (typeof CREDENTIAL_KINDS)[number];

export const CREDENTIAL_LABEL: Record<CredentialKind, { en: string; hi: string }> = {
  GST: { en: "GST registration", hi: "जीएसटी पंजीकरण" },
  MSME: { en: "MSME / Udyam", hi: "एमएसएमई / उद्यम" },
  TRADEMARK: { en: "Trademark", hi: "ट्रेडमार्क" },
  ISO: { en: "ISO certification", hi: "आईएसओ प्रमाणन" },
  OTHER: { en: "Other document", hi: "अन्य दस्तावेज़" },
};

/** Uploaded documents are served by this site, so the address must be one of its own storage paths. */
const ownFileUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v.startsWith("/api/storage/"), "Upload a file first");

export const credentialInputSchema = z.object({
  kind: z.enum(CREDENTIAL_KINDS).default("OTHER"),
  titleEn: z.string().trim().min(2).max(160),
  titleHi: z.string().trim().min(2).max(160),
  descriptionEn: z.string().trim().max(1000).optional().nullable(),
  descriptionHi: z.string().trim().max(1000).optional().nullable(),
  documentNumber: z.string().trim().max(80).optional().nullable(),
  fileUrl: ownFileUrl,
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.enum(["application/pdf", "image/png", "image/jpeg", "image/webp"]),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().min(0).max(9999).default(0),
});

export const credentialUpdateSchema = credentialInputSchema.partial();
