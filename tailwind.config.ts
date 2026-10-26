import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Theme taken from the client's reference site (Bharat Darshan Teerth Yatra): saffron-orange
 * #F96706 flowing into gold #FFC105, warm cream surfaces, dark brown text, maroon #661919 for
 * the footer, Poppins type and softly rounded corners.
 *
 * Rules the whole UI follows:
 *  - Buttons and highlights are filled orange (`bg-brand`) with white bold text (`text-on-brand`)
 *    and turn a deeper orange (`bg-brand-hover`) on hover.
 *  - Gold (`bg-gold`, `text-gold`) is for accents on dark areas and for gradients; text on gold
 *    is dark brown (`text-on-gold`).
 *  - Headings use the dark brown `secondary`; small accent labels use `primary`, an orange
 *    deep enough to read on cream and peach (5:1).
 *  - Maroon is the footer background (`bg-maroon`) and an accent for borders.
 *  - Body text is dark brown (#261B17) on cream (16:1).
 */
const PALETTE: Record<string, string> = {
  // Brand: the four colours the client chose (saffron, maroon, yellow, red) on a warm cream page.
  // Filled buttons are maroon with white text (12:1); saffron and yellow are accents and fills
  // with dark text; red is for offers, badges and errors.
  brand: "#641E2B",
  "brand-hover": "#4B1724",
  "on-brand": "#FFFFFF",
  saffron: "#E77B18",
  "on-saffron": "#271B1B",
  gold: "#F4C65D",
  "on-gold": "#271B1B",
  signal: "#C62828",
  "on-signal": "#FFFFFF",
  maroon: "#641E2B",
  "maroon-deep": "#4B1724",
  "on-maroon": "#FFF8EC",
  yellow: "#F4C65D",

  // Surfaces: cream page, white cards
  surface: "#FFF8EC",
  "surface-dim": "#F1E3CD",
  "surface-bright": "#FFFFFF",
  "surface-container-lowest": "#FFFFFF",
  "surface-container-low": "#FFFDF9",
  "surface-container": "#FFF3DF",
  "surface-container-high": "#FBE9CC",
  "surface-container-highest": "#F6DDB4",
  "on-surface": "#271B1B",
  "on-surface-variant": "#5E4F4B",
  "inverse-surface": "#271B1B",
  "inverse-on-surface": "#FFF8EC",
  outline: "#7A6A64",
  "outline-variant": "#EADBCA",
  "surface-tint": "#E77B18",

  // Primary: deep saffron for accent text (5:1 on cream); fills use brand or saffron
  primary: "#A4510A",
  "on-primary": "#FFFFFF",
  "primary-container": "#FFE3C2",
  "on-primary-container": "#6B3000",
  "primary-fixed": "#FFE3C2",
  "primary-fixed-dim": "#E77B18",
  "on-primary-fixed": "#271B1B",
  "on-primary-fixed-variant": "#6B3000",

  // Secondary: maroon for headings
  secondary: "#5A1A26",
  "on-secondary": "#FFFFFF",
  "secondary-container": "#FBE9CC",
  "on-secondary-container": "#4B1724",
  "secondary-fixed": "#FBE9CC",
  "secondary-fixed-dim": "#E77B18",
  "on-secondary-fixed": "#271B1B",
  "on-secondary-fixed-variant": "#4B1724",

  // Tertiary: maroon text, yellow fills
  tertiary: "#641E2B",
  "on-tertiary": "#FFFFFF",
  "tertiary-container": "#F4C65D",
  "on-tertiary-container": "#271B1B",
  "tertiary-fixed": "#F4C65D",
  "tertiary-fixed-dim": "#E77B18",
  "on-tertiary-fixed": "#271B1B",
  "on-tertiary-fixed-variant": "#641E2B",

  // Errors: red on a pale red tint
  error: "#C62828",
  "on-error": "#FFFFFF",
  "error-container": "#FDE3E1",
  "on-error-container": "#7A1212",
};

const hexToRgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: Object.fromEntries(
        Object.keys(PALETTE).map((name) => [name, `rgb(var(--${name}-rgb) / <alpha-value>)`])
      ),
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      fontFamily: {
        // Poppins for Latin text; Noto Sans supplies the Devanagari (Hindi) glyphs
        serif: ["var(--font-playfair)", "var(--font-noto-serif-deva)", "Georgia", "serif"],
        sans: ["var(--font-poppins)", "var(--font-noto-sans)", "Poppins", "sans-serif"],
        display: ["var(--font-playfair)", "var(--font-noto-serif-deva)", "Georgia", "serif"],
        headline: ["var(--font-playfair)", "var(--font-noto-serif-deva)", "Georgia", "serif"],
        body: ["var(--font-poppins)", "var(--font-noto-sans)", "Poppins", "sans-serif"],
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        gutter: "1rem",
        "gutter-desktop": "1.5rem",
        margin: "1rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3.5rem",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      const vars: Record<string, string> = {};
      for (const [name, hex] of Object.entries(PALETTE)) {
        vars[`--${name}`] = hex;
        vars[`--${name}-rgb`] = hexToRgb(hex);
      }
      addBase({ ":root": vars });
    }),
  ],
};

export default config;
