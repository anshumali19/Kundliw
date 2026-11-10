import { ADMIN_GUIDE_EN, ADMIN_GUIDE_HI } from "./adminGuideText";

export type GuideSlug = "user" | "associate" | "admin";

export const GUIDE_SLUGS: GuideSlug[] = ["user", "associate", "admin"];

export interface GuideContent {
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
}

/** StaticPage slug under which the admin can edit each guide. */
export const guidePageSlug = (slug: GuideSlug) => `guide-${slug}`;

/**
 * Starter guides, shown until the admin edits the matching page
 * (Admin > Pages & legal > "Guide: ..."). Pictures and videos are added in Admin > Guides & visuals.
 * They describe only what the system does.
 */
export const DEFAULT_GUIDES: Record<GuideSlug, GuideContent> = {
  user: {
    titleEn: "User Guide",
    titleHi: "उपयोगकर्ता मार्गदर्शिका",
    contentEn: `1. Create your account
Open Register, choose User Register and fill in your name, mobile number and email. You can sign in later with a mobile OTP.

2. Book a service, step by step
Step 1 Service: open Services and choose what you need.
Step 2 Package: pick the package (a version of the service).
Step 3 Plan: pick the plan. The price is shown.
Step 4 Offer: type a promo code if you have one, and the discount is shown.
Step 5 Your details: enter the birth details and, if the plan has a call, choose a time.
A small strip at the top of each page shows which step you are on.

3. Pay
Pay online, or pay by UPI, QR code or bank transfer using the details shown, and enter the payment reference. Manual payments are confirmed by the Kendra team. Some services, such as Matrimonial and Bharat Darshan, are paid on their own partner website; you are told this before you go there.

4. Your bill and invoice
After payment is confirmed, open My Account. On each paid order you can download the GST invoice and the confirmation ticket.

5. Track your order
My Account shows each stage: Order Received, In Progress, Complete, Dispatched and Delivered. A tracking number is shown when a printed copy is sent. Appointment approval is shown too.

6. Your documents
Reports and files uploaded for you appear in My documents (vault).

7. Need help?
Open Support tickets from My Account (or the Tickets icon on the Contact page), write your problem and press Raise ticket. The Kendra replies in the same ticket. You can also use the Call, WhatsApp, Chat and Ask AI buttons.

8. This guide
Use View, Download or Print on My Account to keep a copy.`,
    contentHi: `1. खाता बनाएँ
रजिस्टर खोलकर यूज़र रजिस्टर चुनें और अपना नाम, मोबाइल नंबर तथा ईमेल भरें। आगे मोबाइल OTP से लॉगिन कर सकते हैं।

2. सेवा बुक करें, चरण दर चरण
चरण 1 सेवा: सेवाएँ खोलकर अपनी आवश्यकता की सेवा चुनें।
चरण 2 पैकेज: पैकेज (सेवा का रूप) चुनें।
चरण 3 प्लान: प्लान चुनें। कीमत दिखती है।
चरण 4 ऑफ़र: प्रोमो कोड हो तो भरें, छूट दिखेगी।
चरण 5 आपका विवरण: जन्म विवरण भरें और यदि प्लान में कॉल है तो समय चुनें।
हर पेज के ऊपर की पट्टी बताती है कि आप किस चरण पर हैं।

3. भुगतान
ऑनलाइन, या दिखाए गए विवरण से UPI, QR कोड अथवा बैंक ट्रांसफर द्वारा भुगतान करें और संदर्भ संख्या भरें। मैनुअल भुगतान केंद्र की टीम पक्का करती है। कुछ सेवाओं, जैसे विवाह और भारत दर्शन, का भुगतान उनकी अपनी सहयोगी वेबसाइट पर होता है; वहाँ जाने से पहले आपको यह बताया जाता है।

4. आपका बिल और इनवॉइस
भुगतान पक्का होने के बाद मेरा खाता खोलें। हर भुगतान हुए ऑर्डर पर GST इनवॉइस और कन्फर्मेशन टिकट डाउनलोड कर सकते हैं।

5. ऑर्डर की स्थिति
मेरा खाता में हर चरण दिखता है: ऑर्डर प्राप्त, कार्य जारी, तैयार, भेजा गया और वितरित। प्रिंटेड प्रति भेजी जाने पर ट्रैकिंग नंबर दिखता है। अपॉइंटमेंट की स्वीकृति भी दिखती है।

6. आपके दस्तावेज़
आपके लिए अपलोड की गई रिपोर्ट और फ़ाइलें मेरे दस्तावेज़ (वॉल्ट) में मिलती हैं।

7. मदद चाहिए?
मेरा खाता से सहायता टिकट (या संपर्क पेज का टिकट आइकन) खोलें, समस्या लिखें और टिकट बनाएँ दबाएँ। केंद्र उसी टिकट में उत्तर देता है। कॉल, व्हाट्सएप, चैट और Ask AI बटन भी उपलब्ध हैं।

8. यह गाइड
प्रति रखने के लिए मेरा खाता पर देखें, डाउनलोड या प्रिंट का उपयोग करें।`,
  },
  associate: {
    titleEn: "Associate Guide",
    titleHi: "एसोसिएट मार्गदर्शिका",
    contentEn: `1. Register
Open Register and choose Associate Register. Fill in your details and set a password. Your account starts as "Awaiting approval".

2. Approval
The Kendra reviews your application. You are notified by email when it is approved or declined. Your referral link works only after approval.

3. Your dashboard
The top of the dashboard explains each part in six short steps. Below it you see your referral link, your commission table, your payout requests and, at the bottom, every Service, Package, Plan and Offer you can recommend (view only).

4. Share your referral link
Your personal link looks like /r/YOURCODE. Share it by WhatsApp or any other way. When a visitor opens your link and books within 30 days, the booking is credited to you.

5. Commission
The Kendra sets the commission (a fixed amount or a percentage) per service or plan. It is calculated on the booking amount before GST. A commission is "Pending" until the customer's payment is confirmed, then "Earned".

6. Request a payout
Add your UPI or bank details, then press Request payout. The Kendra reviews the request and pays you directly. The request then shows as Paid with a reference, or Declined with a reason.

7. Rules
You cannot earn commission on your own bookings. Commission on cancelled, expired or refunded bookings is cancelled. Commission already paid is not changed.

8. Help and this guide
Raise a Support ticket from the dashboard for any problem; the Kendra replies in the ticket. Use View, Download or Print on the dashboard to keep a copy of this guide.`,
    contentHi: `1. रजिस्टर करें
रजिस्टर खोलकर एसोसिएट रजिस्टर चुनें, अपना विवरण भरें और पासवर्ड बनाएँ। आपका खाता "स्वीकृति की प्रतीक्षा" में शुरू होता है।

2. स्वीकृति
केंद्र आपके आवेदन की समीक्षा करता है। स्वीकृत या अस्वीकृत होने पर आपको ईमेल से सूचना मिलती है। आपका रेफ़रल लिंक स्वीकृति के बाद ही काम करता है।

3. आपका डैशबोर्ड
डैशबोर्ड के ऊपर छह छोटे चरणों में हर हिस्सा समझाया गया है। उसके नीचे आपका रेफ़रल लिंक, कमीशन तालिका, भुगतान अनुरोध और सबसे नीचे हर सेवा, पैकेज, प्लान और ऑफ़र दिखता है जिसकी आप सिफ़ारिश कर सकते हैं (केवल देखने के लिए)।

4. रेफ़रल लिंक साझा करें
आपका निजी लिंक /r/आपका-कोड जैसा होता है। इसे व्हाट्सएप या किसी भी माध्यम से साझा करें। कोई आगंतुक आपका लिंक खोलकर 30 दिनों के भीतर बुकिंग करे तो वह आपके नाम दर्ज होती है।

5. कमीशन
केंद्र प्रत्येक सेवा या प्लान के लिए कमीशन (निश्चित राशि या प्रतिशत) तय करता है। यह GST से पहले की बुकिंग राशि पर गिना जाता है। ग्राहक का भुगतान पक्का होने तक कमीशन "लंबित" रहता है, फिर "अर्जित" हो जाता है।

6. भुगतान का अनुरोध
अपना UPI या बैंक विवरण भरें, फिर भुगतान का अनुरोध करें दबाएँ। केंद्र अनुरोध की समीक्षा कर सीधे आपको भुगतान करता है। इसके बाद अनुरोध संदर्भ के साथ "भुगतान किया गया" या कारण के साथ "अस्वीकृत" दिखता है।

7. नियम
अपनी स्वयं की बुकिंग पर कमीशन नहीं मिलता। रद्द, समाप्त या वापस की गई बुकिंग का कमीशन रद्द हो जाता है। जो कमीशन पहले ही चुकाया जा चुका है वह नहीं बदलता।

8. मदद और यह गाइड
किसी भी समस्या के लिए डैशबोर्ड से सहायता टिकट बनाएँ; केंद्र टिकट में ही उत्तर देता है। इस गाइड की प्रति रखने के लिए डैशबोर्ड पर देखें, डाउनलोड या प्रिंट का उपयोग करें।`,
  },
  admin: {
    titleEn: "Admin Guide",
    titleHi: "एडमिन मार्गदर्शिका",
    // The full illustrated guide as editable text (Admin > Pages & legal > Guide: Admin). Screens are in the PDFs.
    contentEn: ADMIN_GUIDE_EN,
    contentHi: ADMIN_GUIDE_HI,
  },
};
