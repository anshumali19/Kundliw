import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import {
  AdminVaultManager,
  SerializedVaultFile,
  UserOption,
} from "@/features/admin/components/AdminVaultManager";

interface AdminVaultPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AdminVaultPage({
  params: { locale },
}: AdminVaultPageProps) {
  await requireAdmin("/admin/vault", locale);
  const isHindi = locale === "hi";

  const [rawFiles, rawUsers] = await Promise.all([
    prisma.vaultFile.findMany({
      orderBy: { uploadedAt: "desc" },
      include: {
        user: true,
        order: true,
      },
      take: 100,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: { id: true, orderNumber: true },
        },
      },
      take: 200,
    }),
  ]);

  const files: SerializedVaultFile[] = rawFiles.map((f) => ({
    id: f.id,
    titleEn: f.titleEn,
    titleHi: f.titleHi,
    fileName: f.fileName,
    fileSize: f.fileSize,
    uploadedAt: f.uploadedAt.toISOString(),
    userName: f.user.name || "Customer",
    userEmail: f.user.email,
    userPhone: f.user.phone,
    orderNumber: f.order?.orderNumber || null,
  }));

  const users: UserOption[] = rawUsers.map((u) => ({
    id: u.id,
    name: u.name || "Customer",
    email: u.email,
    phone: u.phone,
    orders: u.orders,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {isHindi ? "प्रशासनिक अभिलेखागार" : "Administrative Console"}
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "कुण्डली वॉल्ट प्रबंधन" : "Customer Vault Dossier Management"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "ग्राहकों के व्यक्तिगत डिजिटल वॉल्ट में प्रमाणित कुण्डली चक्र, वर्षफल एवं शास्त्रीय विश्लेषण PDF अपलोड करें।"
            : "Upload handcrafted horoscope charts, solar returns, and astrological PDFs to customer digital vaults."}
        </p>
      </div>

      <AdminVaultManager files={files} users={users} locale={locale} />
    </div>
  );
}
