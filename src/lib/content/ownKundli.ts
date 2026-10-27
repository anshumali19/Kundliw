/**
 * The main menu's Kundli, Prashna Kundli and Matching items are the Kendra's own Kundli services
 * (fill the form, pay, submit). The free AstroSage tools stay under More and in the footer.
 */
const OWN_KUNDLI_PAGES: Record<string, string> = {
  "/kundli": "/services/janam-kundli",
  "/kundli/prashna": "/services/prashna-kundli",
  "/kundli/matching": "/services/kundli-matching",
};

export function ownKundliHref(href: string): string {
  return OWN_KUNDLI_PAGES[href] ?? href;
}
