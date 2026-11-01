/** Services paid for on another website (for example the matrimonial and pilgrimage partner sites). */
export interface ExternalPay {
  url: string;
  noteEn?: string | null;
  noteHi?: string | null;
}

const DEFAULT_EN = "Payment for this service is made on the partner website, not on this site. You will be taken there to complete your booking and pay.";
const DEFAULT_HI = "इस सेवा का भुगतान इस साइट पर नहीं, सहयोगी वेबसाइट पर होता है। बुकिंग और भुगतान पूरा करने के लिए आपको वहाँ भेजा जाएगा।";

/** The notice shown to the visitor: the admin's own words when written, else a standard sentence. */
export function externalPayNotice(pay: ExternalPay, isHindi: boolean): string {
  return (isHindi ? pay.noteHi || DEFAULT_HI : pay.noteEn || DEFAULT_EN).trim();
}

/** Builds the value from a service row, or null when the service is paid for here. */
export function externalPayOf(s: { externalPayUrl?: string | null; externalPayNoteEn?: string | null; externalPayNoteHi?: string | null }): ExternalPay | null {
  return s.externalPayUrl ? { url: s.externalPayUrl, noteEn: s.externalPayNoteEn, noteHi: s.externalPayNoteHi } : null;
}
