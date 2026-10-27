/**
 * The Kendra's public email. Used wherever an email is shown or linked, unless the admin has
 * saved a different one in Admin > Settings. Every "email us" link opens a mail to this address.
 */
export const KENDRA_EMAIL = "maharshikanadjyotishkendra@gmail.com";

/** The email to show: the one saved in Admin > Settings, otherwise the Kendra's own. */
export function kendraEmail(saved?: string | null): string {
  return (saved || "").trim() || KENDRA_EMAIL;
}
