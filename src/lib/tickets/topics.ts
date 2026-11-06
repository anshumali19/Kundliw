/** SiteConfig key where the admin's own list is saved (Admin > Support tickets > Ready-made questions). */
export const TICKET_TOPICS_KEY = "ticket-topics";

/** The standard ready-made questions, used until the admin saves their own list. Customers can always type their own. */
export interface TicketTopic {
  id: string;
  en: string;
  hi: string;
}

export const TICKET_TOPICS: TicketTopic[] = [
  { id: "payment-not-confirmed", en: "My payment is not confirmed yet", hi: "मेरा भुगतान अभी पक्का नहीं हुआ" },
  { id: "payment-deducted", en: "Money was deducted but the booking failed", hi: "पैसे कट गए पर बुकिंग नहीं हुई" },
  { id: "invoice", en: "I need my invoice or GST bill", hi: "मुझे अपना इनवॉइस या GST बिल चाहिए" },
  { id: "kundli-delay", en: "My Kundli / report is delayed", hi: "मेरी कुंडली / रिपोर्ट में देरी हो रही है" },
  { id: "change-details", en: "I want to correct my birth details", hi: "मैं अपने जन्म विवरण सुधारना चाहता/चाहती हूँ" },
  { id: "call-time", en: "I want to change my call time", hi: "मैं अपनी कॉल का समय बदलना चाहता/चाहती हूँ" },
  { id: "offer-code", en: "My offer code is not working", hi: "मेरा ऑफ़र कोड काम नहीं कर रहा" },
  { id: "refund", en: "I want a refund or cancellation", hi: "मुझे रिफ़ंड या रद्द करना है" },
  { id: "upgrade", en: "I want to upgrade my plan", hi: "मैं अपना प्लान अपग्रेड करना चाहता/चाहती हूँ" },
  { id: "login", en: "I cannot sign in to my account", hi: "मैं अपने खाते में लॉगिन नहीं कर पा रहा/रही" },
  { id: "commission", en: "Question about my commission or payout (associate)", hi: "मेरे कमीशन या भुगतान के बारे में प्रश्न (एसोसिएट)" },
];
