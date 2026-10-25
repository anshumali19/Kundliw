import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Client palette (high contrast): Saffron #F4C430, Maroon #800000, Yellow #FFFF00, Red #FF0000.
 *
 * Rules the whole UI follows:
 *  - Maroon is used for text and borders everywhere; as a filled background ONLY in the
 *    footer Quick Links (`bg-maroon`).
 *  - Buttons and highlights are filled saffron (`bg-brand`) with maroon text (`text-on-brand`,
 *    6.7:1), and turn yellow (`bg-brand-hover`) on hover (10.2:1).
 *  - Red (`bg-signal`) is the accent for badges, offers and alerts, with white text on large
 *    or bold labels only (4.0:1).
 *  - Body text is a maroon-tinted black (#1A0000) on white or pale yellow (20:1).
 */
const PALETTE: Record<string, string> = {
  // Brand
  brand: "#F4C430",
  "brand-hover": "#FFFF00",
  "on-brand": "#800000",
  signal: "#FF0000",
  "on-signal": "#FFFFFF",
  maroon: "#800000",
  "on-maroon": "#FFFFFF",
  yellow: "#FFFF00",

  // Surfaces: white and soft yellow tints
  surface: "#FFFFFF",
  "surface-dim": "#F9EDB5",
  "surface-bright": "#FFFFFF",
  "surface-container-lowest": "#FFFFFF",
  "surface-container-low": "#FFFCE6",
  "surface-container": "#FFF7C2",
  "surface-container-high": "#FCEFA6",
  "surface-container-highest": "#F8E48B",
  "on-surface": "#1A0000",
  "on-surface-variant": "#4A1010",
  "inverse-surface": "#1A0000",
  "inverse-on-surface": "#FFFFFF",
  outline: "#6B2C2C",
  "outline-variant": "#DDB84A",
  "surface-tint": "#800000",

  // Primary and secondary accents are maroon text/borders; fills use brand
  primary: "#800000",
  "on-primary": "#FFFFFF",
  "primary-container": "#F4C430",
  "on-primary-container": "#800000",
  "primary-fixed": "#FFF1B0",
  "primary-fixed-dim": "#F4C430",
  "on-primary-fixed": "#1A0000",
  "on-primary-fixed-variant": "#800000",

  secondary: "#800000",
  "on-secondary": "#FFFFFF",
  "secondary-container": "#F4C430",
  "on-secondary-container": "#800000",
  "secondary-fixed": "#FFF1B0",
  "secondary-fixed-dim": "#F4C430",
  "on-secondary-fixed": "#1A0000",
  "on-secondary-fixed-variant": "#800000",

  tertiary: "#800000",
  "on-tertiary": "#FFFFFF",
  "tertiary-container": "#FFFF00",
  "on-tertiary-container": "#800000",
  "tertiary-fixed": "#FFFF00",
  "tertiary-fixed-dim": "#F4C430",
  "on-tertiary-fixed": "#800000",
  "on-tertiary-fixed-variant": "#800000",

  // Errors: red accents, maroon text on a pale red tint
  error: "#FF0000",
  "on-error": "#FFFFFF",
  "error-container": "#FFE3E3",
  "on-error-container": "#800000",
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
        DEFAULT: "0.125rem", // 2px
        md: "0.25rem",       // 4px
        lg: "0.375rem",
        xl: "0.5rem",
        full: "9999px",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif)", "Noto Serif", "serif"],
        sans: ["var(--font-noto-sans)", "Noto Sans", "sans-serif"],
        display: ["var(--font-noto-serif)", "Noto Serif", "serif"],
        headline: ["var(--font-noto-serif)", "Noto Serif", "serif"],
        body: ["var(--font-noto-sans)", "Noto Sans", "sans-serif"],
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
