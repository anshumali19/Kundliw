/**
 * Escapes a value for safe interpolation into HTML text or attribute context.
 * Used for invoice rendering where customer-supplied names/notes must never be
 * able to inject markup or script.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
