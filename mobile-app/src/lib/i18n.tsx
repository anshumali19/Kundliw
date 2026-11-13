import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

export type Lang = "hi" | "en";
const LANG_KEY = "kjk.lang";

/** Every word the app shows, in English and Hindi. Hindi labels match the website's. */
const STRINGS = {
  appName: { en: "Maharshi Kanad Jyotish Kendra", hi: "महर्षि कणाद ज्योतिष केंद्र" },
  user: { en: "User", hi: "यूज़र" },
  associate: { en: "Associate", hi: "एसोसिएट" },
  signInAs: { en: "Sign in as", hi: "लॉगिन का प्रकार" },
  mobileOtp: { en: "Mobile OTP", hi: "मोबाइल ओटीपी" },
  emailPassword: { en: "Email & password", hi: "ईमेल एवं पासवर्ड" },
  mobileNumber: { en: "Mobile number (+91)", hi: "मोबाइल नंबर (+91)" },
  sendOtp: { en: "Send OTP", hi: "ओटीपी (OTP) भेजें" },
  otpSent: { en: "A 6-digit code was sent to your mobile number.", hi: "आपके मोबाइल नंबर पर 6 अंकों का कोड भेजा गया है।" },
  enterOtp: { en: "6-digit code", hi: "6 अंकों का कोड" },
  verify: { en: "Verify and sign in", hi: "सत्यापित कर लॉगिन करें" },
  changeNumber: { en: "Change number", hi: "नंबर बदलें" },
  emailOrMobile: { en: "Email or mobile number", hi: "ईमेल या मोबाइल नंबर" },
  password: { en: "Password", hi: "पासवर्ड" },
  showPassword: { en: "Show password", hi: "पासवर्ड दिखाएँ" },
  hidePassword: { en: "Hide password", hi: "पासवर्ड छिपाएँ" },
  signIn: { en: "Sign in", hi: "लॉगिन" },
  forgotPassword: { en: "Forgot password?", hi: "पासवर्ड भूल गए?" },
  register: { en: "New here? Register on the website", hi: "नए हैं? वेबसाइट पर पंजीकरण करें" },
  invalidPhone: { en: "Enter a valid 10-digit mobile number.", hi: "सही 10 अंकों का मोबाइल नंबर लिखें।" },
  invalidOtp: { en: "Enter the 6-digit code.", hi: "6 अंकों का कोड लिखें।" },
  fillBoth: { en: "Enter your email or mobile number and your password.", hi: "अपना ईमेल या मोबाइल नंबर और पासवर्ड लिखें।" },
  home: { en: "Home", hi: "मुख्य पृष्ठ" },
  account: { en: "My account", hi: "मेरा खाता" },
  namaste: { en: "Namaste", hi: "नमस्ते" },
  services: { en: "Services", hi: "सेवाएँ" },
  from: { en: "From", hi: "प्रारंभ" },
  plans: { en: "plans", hi: "प्लान" },
  noServices: { en: "No services are listed right now.", hi: "अभी कोई सेवा सूचीबद्ध नहीं है।" },
  retry: { en: "Try again", hi: "फिर कोशिश करें" },
  bookOnWebsite: { en: "Booking in the app is coming soon. Tap a service to book it on the website.", hi: "ऐप में बुकिंग शीघ्र आ रही है। वेबसाइट पर बुक करने के लिए सेवा पर दबाएँ।" },
  role: { en: "Account type", hi: "खाते का प्रकार" },
  mobile: { en: "Mobile", hi: "मोबाइल" },
  email: { en: "Email", hi: "ईमेल" },
  associateStatus: { en: "Associate status", hi: "एसोसिएट स्थिति" },
  language: { en: "Language", hi: "भाषा" },
  legal: { en: "Policies", hi: "नीतियाँ" },
  terms: { en: "Terms & Conditions", hi: "नियम एवं शर्तें" },
  privacy: { en: "Privacy Policy", hi: "गोपनीयता नीति" },
  refund: { en: "Refund Policy", hi: "धनवापसी नीति" },
  cancellation: { en: "Cancellation Policy", hi: "रद्दीकरण नीति" },
  signOut: { en: "Log out", hi: "लॉग आउट" },
  deleteAccount: { en: "Delete my account", hi: "मेरा खाता हटाएँ" },
  deleteTitle: { en: "Delete your account", hi: "अपना खाता हटाएँ" },
  deleteWarning: { en: "This cannot be undone.", hi: "इसे वापस नहीं किया जा सकता।" },
  deleteWhat: {
    en: "Your name, email, mobile number, password, Vault files and (for Associates) payout details are removed. Orders, GST invoices and commission records are kept as the law requires, without your name.",
    hi: "आपका नाम, ईमेल, मोबाइल नंबर, पासवर्ड, वॉल्ट की फ़ाइलें और (एसोसिएट के लिए) भुगतान विवरण हटा दिए जाते हैं। ऑर्डर, GST इनवॉइस और कमीशन के अभिलेख कानून के अनुसार आपके नाम के बिना रखे जाते हैं।",
  },
  typeDelete: { en: "Type DELETE to confirm", hi: "पुष्टि के लिए DELETE लिखें" },
  passwordIfAny: { en: "Your password (if your account has one)", hi: "आपका पासवर्ड (यदि खाते में है)" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  loading: { en: "Loading...", hi: "लोड हो रहा है..." },
  tapToBook: { en: "Choose a service to see its plans and book.", hi: "प्लान देखने और बुक करने के लिए सेवा चुनें।" },
  myOrders: { en: "My orders", hi: "मेरे ऑर्डर" },
  noOrders: { en: "You have no orders yet.", hi: "अभी आपका कोई ऑर्डर नहीं है।" },
  orderNo: { en: "Order", hi: "ऑर्डर" },
  plan: { en: "plan", hi: "प्लान" },
  choosePlan: { en: "Choose a plan", hi: "प्लान चुनें" },
  deliveryIn: { en: "Delivery in", hi: "डिलीवरी" },
  days: { en: "days", hi: "दिन" },
  pagesWord: { en: "pages", hi: "पृष्ठ" },
  callOf: { en: "Call of", hi: "कॉल" },
  minutes: { en: "min", hi: "मिनट" },
  includesCall: { en: "Includes a consultation call", hi: "परामर्श कॉल शामिल" },
  bookThisPlan: { en: "Book this plan", hi: "यह प्लान बुक करें" },
  noPlans: { en: "No plans are available for this service right now.", hi: "इस सेवा के लिए अभी कोई प्लान उपलब्ध नहीं है।" },
  bookingTitle: { en: "Book", hi: "बुकिंग" },
  yourDetails: { en: "Your birth details", hi: "आपकी जन्म जानकारी" },
  fullName: { en: "Full name", hi: "पूरा नाम" },
  gender: { en: "Gender", hi: "लिंग" },
  male: { en: "Male", hi: "पुरुष" },
  female: { en: "Female", hi: "महिला" },
  other: { en: "Other", hi: "अन्य" },
  dob: { en: "Date of birth (DD-MM-YYYY)", hi: "जन्म तिथि (DD-MM-YYYY)" },
  tob: { en: "Time of birth (24-hour, HH:MM)", hi: "जन्म समय (24 घंटे, HH:MM)" },
  timeUnknown: { en: "I do not know the birth time", hi: "मुझे जन्म समय नहीं पता" },
  pob: { en: "Place of birth", hi: "जन्म स्थान" },
  contactPhone: { en: "Mobile number", hi: "मोबाइल नंबर" },
  emailOptional: { en: "Email (optional)", hi: "ईमेल (वैकल्पिक)" },
  reportLanguage: { en: "Language of your report", hi: "रिपोर्ट की भाषा" },
  queries: { en: "Your questions (optional)", hi: "आपके प्रश्न (वैकल्पिक)" },
  familyDetails: { en: "Family details", hi: "पारिवारिक जानकारी" },
  fatherName: { en: "Father's name", hi: "पिता का नाम" },
  motherName: { en: "Mother's name", hi: "माता का नाम" },
  grandfatherName: { en: "Grandfather's name", hi: "दादा का नाम" },
  gotra: { en: "Gotra", hi: "गोत्र" },
  address: { en: "Address", hi: "पता" },
  partnerDetails: { en: "Partner's birth details", hi: "जीवनसाथी की जन्म जानकारी" },
  partnerName: { en: "Partner's full name", hi: "जीवनसाथी का पूरा नाम" },
  chooseSlot: { en: "Choose a call time", hi: "कॉल का समय चुनें" },
  noSlots: { en: "No call times are open right now. Please try again later.", hi: "अभी कोई कॉल समय उपलब्ध नहीं है। कृपया बाद में प्रयास करें।" },
  offerCode: { en: "Offer code (optional)", hi: "ऑफ़र कोड (वैकल्पिक)" },
  apply: { en: "Apply", hi: "लागू करें" },
  removeOffer: { en: "Remove", hi: "हटाएँ" },
  offerApplied: { en: "Offer applied", hi: "ऑफ़र लागू हुआ" },
  priceSummary: { en: "Price", hi: "मूल्य" },
  basePrice: { en: "Plan price", hi: "प्लान का मूल्य" },
  discount: { en: "Discount", hi: "छूट" },
  gstLine: { en: "GST", hi: "जीएसटी" },
  total: { en: "Total to pay", hi: "कुल देय" },
  placeOrder: { en: "Continue to payment", hi: "भुगतान के लिए आगे बढ़ें" },
  totalNote: { en: "The final amount is confirmed by the Kendra when your order is created.", hi: "अंतिम राशि ऑर्डर बनने पर केंद्र द्वारा तय की जाती है।" },
  errName: { en: "Enter at least 2 letters.", hi: "कम से कम 2 अक्षर लिखें।" },
  errDob: { en: "Enter a real date like 25-12-1990.", hi: "सही तारीख लिखें, जैसे 25-12-1990।" },
  errTob: { en: "Enter the time like 06:05 or 18:30.", hi: "समय ऐसे लिखें: 06:05 या 18:30।" },
  errPob: { en: "Enter the place of birth.", hi: "जन्म स्थान लिखें।" },
  errPhone: { en: "Enter a valid 10-digit mobile number.", hi: "सही 10 अंकों का मोबाइल नंबर लिखें।" },
  errEmail: { en: "Enter a valid email address.", hi: "सही ईमेल पता लिखें।" },
  errRequired: { en: "This is required.", hi: "यह जानकारी आवश्यक है।" },
  errSlot: { en: "Choose a time for the call.", hi: "कॉल के लिए समय चुनें।" },
  fixErrors: { en: "Please correct the marked fields.", hi: "कृपया चिह्नित जानकारी ठीक करें।" },
  payTitle: { en: "Payment", hi: "भुगतान" },
  amountToPay: { en: "Amount to pay", hi: "देय राशि" },
  payStep: { en: "Send the amount to the Kendra by UPI or bank transfer, then enter the reference number below.", hi: "राशि UPI या बैंक ट्रांसफर से केंद्र को भेजें, फिर नीचे संदर्भ संख्या लिखें।" },
  payByUpi: { en: "Pay by UPI", hi: "UPI से भुगतान" },
  payByBank: { en: "Bank transfer", hi: "बैंक ट्रांसफर" },
  upiId: { en: "UPI ID", hi: "UPI आईडी" },
  accountName: { en: "Account name", hi: "खाते का नाम" },
  accountNumber: { en: "Account number", hi: "खाता संख्या" },
  ifsc: { en: "IFSC", hi: "IFSC" },
  bank: { en: "Bank", hi: "बैंक" },
  copy: { en: "Copy", hi: "कॉपी" },
  copied: { en: "Copied", hi: "कॉपी हो गया" },
  utr: { en: "UPI UTR / bank reference number", hi: "UPI UTR / बैंक संदर्भ संख्या" },
  utrRequired: { en: "Enter the reference number of your payment.", hi: "अपने भुगतान की संदर्भ संख्या लिखें।" },
  submitPayment: { en: "I have paid, submit", hi: "मैंने भुगतान कर दिया, जमा करें" },
  paymentSent: { en: "Thank you. The Kendra will verify your payment and confirm your order.", hi: "धन्यवाद। केंद्र आपका भुगतान जाँचकर ऑर्डर की पुष्टि करेगा।" },
  payNow: { en: "Pay now", hi: "अभी भुगतान करें" },
  noPayInfo: { en: "The payment details are not set up yet. Please contact the Kendra.", hi: "भुगतान की जानकारी अभी नहीं जुड़ी है। कृपया केंद्र से संपर्क करें।" },
  orderStatus: { en: "Order status", hi: "ऑर्डर की स्थिति" },
  paymentStatus: { en: "Payment", hi: "भुगतान" },
  callTime: { en: "Call time", hi: "कॉल का समय" },
  rejectedNote: { en: "Your payment could not be verified", hi: "आपका भुगतान सत्यापित नहीं हो सका" },
  cancelled: { en: "Cancelled", hi: "रद्द" },
  placedOn: { en: "Placed on", hi: "ऑर्डर की तिथि" },
  invoiceNo: { en: "Invoice", hi: "इनवॉइस" },
} as const;

/** Words for the order and payment states the server sends. */
const ORDER_STATUS = {
  ORDER_RECEIVED: { en: "Order received", hi: "ऑर्डर प्राप्त" },
  KUNDLI_IN_PROGRESS: { en: "Being prepared", hi: "तैयार हो रहा है" },
  KUNDLI_COMPLETE: { en: "Ready", hi: "तैयार" },
  DISPATCHED: { en: "Dispatched", hi: "भेजा गया" },
  DELIVERED: { en: "Delivered", hi: "वितरित" },
  EXECUTION_COMPLETE: { en: "Completed", hi: "पूर्ण" },
} as const;
const PAYMENT_STATUS = {
  PENDING: { en: "Payment pending", hi: "भुगतान बाकी" },
  AWAITING_VERIFICATION: { en: "Payment being verified", hi: "भुगतान की जाँच हो रही है" },
  PAID: { en: "Paid", hi: "भुगतान हो गया" },
  FAILED: { en: "Payment failed", hi: "भुगतान विफल" },
  REFUNDED: { en: "Refunded", hi: "धनवापसी हुई" },
} as const;

export function orderStatusLabel(lang: Lang, status: string): string {
  return (ORDER_STATUS as Record<string, { en: string; hi: string }>)[status]?.[lang] ?? status;
}
export function paymentStatusLabel(lang: Lang, status: string): string {
  return (PAYMENT_STATUS as Record<string, { en: string; hi: string }>)[status]?.[lang] ?? status;
}

export type StringKey = keyof typeof STRINGS;

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey) => string;
  /** Picks the English or Hindi field of something from the server. */
  pick: (en: string | null | undefined, hi: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function translate(lang: Lang, key: StringKey): string {
  return STRINGS[key][lang];
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Hindi first, like the website
  const [lang, setLangState] = useState<Lang>("hi");

  useEffect(() => {
    SecureStore.getItemAsync(LANG_KEY)
      .then((saved) => {
        if (saved === "en" || saved === "hi") setLangState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    SecureStore.setItemAsync(LANG_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t: (key) => translate(lang, key),
      pick: (en, hi) => (lang === "hi" ? hi || en || "" : en || hi || ""),
    }),
    [lang, setLang],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
