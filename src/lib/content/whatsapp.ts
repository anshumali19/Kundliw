/** Builds a wa.me link to the Kendra's WhatsApp number with a ready message. */
export function whatsappDigits(raw?: string | null): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 10) d = `91${d}`;
  return d;
}

export function whatsappLink(raw: string | null | undefined, text: string): string {
  const d = whatsappDigits(raw);
  if (!d) return "#";
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
