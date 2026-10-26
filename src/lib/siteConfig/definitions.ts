import { safeHref } from "@/lib/content/richText";

/**
 * Website settings the super admin can change without touching code.
 * Each section is a list of simple fields; one generic screen renders them all.
 * Pure module (no database) so it can be shared by the admin screen, the API and tests.
 */

export type FieldType = "text" | "textarea" | "url" | "link" | "toggle" | "number" | "color" | "image";

export interface FieldDef {
  key: string;
  en: string;
  hi: string;
  type: FieldType;
  max?: number;
  def?: string | boolean | number;
  help?: string;
  /** Text boxes that accept links ([words](address)) and bold (**words**). */
  rich?: boolean;
}

export interface SectionDef {
  id: string;
  en: string;
  hi: string;
  noteEn?: string;
  noteHi?: string;
  /** Sections that only point to another admin screen. */
  link?: { href: string; en: string; hi: string };
  fields: FieldDef[];
}

const bi = (key: string, en: string, hi: string, type: FieldType = "text", max = 300, def?: string | boolean | number, rich = false): FieldDef[] => [
  { key: `${key}En`, en: `${en} (English)`, hi: `${hi} (अंग्रेज़ी)`, type, max, def, rich },
  { key: `${key}Hi`, en: `${en} (Hindi)`, hi: `${hi} (हिंदी)`, type, max, rich },
];

export const SECTIONS: SectionDef[] = [
  {
    id: "logo",
    en: "Logo",
    hi: "लोगो",
    noteEn: "Upload a logo with Admin → Media (any image), then paste its address here. Leave empty to use the default logo.",
    noteHi: "लोगो बदलने के लिए इमेज अपलोड करके उसका पता यहाँ डालें। खाली छोड़ने पर पुराना लोगो रहेगा।",
    fields: [
      { key: "logoUrl", en: "Logo image", hi: "लोगो इमेज", type: "image" },
      { key: "faviconUrl", en: "Browser tab icon", hi: "ब्राउज़र आइकन", type: "image" },
    ],
  },
  {
    id: "home",
    en: "Home page",
    hi: "होम पेज",
    fields: [
      ...bi("announcement", "Highlight strip below the top banner", "ऊपर की विशेष पट्टी", "text", 200),
      { key: "showSocialStrip", en: "Show social media row on the home page", hi: "होम पेज पर सोशल मीडिया दिखाएँ", type: "toggle", def: true },
    ],
  },
  {
    id: "general",
    en: "General",
    hi: "सामान्य सेटिंग",
    fields: [
      ...bi("tagline", "Tagline", "टैगलाइन", "text", 160),
      ...bi("footerNote", "Footer note", "फुटर संदेश", "textarea", 400),
      ...bi("copyright", "Copyright line", "कॉपीराइट पंक्ति", "text", 200),
    ],
  },
  {
    id: "contact",
    en: "Contact",
    hi: "संपर्क",
    noteEn: "Phone, email, address and the map are in Settings. These are extra details for the Contact page.",
    noteHi: "फ़ोन, ईमेल, पता और नक्शा 'सेटिंग्स' में हैं। यहाँ संपर्क पेज की अतिरिक्त जानकारी है।",
    fields: [
      ...bi("workingHours", "Working hours", "कार्य समय", "text", 200),
      ...bi("contactNote", "Note shown on Contact page", "संपर्क पेज का संदेश", "textarea", 500),
      { key: "supportEmail", en: "Support email", hi: "सहायता ईमेल", type: "text", max: 120 },
    ],
  },
  { id: "social", en: "Social media", hi: "सोशल मीडिया", fields: [] },
  {
    id: "menu",
    en: "Main menu links",
    hi: "मुख्य मेन्यू के लिंक",
    noteEn: "The links in the top menu. Add, remove, rename or reorder them. If you remove everything the standard menu returns.",
    noteHi: "ऊपर के मेन्यू के लिंक। जोड़ें, हटाएँ, नाम बदलें या क्रम बदलें। सब हटा दें तो डिफ़ॉल्ट मेन्यू लौट आएगा।",
    fields: [],
  },
  {
    id: "footerLinks",
    en: "Extra footer links",
    hi: "फुटर के अतिरिक्त लिंक",
    noteEn: "An extra 'More links' list in the footer, for example your WhatsApp group, a YouTube video or another website.",
    noteHi: "फुटर में 'और लिंक' की सूची, जैसे आपका व्हाट्सऐप ग्रुप, यूट्यूब वीडियो या कोई दूसरी वेबसाइट।",
    fields: [],
  },
  {
    id: "seo",
    en: "SEO",
    hi: "एसईओ (खोज में दिखना)",
    fields: [
      ...bi("metaTitle", "Page title", "पेज शीर्षक", "text", 70),
      ...bi("metaDescription", "Description for Google", "गूगल के लिए विवरण", "textarea", 200),
      { key: "keywords", en: "Keywords (comma separated)", hi: "कीवर्ड (कॉमा से अलग)", type: "textarea", max: 400 },
      { key: "shareImage", en: "Share image (WhatsApp/Facebook)", hi: "शेयर इमेज", type: "image" },
      { key: "googleVerification", en: "Google Search Console code", hi: "गूगल सर्च कंसोल कोड", type: "text", max: 120 },
    ],
  },
  {
    id: "content",
    en: "Content",
    hi: "कंटेंट",
    noteEn: "Services, blog, gallery, FAQ and pages have their own screens in the Admin menu.",
    noteHi: "सेवाएँ, ब्लॉग, गैलरी, FAQ और पेज एडमिन मेनू में अलग से हैं।",
    fields: [
      ...bi("aboutShort", "Short about text", "संक्षिप्त परिचय", "textarea", 600),
      ...bi("missionText", "Mission text", "उद्देश्य", "textarea", 600),
    ],
  },
  {
    id: "features",
    en: "Features",
    hi: "सुविधाएँ चालू/बंद",
    fields: [
      { key: "showFloatingButtons", en: "Floating Call / WhatsApp / Chat buttons", hi: "फ्लोटिंग कॉल/व्हाट्सऐप/चैट बटन", type: "toggle", def: true },
      { key: "showCredentialsLink", en: "Credentials link in footer", hi: "फुटर में प्रमाणपत्र लिंक", type: "toggle", def: true },
      { key: "showBlogLink", en: "Blog link in menus", hi: "मेनू में ब्लॉग", type: "toggle", def: true },
    ],
  },
  {
    id: "business",
    en: "Business",
    hi: "व्यवसाय जानकारी",
    noteEn: "GST number, bank and UPI are in Settings. Extra business details to show on the site:",
    noteHi: "GST, बैंक और UPI 'सेटिंग्स' में हैं। यहाँ अन्य व्यवसाय जानकारी है:",
    fields: [
      ...bi("businessName", "Registered business name", "पंजीकृत व्यवसाय नाम", "text", 160),
      { key: "ownerName", en: "Owner / proprietor", hi: "स्वामी / प्रोपराइटर", type: "text", max: 120 },
      { key: "msmeNumber", en: "MSME / Udyam number", hi: "MSME / उद्यम संख्या", type: "text", max: 60 },
      { key: "foundedYear", en: "Year started", hi: "स्थापना वर्ष", type: "number", def: 0 },
    ],
  },
  {
    id: "analytics",
    en: "Analytics",
    hi: "एनालिटिक्स",
    noteEn: "The Google Analytics ID is saved under Admin → API keys. Here you manage what is tracked.",
    noteHi: "गूगल एनालिटिक्स ID 'API कीज़' में रखी जाती है। यहाँ ट्रैकिंग नियंत्रित करें।",
    fields: [
      { key: "trackingEnabled", en: "Allow visitor statistics", hi: "विज़िटर आँकड़े चालू", type: "toggle", def: true },
    ],
  },
  {
    id: "legal",
    en: "Legal pages",
    hi: "कानूनी पेज",
    noteEn: "Privacy policy, terms, refund policy and disclaimer are edited in Pages.",
    noteHi: "प्राइवेसी पॉलिसी, नियम-शर्तें, रिफंड नीति आदि 'पेज' में बदलें।",
    link: { href: "/admin/pages", en: "Open Pages", hi: "पेज खोलें" },
    fields: [
      ...bi("disclaimer", "Short disclaimer shown in footer", "फुटर की संक्षिप्त सूचना", "textarea", 500),
    ],
  },
  {
    id: "heroAnimation",
    en: "Hero animation",
    hi: "हीरो एनिमेशन",
    fields: [
      { key: "enabled", en: "Show the large Om mark behind the headline", hi: "शीर्षक के पीछे बड़ा ॐ चिह्न दिखाएँ", type: "toggle", def: true },
      { key: "glow", en: "Soft glow behind headline", hi: "शीर्षक के पीछे हल्की चमक", type: "toggle", def: false },
      { key: "accent", en: "Small heading colour", hi: "छोटे शीर्षक का रंग", type: "color", def: "#F4C65D" },
    ],
  },
  {
    id: "hero",
    en: "Hero content",
    hi: "हीरो कंटेंट",
    noteEn: "Leave a box empty to keep the standard wording.",
    noteHi: "डिफ़ॉल्ट शब्द रखने के लिए खाली छोड़ें।",
    fields: [
      ...bi("eyebrow", "Small heading", "छोटा शीर्षक", "text", 120),
      ...bi("title", "Main heading", "मुख्य शीर्षक", "text", 160),
      ...bi("lead", "Intro text", "परिचय पंक्ति", "textarea", 400),
    ],
  },
  {
    id: "technology",
    en: "Technology information",
    hi: "टेक्नोलॉजी जानकारी",
    noteEn: "Describe the calculation method (for example Lahiri Ayanamsha) shown on the Kundli pages.",
    noteHi: "कुंडली गणना पद्धति (जैसे लाहिरी अयनांश) का विवरण।",
    fields: [
      ...bi("calcMethod", "Calculation method", "गणना पद्धति", "textarea", 600),
      ...bi("accuracyNote", "Accuracy note", "शुद्धता संबंधी सूचना", "textarea", 400),
    ],
  },
  {
    id: "mobileApp",
    en: "Mobile app",
    hi: "मोबाइल ऐप",
    fields: [
      { key: "enabled", en: "Show app download section", hi: "ऐप डाउनलोड सेक्शन दिखाएँ", type: "toggle", def: true },
      { key: "playStoreUrl", en: "Google Play link", hi: "गूगल प्ले लिंक", type: "url" },
      { key: "appStoreUrl", en: "App Store link", hi: "ऐप स्टोर लिंक", type: "url" },
      { key: "apkUrl", en: "Direct APK link", hi: "सीधा APK लिंक", type: "url" },
      ...bi("appText", "Text shown with the download", "डाउनलोड के साथ का संदेश", "text", 200),
    ],
  },
  {
    id: "tools",
    en: "Panchang, Kundli and Matching tools",
    hi: "पंचांग, कुंडली व मिलान टूल",
    noteEn: "These pages show a live tool from another website inside ours. Paste a different address to change the tool, or leave empty for the standard one. Use {lang} where the page language should go (hi or en).",
    noteHi: "ये पेज किसी दूसरी वेबसाइट का लाइव टूल हमारी साइट के अंदर दिखाते हैं। टूल बदलने के लिए नया पता डालें, खाली छोड़ने पर सामान्य टूल रहेगा। भाषा की जगह {lang} लिखें (hi या en)।",
    fields: [
      { key: "panchangEnabled", en: "Panchang page ON", hi: "पंचांग पेज चालू", type: "toggle", def: true },
      { key: "kundliEnabled", en: "Kundli page ON", hi: "कुंडली पेज चालू", type: "toggle", def: true },
      { key: "matchingEnabled", en: "Kundli matching page ON", hi: "कुंडली मिलान पेज चालू", type: "toggle", def: true },
      { key: "panchangUrl", en: "Panchang calendar address", hi: "पंचांग कैलेंडर का पता", type: "url", max: 400, def: "https://panchang.astrosage.com/?language={lang}" },
      { key: "kundliUrl", en: "Kundli (birth chart) address", hi: "कुंडली का पता", type: "url", max: 400, def: "https://www.astrosage.com/freekundli/" },
      { key: "matchingUrl", en: "Kundli matching address", hi: "कुंडली मिलान का पता", type: "url", max: 400, def: "https://www.astrosage.com/freechart/matchmaking.asp" },
    ],
  },
  {
    id: "homeSections",
    en: "Home page: show or hide sections",
    hi: "होम पेज: सेक्शन दिखाएँ/छिपाएँ",
    noteEn: "Switch any block of the home page on or off. Hidden blocks stay saved.",
    noteHi: "होम पेज का कोई भी हिस्सा चालू या बंद करें। बंद किए हिस्से सुरक्षित रहते हैं।",
    fields: [
      { key: "showQuickCards", en: "Three cards under the banner", hi: "बैनर के नीचे तीन कार्ड", type: "toggle", def: true },
      { key: "showAbout", en: "About", hi: "परिचय", type: "toggle", def: true },
      { key: "showServices", en: "All services grid", hi: "सभी सेवाओं की सूची", type: "toggle", def: true },
      { key: "showPlans", en: "Kundli, Prashn and Matching plans", hi: "कुंडली, प्रश्न और मिलान योजनाएँ", type: "toggle", def: true },
      { key: "showConnected", en: "Connected services", hi: "संबद्ध सेवाएँ", type: "toggle", def: true },
      { key: "showTools", en: "Free tools", hi: "निःशुल्क उपकरण", type: "toggle", def: true },
      { key: "showRequestForm", en: "Kundli request form", hi: "कुंडली अनुरोध फ़ॉर्म", type: "toggle", def: true },
      { key: "showGallery", en: "Gallery", hi: "गैलरी", type: "toggle", def: true },
      { key: "showBooking", en: "Booking steps", hi: "बुकिंग के चरण", type: "toggle", def: true },
      { key: "showPayment", en: "Payment information", hi: "भुगतान की जानकारी", type: "toggle", def: true },
      { key: "showReviews", en: "Reviews", hi: "समीक्षाएँ", type: "toggle", def: true },
      { key: "showFaq", en: "FAQ", hi: "सामान्य प्रश्न", type: "toggle", def: true },
      { key: "showContact", en: "Contact block", hi: "संपर्क हिस्सा", type: "toggle", def: true },
    ],
  },
  {
    id: "homeHero",
    en: "Home page: banner (hero)",
    hi: "होम पेज: मुख्य बैनर",
    noteEn: "Pictures, text and the two buttons of the large banner. Leave a box empty to keep the standard wording.",
    noteHi: "बड़े बैनर की तस्वीरें, लिखावट और दो बटन। डिफ़ॉल्ट शब्दों के लिए खाली छोड़ें।",
    fields: [
      { key: "image1", en: "Banner picture 1", hi: "बैनर तस्वीर 1", type: "image" },
      { key: "image2", en: "Banner picture 2 (fades in and out)", hi: "बैनर तस्वीर 2 (धीरे-धीरे बदलती है)", type: "image" },
      { key: "overlay", en: "Darkness over the pictures (0 to 90)", hi: "तस्वीरों पर अँधेरा (0 से 90)", type: "number", def: 60 },
      ...bi("cta1Label", "First button text", "पहले बटन का टेक्स्ट", "text", 60),
      { key: "cta1Url", en: "First button goes to", hi: "पहला बटन कहाँ जाए", type: "link", max: 400, def: "/services" },
      ...bi("cta2Label", "Second button text", "दूसरे बटन का टेक्स्ट", "text", 60),
      { key: "cta2Url", en: "Second button goes to", hi: "दूसरा बटन कहाँ जाए", type: "link", max: 400, def: "/kundli" },
      { key: "showCta2", en: "Show the second button", hi: "दूसरा बटन दिखाएँ", type: "toggle", def: true },
    ],
  },
  {
    id: "homeCards",
    en: "Home page: three cards and About",
    hi: "होम पेज: तीन कार्ड और परिचय",
    fields: [
      ...bi("quick1Title", "Card 1 title", "कार्ड 1 शीर्षक", "text", 80),
      ...bi("quick1Text", "Card 1 text", "कार्ड 1 टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("quick2Title", "Card 2 title", "कार्ड 2 शीर्षक", "text", 80),
      ...bi("quick2Text", "Card 2 text", "कार्ड 2 टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("quick3Title", "Card 3 title", "कार्ड 3 शीर्षक", "text", 80),
      ...bi("aboutLabel", "About: small heading", "परिचय: छोटा शीर्षक", "text", 100),
      ...bi("aboutTitle", "About: heading", "परिचय: शीर्षक", "text", 120),
      ...bi("aboutIntro", "About: text", "परिचय: टेक्स्ट", "textarea", 900, undefined, true),
      { key: "aboutImage", en: "About: picture", hi: "परिचय: तस्वीर", type: "image" },
      ...bi("feature1Title", "About point 1 title", "बिंदु 1 शीर्षक", "text", 80),
      ...bi("feature1Text", "About point 1 text", "बिंदु 1 टेक्स्ट", "text", 200),
      ...bi("feature2Title", "About point 2 title", "बिंदु 2 शीर्षक", "text", 80),
      ...bi("feature2Text", "About point 2 text", "बिंदु 2 टेक्स्ट", "text", 200),
      ...bi("feature3Title", "About point 3 title", "बिंदु 3 शीर्षक", "text", 80),
      ...bi("feature3Text", "About point 3 text", "बिंदु 3 टेक्स्ट", "text", 200),
      ...bi("aboutButton", "About button text", "परिचय बटन टेक्स्ट", "text", 60),
      { key: "aboutButtonUrl", en: "About button goes to (empty = WhatsApp)", hi: "बटन कहाँ जाए (खाली = व्हाट्सऐप)", type: "link", max: 400 },
    ],
  },
  {
    id: "homeServices",
    en: "Home page: services, plans and tools headings",
    hi: "होम पेज: सेवाओं, योजनाओं और उपकरणों के शीर्षक",
    fields: [
      ...bi("servicesLabel", "Services: small heading", "सेवाएँ: छोटा शीर्षक", "text", 100),
      ...bi("servicesTitle", "Services: heading", "सेवाएँ: शीर्षक", "text", 120),
      ...bi("servicesIntro", "Services: text", "सेवाएँ: टेक्स्ट", "textarea", 400, undefined, true),
      ...bi("consultLabel", "Service card link text", "सेवा कार्ड लिंक टेक्स्ट", "text", 40),
      ...bi("janamTitle", "Janam Kundli plans heading", "जन्म कुंडली योजनाओं का शीर्षक", "text", 120),
      ...bi("janamIntro", "Janam Kundli plans text", "जन्म कुंडली योजनाओं का टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("prashnTitle", "Prashn Kundli plans heading", "प्रश्न कुंडली योजनाओं का शीर्षक", "text", 120),
      ...bi("prashnIntro", "Prashn Kundli plans text", "प्रश्न कुंडली योजनाओं का टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("matchingTitle", "Matching plans heading", "मिलान योजनाओं का शीर्षक", "text", 120),
      ...bi("matchingIntro", "Matching plans text", "मिलान योजनाओं का टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("selectPlanLabel", "Plan button text", "योजना बटन टेक्स्ट", "text", 40),
      ...bi("connectedLabel", "Connected services: small heading", "संबद्ध सेवाएँ: छोटा शीर्षक", "text", 100),
      ...bi("connectedTitle", "Connected services: heading", "संबद्ध सेवाएँ: शीर्षक", "text", 120),
      ...bi("toolsLabel", "Free tools: small heading", "निःशुल्क उपकरण: छोटा शीर्षक", "text", 100),
      ...bi("toolsTitle", "Free tools: heading", "निःशुल्क उपकरण: शीर्षक", "text", 120),
      ...bi("toolsIntro", "Free tools: text", "निःशुल्क उपकरण: टेक्स्ट", "textarea", 300, undefined, true),
    ],
  },
  {
    id: "homeProcess",
    en: "Home page: request form, gallery, booking and payment",
    hi: "होम पेज: अनुरोध फ़ॉर्म, गैलरी, बुकिंग और भुगतान",
    fields: [
      ...bi("formLabel", "Request form: small heading", "अनुरोध फ़ॉर्म: छोटा शीर्षक", "text", 100),
      ...bi("formTitle", "Request form: heading", "अनुरोध फ़ॉर्म: शीर्षक", "text", 120),
      ...bi("formIntro", "Request form: text", "अनुरोध फ़ॉर्म: टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("formSideTitle", "Request form side panel title", "साइड पैनल शीर्षक", "text", 80),
      ...bi("formSideText", "Request form side panel text", "साइड पैनल टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("galleryLabel", "Gallery: small heading", "गैलरी: छोटा शीर्षक", "text", 100),
      ...bi("galleryTitle", "Gallery: heading", "गैलरी: शीर्षक", "text", 120),
      ...bi("bookingLabel", "Booking: small heading", "बुकिंग: छोटा शीर्षक", "text", 100),
      ...bi("bookingTitle", "Booking: heading", "बुकिंग: शीर्षक", "text", 120),
      ...bi("bookingIntro", "Booking: text", "बुकिंग: टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("step1Title", "Step 1 title", "चरण 1 शीर्षक", "text", 80),
      ...bi("step1Text", "Step 1 text", "चरण 1 टेक्स्ट", "text", 200),
      ...bi("step2Title", "Step 2 title", "चरण 2 शीर्षक", "text", 80),
      ...bi("step2Text", "Step 2 text", "चरण 2 टेक्स्ट", "text", 200),
      ...bi("step3Title", "Step 3 title", "चरण 3 शीर्षक", "text", 80),
      ...bi("step3Text", "Step 3 text", "चरण 3 टेक्स्ट", "text", 200),
      ...bi("step4Title", "Step 4 title", "चरण 4 शीर्षक", "text", 80),
      ...bi("step4Text", "Step 4 text", "चरण 4 टेक्स्ट", "text", 200),
      ...bi("bookingButton", "Booking button text", "बुकिंग बटन टेक्स्ट", "text", 60),
      ...bi("paymentLabel", "Payment: small heading", "भुगतान: छोटा शीर्षक", "text", 100),
      ...bi("paymentTitle", "Payment: heading", "भुगतान: शीर्षक", "text", 120),
      ...bi("paymentIntro", "Payment: text", "भुगतान: टेक्स्ट", "textarea", 300, undefined, true),
      ...bi("payBeforeTitle", "Payment left box title", "भुगतान बाएँ बॉक्स का शीर्षक", "text", 80),
      ...bi("payBeforeText", "Payment left box steps (one per line)", "भुगतान बाएँ बॉक्स के चरण (हर पंक्ति में एक)", "textarea", 600),
      ...bi("payGatewayTitle", "Payment right box title", "भुगतान दाएँ बॉक्स का शीर्षक", "text", 80),
      ...bi("payGatewayText", "Payment right box text", "भुगतान दाएँ बॉक्स का टेक्स्ट", "textarea", 500, undefined, true),
    ],
  },
  {
    id: "homeContact",
    en: "Home page: reviews, FAQ and contact block",
    hi: "होम पेज: समीक्षाएँ, प्रश्न और संपर्क",
    fields: [
      ...bi("reviewsLabel", "Reviews: small heading", "समीक्षाएँ: छोटा शीर्षक", "text", 100),
      ...bi("reviewsTitle", "Reviews: heading", "समीक्षाएँ: शीर्षक", "text", 120),
      ...bi("faqLabel", "FAQ: small heading", "प्रश्न: छोटा शीर्षक", "text", 100),
      ...bi("faqTitle", "FAQ: heading", "प्रश्न: शीर्षक", "text", 120),
      ...bi("contactLabel", "Contact: small heading", "संपर्क: छोटा शीर्षक", "text", 100),
      ...bi("contactTitle", "Contact: heading", "संपर्क: शीर्षक", "text", 120),
      ...bi("contactIntro", "Contact: text", "संपर्क: टेक्स्ट", "textarea", 400, undefined, true),
      ...bi("helpTitle", "Right box title", "दाएँ बॉक्स का शीर्षक", "text", 80),
      ...bi("help1Title", "Help point 1 title", "बिंदु 1 शीर्षक", "text", 80),
      ...bi("help1Text", "Help point 1 text", "बिंदु 1 टेक्स्ट", "text", 200),
      ...bi("help2Title", "Help point 2 title", "बिंदु 2 शीर्षक", "text", 80),
      ...bi("help2Text", "Help point 2 text", "बिंदु 2 टेक्स्ट", "text", 200),
      ...bi("help3Title", "Help point 3 title", "बिंदु 3 शीर्षक", "text", 80),
      ...bi("help3Text", "Help point 3 text", "बिंदु 3 टेक्स्ट", "text", 200),
      ...bi("contactButton", "Contact button text", "संपर्क बटन टेक्स्ट", "text", 60),
    ],
  },
  {
    id: "topbar",
    en: "Top bar (date and time line)",
    hi: "ऊपरी पट्टी (तारीख और समय)",
    noteEn: "Choose what the thin dark bar at the very top shows.",
    noteHi: "सबसे ऊपर की पतली पट्टी में क्या दिखे, यह चुनें।",
    fields: [
      { key: "showTime", en: "Time", hi: "समय", type: "toggle", def: true },
      { key: "showSeconds", en: "Seconds in the time", hi: "समय में सेकंड", type: "toggle", def: true },
      { key: "showDay", en: "Day of the week", hi: "वार", type: "toggle", def: true },
      { key: "showDate", en: "Date, month and year", hi: "तारीख, महीना और वर्ष", type: "toggle", def: true },
      { key: "showPaksha", en: "Paksha", hi: "पक्ष", type: "toggle", def: true },
      { key: "showTithi", en: "Tithi (with end time)", hi: "तिथि (समाप्ति समय सहित)", type: "toggle", def: true },
      { key: "showMasa", en: "Hindu month", hi: "हिंदू माह", type: "toggle", def: true },
      { key: "showSamvat", en: "Vikram Samvat", hi: "विक्रम संवत", type: "toggle", def: true },
      { key: "showPanchangButton", en: "Panchang Calendar button", hi: "पंचांग कैलेंडर बटन", type: "toggle", def: true },
      { key: "showPhone", en: "Phone number", hi: "फ़ोन नंबर", type: "toggle", def: true },
      { key: "showSocial", en: "Social media icons", hi: "सोशल मीडिया आइकन", type: "toggle", def: true },
      { key: "showAuthLinks", en: "Sign in and Register links", hi: "साइन इन और रजिस्टर लिंक", type: "toggle", def: true },
      { key: "showBar", en: "Show the whole top bar", hi: "पूरी ऊपरी पट्टी दिखाएँ", type: "toggle", def: true },
    ],
  },
  {
    id: "floating",
    en: "Floating buttons (call, WhatsApp, AI, chat)",
    hi: "फ्लोटिंग बटन (कॉल, व्हाट्सऐप, AI, चैट)",
    fields: [
      { key: "showCall", en: "Call button", hi: "कॉल बटन", type: "toggle", def: true },
      { key: "showWhatsapp", en: "WhatsApp button", hi: "व्हाट्सऐप बटन", type: "toggle", def: true },
      { key: "showAi", en: "Ask AI button", hi: "AI बटन", type: "toggle", def: true },
      { key: "showChat", en: "Chat button", hi: "चैट बटन", type: "toggle", def: true },
      { key: "showAskBar", en: "Ask-a-question bar at the bottom (large screens)", hi: "नीचे का प्रश्न पूछें बार (बड़ी स्क्रीन)", type: "toggle", def: true },
      { key: "callNumber", en: "Number the call button dials (empty = main phone)", hi: "कॉल बटन का नंबर (खाली = मुख्य फ़ोन)", type: "text", max: 20 },
      { key: "whatsappNumber", en: "WhatsApp number (empty = main phone)", hi: "व्हाट्सऐप नंबर (खाली = मुख्य फ़ोन)", type: "text", max: 20 },
      ...bi("whatsappMessage", "First WhatsApp message", "व्हाट्सऐप का पहला संदेश", "textarea", 300),
    ],
  },
  {
    id: "intro",
    en: "Opening screen",
    hi: "ओपनिंग स्क्रीन",
    fields: [
      { key: "enabled", en: "Show the opening screen on the first visit", hi: "पहली बार खुलने पर ओपनिंग स्क्रीन दिखाएँ", type: "toggle", def: true },
      { key: "seconds", en: "How long it stays (seconds, 1 to 8)", hi: "कितनी देर दिखे (सेकंड, 1 से 8)", type: "number", def: 3 },
      ...bi("title", "Name shown", "दिखने वाला नाम", "text", 80),
      ...bi("tagline", "Line under the name", "नाम के नीचे की पंक्ति", "text", 120),
      ...bi("sub", "Small capital line", "छोटी पंक्ति", "text", 80),
      { key: "symbol", en: "Symbol in the circle", hi: "सर्कल का चिह्न", type: "text", max: 4, def: "ॐ" },
    ],
  },
  {
    id: "theme",
    en: "Colours of the website",
    hi: "वेबसाइट के रंग",
    noteEn: "Leave a colour empty to keep the standard one. Pick dark colours for 'Dark brown' so white text stays readable on it.",
    noteHi: "डिफ़ॉल्ट रंग के लिए खाली छोड़ें। 'गहरा भूरा' के लिए गहरा रंग चुनें ताकि उस पर सफ़ेद अक्षर साफ़ दिखें।",
    fields: [
      { key: "brand", en: "Main button colour", hi: "मुख्य बटन का रंग", type: "color" },
      { key: "saffron", en: "Orange accent (cards, lines)", hi: "नारंगी रंग (कार्ड, रेखाएँ)", type: "color" },
      { key: "dark", en: "Dark brown (top bar, footer, banners)", hi: "गहरा भूरा (ऊपरी पट्टी, फुटर)", type: "color" },
      { key: "gold", en: "Gold (highlights)", hi: "सुनहरा (हाइलाइट)", type: "color" },
      { key: "page", en: "Page background", hi: "पेज की पृष्ठभूमि", type: "color" },
    ],
  },
  {
    id: "admin",
    en: "Admin settings",
    hi: "एडमिन सेटिंग",
    noteEn: "Quick links to the other control screens.",
    noteHi: "अन्य कंट्रोल स्क्रीन के लिंक।",
    link: { href: "/admin/settings", en: "Open Settings", hi: "सेटिंग्स खोलें" },
    fields: [
      { key: "adminNote", en: "Private notes for admin (not shown to visitors)", hi: "एडमिन के निजी नोट", type: "textarea", max: 1000 },
    ],
  },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

/* ---------------- Social media ---------------- */

export const SOCIAL_PLATFORMS = [
  { id: "youtube", name: "YouTube" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "facebook", name: "Facebook" },
  { id: "instagram", name: "Instagram" },
  { id: "twitter", name: "Twitter / X" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "telegram", name: "Telegram" },
] as const;

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

const PLATFORM_IDS: string[] = SOCIAL_PLATFORMS.map((p) => p.id);

/** Accepts a web address; for WhatsApp also a bare phone number. Returns "" when not usable. */
export function cleanSocialUrl(id: string, raw: unknown): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (id === "whatsapp" && /^\+?[\d\s-]{8,16}$/.test(v)) {
    let digits = v.replace(/\D/g, "");
    if (digits.length === 10) digits = `91${digits}`;
    return `https://wa.me/${digits}`;
  }
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    return u.toString().slice(0, 500);
  } catch {
    return "";
  }
}

export function normalizeSocial(input: unknown): { ok: true; items: SocialLink[] } | { ok: false; error: string } {
  const list = Array.isArray((input as { items?: unknown })?.items) ? ((input as { items: unknown[] }).items) : null;
  if (!list) return { ok: false, error: "Invalid social links." };
  const out: SocialLink[] = [];
  for (const row of list.slice(0, 20)) {
    const r = row as Partial<SocialLink>;
    const id = String(r.id || "");
    if (!PLATFORM_IDS.includes(id)) return { ok: false, error: "Unknown platform." };
    const rawUrl = String(r.url ?? "").trim();
    const url = cleanSocialUrl(id, rawUrl);
    if (rawUrl && !url) return { ok: false, error: `${id}: please enter a full web address starting with https://` };
    const name = String(r.name || SOCIAL_PLATFORMS.find((p) => p.id === id)?.name || id).trim().slice(0, 40);
    out.push({ id, name, url, active: r.active === true });
  }
  return { ok: true, items: out };
}

/** Fills missing platforms so the admin always sees every row. */
export function completeSocial(items: SocialLink[] | null | undefined): SocialLink[] {
  return SOCIAL_PLATFORMS.map((p) => {
    const found = items?.find((i) => i.id === p.id);
    return found ?? { id: p.id, name: p.name, url: "", active: false };
  });
}

/* ---------------- Generic sections ---------------- */

export type SectionValues = Record<string, string | boolean | number>;

export function defaultsFor(section: SectionDef): SectionValues {
  const out: SectionValues = {};
  for (const f of section.fields) out[f.key] = f.def ?? (f.type === "toggle" ? false : f.type === "number" ? 0 : "");
  return out;
}

function validAddress(v: string): boolean {
  return v.startsWith("/") && !v.startsWith("//") ? true : /^https:\/\//i.test(v);
}

export function normalizeSection(
  section: SectionDef,
  input: unknown
): { ok: true; values: SectionValues } | { ok: false; error: string } {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const values: SectionValues = {};
  for (const f of section.fields) {
    const raw = src[f.key];
    if (f.type === "toggle") {
      values[f.key] = raw === true;
    } else if (f.type === "number") {
      const n = Number(raw);
      values[f.key] = Number.isFinite(n) ? Math.max(0, Math.min(100000, Math.round(n))) : 0;
    } else {
      const s = String(raw ?? "").trim();
      if (s.length > (f.max ?? 300)) return { ok: false, error: `${f.en} is too long.` };
      if (f.type === "link" && s && !safeHref(s)) return { ok: false, error: `${f.en}: enter a page like /services, a full web address (https://...), tel:+91... or mailto:...` };
      if (f.type === "url" && s && !/^https?:\/\//i.test(s)) return { ok: false, error: `${f.en}: enter a full address starting with https://` };
      if (f.type === "image" && s && !validAddress(s)) return { ok: false, error: `${f.en}: use an uploaded image or an https:// address.` };
      if (f.type === "color" && s && !/^#[0-9a-fA-F]{6}$/.test(s)) return { ok: false, error: `${f.en}: colour must look like #E77B18.` };
      values[f.key] = s;
    }
  }
  return { ok: true, values };
}

/* ---------------- Link lists (menu, footer links) ---------------- */

export interface LinkRow {
  labelEn: string;
  labelHi: string;
  href: string;
  show: boolean;
}

export const LINK_LIST_IDS = ["menu", "footerLinks"] as const;

export function normalizeLinkList(input: unknown): { ok: true; items: LinkRow[] } | { ok: false; error: string } {
  const list = Array.isArray((input as { items?: unknown })?.items) ? (input as { items: unknown[] }).items : null;
  if (!list) return { ok: false, error: "Invalid list." };
  const out: LinkRow[] = [];
  for (const row of list.slice(0, 40)) {
    const r = row as Partial<LinkRow>;
    const labelEn = String(r.labelEn ?? "").trim().slice(0, 60);
    const labelHi = String(r.labelHi ?? "").trim().slice(0, 60);
    const href = String(r.href ?? "").trim();
    if (!labelEn && !labelHi && !href) continue;
    if (!labelEn && !labelHi) return { ok: false, error: "Every link needs a name." };
    const ok = safeHref(href);
    if (!ok) return { ok: false, error: `"${labelEn || labelHi}": enter a page like /services, a full web address (https://...), tel:+91... or mailto:...` };
    out.push({ labelEn, labelHi, href: ok.href, show: r.show !== false });
  }
  return { ok: true, items: out };
}
