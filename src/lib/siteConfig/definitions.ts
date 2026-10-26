/**
 * Website settings the super admin can change without touching code.
 * Each section is a list of simple fields; one generic screen renders them all.
 * Pure module (no database) so it can be shared by the admin screen, the API and tests.
 */

export type FieldType = "text" | "textarea" | "url" | "toggle" | "number" | "color" | "image";

export interface FieldDef {
  key: string;
  en: string;
  hi: string;
  type: FieldType;
  max?: number;
  def?: string | boolean | number;
  help?: string;
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

const bi = (key: string, en: string, hi: string, type: FieldType = "text", max = 300, def?: string | boolean | number): FieldDef[] => [
  { key: `${key}En`, en: `${en} (English)`, hi: `${hi} (अंग्रेज़ी)`, type, max, def },
  { key: `${key}Hi`, en: `${en} (Hindi)`, hi: `${hi} (हिंदी)`, type, max },
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
      { key: "logoAlt", en: "Logo text (for accessibility)", hi: "लोगो का नाम", type: "text", max: 120 },
    ],
  },
  {
    id: "home",
    en: "Home page",
    hi: "होम पेज",
    fields: [
      ...bi("announcement", "Highlight strip below the top banner", "ऊपर की विशेष पट्टी", "text", 200),
      { key: "showSocialStrip", en: "Show social media row on the home page", hi: "होम पेज पर सोशल मीडिया दिखाएँ", type: "toggle", def: true },
      { key: "showPanchang", en: "Show daily Panchang", hi: "दैनिक पंचांग दिखाएँ", type: "toggle", def: true },
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
      { key: "allowAssociateSignup", en: "Show 'Become an associate' links", hi: "'सहयोगी बनें' लिंक दिखाएँ", type: "toggle", def: true },
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
      { key: "facebookPixelId", en: "Facebook Pixel ID", hi: "फेसबुक पिक्सल ID", type: "text", max: 40 },
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
      { key: "enabled", en: "Show live clock and moving effects", hi: "लाइव घड़ी/एनिमेशन दिखाएँ", type: "toggle", def: true },
      { key: "marqueeLike", en: "Soft glow behind headline", hi: "शीर्षक के पीछे हल्की चमक", type: "toggle", def: false },
      { key: "accent", en: "Highlight colour", hi: "हाइलाइट रंग", type: "color", def: "#C2610C" },
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
      if (f.type === "url" && s && !/^https?:\/\//i.test(s)) return { ok: false, error: `${f.en}: enter a full address starting with https://` };
      if (f.type === "image" && s && !validAddress(s)) return { ok: false, error: `${f.en}: use an uploaded image or an https:// address.` };
      if (f.type === "color" && s && !/^#[0-9a-fA-F]{6}$/.test(s)) return { ok: false, error: `${f.en}: colour must look like #C2610C.` };
      values[f.key] = s;
    }
  }
  return { ok: true, values };
}
