import { colors } from "@/theme";

/** The website's own colours for the four round buttons: call blue, WhatsApp green, Ask AI purple, chat orange. */
export const FAB_COLORS = { call: "#2563EB", whatsapp: "#25A244", ai: "#7C3AED", chat: "#D95A24" } as const;

/** What the strip says until the admin adds a notice under Admin > Marquee (the website's own default). */
export const DEFAULT_TICKER = {
  textEn: "Welcome to Maharshi Kanad Jyotish Kendra. Book Kundli, matching and consultations online.",
  textHi: "महर्षि कणाद ज्योतिष केंद्र में आपका स्वागत है। कुंडली, मिलान और परामर्श ऑनलाइन बुक करें।",
};

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const MAROONS = new Set(["var(--secondary)", "var(--primary)", "var(--maroon)", "#800000", "#6b1d1d"]);

/**
 * The strip's colours as the website works them out: yellow with dark maroon text unless the admin picked
 * other colours (maroon is reserved for the footer, so an old maroon setting also gives yellow). Only colour
 * codes like #RRGGBB are taken; anything else (the website's named colours) falls back to the standard ones.
 */
export function tickerColors(bg: string | undefined, text: string | undefined): { bg: string; fg: string } {
  const b = (bg ?? "").trim();
  const useStandard = !b || MAROONS.has(b.toLowerCase()) || !HEX.test(b);
  const t = (text ?? "").trim();
  return { bg: useStandard ? colors.gold : b, fg: useStandard ? colors.maroonDeep : HEX.test(t) ? t : colors.maroonDeep };
}

/** The strip's words in one line (notices apart by a dot), in the chosen language; the default welcome when there are none. */
export function tickerText(items: { textEn: string; textHi: string }[], lang: "hi" | "en"): string {
  const list = items.length > 0 ? items : [DEFAULT_TICKER];
  return list.map((i) => (lang === "hi" ? i.textHi || i.textEn : i.textEn || i.textHi)).filter(Boolean).join("   •   ");
}

/** The 10 digits of a typed mobile number; empty when there are fewer than 10. */
export function chatPhone(input: string): string {
  const d = input.replace(/\D/g, "");
  return d.length < 10 ? "" : d.slice(-10);
}
