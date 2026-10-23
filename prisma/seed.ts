import {
  PrismaClient,
  Role,
  DiscountType,
  BannerPosition,
  BannerType,
  MarqueePosition,
  OrderStatus,
  PaymentStatus,
  PaymentMode,
  Prisma,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Maharshi Kanad Jyotish Kendra comprehensive demo database...");

  // 1. Counters for sequential numbering
  await prisma.counter.upsert({
    where: { id: "ORDER_SEQ" },
    update: {},
    create: { id: "ORDER_SEQ", seq: 1000 },
  });

  await prisma.counter.upsert({
    where: { id: "INVOICE_SEQ" },
    update: {},
    create: { id: "INVOICE_SEQ", seq: 500 },
  });

  // 2. Admin User
  const defaultDevPassword = "ChangeMeInAdminSettings@2026";
  const initialAdminPassword =
    process.env.INITIAL_ADMIN_PASSWORD || defaultDevPassword;

  if (process.env.NODE_ENV === "production") {
    if (
      !process.env.INITIAL_ADMIN_PASSWORD ||
      process.env.INITIAL_ADMIN_PASSWORD === defaultDevPassword
    ) {
      throw new Error(
        "CRITICAL SECURITY ERROR: INITIAL_ADMIN_PASSWORD must be explicitly provided in production and cannot be the default development password."
      );
    }
  }

  const bcryptLib = (bcrypt as any).default || bcrypt;
  const adminPasswordHash = await bcryptLib.hash(initialAdminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@kanad-jyotish.in" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@kanad-jyotish.in",
      name: "Kendra Administrator (महर्षि कणाद केंद्र)",
      phone: "+919999900001",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // Demo standard customer user (uses fake demo phone, not SRS phone)
  const userPasswordHash = await bcryptLib.hash("UserKanad@2026", 10);
  const demoCustomer = await prisma.user.upsert({
    where: { email: "aditya.sharma@example.com" },
    update: {},
    create: {
      email: "aditya.sharma@example.com",
      name: "Aditya Narayan Sharma",
      phone: "+919999900002",
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  // 3. Admin Settings
  // Real contact numbers from SRS: +91-9827991224 and +91-7509124672.
  // City, coordinates and timezone are kept nullable per specification.
  await prisma.adminSettings.upsert({
    where: { id: "default" },
    update: {
      phone1: "+91-9827991224",
      phone2: "+91-7509124672",
      city: null,
      latitude: null,
      longitude: null,
      timezone: null,
    },
    create: {
      id: "default",
      siteNameEn: "Maharshi Kanad Jyotish Kendra",
      siteNameHi: "महर्षि कणाद ज्योतिष केंद्र",
      phone1: "+91-9827991224", // SRS Real Phone 1
      phone2: "+91-7509124672", // SRS Real Phone 2
      email: "contact@kanadastro.org",
      addressEn: "Kanad Bhavan, Dashashwamedh Ghat Marg, Varanasi, Uttar Pradesh 221001",
      addressHi: "कणाद भवन, दशाश्वमेध घाट मार्ग, वाराणसी, उत्तर प्रदेश २२१००१",
      city: null,
      latitude: null,
      longitude: null,
      timezone: null,
      // --- DEMO BANK & GST DETAILS ---
      upiVpa: "kanadjyotish@sbi",
      bankAccountName: "Maharshi Kanad Jyotish Kendra [Demo Account]",
      bankAccountNumber: "389201928410",
      bankIfsc: "SBIN0000201",
      bankName: "State Bank of India, Main Branch Varanasi",
      qrCodeUrl: "/images/demo-qr.png",
      gstin: "09AAATM1234F1Z5", // Demo GSTIN
      defaultGstRateBps: 1800, // 18.00%
    },
  });

  // 4. Services and Plans
  const srv1 = await prisma.service.upsert({
    where: { slug: "complete-janampatri" },
    update: {},
    create: {
      slug: "complete-janampatri",
      titleEn: "Complete Janampatri & Lifetime Vedic Kundli",
      titleHi: "सम्पूर्ण जन्मपत्रिका एवं षोडशवर्ग चक्र",
      taglineEn: "Exhaustive 45-page astrological dossier mapping D1 to D60 charts",
      taglineHi: "लग्न कुण्डली से लेकर षष्ट्यंश (डी-६०) तक सम्पूर्ण सूक्ष्म गणितीय चक्र",
      descriptionEn: "Complete Janampatri covering Shodashvarga harmonic charts, Vimshottari Mahadasha-Antardasha cycles, Sade Sati analysis, and career/health timing.",
      descriptionHi: "विशुद्ध सूर्य सिद्धान्त एवं दृग्गणित पर आधारित सम्पूर्ण जीवन फलकथन एवं ग्रह स्पष्ट विचार।",
      highlightsEn: ["D1 to D60 charts", "Lifetime Dasha cycles", "Physical bound manual"],
      highlightsHi: ["षोडशवर्ग सूक्ष्म चक्र", "आजीवन विंशोत्तरी महादशा", "हस्तलिखित पोथी ग्रंथ"],
      orderIndex: 1,
      isActive: true,
    },
  });

  const plan1_1 = await prisma.plan.upsert({
    where: { serviceId_slug: { serviceId: srv1.id, slug: "digital-dossier" } },
    update: {},
    create: {
      serviceId: srv1.id,
      slug: "digital-dossier",
      titleEn: "Digital Ephemeris PDF",
      titleHi: "डिजिटल कुण्डली पीडीएफ",
      descriptionEn: "High-precision printable PDF horoscope dossier with planetary degrees.",
      descriptionHi: "ग्रह स्पष्ट एवं लग्न विचार से युक्त डिजिटल पीडीएफ कुण्डली।",
      pricePaise: 110000, // ₹1,100
      originalPricePaise: 150000,
      deliveryDays: 3,
      pages: 25,
      hasCall: false,
      orderIndex: 1,
      isActive: true,
    },
  });

  const plan1_2 = await prisma.plan.upsert({
    where: { serviceId_slug: { serviceId: srv1.id, slug: "handcrafted-pothi" } },
    update: {},
    create: {
      serviceId: srv1.id,
      slug: "handcrafted-pothi",
      titleEn: "Archival Bound Pothi Dossier",
      titleHi: "हस्तनिर्मित पोथी संस्करण",
      descriptionEn: "Handcrafted bound Janampatri manual with 30-min one-on-one Kendra team consultation.",
      descriptionHi: "हस्तनिर्मित जिल्दबंद कुण्डली एवं वरिष्ठ दैवज्ञ के साथ ३० मिनट का परामर्श।",
      pricePaise: 250000, // ₹2,500
      originalPricePaise: 310000,
      deliveryDays: 5,
      pages: 45,
      hasCall: true,
      callDurationMinutes: 30,
      isPopular: true,
      orderIndex: 2,
      isActive: true,
    },
  });

  const srv2 = await prisma.service.upsert({
    where: { slug: "career-business-raj-yoga" },
    update: {},
    create: {
      slug: "career-business-raj-yoga",
      titleEn: "Career, Business & Raj Yoga Consultation",
      titleHi: "कर्मभाव, व्यवसाय एवं राजयोग परीक्षण",
      taglineEn: "Specialized diagnosis of 10th House, Amatyakaraka, and Dashamsha (D10)",
      taglineHi: "दशम भाव, दशमांश चक्र एवं अमात्यकारक के आधार पर आजीविका परीक्षा",
      descriptionEn: "Deep diagnostic analysis of vocational transits, promotions, business crossroads, and Sade Sati mitigation.",
      descriptionHi: "व्यवसाय वृद्धि, पदोन्नति एवं आर्थिक संशयों के समाधान हेतु वरिष्ठ दैवज्ञ परामर्श।",
      highlightsEn: ["D10 Dashamsha audit", "Sade Sati mitigation", "Direct 1-on-1 Kendra team consultation"],
      highlightsHi: ["दशमांश सूक्ष्म विश्लेषण", "साढ़ेसाती शांति उपाय", "वरिष्ठ ज्योतिषी से सीधा वार्तालाप"],
      orderIndex: 2,
      isActive: true,
    },
  });

  const plan2_1 = await prisma.plan.upsert({
    where: { serviceId_slug: { serviceId: srv2.id, slug: "standard-career" } },
    update: {},
    create: {
      serviceId: srv2.id,
      slug: "standard-career",
      titleEn: "Single Consultation & D10 Audit",
      titleHi: "एकल परामर्श एवं दशमांश परीक्षण",
      descriptionEn: "Direct telephonic consultation session and career astrological review.",
      descriptionHi: "वरिष्ठ ज्योतिषी के साथ ३० मिनट की सीधी फोन वार्ता एवं आजीविका फलकथन।",
      pricePaise: 150000, // ₹1,500
      originalPricePaise: 210000,
      deliveryDays: 2,
      hasCall: true,
      callDurationMinutes: 30,
      orderIndex: 1,
      isActive: true,
    },
  });

  const srv3 = await prisma.service.upsert({
    where: { slug: "kundli-matching" },
    update: {},
    create: {
      slug: "kundli-matching",
      titleEn: "Kundli Milan & Matrimonial Compatibility",
      titleHi: "अष्टकूट ३६ गुण मिलान एवं दाम्पत्य विचार",
      taglineEn: "36-Guna assessment paired with Nadi Dosha and Manglik examination",
      taglineHi: "वर-कन्या के ३६ गुण मिलान, मांगलिक दोष परिहार एवं नाड़ी दोष परीक्षण",
      descriptionEn: "Rigorous astrological evaluation of marriage harmony, longevity, mental alignment, and progeny vitality.",
      descriptionHi: "विवाह पूर्व शुद्ध वैदिक मेलापक एवं दांपत्य सुख का विस्तृत निर्णय।",
      orderIndex: 3,
      isActive: true,
    },
  });

  const plan3_1 = await prisma.plan.upsert({
    where: { serviceId_slug: { serviceId: srv3.id, slug: "milan-report" } },
    update: {},
    create: {
      serviceId: srv3.id,
      slug: "milan-report",
      titleEn: "36-Guna Ashtakoot Scorecard PDF",
      titleHi: "३६ गुण मेलापक विवरण पत्र",
      descriptionEn: "Detailed Ashtakoot breakdown, Manglik assessment, and Nadi Dosha cancellations.",
      descriptionHi: "अष्टकूट विवरण, मांगलिक विचार एवं शास्त्रीय परिहार रिपोर्ट।",
      pricePaise: 110000, // ₹1,100
      originalPricePaise: 150000,
      deliveryDays: 1,
      pages: 12,
      hasCall: false,
      orderIndex: 1,
      isActive: true,
    },
  });

  // 5. Offers / Coupons
  await prisma.offer.upsert({
    where: { code: "SHUBH500" },
    update: {},
    create: {
      code: "SHUBH500",
      titleEn: "Shubh Muhurat Flat ₹500 Discount",
      titleHi: "शुभ मुहूर्त विशेष छूट ₹५००",
      discountType: DiscountType.FLAT,
      discountValuePaise: 50000, // Flat Rs 500
      minOrderValuePaise: 150000, // Min order Rs 1,500
      usageLimit: 500,
      usedCount: 12,
      isActive: true,
    },
  });

  await prisma.offer.upsert({
    where: { code: "JYOTISH500" },
    update: {},
    create: {
      code: "JYOTISH500",
      titleEn: "Vedic Scholar Inaugural Waiver",
      titleHi: "विद्वत् परिषद विशेष अनुदान",
      discountType: DiscountType.FLAT,
      discountValuePaise: 50000, // Flat Rs 500
      minOrderValuePaise: 150000,
      usageLimit: 1000,
      usedCount: 45,
      isActive: true,
    },
  });

  // 6. Slots
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  for (let i = 1; i <= 5; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(slotDate.getDate() + i);

    await prisma.slot.upsert({
      where: { id: `seed_slot_${i}` },
      update: {},
      create: {
        id: `seed_slot_${i}`,
        date: slotDate,
        startTime: "11:00",
        endTime: "11:30",
        capacity: 2,
        bookedCount: 0,
        isActive: true,
      },
    });
  }

  // 7. Orders across all 6 Canonical Statuses (Linked to Aditya Sharma)
  const defaultJataka: Prisma.InputJsonValue = {
    name: "Aditya Narayan Sharma",
    phone: "+919999900002",
    email: "aditya.sharma@example.com",
    gender: "MALE",
    dob: "1994-08-22",
    tob: "08:15",
    pob: "Varanasi, Uttar Pradesh",
    gotra: "Kashyapa",
    language: "hi",
    queries: "Career trajectory and foreign travels in the upcoming Mahadasha.",
  };

  const statusConfigs = [
    {
      orderNumber: "MKJK-2026-1001",
      invoiceNumber: "INV-2026-0501",
      status: OrderStatus.ORDER_RECEIVED,
      note: "Order intake confirmed. Natal chart locked for senior scholar allocation.",
      plan: plan1_1,
      serviceId: srv1.id,
    },
    {
      orderNumber: "MKJK-2026-1002",
      invoiceNumber: "INV-2026-0502",
      status: OrderStatus.KUNDLI_IN_PROGRESS,
      note: "Shodashvarga mathematical planetary degrees computation in progress.",
      plan: plan2_1,
      serviceId: srv2.id,
    },
    {
      orderNumber: "MKJK-2026-1003",
      invoiceNumber: "INV-2026-0503",
      status: OrderStatus.KUNDLI_COMPLETE,
      note: "Two-tier Kendra team review complete. Final chart signed and uploaded to customer vault.",
      plan: plan1_2,
      serviceId: srv1.id,
    },
    {
      orderNumber: "MKJK-2026-1004",
      invoiceNumber: "INV-2026-0504",
      status: OrderStatus.DISPATCHED,
      note: "Handcrafted bound Pothi dispatched via BlueDart Express.",
      courierName: "BlueDart Express",
      trackingNumber: "BD982741920IN",
      plan: plan1_2,
      serviceId: srv1.id,
    },
    {
      orderNumber: "MKJK-2026-1005",
      invoiceNumber: "INV-2026-0505",
      status: OrderStatus.DELIVERED,
      note: "Printed astrological manual delivered to customer residential address.",
      courierName: "BlueDart Express",
      trackingNumber: "BD982741920IN",
      plan: plan1_2,
      serviceId: srv1.id,
    },
    {
      orderNumber: "MKJK-2026-1006",
      invoiceNumber: "INV-2026-0506",
      status: OrderStatus.EXECUTION_COMPLETE,
      note: "One-on-one telephonic Kendra team consultation session successfully completed.",
      courierName: "BlueDart Express",
      trackingNumber: "BD982741920IN",
      plan: plan2_1,
      serviceId: srv2.id,
    },
  ];

  for (const cfg of statusConfigs) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: cfg.orderNumber },
    });

    if (!existing) {
      const order = await prisma.order.create({
        data: {
          orderNumber: cfg.orderNumber,
          userId: demoCustomer.id,
          serviceId: cfg.serviceId,
          planId: cfg.plan.id,
          status: cfg.status,
          paymentStatus: PaymentStatus.PAID,
          paymentMode: PaymentMode.RAZORPAY,
          jatakaDetails: defaultJataka,
          baseAmountPaise: cfg.plan.pricePaise,
          discountAmountPaise: 0,
          taxableAmountPaise: cfg.plan.pricePaise,
          gstRateBasisPoints: 1800,
          gstAmountPaise: Math.round((cfg.plan.pricePaise * 1800) / 10000),
          netAmountPaise: cfg.plan.pricePaise + Math.round((cfg.plan.pricePaise * 1800) / 10000),
          invoiceNumber: cfg.invoiceNumber,
          gstin: "09AAATM1234F1Z5",
          courierName: cfg.courierName,
          trackingNumber: cfg.trackingNumber,
        },
      });

      await prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: cfg.status,
          note: cfg.note,
          changedById: adminUser.id,
        },
      });
    }
  }

  // 8. Demo Vault File (Stored on disk for authenticated download)
  const storageVaultDir = path.join(process.cwd(), "storage", "vault");
  if (!fs.existsSync(storageVaultDir)) {
    fs.mkdirSync(storageVaultDir, { recursive: true });
  }

  const samplePdfPath = path.join(storageVaultDir, "demo_aditya_sharma_janampatri.pdf");
  if (!fs.existsSync(samplePdfPath)) {
    const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 20 Tf
100 700 Td
(Maharshi Kanad Jyotish Kendra - Janampatri Dossier) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000201 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
307
%%EOF`;
    fs.writeFileSync(samplePdfPath, minimalPdf);
  }

  await prisma.vaultFile.deleteMany({
    where: { userId: demoCustomer.id },
  });

  await prisma.vaultFile.create({
    data: {
      userId: demoCustomer.id,
      titleEn: "Complete Janampatri & Shodashvarga Chart Dossier",
      titleHi: "सम्पूर्ण जन्मपत्रिका एवं षोडशवर्ग चक्र अभिलेख",
      fileName: "Aditya_Sharma_Janampatri_Vedic_Dossier.pdf",
      storageKey: "vault/demo_aditya_sharma_janampatri.pdf",
      fileSize: 450000,
      mimeType: "application/pdf",
    },
  });

  // 9. Promotional Banners (Across TOP, BOTTOM, LEFT, RIGHT slots)
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        titleEn: "Samvat 2083 Surya Siddhanta Muhurat Tables",
        titleHi: "सम्वत् २०८३ सूर्य सिद्धान्त शुभ मुहूर्त पंचांग",
        subtitleEn: "Authentic Vivah & Griha Pravesh Almanac",
        subtitleHi: "विवाह एवं गृह प्रवेश शुभ कालनिर्णय",
        imageUrl: "/images/banner-top.jpg",
        linkUrl: "/panchang",
        position: BannerPosition.TOP,
        type: BannerType.CAROUSEL,
        isActive: true,
        orderIndex: 1,
      },
      {
        titleEn: "Kendra Archival Kundli Dossier Bookings Open",
        titleHi: "हस्तनिर्मित पोथी संस्करण अग्रिम पंजीकरण",
        subtitleEn: "Limited monthly allocations for physical bound Janampatri",
        subtitleHi: "मासिक हस्तनिर्मित पोथी प्रतियों हेतु सीमित स्थान",
        imageUrl: "/images/banner-top-2.jpg",
        linkUrl: "/services",
        position: BannerPosition.TOP,
        type: BannerType.CAROUSEL,
        isActive: true,
        orderIndex: 2,
      },
      {
        titleEn: "Guru-Shani Transit Maha-Yajna",
        titleHi: "गुरु-शनि राशि परिवर्तन विशेष अनुष्ठान",
        subtitleEn: "Varanasi Dashashwamedh Sanctum Live Ephemeris",
        subtitleHi: "दशाश्वमेध घाट काशी से सस्वर वैदिक पाठ",
        imageUrl: "/images/banner-hero.jpg",
        linkUrl: "/services",
        position: BannerPosition.RIGHT,
        type: BannerType.STATIC,
        isActive: true,
        orderIndex: 1,
      },
      {
        titleEn: "Vedic Matchmaking & Kundli Milan Scrutiny",
        titleHi: "अष्टकूट गुण मिलान एवं मांगलिक विचार",
        subtitleEn: "Parashari Bhanga metric analysis by Kendra team",
        subtitleHi: "केंद्र दल द्वारा परिहार एवं सूक्ष्म गुण परीक्षण",
        imageUrl: "/images/banner-left.jpg",
        linkUrl: "/kundli/matching",
        position: BannerPosition.LEFT,
        type: BannerType.STATIC,
        isActive: true,
        orderIndex: 1,
      },
      {
        titleEn: "Surya Siddhanta Ephemeris Calibration Update",
        titleHi: "सूर्य सिद्धान्त पंचांग गणितीय परिशोधन",
        subtitleEn: "High-precision Chitrapaksha Ayanamsha calculations",
        subtitleHi: "चित्रापक्षीय अयनांश पर आधारित शुद्ध खगोलीय तालिकायें",
        imageUrl: "/images/banner-bottom.jpg",
        linkUrl: "/panchang",
        position: BannerPosition.BOTTOM,
        type: BannerType.STATIC,
        isActive: true,
        orderIndex: 1,
      },
    ],
  });

  // 10. Marquee Announcements
  await prisma.marqueeItem.deleteMany({});
  await prisma.marqueeItem.createMany({
    data: [
      {
        textEn: "Special Notice: Registration open for Guru-Shani transit Maha-Yajna at Dashashwamedh Ghat, Varanasi",
        textHi: "विशेष सूचना: गुरु-शनि राशि परिवर्तन पर विशेष महायज्ञ पंजीकरण प्रारंभ, दशाश्वमेध घाट काशी",
        speedSec: 25,
        fontSize: 13,
        bgColor: "var(--secondary)",
        textColor: "var(--on-secondary)",
        position: MarqueePosition.BOTTOM,
        isActive: true,
        orderIndex: 1,
      },
      {
        textEn: "Auspicious Vivah & Griha Pravesh Muhurat Tables published according to Surya Siddhanta",
        textHi: "शुद्ध सूर्य सिद्धान्त सम्मत सम्वत् २०८३ विवाह एवं गृह प्रवेश शुभ मुहूर्त तालिका प्रकाशित",
        speedSec: 25,
        fontSize: 13,
        bgColor: "var(--secondary)",
        textColor: "var(--on-secondary)",
        position: MarqueePosition.BOTTOM,
        isActive: true,
        orderIndex: 2,
      },
    ],
  });

  // 11. Testimonials (Sample data - NOT verified)
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: [
      {
        authorNameEn: "Sample Client (Bengaluru)",
        authorNameHi: "परामर्शार्थी (बेंगलुरु)",
        authorTitleEn: "Client • Career Analysis",
        authorTitleHi: "परामर्शार्थी • कर्मभाव विश्लेषण",
        cityEn: "Bengaluru",
        cityHi: "बेंगलुरु",
        quoteEn: "[Sample Testimonial] Detailed analysis of natal charts and planetary periods provided clarity on vocational transitions.",
        quoteHi: "[नमूना अनुभव] कुण्डली चक्रों और दशा क्रम का विस्तृत शास्त्रीय विश्लेषण प्राप्त हुआ।",
        rating: 5,
        isVerified: false, // Explicitly false per instruction
        orderIndex: 1,
      },
      {
        authorNameEn: "Sample Client (London)",
        authorNameHi: "परामर्शार्थी (लंदन)",
        authorTitleEn: "Client • Birth Time Rectification",
        authorTitleHi: "परामर्शार्थी • जन्म समय शोधन",
        cityEn: "London, UK",
        cityHi: "लंदन",
        quoteEn: "[Sample Testimonial] The mathematical rectification methodology provided structured and clear astrological milestones.",
        quoteHi: "[नमूना अनुभव] सूक्ष्म गणितीय गणना द्वारा शोधन प्रक्रिया अत्यंत स्पष्ट रही।",
        rating: 5,
        isVerified: false, // Explicitly false per instruction
        orderIndex: 2,
      },
      {
        authorNameEn: "Sample Client (Varanasi)",
        authorNameHi: "परामर्शार्थी (काशी)",
        authorTitleEn: "Client • Kundli Matching",
        authorTitleHi: "परामर्शार्थी • कुण्डली मिलान",
        cityEn: "Varanasi",
        cityHi: "वाराणसी",
        quoteEn: "[Sample Testimonial] Thorough Ashtakoot compatibility examination based on classical canons.",
        quoteHi: "[नमूना अनुभव] शास्त्रों सम्मत अष्टकूट गुण मिलान विचार प्राप्त हुआ।",
        rating: 5,
        isVerified: false, // Explicitly false per instruction
        orderIndex: 3,
      },
    ],
  });

  // 12. Static Pages
  const staticPages = [
    {
      slug: "about",
      titleEn: "About Maharshi Kanad Jyotish Kendra",
      titleHi: "महर्षि कणाद ज्योतिष केंद्र परिचय",
      contentEn:
        "Maharshi Kanad Jyotish Kendra is an authentic center of Vedic astronomical calculations and traditional Jyotish Siddhanta rooted in Varanasi's 42+ years lineage at Dashashwamedh Ghat. We dispell fear and superstition through pure mathematical ephemeris.",
      contentHi:
        "महर्षि कणाद ज्योतिष केंद्र वाराणसी के दशाश्वमेध घाट पर ४२ से अधिक वर्षों की अविच्छिन्न परंपरा से संचालित प्रामाणिक ज्योतिष पीठ है। यहाँ समस्त भविष्य विचार अंधविश्वास से परे, विशुद्ध गणितीय गणनाओं पर आधारित हैं।",
    },
    {
      slug: "founder",
      titleEn: "Founder Lineage & Scholarly Tradition",
      titleHi: "संस्थापक परंपरा एवं शास्त्रीय इतिहास",
      contentEn:
        "Established by classical scholars educated in Kashi Hindu Vishwavidyalaya and Sampurnanand Sanskrit Vishwavidyalaya, preserving Dashashwamedh astronomical charts down to the arc-second.",
      contentHi:
        "काशी हिंदू विश्वविद्यालय एवं संपूर्णानंद संस्कृत विश्वविद्यालय के मूर्धन्य दैवज्ञों द्वारा स्थापित यह केंद्र चार दशकों से शुद्ध दृग्गणित की रक्षा कर रहा है।",
    },
    {
      slug: "help",
      titleEn: "Help Center & Contact Support",
      titleHi: "सहायता एवं परामर्श संपर्क",
      contentEn:
        "For assistance regarding consultation bookings, birth detail rectifications, or payment verifications, reach our helpline daily at +91-9827991224 and +91-7509124672.",
      contentHi:
        "परामर्श बुकिंग अथवा जन्म समय सत्यापन हेतु हमारे दूरभाष +91-9827991224 अथवा +91-7509124672 पर प्रातः ०९:०० से सायं ०७:०० बजे तक संपर्क करें।",
    },
    {
      slug: "terms",
      titleEn: "Terms of Service & Astrological Ethics",
      titleHi: "सेवा नियम एवं आचार संहिता",
      contentEn:
        "All consultations and computational Janampatris are rendered strictly as advisory guidance rooted in canonical Vedanga Jyotish.",
      contentHi:
        "केंद्र द्वारा प्रस्तुत समस्त परामर्श शास्त्रीय मार्गदर्शन हेतु हैं। ज्योतिष जीवन निर्णयों में विवेकपूर्ण दिशा प्रदान करने वाली विद्या है।",
    },
    {
      slug: "privacy",
      titleEn: "Privacy Policy & Birth Data Confidentiality",
      titleHi: "गोपनीयता नीति एवं जन्म विवरण सुरक्षा",
      contentEn:
        "Your birth coordinates, family Gotra, and consultation queries are kept strictly confidential and never commercialized.",
      contentHi:
        "प्रत्येक जातक के जन्म समय, जन्म स्थान एवं व्यक्तिगत प्रश्नों की पूर्ण गोपनीयता रखी जाती है।",
    },
    {
      slug: "refund",
      titleEn: "Consultation Cancellation & Dakshina Policy",
      titleHi: "परामर्श निरस्तीकरण एवं दक्षिणा नीति",
      contentEn:
        "Appointments may be rescheduled or cancelled up to 24 hours prior to the slot. Custom handwritten Pothi preparations follow standard policy.",
      contentHi:
        "परामर्श समय से २४ घंटे पूर्व स्लॉट को पुनः निर्धारित अथवा निरस्त किया जा सकता है।",
    },
  ];

  for (const page of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      create: page,
      update: page,
    });
  }

  // 13. Blog Posts
  await prisma.blogPost.upsert({
    where: { slug: "navamsha-d9-destiny-secrets" },
    update: {},
    create: {
      slug: "navamsha-d9-destiny-secrets",
      titleEn: "Navamsha (D9): The Hidden Harmonic Chart of Destiny",
      titleHi: "नवमांश कुण्डली (डी-९): भाग्य एवं सूक्ष्म संस्कार का रहस्य",
      excerptEn: "Why the D9 Navamsha chart holds the ultimate key to matrimonial harmony and karmic fruitage.",
      excerptHi: "लग्न कुण्डली शरीर है तो नवमांश उसकी आत्मा। जानें विवाह और भाग्य निर्णय में नवमांश की महत्ता।",
      contentEn: `## The Ninth Harmonic Division\nIn canonical Vedic astrology, the Rashi (D1) chart represents the manifest tree, but the Navamsha (D9) chart reveals its hidden roots.\n\nDividing each 30° zodiac sign into 9 equal segments of 3°20' yields 108 padas matching the 108 syllables of the sacred Rigvedic metres.`,
      contentHi: `## नवम वर्ग की महत्ता\nवैदिक ज्योतिष में लग्न चक्र यदि वृक्ष है, तो नवमांश उसकी गहरी जड़ें हैं। प्रत्येक राशि के नौ समान भाग (३°२०') १०८ चरणों का निर्माण करते हैं।`,
      coverImage: "/images/blog-navamsha.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "surya-siddhanta-mathematics" },
    update: {},
    create: {
      slug: "surya-siddhanta-mathematics",
      titleEn: "Surya Siddhanta Mathematical Ephemeris vs Modern Modernity",
      titleHi: "सूर्य सिद्धान्त गणित एवं आधुनिक दृग्गणित समन्वय",
      excerptEn: "Unraveling the astronomical precision of Kashi ephemeris tables down to seconds of arc.",
      excerptHi: "काशी पंचांग परंपरा में कला-विकला स्तर की शुद्ध गणना का वैज्ञानिक आधार।",
      contentEn: `## Spherical Trigonometry in Ancient India\nThe Surya Siddhanta lays down rigorous trigonometric functions to compute the true apparent motions of the Sun and Moon.`,
      contentHi: `## प्राचीन भारतीय खगोल गणित\nसूर्य सिद्धान्त में जीवा, कोटिज्या एवं उत्क्रमज्या द्वारा सूर्य एवं चन्द्रमा की स्पष्ट गति की गणना का अद्भुत विधान है।`,
      coverImage: "/images/blog-siddhanta.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // 14. Media Gallery
  await prisma.mediaGalleryItem.deleteMany({});
  await prisma.mediaGalleryItem.createMany({
    data: [
      {
        titleEn: "Dashashwamedh Sanctum Altar",
        titleHi: "दशाश्वमेध घाट ज्योतिष पीठ वेदी",
        captionEn: "Morning ephemeris calculation ritual facing the Ganges.",
        captionHi: "माँ गंगा के पावन तट पर प्रातःकालीन पंचांग पठन एवं ग्रह वेदी।",
        imageUrl: "/images/gallery-1.jpg",
        orderIndex: 1,
      },
      {
        titleEn: "Handcrafted Palmleaf & Bound Manuscripts",
        titleHi: "हस्तलिखित पांडुलिपि एवं पोथी अभिलेख",
        captionEn: "Archival astronomical charts preserved over four decades.",
        captionHi: "चार दशकों से संरक्षित शुद्ध गणितीय चक्र एवं कुण्डली ग्रंथ।",
        imageUrl: "/images/gallery-2.jpg",
        orderIndex: 2,
      },
      {
        titleEn: "Vedic Scholar Conclave",
        titleHi: "काशी विद्वत् संगोष्ठी एवं कालनिर्णय",
        captionEn: "Senior Kendra team determining festival tithis and eclipse timings.",
        captionHi: "वरिष्ठ दैवज्ञों द्वारा ग्रहण एवं पर्व काल का सूक्ष्म निर्धारण।",
        imageUrl: "/images/gallery-3.jpg",
        orderIndex: 3,
      },
    ],
  });

  // 15. Pre-cache Panchang for Today in Varanasi
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  await prisma.panchangCache.upsert({
    where: {
      dateString_city: {
        dateString: todayStr,
        city: "varanasi",
      },
    },
    create: {
      dateString: todayStr,
      city: "varanasi",
      dataJson: {
        isDemo: true,
        date: todayStr,
        samvat: "Vikram Samvat 2083 (कालयुक्त)",
        tithi: "Shukla Paksha Trayodashi (शुक्ल त्रयोदशी)",
        tithiEndTime: "06:42 PM",
        paksha: "Shukla (शुक्ल पक्ष)",
        nakshatra: "Uttara Phalguni (उत्तराफाल्गुनी)",
        yoga: "Shobhana (शोभन)",
        karana: "Taitila (तैतिल)",
        vaar: "Shukravar (Friday / शुक्रवार)",
        abhijitMuhurat: "11:48 AM - 12:36 PM",
        rahuKaal: "10:42 AM - 12:08 PM",
        sunrise: "06:14 AM",
        sunset: "05:42 PM",
      },
    },
    update: {},
  });

  console.log("Database seeded successfully with all 6 order statuses, customer vault document, CMS models, and demo dataset!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
