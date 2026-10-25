/* eslint-disable */
/**
 * Idempotently ensures the two SRS cross-promotion portals exist as Other Services.
 * Safe on a live database: rows are created only when missing (empty `update`),
 * so later edits made in the admin panel are never overwritten.
 *
 *   node scripts/upsert-other-services.js
 */
const { PrismaClient } = require("@prisma/client");

const SERVICES = [
  {
    slug: "bharat-darshan-teerth-yatra",
    titleEn: "Bharat Darshan Teerth Yatra",
    titleHi: "भारत दर्शन तीर्थ यात्रा",
    taglineEn: "Pilgrimage journeys from our group portal",
    taglineHi: "हमारे समूह पोर्टल की तीर्थ यात्राएँ",
    descriptionEn:
      "Bharat Darshan Teerth Yatra is a sister portal of the Kendra for organised pilgrimage tours. Visit the portal for yatra details, itineraries and bookings.",
    descriptionHi:
      "भारत दर्शन तीर्थ यात्रा केंद्र का सहयोगी पोर्टल है, जहाँ आयोजित तीर्थ यात्राओं की जानकारी, यात्रा-कार्यक्रम और बुकिंग उपलब्ध है।",
    actionUrl: "https://bharatdarshanmpcg.org",
    orderIndex: 1,
  },
  {
    slug: "matrimonial-service",
    titleEn: "Matrimonial Service",
    titleHi: "वैवाहिक सेवा",
    taglineEn: "Vindhya Vivah Sanskar matrimonial portal",
    taglineHi: "विंध्य विवाह संस्कार वैवाहिक पोर्टल",
    descriptionEn:
      "Our matrimonial service is run through the Vindhya Vivah Sanskar portal. Visit the portal to register and explore matrimonial listings.",
    descriptionHi:
      "हमारी वैवाहिक सेवा विंध्य विवाह संस्कार पोर्टल के माध्यम से संचालित है। पंजीकरण एवं वैवाहिक विवरण देखने के लिए पोर्टल पर जाएँ।",
    actionUrl: "https://vindhyavivahsanskar.com",
    orderIndex: 2,
  },
];

async function ensureOtherServices(prisma) {
  for (const s of SERVICES) {
    const row = await prisma.otherService.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, isActive: true },
    });
    console.log(`[other-services] ${row.slug}: ok`);
  }
}

module.exports = { ensureOtherServices };

if (require.main === module) {
  const prisma = new PrismaClient();
  ensureOtherServices(prisma)
    .catch((err) => {
      console.error("[other-services] Failed:", err.message);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
