/** Turns the admin's colour choices into CSS variables. Only #rrggbb values are accepted. */

const HEX = /^#[0-9a-fA-F]{6}$/;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

function shade(hex: string, amount: number): string {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const out = n.map((v) => Math.max(0, Math.min(255, Math.round(v + (amount < 0 ? v * amount : (255 - v) * amount)))));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const FONT_NAME = /^[A-Za-z0-9 \-]{2,60}$/;
/** Fonts that are already loaded on the site, so they work on every device. */
const LOADED_FONTS: Record<string, string> = {
  poppins: "var(--font-poppins)",
  "noto sans": "var(--font-noto-sans)",
  "cormorant garamond": "var(--font-cormorant)",
  cormorant: "var(--font-cormorant)",
};

/** Accepts only a plain font name; anything else is ignored so no stray CSS can get in. */
function fontStack(raw: unknown): string {
  const name = String(raw || "").trim();
  if (!FONT_NAME.test(name)) return "";
  const loaded = LOADED_FONTS[name.toLowerCase()];
  return loaded ? `${loaded},${/cormorant/i.test(name) ? "Georgia,serif" : "sans-serif"}` : `"${name}",sans-serif`;
}

/** Returns CSS text for a <style> tag, or "" when nothing was changed. */
export function themeCss(theme: Record<string, string | boolean | number>): string {
  const pick = (k: string) => {
    const v = String(theme[k] || "").trim();
    return HEX.test(v) ? v : "";
  };
  const vars: Record<string, string> = {};
  const set = (name: string, hex: string) => {
    vars[`--${name}`] = hex;
    vars[`--${name}-rgb`] = rgb(hex);
  };
  const brand = pick("brand");
  if (brand) {
    set("brand", brand);
    set("brand-hover", shade(brand, -0.2));
    set("signal", shade(brand, -0.2));
  }
  const saffron = pick("saffron");
  if (saffron) {
    set("saffron", saffron);
    set("surface-tint", saffron);
    set("primary-fixed-dim", saffron);
    set("secondary-fixed-dim", saffron);
    set("tertiary-fixed-dim", saffron);
  }
  const dark = pick("dark");
  if (dark) {
    set("maroon", dark);
    set("maroon-deep", shade(dark, -0.35));
    set("secondary", dark);
    set("tertiary", dark);
    set("inverse-surface", dark);
  }
  const gold = pick("gold");
  if (gold) {
    set("gold", gold);
    set("yellow", gold);
    set("tertiary-container", gold);
    set("tertiary-fixed", gold);
  }
  const page = pick("page");
  if (page) {
    set("surface", page);
    set("surface-container-low", shade(page, 0.4));
    set("surface-container", shade(page, -0.04));
    set("surface-container-high", shade(page, -0.08));
  }
  const text = pick("text");
  if (text) set("on-surface", text);
  const heading = pick("heading");
  if (heading) set("secondary", heading);
  const link = pick("link");
  if (link) {
    set("primary", link);
  }
  const buttonText = pick("buttonText");
  if (buttonText) set("on-brand", buttonText);
  const card = pick("card");
  if (card) {
    set("surface-container-lowest", card);
    set("surface-bright", card);
  }
  const border = pick("border");
  if (border) set("outline-variant", border);
  const footerBg = pick("footerBg");
  if (footerBg) set("footer-bg", footerBg);
  const topbarBg = pick("topbarBg");
  if (topbarBg) set("topbar-bg", topbarBg);

  const mapBtn = pick("mapButton");
  if (mapBtn) set("map-button", mapBtn);
  const mapBtnText = pick("mapButtonText");
  if (mapBtnText) set("on-map-button", mapBtnText);

  const entries = Object.entries(vars);
  const rules: string[] = [];
  if (entries.length > 0) rules.push(`:root{${entries.map(([k, v]) => `${k}:${v}`).join(";")}}`);

  const bodyFont = fontStack(theme.bodyFont);
  if (bodyFont) rules.push(`html,body{font-family:${bodyFont}}`);
  const headingFont = fontStack(theme.headingFont);
  if (headingFont) rules.push(`h1,h2,h3,h4,h5,h6,.font-serif{font-family:${headingFont}}`);
  return rules.join("");
}
