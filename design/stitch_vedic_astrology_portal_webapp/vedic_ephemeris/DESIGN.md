---
name: Vedic Ephemeris
colors:
  surface: '#fff8f6'
  surface-dim: '#ebd5ce'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#ffe9e2'
  surface-container-high: '#fae3dc'
  surface-container-highest: '#f4ded7'
  on-surface: '#241915'
  on-surface-variant: '#574237'
  inverse-surface: '#3b2d29'
  inverse-on-surface: '#ffede7'
  outline: '#8a7265'
  outline-variant: '#dec1b1'
  surface-tint: '#984700'
  primary: '#984700'
  on-primary: '#ffffff'
  primary-container: '#e8751a'
  on-primary-container: '#4d2100'
  inverse-primary: '#ffb68a'
  secondary: '#9c413f'
  on-secondary: '#ffffff'
  secondary-container: '#fe8e88'
  on-secondary-container: '#762524'
  tertiary: '#785900'
  on-tertiary: '#ffffff'
  tertiary-container: '#bd8e00'
  on-tertiary-container: '#3c2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb68a'
  on-primary-fixed: '#321300'
  on-primary-fixed-variant: '#743500'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410005'
  on-secondary-fixed-variant: '#7d2b29'
  tertiary-fixed: '#ffdf9d'
  tertiary-fixed-dim: '#f9bd14'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#fff8f6'
  on-background: '#241915'
  surface-variant: '#f4ded7'
typography:
  display:
    fontFamily: Noto Serif
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.01em
  display-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: '0'
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.005em
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: '0'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: '0'
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Noto Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the intellectual gravity, spiritual precision, and enduring authority of classical Indian astronomical sciences (Jyotisha). It is deliberately anti-SaaS, evoking physical lithographic panchang calendars, weathered Sanskrit manuscripts, copper inscriptions, and classical Indian broadsheet publishing. 

The aesthetic is grounded, scholarly, and contemplative. It rejects contemporary app trends—no synthetic blur filters, no rounded pill containers, and no hyper-saturated digital gradients. Visual structure is disciplined through asymmetric editorial compositions, deliberate hairline framework rules, and rigorous bilingual hierarchy catering equally to English and Devanagari readers.

## Colors

The palette is rooted in classical organic pigments of sacred ritual and traditional publication:

- **Primary (`#E8751A` - Saffron):** Reserved for primary interactive elements, critical astronomical indicators, and focal focal points.
- **Secondary (`#6B1D1D` - Deep Kumkum Maroon):** Anchors structural architecture, prominent mastheads, footers, section markers, and hairline divider rules.
- **Tertiary (`#F2B705` - Turmeric Yellow):** Applied strictly to auspicious status badges, nakshatra indicators, and subtle informational highlights.
- **Surface / Background (`#FFF8EC` - Warm Parchment):** The foundation canvas mimicking pressed handmade parchment.
- **Neutral / Text (`#1F1410` - Near-Black Charred Ink):** High-contrast, uncompromising ink tone for sharp body legibility across both Latin and Devanagari scripts.
- **Hairline Border Rule (`#E5D5C5`):** Low-contrast architectural divider tone used to separate information clusters without visual bulk.

## Typography

Typography prioritizes bilingual parity across Latin and Devanagari scripts:

- **Editorial Headings (Noto Serif):** Classical, sturdy serifs evoke antique printings. Headings maintain a balanced x-height and clear shirorekha alignment in Devanagari.
- **Informational Text & Metrics (Noto Sans):** Selected for clinical clarity in compact ephemeris calculations, astronomical tables, and long-form readings.
- **Labels:** Rendered in small-caps for Latin script with extended tracking (`0.08em` to `0.1em`) to simulate hot-metal typesetting, and bold medium weight for Devanagari terms.

## Layout & Spacing

The layout is constructed as an asymmetrical, broadsheet-inspired multi-column grid:

- **Grid Model:** 12-column desktop grid with a dominant 8-column primary content pane offset by a 4-column reference pane for ephemeris sidebars and panchang calculations. On mobile, content folds into a single left-aligned column.
- **Structural Framing:** Content blocks are demarcated by 1px solid hairline borders in `#E5D5C5` and secondary structural breaks in `#6B1D1D`.
- **Rhythm:** Spacing remains compact and purposeful, reflecting data-dense traditional manuscripts rather than expansive SaaS whitespace.

## Elevation & Depth

Visual hierarchy uses strictly physical, planar techniques:

- **Zero Drop Shadows:** Depth is never communicated through ambient blurs or elevation offsets.
- **Border Partitioning:** Spatial division relies on structural 1px borders, subtle double-hairline frames (simulating traditional manuscript borders), and tonal shifts.
- **Surface Layering:** Highlighted containers utilize solid fills of parchment variations (`#FFF8EC` to `#F9EED9`) framed with `#6B1D1D` borders to establish focus without lifting off the page plane.

## Shapes

Containers, charts, and interactive components feature a uniform 4px (`roundedness: 1`) boundary radius. Sharp corners and micro-curvatures balance the precision of lithographic prints with modern screen ergonomics. Circular geometry is reserved strictly for planetary glyph indicators and cosmological yantra motifs.

## Components

### Buttons
- **Primary:** Solid Saffron (`#E8751A`) background, `#FFF8EC` text, 4px radius, 1px border (`#C65E0C`). Hover shifts to deepened saffron.
- **Secondary / Scholarly:** Deep Maroon (`#6B1D1D`) outline (1px), `#6B1D1D` text, transparent background. Hover fills with `#6B1D1D` and shifts text to `#FFF8EC`.

### Kundali & Kundali Chart Grids
- Classical North-Indian (diamond) and South-Indian (square) astrological house frames drawn with 1px or 2px `#6B1D1D` rules.
- House numbers and zodiac abbreviations styled in small-caps `label-sm` with planetary glyphs rendered in high-contrast `#1F1410`.

### Panchang Horizontal Strip
- A continuous horizontal daily ephemeris bar bounded by upper and lower `#6B1D1D` hairlines.
- Divided into columns: Tithi, Vaar, Nakshatra, Yoga, and Karana. Each block pairs an uppercase tracked label above a serif value.

### Language Switcher [EN | हिं]
- Minimalist segmented toggle framed in a 1px `#6B1D1D` border.
- Active state uses an ink-stamp fill of `#6B1D1D` with `#FFF8EC` typography; inactive state retains a parchment background with maroon text.

### Badges & Astrological Markers
- Compact, flat chips with a 4px corner radius.
- Auspicious markers (e.g., Shubh Muhurat) use a Turmeric (`#F2B705`) fill with `#1F1410` text. Critical cautions (e.g., Rahu Kaal) use `#6B1D1D` with `#FFF8EC` text.

### Form Inputs
- Flat, parchment-toned backgrounds (`#FFFDF7`) surrounded by 1px `#E5D5C5` borders.
- Active focus transitions the border to `#6B1D1D` with no outer focus glow. Labels sit outside the field in tracked uppercase serif.