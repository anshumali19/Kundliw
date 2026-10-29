/* Creates the client's data flow: 4 services (Kundli, Kundli Matching, Prashna Kundli, Varsh Phal),
   each with packages by delivery mode (Audio / Video / PDF), plans (Basic / Premium) and one offer.
   Existing services/packages/plans/offers are left untouched. New plans are created HIDDEN with placeholder
   prices so nothing wrong goes public: the admin sets real prices, then switches them on.
   Usage: DATABASE_URL=... node scripts/seed-kundli-flow.cjs */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SERVICES = [
  { slug: "janam-kundli", en: "Kundli (Janam Kundli)", hi: "जन्म कुंडली", base: 1100 },
  { slug: "kundli-matching", en: "Kundli Matching", hi: "कुंडली मिलान", base: 800 },
  { slug: "prashna-kundli", en: "Prashna Kundli", hi: "प्रश्न कुंडली", base: 500 },
  { slug: "varshphal", en: "Varsh Phal (Yearly Forecast)", hi: "वर्षफल", base: 900 },
];
const MODES = [
  { slug: "audio", en: "Audio", hi: "ऑडियो", extra: 0 },
  { slug: "video", en: "Video", hi: "वीडियो", extra: 400 },
  { slug: "pdf", en: "PDF Report", hi: "पीडीएफ रिपोर्ट", extra: 200 },
];
const TIERS = [
  { slug: "basic", en: "Basic", hi: "बेसिक", mult: 1, popular: false },
  { slug: "premium", en: "Premium", hi: "प्रीमियम", mult: 2, popular: true },
];

(async () => {
  let created = 0;
  let order = 0;
  for (const s of SERVICES) {
    order++;
    let svc = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (!svc) {
      svc = await prisma.service.create({
        data: { slug: s.slug, titleEn: s.en, titleHi: s.hi, descriptionEn: `${s.en} by Maharshi Kanad Jyotish Kendra. Choose a package, then a plan.`, descriptionHi: `महर्षि कणाद ज्योतिष केंद्र द्वारा ${s.hi}। पैकेज और फिर प्लान चुनें।`, highlightsEn: [], highlightsHi: [], orderIndex: 100 + order, isActive: false },
      });
      created++;
    }
    let pi = 0;
    for (const m of MODES) {
      pi++;
      const pkg = await prisma.servicePackage.upsert({
        where: { serviceId_slug: { serviceId: svc.id, slug: m.slug } },
        update: {},
        create: { serviceId: svc.id, slug: m.slug, titleEn: m.en, titleHi: m.hi, descriptionEn: `${s.en} delivered as ${m.en}.`, descriptionHi: `${s.hi} ${m.hi} के रूप में।`, orderIndex: pi, isActive: false },
      });
      let ti = 0;
      for (const t of TIERS) {
        ti++;
        const slug = `${m.slug}-${t.slug}`;
        const exists = await prisma.plan.findUnique({ where: { serviceId_slug: { serviceId: svc.id, slug } } });
        if (exists) continue;
        await prisma.plan.create({
          data: {
            serviceId: svc.id, packageId: pkg.id, slug, titleEn: `${m.en} ${t.en}`, titleHi: `${m.hi} ${t.hi}`,
            descriptionEn: `${t.en} plan, ${m.en}.`, descriptionHi: `${t.hi} प्लान, ${m.hi}।`,
            pricePaise: (s.base + m.extra) * t.mult * 100, featuresEn: [], featuresHi: [], isPopular: t.popular, orderIndex: ti, isActive: false,
          },
        });
        created++;
      }
    }
  }
  const code = "KUNDLI10";
  if (!(await prisma.offer.findUnique({ where: { code } }))) {
    await prisma.offer.create({
      data: { code, titleEn: "10% off Kundli services", titleHi: "कुंडली सेवाओं पर 10% छूट", discountType: "PERCENTAGE", discountValuePaise: 10, serviceSlugs: SERVICES.map((x) => x.slug), showOnPlan: true, isActive: false },
    });
    created++;
  }
  console.log(`Done. ${created} new records created (all hidden until you switch them on in Admin).`);
})().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
