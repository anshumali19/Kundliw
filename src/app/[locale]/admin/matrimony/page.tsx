import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { DeskManager } from "@/features/admin/desk/DeskManager";

export const dynamic = "force-dynamic";

export default async function AdminMatrimonyPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/matrimony", locale);
  const isHindi = locale === "hi";
  const items = await prisma.matrimonyProfile.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
          {isHindi ? "विंध्य विवाह संस्कार" : "Vindhya Vivah Sanskar (Matrimony)"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "नए प्रोफ़ाइल स्वीकृत या अस्वीकृत करें और सशुल्क सदस्यों की अवधि देखें।"
            : "Approve or reject new profiles and keep track of paid members and how long their membership runs."}
        </p>
      </div>
      <DeskManager kind="matrimony" items={JSON.parse(JSON.stringify(items))} isHindi={isHindi} />
    </div>
  );
}
