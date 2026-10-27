/**
 * The Kendra's public email. Used wherever an email is shown or linked, unless the admin has
 * saved a different one in Admin > Settings. Every "email us" link opens a mail to this address.
 */
export const KENDRA_EMAIL = "maharshikanadjyotishkendra@gmail.com";

const OLD_SAMPLE_EMAILS = ["contact@kanadastro.org", "vedic@kanad-jyotish.in", "sntiwarigevra61@gmail.com"];

/** The email to show: the one saved in Admin > Settings, otherwise the Kendra's own. */
export function kendraEmail(saved?: string | null): string {
  const value = (saved || "").trim();
  // Old sample addresses that were once saved in Settings are ignored
  return value && !OLD_SAMPLE_EMAILS.includes(value.toLowerCase()) ? value : KENDRA_EMAIL;
}
