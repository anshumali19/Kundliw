/** Turns the admin's colour choices into CSS variables. Only #rrggbb values are accepted. */

const HEX = /^#[0-9a-fA-F]{6}$/;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

function shade(hex: string, amount: number): string {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const out = n.map((v) => Math.max(0, Math.min(255, Math.round(v + (amount < 0 ? v * amount : (255 - v) * amount)))));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
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
  const entries = Object.entries(vars);
  if (entries.length === 0) return "";
  return `:root{${entries.map(([k, v]) => `${k}:${v}`).join(";")}}`;
}
