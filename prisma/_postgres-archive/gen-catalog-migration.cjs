/* NOTE: migration 11 is already applied on the live database. Do not regenerate it; add a new migration instead. */
/* eslint-disable */
/**
 * Generates prisma/migrations/11_real_catalog/migration.sql: the Kendra's real services, plans, other
 * services, FAQ and contact details, taken from the client's own site (maharshikanadjyotishkendra.online).
 * Everything is idempotent (safe to run twice) and never deletes: old sample services are only switched off.
 */
const fs = require("fs");
const path = require("path");

const q = (s) => (s === null || s === undefined ? "NULL" : `$q$${s}$q$`);
const arr = (a) => (a.length ? `ARRAY[${a.map(q).join(",")}]::text[]` : "ARRAY[]::text[]");
const id = (kind, slug) => `'cat_' || md5('${kind}:${slug}')`;

const FEATURES_EN = ["Basic analysis", "Digital summary", "Consultation guidance"];
const FEATURES_HI = ["मूल विश्लेषण", "डिजिटल सारांश", "परामर्श मार्गदर्शन"];

const services = [
  {
    slug: "janam-kundli",
    titleEn: "Janam Kundli",
    titleHi: "जन्म कुंडली",
    taglineEn: "Birth Kundli plans",
    taglineHi: "जन्म कुंडली योजनाएँ",
    descEn: "Professionally prepared birth chart based on accurate birth details and traditional Vedic principles. Choose a plan according to the depth of report and consultation required.",
    descHi: "सही जन्म विवरण और पारंपरिक वैदिक सिद्धांतों पर आधारित व्यावसायिक जन्म कुंडली। रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।",
    order: 1,
    plans: [
      ["basic-kundli", "Basic Kundli", "बेसिक कुंडली", 501, 3, false],
      ["detailed-kundli", "Detailed Kundli", "विस्तृत कुंडली", 1101, 5, true],
      ["premium-kundli", "Premium Kundli", "प्रीमियम कुंडली", 2101, 7, false],
    ],
  },
  {
    slug: "prashna-kundli",
    titleEn: "Prashn Kundli",
    titleHi: "प्रश्न कुंडली",
    taglineEn: "For one clear question",
    taglineHi: "एक स्पष्ट प्रश्न के लिए",
    descEn: "Focused astrology consultation for one specific question. Choose the required depth of analysis.",
    descHi: "किसी एक विशेष प्रश्न के लिए केंद्रित ज्योतिष परामर्श। आवश्यक गहराई के अनुसार योजना चुनें।",
    order: 2,
    plans: [
      ["basic-prashn", "Basic Prashn", "बेसिक प्रश्न", 301, 2, false],
      ["detailed-prashn", "Detailed Prashn", "विस्तृत प्रश्न", 501, 3, true],
      ["premium-prashn", "Premium Prashn", "प्रीमियम प्रश्न", 1101, 5, false],
    ],
  },
  {
    slug: "kundli-matching",
    titleEn: "Kundli Matching",
    titleHi: "कुंडली मिलान",
    taglineEn: "Compatibility for marriage planning",
    taglineHi: "विवाह के लिए अनुकूलता विश्लेषण",
    descEn: "Traditional compatibility analysis for marriage planning (Ashtakoot Guna Milan, Manglik and Nadi considerations).",
    descHi: "विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण (अष्टकूट गुण मिलान, मांगलिक एवं नाड़ी विचार)।",
    order: 3,
    plans: [
      ["basic-matching", "Basic Matching", "बेसिक मिलान", 501, 3, false],
      ["detailed-matching", "Detailed Matching", "विस्तृत मिलान", 1101, 5, true],
      ["premium-matching", "Premium Matching", "प्रीमियम मिलान", 2101, 7, false],
    ],
  },
];

const others = [
  ["puja-services", "Puja Services", "पूजा सेवाएँ", "Traditional Puja arrangements for family and spiritual requirements.", "पारिवारिक एवं आध्यात्मिक आवश्यकताओं के लिए पारंपरिक पूजा व्यवस्था।", null, null],
  ["paath", "Paath", "पाठ", "Sacred religious recitation and Paath services.", "पवित्र धार्मिक पाठ एवं पाठ सेवाएँ।", null, null],
  ["yagya-anushthan", "Yagya Anushthan", "यज्ञ अनुष्ठान", "Vedic Yagya and Anushthan arranged according to purpose.", "उद्देश्य के अनुसार वैदिक यज्ञ एवं अनुष्ठान।", null, null],
  ["katha", "Katha", "कथा", "Sacred Katha and devotional discourse.", "पवित्र कथा एवं भक्ति प्रवचन।", null, null],
  ["mantra-jap", "Mantra Jap", "मंत्र जप", "Traditional mantra chanting with Sankalp and prescribed count.", "संकल्प एवं निर्धारित संख्या के साथ पारंपरिक मंत्र जप।", null, null],
  ["rudra-mahabhishek", "Rudra Mahabhishek", "रुद्र महाभिषेक", "Sacred Rudra Mahabhishek with Vedic mantras.", "वैदिक मंत्रों के साथ पवित्र रुद्र महाभिषेक।", null, null],
  ["navratri-anushthan", "Navratri Anushthan", "नवरात्रि अनुष्ठान", "Special Navratri worship and spiritual observances.", "नवरात्रि की विशेष पूजा एवं आध्यात्मिक अनुष्ठान।", null, null],
  ["bhagavad-mahapurana-gyan-yagya", "Shrimad Bhagavad Mahapurana Gyan Yagya", "श्रीमद्भागवत महापुराण ज्ञान यज्ञ", "Bhagavad Mahapurana Katha and Gyan Yagya.", "भागवत महापुराण कथा एवं ज्ञान यज्ञ।", null, null],
  ["valmiki-ramayana", "Shrimad Valmiki Ramayana", "श्रीमद् वाल्मीकि रामायण", "Sacred recitation and Katha of Shrimad Valmiki Ramayana.", "श्रीमद् वाल्मीकि रामायण का पवित्र पाठ एवं कथा।", null, null],
  ["astrology", "Astrology", "ज्योतिष", "Personalized Vedic astrology guidance for important life decisions.", "जीवन के महत्वपूर्ण निर्णयों के लिए व्यक्तिगत वैदिक ज्योतिष मार्गदर्शन।", "/ref/astrology.webp", null],
  ["vastu-shastra", "Vastu Shastra", "वास्तु शास्त्र", "Vastu guidance for homes, offices and commercial spaces.", "घर, कार्यालय एवं व्यावसायिक स्थानों के लिए वास्तु मार्गदर्शन।", "/ref/vastu.webp", null],
  ["matrimonial-service", "Matrimonial Services", "वैवाहिक सेवाएँ", "Support through the Vindhya Vivah Sanskar platform (matrimonial website and Android application).", "विंध्य विवाह संस्कार प्लेटफ़ॉर्म के माध्यम से सहयोग (वैवाहिक वेबसाइट एवं एंड्रॉइड ऐप)।", null, "https://vindhyavivahsanskar.com"],
  ["bharat-darshan-teerth-yatra", "Bharat Darshan Teerth Yatra", "भारत दर्शन तीर्थ यात्रा", "Pilgrimage and religious-tour service support.", "तीर्थ यात्रा एवं धार्मिक यात्रा सेवा सहयोग।", null, "https://bharatdarshanmpcg.org"],
  ["vehicle-service", "Vehicle Service", "वाहन सेवा", "Vehicle assistance for local, outstation and pilgrimage travel.", "स्थानीय, बाहरी एवं तीर्थ यात्रा के लिए वाहन सहायता।", null, null],
  ["driver-service", "Driver Service", "ड्राइवर सेवा", "Driver assistance according to timing and availability.", "समय एवं उपलब्धता के अनुसार ड्राइवर सहायता।", null, null],
  ["itr-help-desk", "Income Tax Return Filing Help Desk", "आयकर रिटर्न फाइलिंग हेल्प डेस्क", "ITR document coordination and filing assistance help desk.", "आईटीआर दस्तावेज़ समन्वय एवं फाइलिंग सहायता डेस्क।", null, null],
];

const faqs = [
  ["What details are required for Janam Kundli?", "जन्म कुंडली के लिए कौन-सा विवरण चाहिए?", "Full name, date of birth, exact time of birth and place of birth are normally required.", "पूरा नाम, जन्म तिथि, जन्म का सही समय और जन्म स्थान सामान्यतः आवश्यक होते हैं।", "KUNDLI"],
  ["How does Prashn Kundli work?", "प्रश्न कुंडली कैसे काम करती है?", "Choose a plan, submit one clear question and confirm the consultation timing.", "योजना चुनें, एक स्पष्ट प्रश्न भेजें और परामर्श का समय पक्का करें।", "KUNDLI"],
  ["Can I book through WhatsApp?", "क्या मैं व्हाट्सऐप से बुकिंग कर सकता हूँ?", "Yes. Booking buttons prepare a WhatsApp enquiry.", "हाँ। बुकिंग बटन से व्हाट्सऐप पर पूछताछ तैयार हो जाती है।", "GENERAL"],
  ["Are Vehicle and Driver services available?", "क्या वाहन और ड्राइवर सेवाएँ उपलब्ध हैं?", "Yes, subject to route, timing and availability.", "हाँ, मार्ग, समय और उपलब्धता के अनुसार।", "GENERAL"],
  ["How is payment handled?", "भुगतान कैसे होता है?", "Confirm the service, schedule and final fee before payment.", "भुगतान से पहले सेवा, समय और अंतिम शुल्क की पुष्टि करें।", "PAYMENT"],
];

let sql = "-- The Kendra's real services, plans, FAQ and contact details (from the client's own site).\n-- Idempotent. Nothing is deleted: the old sample services are only switched off.\n\n";

for (const s of services) {
  sql += `INSERT INTO "Service" ("id","slug","titleEn","titleHi","taglineEn","taglineHi","descriptionEn","descriptionHi","highlightsEn","highlightsHi","orderIndex","isActive","updatedAt")
VALUES (${id("service", s.slug)}, ${q(s.slug)}, ${q(s.titleEn)}, ${q(s.titleHi)}, ${q(s.taglineEn)}, ${q(s.taglineHi)}, ${q(s.descEn)}, ${q(s.descHi)}, ${arr(FEATURES_EN)}, ${arr(FEATURES_HI)}, ${s.order}, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","taglineEn"=EXCLUDED."taglineEn","taglineHi"=EXCLUDED."taglineHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","highlightsEn"=EXCLUDED."highlightsEn","highlightsHi"=EXCLUDED."highlightsHi","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();\n\n`;
  s.plans.forEach((p, i) => {
    const [pslug, tEn, tHi, price, days, popular] = p;
    sql += `INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES (${id("plan", s.slug + "/" + pslug)}, (SELECT "id" FROM "Service" WHERE "slug"=${q(s.slug)}), ${q(pslug)}, ${q(tEn)}, ${q(tHi)}, ${q(s.descEn)}, ${q(s.descHi)}, ${price * 100}, ${days}, false, ${arr(FEATURES_EN)}, ${arr(FEATURES_HI)}, ${popular}, ${i}, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();\n\n`;
  });
}

// Switch off the old sample catalogue (kept, so past orders still show their service)
sql += `UPDATE "Service" SET "isActive"=false,"updatedAt"=NOW() WHERE "slug" IN ('complete-janampatri','career-business-raj-yoga');
UPDATE "Plan" SET "isActive"=false,"updatedAt"=NOW() WHERE "slug"='milan-report';\n\n`;

others.forEach((o, i) => {
  const [slug, tEn, tHi, dEn, dHi, img, url] = o;
  sql += `INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES (${id("other", slug)}, ${q(slug)}, ${q(tEn)}, ${q(tHi)}, ${q(dEn)}, ${q(dHi)}, ${q(img)}, ${q(url)}, ${i + 1}, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();\n\n`;
});

faqs.forEach((f, i) => {
  sql += `INSERT INTO "FaqItem" ("id","questionEn","questionHi","answerEn","answerHi","category","orderIndex","isActive","updatedAt")
SELECT ${id("faq", String(i))}, ${q(f[0])}, ${q(f[1])}, ${q(f[2])}, ${q(f[3])}, ${q(f[4])}, ${i + 1}, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem" WHERE "questionEn"=${q(f[0])});\n\n`;
});

// Sample content from the first build (Varanasi notices, placeholder banners and photos, sample reviews and codes)
// is switched off or replaced, never deleted.
sql += `UPDATE "MarqueeItem" SET "textEn"=${q("Vedic Astrology • Janam Kundli • Prashn Kundli • Kundli Matching • Puja • Paath • Yagya • Vastu • Call +91 98279 91224")}, "textHi"=${q("वैदिक ज्योतिष • जन्म कुंडली • प्रश्न कुंडली • कुंडली मिलान • पूजा • पाठ • यज्ञ • वास्तु • संपर्क +91 98279 91224")}
WHERE "id" = (SELECT "id" FROM "MarqueeItem" WHERE "textEn" LIKE '%Dashashwamedh%' ORDER BY "createdAt" LIMIT 1);
UPDATE "MarqueeItem" SET "textEn"=${q("Book online or enquire on WhatsApp • Matrimonial and Bharat Darshan services available • Bhilai, Durg, Chhattisgarh")}, "textHi"=${q("ऑनलाइन बुक करें या व्हाट्सऐप पर पूछें • वैवाहिक एवं भारत दर्शन सेवाएँ उपलब्ध • भिलाई, दुर्ग, छत्तीसगढ़")}
WHERE "textEn" LIKE '%Surya Siddhanta%';
UPDATE "Banner" SET "isActive"=false WHERE "imageUrl" LIKE '/images/banner-%';
UPDATE "MediaGalleryItem" SET "isActive"=false WHERE "imageUrl" LIKE '/images/gallery-%';
UPDATE "Testimonial" SET "isActive"=false WHERE "authorNameEn" LIKE 'Sample Client%';
UPDATE "Offer" SET "isActive"=false WHERE "code" IN ('SHUBH500','JYOTISH500');
`;

// Contact details: only replace the original sample values, never an address the client already typed
sql += `UPDATE "AdminSettings" SET
  "email"='sntiwarigevra61@gmail.com',
  "addressEn"='Bhilai, Durg, Chhattisgarh',
  "addressHi"='भिलाई, दुर्ग, छत्तीसगढ़',
  "city"='Bhilai',
  "latitude"=21.2092,
  "longitude"=81.3784,
  "mapLatitude"=21.2092,
  "mapLongitude"=81.3784,
  "mapLabelEn"='Maharshi Kanad Jyotish Kendra, Bhilai',
  "mapLabelHi"='महर्षि कणाद ज्योतिष केंद्र, भिलाई',
  "updatedAt"=NOW()
WHERE "id"='default' AND "addressEn" LIKE 'Kanad Bhavan%';
`;

const dir = path.join(__dirname, "..", "prisma", "migrations", "11_real_catalog");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "migration.sql"), sql, "utf8");
console.log("written", sql.length, "bytes");
