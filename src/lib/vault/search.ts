import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SerializedVaultFile, UserOption } from "@/features/admin/components/AdminVaultManager";

export const VAULT_SEARCH_FIELDS = ["all", "id", "name", "mobile", "email"] as const;
export type VaultSearchField = (typeof VAULT_SEARCH_FIELDS)[number];

/** Builds the customer filter for what the admin typed: customer ID, name, mobile number or e-mail. */
export function userWhere(q: string, field: VaultSearchField): Prisma.UserWhereInput {
  const text = q.trim();
  if (!text) return {};
  const digits = text.replace(/\D/g, "");
  const byId: Prisma.UserWhereInput = { id: { contains: text, mode: "insensitive" } };
  const byName: Prisma.UserWhereInput = { name: { contains: text, mode: "insensitive" } };
  const byEmail: Prisma.UserWhereInput = { email: { contains: text, mode: "insensitive" } };
  const byMobile: Prisma.UserWhereInput = digits.length >= 3 ? { phone: { contains: digits } } : { id: "__none__" };
  if (field === "id") return byId;
  if (field === "name") return byName;
  if (field === "email") return byEmail;
  if (field === "mobile") return byMobile;
  return { OR: [byId, byName, byEmail, ...(digits.length >= 3 ? [byMobile] : [])] };
}

export async function searchVault(q: string, field: VaultSearchField): Promise<{ files: SerializedVaultFile[]; users: UserOption[] }> {
  const text = q.trim();
  const uw = userWhere(text, field);
  const fileWhere: Prisma.VaultFileWhereInput = text
    ? {
        OR: [
          { user: uw },
          ...(field === "all" ? [{ titleEn: { contains: text, mode: "insensitive" as const } }, { titleHi: { contains: text, mode: "insensitive" as const } }, { fileName: { contains: text, mode: "insensitive" as const } }, { order: { orderNumber: { contains: text, mode: "insensitive" as const } } }] : []),
        ],
      }
    : {};
  const [rawFiles, rawUsers] = await Promise.all([
    prisma.vaultFile.findMany({ where: fileWhere, orderBy: { uploadedAt: "desc" }, include: { user: true, order: true }, take: 100 }),
    prisma.user.findMany({ where: uw, orderBy: { createdAt: "desc" }, include: { orders: { select: { id: true, orderNumber: true } } }, take: 200 }),
  ]);
  return {
    files: rawFiles.map((f) => ({
      id: f.id,
      titleEn: f.titleEn,
      titleHi: f.titleHi,
      fileName: f.fileName,
      fileSize: f.fileSize,
      uploadedAt: f.uploadedAt.toISOString(),
      userId: f.user.id,
      userName: f.user.name || "Customer",
      userEmail: f.user.email,
      userPhone: f.user.phone,
      orderNumber: f.order?.orderNumber || null,
      mimeType: f.mimeType,
      uploadedByRole: f.uploadedByRole,
    })),
    users: rawUsers.map((u) => ({ id: u.id, name: u.name || "Customer", email: u.email, phone: u.phone, orders: u.orders })),
  };
}
