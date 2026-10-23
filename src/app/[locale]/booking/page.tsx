import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { BookingWizard, BookingServiceSummary, AvailableSlot } from "@/features/booking/components/BookingWizard";

interface BookingPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    service?: string;
    plan?: string;
    offer?: string;
    name?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dob?: string;
    tob?: string;
    pob?: string;
    partnerName?: string;
    partnerDob?: string;
    partnerTob?: string;
    partnerPob?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params: { locale },
  searchParams,
}: BookingPageProps) {
  // Login required before booking per SRS and instructions
  const user = await requireUser(
    `/booking${
      searchParams?.service
        ? `?service=${encodeURIComponent(searchParams.service)}&plan=${encodeURIComponent(
            searchParams.plan || ""
          )}`
        : ""
    }`,
    locale
  );

  // Fetch all active services with their active plans
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const servicesData: BookingServiceSummary[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    titleEn: s.titleEn,
    titleHi: s.titleHi,
    plans: s.plans.map((p) => ({
      id: p.id,
      slug: p.slug,
      titleEn: p.titleEn,
      titleHi: p.titleHi,
      pricePaise: p.pricePaise,
      originalPricePaise: p.originalPricePaise,
      deliveryDays: p.deliveryDays,
      pages: p.pages,
      hasCall: p.hasCall,
      callDurationMinutes: p.callDurationMinutes,
    })),
  }));

  // Fetch upcoming slots for calls
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextTwoWeeks = new Date(today);
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);

  const rawSlots = await prisma.slot.findMany({
    where: {
      isActive: true,
      date: { gte: today, lte: nextTwoWeeks },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const availableSlots: AvailableSlot[] = rawSlots
    .filter((s) => s.bookedCount < s.capacity)
    .map((s) => ({
      id: s.id,
      date: s.date.toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      available: s.capacity - s.bookedCount,
    }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
      <BookingWizard
        services={servicesData}
        initialServiceSlug={searchParams?.service || (servicesData[0]?.slug ?? "")}
        initialPlanSlug={searchParams?.plan || (servicesData[0]?.plans[0]?.slug ?? "")}
        initialOfferCode={searchParams?.offer || ""}
        initialSlots={availableSlots}
        userPhone={user.phone}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        initialJataka={{
          name: searchParams?.name,
          gender: searchParams?.gender,
          dob: searchParams?.dob,
          tob: searchParams?.tob,
          pob: searchParams?.pob,
          partnerName: searchParams?.partnerName,
          partnerDob: searchParams?.partnerDob,
          partnerTob: searchParams?.partnerTob,
          partnerPob: searchParams?.partnerPob,
        }}
      />
    </div>
  );
}
