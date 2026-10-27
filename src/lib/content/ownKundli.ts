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

/** The Kendra's own Kundli services. Their booking order is: select Kundli, fill the form, choose a plan, pay. */
export const KUNDLI_SERVICE_SLUGS = ["janam-kundli", "prashna-kundli", "kundli-matching"];

export function isKundliService(slug: string | undefined | null): boolean {
  return !!slug && KUNDLI_SERVICE_SLUGS.includes(slug);
}
