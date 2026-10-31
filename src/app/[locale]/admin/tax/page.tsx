import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { DeskManager } from "@/features/admin/desk/DeskManager";

export const dynamic = "force-dynamic";

export default async function AdminTaxPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/tax", locale);
  const isHindi = locale === "hi";
  const items = await prisma.taxCase.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{isHindi ? "कर सहायता (ITR हेल्प डेस्क)" : "Tax Desk (ITR Help Desk)"}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isHindi ? "ग्राहकों के जमा कर दस्तावेज़ और उनकी फ़ाइलिंग स्थिति।" : "Tax documents submitted by clients and where each filing stands."}
        </p>
      </div>
      <DeskManager kind="tax" items={JSON.parse(JSON.stringify(items))} isHindi={isHindi} />
    </div>
  );
}
