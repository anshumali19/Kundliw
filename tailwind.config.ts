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
  // Brand
  brand: "#F96706",
  "brand-hover": "#D95705",
  "on-brand": "#FFFFFF",
  gold: "#FFC105",
  "on-gold": "#261B17",
  signal: "#E83A3A",
  "on-signal": "#FFFFFF",
  maroon: "#661919",
  "on-maroon": "#FFFFFF",
  yellow: "#FFC105",

  // Surfaces: warm cream with peach tints
  surface: "#FCFAF8",
  "surface-dim": "#F0E4D8",
  "surface-bright": "#FFFFFF",
  "surface-container-lowest": "#FFFFFF",
  "surface-container-low": "#FFF8F1",
  "surface-container": "#FFF2E5",
  "surface-container-high": "#FBE6D2",
  "surface-container-highest": "#F5D9BF",
  "on-surface": "#261B17",
  "on-surface-variant": "#5F4F49",
  "inverse-surface": "#261B17",
  "inverse-on-surface": "#FFFFFF",
  outline: "#7E6D67",
  "outline-variant": "#E8E0D9",
  "surface-tint": "#F96706",

  // Primary: deep orange for accent text; fills use brand
  primary: "#B04600",
  "on-primary": "#FFFFFF",
  "primary-container": "#FFE4CC",
  "on-primary-container": "#7A2E00",
  "primary-fixed": "#FFE4CC",
  "primary-fixed-dim": "#F96706",
  "on-primary-fixed": "#261B17",
  "on-primary-fixed-variant": "#7A2E00",

  // Secondary: dark brown for headings
  secondary: "#2B1A14",
  "on-secondary": "#FFFFFF",
  "secondary-container": "#FFE9D0",
  "on-secondary-container": "#2B1A14",
  "secondary-fixed": "#FFE9D0",
  "secondary-fixed-dim": "#F96706",
  "on-secondary-fixed": "#261B17",
  "on-secondary-fixed-variant": "#2B1A14",

  // Tertiary: maroon text, gold fills
  tertiary: "#661919",
  "on-tertiary": "#FFFFFF",
  "tertiary-container": "#FFC105",
  "on-tertiary-container": "#261B17",
  "tertiary-fixed": "#FFC105",
  "tertiary-fixed-dim": "#F96706",
  "on-tertiary-fixed": "#261B17",
  "on-tertiary-fixed-variant": "#661919",

  // Errors: red accent, dark red text on a pale red tint
  error: "#E83A3A",
  "on-error": "#FFFFFF",
  "error-container": "#FDE3E3",
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
        serif: ["var(--font-poppins)", "var(--font-noto-sans)", "Poppins", "sans-serif"],
        sans: ["var(--font-poppins)", "var(--font-noto-sans)", "Poppins", "sans-serif"],
        display: ["var(--font-poppins)", "var(--font-noto-sans)", "Poppins", "sans-serif"],
        headline: ["var(--font-poppins)", "var(--font-noto-sans)", "Poppins", "sans-serif"],
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
