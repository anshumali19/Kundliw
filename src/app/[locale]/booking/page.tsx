import { activePlanWhere } from "@/lib/content/packages";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { REFERRAL_COOKIE, normalizeReferralCode } from "@/lib/associates/service";
import { getGstSettings } from "@/lib/billing/gstSettings";
import { BookingWizard, BookingServiceSummary, AvailableSlot } from "@/features/booking/components/BookingWizard";

interface BookingPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    service?: string;
    plan?: string;
    offer?: string;
    ref?: string;
    phone?: string;
    pay?: string;
    name?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dob?: string;
    tob?: string;
    pob?: string;
    partnerName?: string;
    partnerDob?: string;
    partnerTob?: string;
    partnerPob?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function BookingPage(props: BookingPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    locale
  } = params;

  // Login required before booking per SRS and instructions
  const user = await requireUser(
    `/booking${
      searchParams?.service
        ? `?service=${encodeURIComponent(searchParams.service)}&plan=${encodeURIComponent(
            searchParams.plan || ""
          )}${searchParams.offer ? `&offer=${encodeURIComponent(searchParams.offer)}` : ""}${
            searchParams.ref ? `&ref=${encodeURIComponent(searchParams.ref)}` : ""
          }`
        : ""
    }`,
    locale
  );

  // Fetch all active services with their active plans
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      plans: {
        where: activePlanWhere,
        orderBy: { orderIndex: "asc" },
      },
      packages: { where: { isActive: true }, orderBy: { orderIndex: "asc" } },
    },
    orderBy: { orderIndex: "asc" },
  });

  const servicesData: BookingServiceSummary[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    titleEn: s.titleEn,
    titleHi: s.titleHi,
    packages: s.packages.map((k) => ({
      id: k.id,
      titleEn: k.titleEn,
      titleHi: k.titleHi,
      descriptionEn: k.descriptionEn,
      descriptionHi: k.descriptionHi,
    })),
    // Plans of a package that is switched off are not offered
    plans: s.plans
      .filter((p) => !p.packageId || s.packages.some((k) => k.id === p.packageId))
      .map((p) => ({
      id: p.id,
      packageId: p.packageId,
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

  const gst = await getGstSettings();
  const referralCookie =
    normalizeReferralCode(searchParams?.ref) || normalizeReferralCode((await cookies()).get(REFERRAL_COOKIE)?.value) || "";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
      <BookingWizard
        services={servicesData}
        initialServiceSlug={searchParams?.service || (servicesData[0]?.slug ?? "")}
        initialPlanSlug={searchParams?.plan || (servicesData[0]?.plans[0]?.slug ?? "")}
        initialOfferCode={searchParams?.offer || ""}
        initialReferralCode={referralCookie}
        initialPay={searchParams?.pay}
        gstRateBasisPoints={gst.rateBasisPoints}
        initialSlots={availableSlots}
        userPhone={user.phone}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        initialJataka={{
          name: searchParams?.name,
          phone: searchParams?.phone,
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
