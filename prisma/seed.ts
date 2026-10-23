import { PrismaClient, Role, DiscountType, BannerPosition, BannerType, MarqueePosition } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Maharshi Kanad Jyotish Kendra database...");

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
  const initialAdminPassword =
    process.env.INITIAL_ADMIN_PASSWORD || "ChangeMeInAdminSettings@2026";
  if (!process.env.INITIAL_ADMIN_PASSWORD && process.env.NODE_ENV === "production") {
    throw new Error(
      "INITIAL_ADMIN_PASSWORD environment variable must be set in production before seeding."
    );
  }

  const adminPasswordHash = await bcrypt.hash(initialAdminPassword, 10);
  await prisma.user.upsert({
    where: { email: "admin@kanad-jyotish.in" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@kanad-jyotish.in",
      name: "Acharya Admin (महर्षि कणाद पीठ)",
      phone: "+919827991224",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // Demo standard user
  const userPasswordHash = await bcrypt.hash("UserKanad@2026", 10);
  await prisma.user.upsert({
    where: { email: "aditya.sharma@example.com" },
    update: {},
    create: {
      email: "aditya.sharma@example.com",
      name: "Aditya Narayan Sharma",
      phone: "+917509124672",
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  // 3. Admin Settings
  // Real contact numbers from SRS: +91-9827991224 and +91-7509124672.
  // Location, Bank details and GSTIN are marked as sample seeds.
  await prisma.adminSettings.upsert({
    where: { id: "default" },
    update: {
      phone1: "+91-9827991224",
      phone2: "+91-7509124672",
    },
    create: {
      id: "default",
      siteNameEn: "Maharshi Kanad Jyotish Kendra",
      siteNameHi: "महर्षि कणाद ज्योतिष केंद्र",
      phone1: "+91-9827991224", // SRS Real Phone 1
      phone2: "+91-7509124672", // SRS Real Phone 2
      email: "vedic@kanad-jyotish.in",
      addressEn: "Kanad Bhavan, Dashashwamedh Ghat Marg, Varanasi, Uttar Pradesh 221001",
      addressHi: "कणाद भवन, दशाश्वमेध घाट मार्ग, वाराणसी, उत्तर प्रदेश २२१००१",
      city: "Varanasi",
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: "Asia/Kolkata",
      // --- PLACEHOLDER BANK & GST DETAILS (Update via Admin Settings) ---
      upiVpa: "kanadjyotish@sbi",
      bankAccountName: "Maharshi Kanad Jyotish Trust [SAMPLE PLACEHOLDER]",
      bankAccountNumber: "389201928410",
      bankIfsc: "SBIN0000201",
      bankName: "State Bank of India, Main Branch Varanasi",
      gstin: "09AAATM1234F1Z5", // SAMPLE PLACEHOLDER
      defaultGstRateBps: 1800, // 18.00%
    },
  });

  // 4. Services and Plans
  const srv1 = await prisma.service.upsert({
    where: { slug: "complete-janampatri" },
    update: {},
    create: {
      slug: "complete-janampatri",
      titleEn: "Complete Janampatri & Lifetime Kundli",
      titleHi: "सम्पूर्ण जन्मपत्रिका एवं षोडशवर्ग चक्र",
      taglineEn: "Comprehensive Lifetime Janampatri & Varshaphala Siddhanta",
      taglineHi: "वृहत पाराशरी एवं ताजिक वर्षफल सिद्धांत",
      descriptionEn: "Exhaustive astrological dossier mapping D1 Rashi down to D60 Shashtiamsa. In-depth analysis of Vimshottari Mahadasha cycles, planetary friendships, and lifelong milestones.",
      descriptionHi: "डी१ लग्न से लेकर डी६० षष्ट्यंश तक सूक्ष्म चक्रों का गहन विश्लेषण। विंशोत्तरी महादशा-अंतर्दशा क्रम तथा जीवन के महत्वपूर्ण कालखण्डों का शास्त्रीय निरूपण।",
      icon: "auto_stories",
      orderIndex: 1,
      isActive: true,
      plans: {
        create: [
          {
            slug: "samanya",
            titleEn: "Samanya (Basic Digital)",
            titleHi: "सामान्य प्रति (डिजिटल)",
            descriptionEn: "Ideal for foundational natal planetary positions and essential dasha timelines.",
            descriptionHi: "मूलभूत ग्रह स्थिति एवं मुख्य दशा क्रम हेतु उपयोगी डिजिटल संस्करण।",
            pricePaise: 110000, // Rs 1,100
            originalPricePaise: 150000,
            deliveryDays: 3,
            pages: 18,
            hasCall: false,
            featuresEn: [
              "18-Page Computational Natal Horoscope (PDF)",
              "3 Working Days Turnaround Time",
              "D1 Lagna + D9 Navamsha Analysis",
              "No Live Acharya Session",
              "No Postal Physical Book",
            ],
            featuresHi: [
              "१८ पृष्ठ संगणित जन्मपत्री (PDF डाउनलोड)",
              "३ कार्यदिवस में उपलब्धता",
              "D1 लग्न व D9 नवांश चक्र विवरण",
              "प्रत्यक्ष ज्योतिषी परामर्श सम्मिलित नहीं",
              "डाक द्वारा भौतिक प्रेषण अनुपलब्ध",
            ],
            isPopular: false,
            orderIndex: 1,
          },
          {
            slug: "vishesh",
            titleEn: "Vishesh (Detailed Hybrid)",
            titleHi: "सटीक विस्तृत (विशेषांक)",
            descriptionEn: "Definitive bundle: handbound archival manuscript book shipped to home + 30-min 1-on-1 Acharya consultation.",
            descriptionHi: "हस्तलिखित काष्ठ जिल्द पोथी ग्रंथ घर पर प्रेषित + ३० मिनट वरिष्ठ ज्योतिर्विद् प्रत्यक्ष दूरभाष संवाद।",
            pricePaise: 210000, // Rs 2,100
            originalPricePaise: 280000,
            deliveryDays: 5,
            pages: 45,
            hasCall: true,
            callDurationMinutes: 30,
            featuresEn: [
              "45+ Page Spiral Bound Laminated Pothi Manual",
              "30-Minute Direct Acharya Telephone / Video Advisory",
              "Free Speed Post Shipping across India",
              "Personalized Gemstone & Vedic Yantra Prescription",
              "10-Year Vimshottari Mahadasha & Transit Forecast",
            ],
            featuresHi: [
              "४५+ पृष्ठ सर्पिलाकार लेमिनेटेड पोथी ग्रंथ",
              "३० मिनट प्रत्यक्ष आचार्य दूरभाष/वीडियो परामर्श",
              "स्पीड पोस्ट द्वारा भारत भर में निःशुल्क प्रेषण",
              "व्यक्तिगत रत्न एवं सिद्ध यंत्र अनुशंसा",
              "१०-वर्षीय विंशोत्तरी दशा व गोचर फलादेश",
            ],
            isPopular: true,
            orderIndex: 2,
          },
          {
            slug: "rajasi",
            titleEn: "Rajasi (Imperial Lifetime)",
            titleHi: "राजकीय संपूर्ण (आजीवन)",
            descriptionEn: "Bound in deluxe faux-leather with gold foil, 60-min video session, and birth-time rectification.",
            descriptionHi: "स्वर्णमंडित लेदरेट बाइंडिंग महाग्रंथ, ६० मिनट आचार्य वीडियो सत्र एवं सूक्ष्म जन्म समय शोधन।",
            pricePaise: 510000, // Rs 5,100
            originalPricePaise: 650000,
            deliveryDays: 7,
            pages: 90,
            hasCall: true,
            callDurationMinutes: 60,
            featuresEn: [
              "90+ Page Gold-Foil Leatherette Grand Manual",
              "60-Minute 1-on-1 Chief Daivajna Video Session",
              "Birth-Time Rectification (BTR) by Tattva Shodhana",
              "120-Year Full Lifetime Dasha & All 16 Divisional Charts (D1-D60)",
              "Certified Gemstone Audit & Energized Copper Yantra",
            ],
            featuresHi: [
              "९०+ पृष्ठ स्वर्णमंडित लेदरेट बाइंडिंग महाग्रंथ",
              "६० मिनट १-on-१ मुख्य ज्योतिषाचार्य वीडियो सत्र",
              "सूक्ष्म जन्म समय शोधन (BTR)",
              "आजीवन १२०-वर्ष विंशोत्तरी दशा व पूर्ण षोडशवर्ग (D1-D60)",
              "प्रमाणित रत्न परीक्षण रिपोर्ट व तांत्रिक सुरक्षा यंत्र",
            ],
            isPopular: false,
            orderIndex: 3,
          },
        ],
      },
    },
  });

  const srv2 = await prisma.service.upsert({
    where: { slug: "career-business-raj-yoga" },
    update: {},
    create: {
      slug: "career-business-raj-yoga",
      titleEn: "Career, Business & Raj Yoga Consultation",
      titleHi: "कर्मभाव, व्यवसाय एवं राजयोग परीक्षण",
      taglineEn: "Specialized diagnosis of 10th House, Amatyakaraka & D10",
      taglineHi: "दशम कर्मभाव, अमात्यकारक एवं दशमांश चक्र का सूक्ष्म परीक्षण",
      descriptionEn: "Pinpoints golden professional transits, Sade Sati mitigation, leadership ascension windows, and venture feasibility.",
      descriptionHi: "व्यापार में सफलता, पदोन्नति का समय, साढ़ेसाती का प्रभाव तथा व्यापारिक साझेदारी की अनुकूलता का शास्त्रीय मार्गदर्शन।",
      icon: "trending_up",
      orderIndex: 2,
      isActive: true,
      plans: {
        create: [
          {
            slug: "career-standard",
            titleEn: "Career Diagnosis & 30-Min Advisory",
            titleHi: "कर्मभाव परीक्षण एवं ३० मि. परामर्श",
            descriptionEn: "Complete 10th house karmasthana and Dashamsha (D10) report + live Acharya discussion.",
            descriptionHi: "दशमांश विश्लेषण एवं ३० मिनट वरिष्ठ आचार्य प्रत्यक्ष विमर्श।",
            pricePaise: 150000, // Rs 1,500
            originalPricePaise: 200000,
            deliveryDays: 2,
            pages: 15,
            hasCall: true,
            callDurationMinutes: 30,
            featuresEn: [
              "10th House Karmabhava & Dashamsha (D10) Audit",
              "Sade Sati Impact & Shani Shanti Measures",
              "Direct 30-Min Session with Senior Acharya",
            ],
            featuresHi: [
              "दशम भाव व दशमांश (D10) विस्तृत चक्र",
              "शनि साढ़ेसाती प्रभाव व शांति विधान",
              "३० मिनट प्रत्यक्ष ज्योतिषी वार्ता",
            ],
            isPopular: true,
            orderIndex: 1,
          },
        ],
      },
    },
  });

  const srv3 = await prisma.service.upsert({
    where: { slug: "kundli-matching" },
    update: {},
    create: {
      slug: "kundli-matching",
      titleEn: "Kundli Milan & Marriage Harmony",
      titleHi: "अष्टकूट ३६ गुण मिलान एवं दाम्पत्य विचार",
      taglineEn: "Ashtakoot 36-Guna assessment paired with Nadi Dosha cancellations",
      taglineHi: "अष्टकूट ३६ गुण मिलान, नाड़ी दोष परिहार एवं नवांश सामंजस्य",
      descriptionEn: "Moving beyond superficial point systems: rigorous Ashtakoot 36-Guna assessment paired with Nadi Dosha cancellations, Bhakoot examination, and D9 Navamsha mutual compatibility to ensure marital longevity.",
      descriptionHi: "केवल गुण अंक नहीं, अपितु नाड़ी दोष परिहार, भकूट शुद्धि, मंगल दोष विचार एवं नवम-पंचम योग का समग्र शास्त्रीय निर्णय।",
      icon: "favorite",
      orderIndex: 3,
      isActive: true,
      plans: {
        create: [
          {
            slug: "milan-standard",
            titleEn: "Ashtakoot Milan Report",
            titleHi: "अष्टकूट मिलान पत्र",
            descriptionEn: "Complete 36-Guna Milapak scorecard with Manglik dosha cancellation verdict.",
            descriptionHi: "३६ गुण मिलान स्कोरकार्ड एवं भौम दोष परिहार निर्णय।",
            pricePaise: 110000, // Rs 1,100
            originalPricePaise: 150000,
            deliveryDays: 1,
            pages: 12,
            hasCall: false,
            featuresEn: [
              "Ashtakoot 36 Guna Milapak Score Sheet",
              "Manglik Dosha Cancellation Verdict",
              "Navamsha D9 Progeny & Mental Alignment Verdict",
            ],
            featuresHi: [
              "अष्टकूट ३६ गुण मिलान तालिका",
              "भौम (मंगल) दोष परिहार निर्णय",
              "D9 नवांश संतान व मानसिक सामंजस्य परीक्षण",
            ],
            isPopular: true,
            orderIndex: 1,
          },
        ],
      },
    },
  });

  const srv4 = await prisma.service.upsert({
    where: { slug: "prashna-kundli" },
    update: {},
    create: {
      slug: "prashna-kundli",
      titleEn: "Prashna Kundli / Horary Astrology",
      titleHi: "तात्कालिक प्रश्न शास्त्र समाधान",
      taglineEn: "Direct answers cast at the canonical moment of question intake at Varanasi",
      taglineHi: "काशी पंचांग के तात्कालिक कालखंड पर आधारित सटीक प्रश्न विचार",
      descriptionEn: "When exact birth time is missing or an urgent dilemma requires immediate resolution (litigation, missing objects, transaction success). Cast strictly using the canonical moment of question intake at Varanasi.",
      descriptionHi: "जब जन्म समय अज्ञात हो अथवा तात्कालिक संकट का शीघ्र निर्णय चाहिए। प्रश्न समय की ग्रह स्थिति से समाधान।",
      icon: "help_center",
      orderIndex: 4,
      isActive: true,
      plans: {
        create: [
          {
            slug: "prashna-single",
            titleEn: "Single Prashna Same-Day Verdict",
            titleHi: "एकल प्रश्न समाधान (उसी दिन)",
            descriptionEn: "Direct Yes/No likelihood & definitive timeframe window with audio memo + written PDF.",
            descriptionHi: "स्पष्ट हाँ/ना सम्भावना, समयावधि एवं ऑडियो वॉइस नोट सहित लिखित PDF।",
            pricePaise: 85000, // Rs 850
            originalPricePaise: 110000,
            deliveryDays: 1,
            pages: 5,
            hasCall: false,
            featuresEn: [
              "Prashna Arudha and Tajik Itthasala Yoga Analysis",
              "Direct Yes/No Likelihood & Definitive Timeframe",
              "Audio Memo + Written PDF Response within 6 Hours",
            ],
            featuresHi: [
              "आरूढ़ एवं ताजिक इत्थशाल योग विश्लेषण",
              "स्पष्ट फलादेश एवं काल-अवधि",
              "६ घंटे में ऑडियो संदेश व लिखित PDF",
            ],
            isPopular: true,
            orderIndex: 1,
          },
        ],
      },
    },
  });

  // 5. Offers (all money in paise)
  await prisma.offer.upsert({
    where: { code: "VEDIC2025" },
    update: {},
    create: {
      code: "VEDIC2025",
      titleEn: "Kashi Mahotsav Special Discount (Flat ₹500 Off)",
      titleHi: "काशी महोत्सव विशेष छूट (सपाट ₹500 छूट)",
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

  // 6. Marquee Announcements
  await prisma.marqueeItem.deleteMany({});
  await prisma.marqueeItem.createMany({
    data: [
      {
        textEn: "Special Notice: Registration open for Guru-Shani transit Maha-Yajna at Dashashwamedh Ghat",
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
        textHi: "शुद्ध सूर्य सिद्धान्त सम्मत ज्येष्ठ मास विवाह एवं गृह प्रवेश शुभ मुहूर्त तालिका प्रकाशित",
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

  // 7. Sample Testimonials (Unverified sample seed data)
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: [
      {
        authorNameEn: "Sample Client (Bengaluru)",
        authorNameHi: "यजमान (बेंगलुरु)",
        authorTitleEn: "Client • Career Analysis",
        authorTitleHi: "यजमान • कर्मभाव विश्लेषण",
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
        authorNameHi: "यजमान (लंदन)",
        authorTitleEn: "Client • Birth Time Rectification",
        authorTitleHi: "यजमान • जन्म समय शोधन",
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
        authorNameHi: "यजमान (काशी)",
        authorTitleEn: "Client • Kundli Matching",
        authorTitleHi: "यजमान • कुण्डली मिलान",
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

  console.log("Database seeded successfully with services, plans, offers, marquee, and real SRS contacts!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
