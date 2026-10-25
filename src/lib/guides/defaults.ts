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
 * (Admin > Pages > "Guide: ..."). They describe only what the system does.
 */
export const DEFAULT_GUIDES: Record<GuideSlug, GuideContent> = {
  user: {
    titleEn: "User Guide",
    titleHi: "उपयोगकर्ता मार्गदर्शिका",
    contentEn: `1. Create your account
Open Register, choose User Register and fill in your name, mobile number and email. You can sign in later with a mobile OTP.

2. Book a service
Open Services, choose a service and a plan, enter the birth details, choose an appointment time if the plan includes a call, and apply an offer code if you have one.

3. Pay
Pay online, or pay by UPI or bank transfer using the details shown and enter the payment reference. Manual payments are confirmed by the Kendra team.

4. Track your order
Open My Account to see each stage: Order Received, In Progress, Complete, Dispatched and Delivered. Appointment approval is shown there too.

5. Download your documents
Reports and files uploaded for you appear in your account vault. Your invoice can be downloaded once the payment is confirmed.

6. Need help?
Use the Call, WhatsApp, Chat and Ask AI buttons on the website, or the Contact page.`,
    contentHi: `1. खाता बनाएँ
रजिस्टर खोलकर यूज़र रजिस्टर चुनें और अपना नाम, मोबाइल नंबर तथा ईमेल भरें। आगे मोबाइल OTP से लॉगिन कर सकते हैं।

2. सेवा बुक करें
सेवाएँ खोलकर सेवा और प्लान चुनें, जन्म विवरण भरें, यदि प्लान में कॉल शामिल है तो अपॉइंटमेंट का समय चुनें और ऑफ़र कोड हो तो लगाएँ।

3. भुगतान करें
ऑनलाइन भुगतान करें, या दिखाए गए UPI अथवा बैंक विवरण से भुगतान कर भुगतान संदर्भ संख्या दर्ज करें। मैन्युअल भुगतान की पुष्टि केंद्र की टीम करती है।

4. ऑर्डर ट्रैक करें
मेरा खाता में हर चरण देखें: ऑर्डर प्राप्त, प्रगति में, पूर्ण, प्रेषित और वितरित। अपॉइंटमेंट की स्वीकृति भी वहीं दिखती है।

5. दस्तावेज़ डाउनलोड करें
आपके लिए अपलोड की गई रिपोर्ट और फ़ाइलें आपके खाते की तिजोरी में दिखती हैं। भुगतान की पुष्टि के बाद इनवॉइस डाउनलोड किया जा सकता है।

6. सहायता चाहिए?
वेबसाइट के कॉल, व्हाट्सएप, चैट और एआई बटन, या संपर्क पृष्ठ का उपयोग करें।`,
  },
  associate: {
    titleEn: "Associate Guide",
    titleHi: "एसोसिएट मार्गदर्शिका",
    contentEn: `1. Register
Open Register and choose Associate Register. Fill in your details and set a password. Your account starts as "Awaiting approval".

2. Approval
The Kendra reviews your application. You are notified by email when it is approved or declined. Your referral link works only after approval.

3. Share your referral link
Sign in to the Associate portal. Your personal link looks like /r/YOURCODE. Share it by WhatsApp or any other way. When a visitor opens your link and books within 30 days, the booking is credited to you.

4. Commission
The Kendra sets the commission (a fixed amount or a percentage) per service or plan. It is calculated on the booking amount before GST. A commission is "Pending" until the customer's payment is confirmed, then "Earned".

5. Request a payout
When you have earned commission, press Request payout. The Kendra reviews the request and pays you directly. The request then shows as Paid with a reference, or Declined with a reason.

6. Rules
You cannot earn commission on your own bookings. Commission on cancelled, expired or refunded bookings is cancelled. Commission already paid is not changed.`,
    contentHi: `1. रजिस्टर करें
रजिस्टर खोलकर एसोसिएट रजिस्टर चुनें, अपना विवरण भरें और पासवर्ड बनाएँ। आपका खाता "स्वीकृति की प्रतीक्षा" में शुरू होता है।

2. स्वीकृति
केंद्र आपके आवेदन की समीक्षा करता है। स्वीकृत या अस्वीकृत होने पर आपको ईमेल से सूचना मिलती है। आपका रेफ़रल लिंक स्वीकृति के बाद ही काम करता है।

3. रेफ़रल लिंक साझा करें
एसोसिएट पोर्टल में लॉगिन करें। आपका निजी लिंक /r/आपका-कोड जैसा होता है। इसे व्हाट्सएप या किसी भी माध्यम से साझा करें। कोई आगंतुक आपका लिंक खोलकर 30 दिनों के भीतर बुकिंग करे तो वह आपके नाम दर्ज होती है।

4. कमीशन
केंद्र प्रत्येक सेवा या प्लान के लिए कमीशन (निश्चित राशि या प्रतिशत) तय करता है। यह GST से पहले की बुकिंग राशि पर गिना जाता है। ग्राहक का भुगतान पक्का होने तक कमीशन "लंबित" रहता है, फिर "अर्जित" हो जाता है।

5. भुगतान का अनुरोध
अर्जित कमीशन होने पर भुगतान का अनुरोध करें दबाएँ। केंद्र अनुरोध की समीक्षा कर सीधे आपको भुगतान करता है। इसके बाद अनुरोध संदर्भ के साथ "भुगतान किया गया" या कारण के साथ "अस्वीकृत" दिखता है।

6. नियम
अपनी स्वयं की बुकिंग पर कमीशन नहीं मिलता। रद्द, समाप्त या वापस की गई बुकिंग का कमीशन रद्द हो जाता है। जो कमीशन पहले ही चुकाया जा चुका है वह नहीं बदलता।`,
  },
  admin: {
    titleEn: "Admin Guide",
    titleHi: "एडमिन मार्गदर्शिका",
    contentEn: `1. Sign in
Use the Super Admin login. Admin accounts are never created from the website.

2. Content
Services, plans, offers, banners, marquee, founder, gallery, blog, testimonials, FAQ, pages and translations are edited from the admin navigation. Changes appear on the website immediately.

3. Orders and appointments
Open Orders to verify manual payments, move an order through its stages, approve, reject or complete appointments, and assign a booking to an associate.

4. Associates
Open Associates to approve or reject applications, set commission rules (global, per service or per plan) and review payout requests. Mark a payout as Paid after you have paid the associate yourself; the system records it but does not move money.

5. Settings and keys
Site Settings holds the address, phone, bank, UPI, QR, GST and the app download link. API Keys holds Razorpay, SMS, email, Google, Facebook and AstroSage details, stored encrypted.

6. Backups
Open Backup and download a copy of your content and records regularly. Keep it somewhere safe.

7. Guides
The User, Associate and Admin guides can be edited from Pages.`,
    contentHi: `1. लॉगिन
सुपर एडमिन लॉगिन का उपयोग करें। एडमिन खाते वेबसाइट से कभी नहीं बनाए जाते।

2. सामग्री
सेवाएँ, प्लान, ऑफ़र, बैनर, मार्की, संस्थापक, गैलरी, ब्लॉग, प्रशंसापत्र, FAQ, पृष्ठ और अनुवाद एडमिन नेविगेशन से बदले जाते हैं। बदलाव वेबसाइट पर तुरंत दिखते हैं।

3. ऑर्डर और अपॉइंटमेंट
ऑर्डर खोलकर मैन्युअल भुगतान सत्यापित करें, ऑर्डर को चरणों में आगे बढ़ाएँ, अपॉइंटमेंट स्वीकृत, अस्वीकृत या पूर्ण करें और बुकिंग को किसी एसोसिएट को सौंपें।

4. एसोसिएट
एसोसिएट खोलकर आवेदन स्वीकृत या अस्वीकृत करें, कमीशन नियम (सामान्य, सेवा-वार या प्लान-वार) तय करें और भुगतान अनुरोध देखें। एसोसिएट को स्वयं भुगतान करने के बाद ही भुगतान को "भुगतान किया गया" चिह्नित करें; सिस्टम इसे दर्ज करता है, धन का लेन-देन नहीं करता।

5. सेटिंग्स और कुंजियाँ
साइट सेटिंग्स में पता, फ़ोन, बैंक, UPI, QR, GST और ऐप डाउनलोड लिंक रहते हैं। API कुंजियों में Razorpay, SMS, ईमेल, Google, Facebook और AstroSage विवरण एन्क्रिप्टेड रूप में रहते हैं।

6. बैकअप
बैकअप खोलकर अपनी सामग्री और रिकॉर्ड की प्रति नियमित रूप से डाउनलोड करें और सुरक्षित रखें।

7. मार्गदर्शिकाएँ
यूज़र, एसोसिएट और एडमिन मार्गदर्शिकाएँ पृष्ठ अनुभाग से बदली जा सकती हैं।`,
  },
};
