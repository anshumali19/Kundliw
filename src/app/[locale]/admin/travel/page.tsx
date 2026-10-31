import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { DeskManager } from "@/features/admin/desk/DeskManager";

export const dynamic = "force-dynamic";

export default async function AdminTravelPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/travel", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [requests, vehicles] = await Promise.all([
    prisma.travelRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.travelVehicle.findMany({ orderBy: { name: "asc" } }),
  ]);
  const options = vehicles.map((v) => ({ id: v.id, label: `${v.name} (${v.number})${v.isAvailable ? "" : isHindi ? " - अनुपलब्ध" : " - not available"}` }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Pilgrimage & Tours (Bharat Darshan)", "तीर्थ एवं यात्रा (भारत दर्शन)")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t("Travel requests with their booking status, and the vehicles and drivers you can send.", "यात्रा अनुरोध व उनकी बुकिंग स्थिति, तथा भेजे जा सकने वाले वाहन और चालक।")}
        </p>
      </div>
      <section className="space-y-3" aria-labelledby="req-title">
        <h2 id="req-title" className="font-serif text-lg font-bold text-secondary">{t("1. Travel requests", "1. यात्रा अनुरोध")}</h2>
        <DeskManager kind="travel" items={JSON.parse(JSON.stringify(requests))} isHindi={isHindi} vehicles={options} />
      </section>
      <section className="space-y-3" aria-labelledby="veh-title">
        <h2 id="veh-title" className="font-serif text-lg font-bold text-secondary">{t("2. Vehicles & drivers", "2. वाहन व चालक")}</h2>
        <DeskManager kind="vehicles" items={JSON.parse(JSON.stringify(vehicles))} isHindi={isHindi} />
      </section>
    </div>
  );
}
