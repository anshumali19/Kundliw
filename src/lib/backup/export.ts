import { prisma } from "@/lib/prisma";

/** Fields that hold encrypted third-party secrets. They are never exported. */
const SECRET_PREFIX = "enc";

function stripSecrets<T extends Record<string, unknown>>(row: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !key.startsWith(SECRET_PREFIX))
  ) as Partial<T>;
}

/**
 * Builds a JSON snapshot of the Kendra's content and records.
 * It excludes API keys and secrets, password hashes and uploaded file bytes
 * (files stay in storage; only their records are listed).
 */
export async function buildBackupSnapshot() {
  const [
    settings,
    services,
    plans,
    offers,
    slots,
    users,
    orders,
    orderStatusEvents,
    associates,
    commissionRules,
    commissions,
    payouts,
    vaultFiles,
    chatbotQA,
    enquiries,
    marquee,
    banners,
    blogPosts,
    otherServices,
    testimonials,
    gallery,
    founder,
    faq,
    pages,
    translations,
  ] = await Promise.all([
    prisma.adminSettings.findMany(),
    prisma.service.findMany(),
    prisma.plan.findMany(),
    prisma.offer.findMany(),
    prisma.slot.findMany(),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    }),
    prisma.order.findMany(),
    prisma.orderStatusEvent.findMany(),
    prisma.associateProfile.findMany(),
    prisma.commissionRule.findMany(),
    prisma.commission.findMany(),
    prisma.payoutRequest.findMany(),
    prisma.vaultFile.findMany(),
    prisma.chatbotQA.findMany(),
    prisma.contactEnquiry.findMany(),
    prisma.marqueeItem.findMany(),
    prisma.banner.findMany(),
    prisma.blogPost.findMany(),
    prisma.otherService.findMany(),
    prisma.testimonial.findMany(),
    prisma.mediaGalleryItem.findMany(),
    prisma.founderProfile.findMany(),
    prisma.faqItem.findMany(),
    prisma.staticPage.findMany(),
    prisma.translationOverride.findMany(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    note: "Secrets, password hashes and file contents are not included.",
    settings: settings.map(stripSecrets),
    services,
    plans,
    offers,
    slots,
    users,
    orders,
    orderStatusEvents,
    associates,
    commissionRules,
    commissions,
    payouts,
    vaultFiles,
    chatbotQA,
    enquiries,
    marquee,
    banners,
    blogPosts,
    otherServices,
    testimonials,
    gallery,
    founder,
    faq,
    pages,
    translations,
  };
}
