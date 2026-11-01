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
    contentEn: `1. Sign in
Use the Super Admin login. Admin accounts are never created from the website. On every admin page, open "What is this page? Why use it?" at the top to read what the page does, and add a short demo video for it.

2. Dashboard
Shows today's new orders, pending Kundli and Prashna, calls, new users and active clients, an earnings chart (daily, weekly, monthly) and recent orders. The "Site status" strip turns Maintenance mode on or off: visitors then see a "back soon" page while you and the sign-in pages keep working.

3. The catalogue in four steps
Step 1 Services: add a service, its picture, video, description and demos.
Step 2 Packages: choose a service, then add or move its packages.
Step 3 Plans: choose a service and a package, then add or move its plans and prices.
Step 4 Offers: promo codes tied to a plan or a whole package. The offers page also shows the total discount given, how many times each code was used and how many of those reached payment.
For a service paid on a partner website, fill "Paid on another website" in the service form.

4. Orders, Kundli queue and delivery
Orders shows each booking with the client's birth details and questions. Use the Kundli & Prashna queue filter, move each order through its stages, add the courier tracking number for printed copies, and open the invoice or ticket. Upload the finished Kundli PDF in Customer files; the client downloads it from their account.

5. Payments and invoices
Payments & invoices has "How customers pay": set the UPI ID and QR code here. Bank details are in Business settings. Razorpay can be added later in API keys & Analytics and then appears at checkout by itself. Check manual payments by the screenshot and reference number.
GST & revenue report shows each month's paid orders with taxable amount, CGST, SGST and total, by service and plan, with a download that opens in Excel for your accountant.

6. Calls
Appointment slots creates the times clients can pick. Call bookings shows the booked calls on a calendar. Approve or complete a call inside the order.

7. Support tickets and WhatsApp
Enquiries come from the Contact form and chatbot; set each lead to New, Contacted or Closed. Support tickets lists the tickets customers and associates raise; open one, reply and set its status. WhatsApp chats show client messages and let you reply once the WhatsApp keys are saved in API keys & Analytics.

8. Sister services
Matrimony (approve or reject profiles, paid members), Pilgrimage & tours (requests, vehicles and drivers) and Tax desk (documents and filing status).

9. Other Services
Cards for partner services: heading, nature of service, days, dates, day-wise schedule, video, demos, links and the Book Now website.

10. Associates
Approve or reject applications, set commission rules and review payout requests. Mark a payout as Paid only after you have paid the associate yourself.

11. Website content
Website settings, hero slides, banners, scrolling notice, pages, articles, gallery, reviews, FAQ, founder, team, certificates, translations and chatbot are edited from the Website group. Changes show on the website immediately.

12. Guides
Edit the guide words in Pages & legal. Add pictures and videos to the User, Associate and Admin guides in Guides & visuals.

13. Keys and backups
API keys & Analytics holds Razorpay, SMS, email, Google, AstroSage and WhatsApp keys, stored encrypted. Open Backups and download a copy regularly; keep it safe.`,
    contentHi: `1. लॉगिन
सुपर एडमिन लॉगिन का उपयोग करें। एडमिन खाते वेबसाइट से कभी नहीं बनाए जाते। हर एडमिन पेज के ऊपर "यह पेज क्या है? इसका उपयोग क्यों?" खोलकर पढ़ें कि पेज क्या करता है, और उसके लिए छोटा डेमो वीडियो जोड़ें।

2. डैशबोर्ड
आज के नए ऑर्डर, लंबित कुंडली व प्रश्न, कॉल, नए उपयोगकर्ता और सक्रिय ग्राहक, आय का चार्ट (दैनिक, साप्ताहिक, मासिक) और हाल के ऑर्डर दिखाता है। "साइट की स्थिति" पट्टी से रखरखाव मोड चालू या बंद करें: तब आगंतुकों को "जल्द वापसी" पेज दिखता है और आप तथा साइन-इन पेज चलते रहते हैं।

3. सूची चार चरणों में
चरण 1 सेवाएँ: सेवा, उसका चित्र, वीडियो, विवरण और डेमो जोड़ें।
चरण 2 पैकेज: सेवा चुनें, फिर उसके पैकेज जोड़ें या दूसरी सेवा में ले जाएँ।
चरण 3 प्लान: सेवा और पैकेज चुनें, फिर प्लान और कीमतें जोड़ें या ले जाएँ।
चरण 4 ऑफ़र: प्रोमो कोड, किसी प्लान या पूरे पैकेज से जुड़े। ऑफ़र पेज पर कुल दी गई छूट, हर कोड का उपयोग और उनमें से कितने भुगतान तक पहुँचे, यह भी दिखता है।
जिस सेवा का भुगतान सहयोगी वेबसाइट पर होता है, उसके फ़ॉर्म में "दूसरी वेबसाइट पर भुगतान" भरें।

4. ऑर्डर, कुंडली कतार और डिलीवरी
ऑर्डर में हर बुकिंग ग्राहक के जन्म विवरण और प्रश्नों सहित दिखती है। कुंडली व प्रश्न कतार फ़िल्टर का उपयोग करें, ऑर्डर को चरणों में आगे बढ़ाएँ, प्रिंटेड प्रति के लिए कूरियर ट्रैकिंग नंबर डालें, और इनवॉइस या टिकट खोलें। तैयार कुंडली PDF ग्राहक फ़ाइलें में अपलोड करें; ग्राहक उसे अपने खाते से डाउनलोड करता है।

5. भुगतान और इनवॉइस
भुगतान व इनवॉइस में "ग्राहक भुगतान कैसे करें" है: UPI आईडी और QR कोड यहीं लगाएँ। बैंक विवरण व्यवसाय सेटिंग में हैं। Razorpay बाद में API कीज़ व एनालिटिक्स में जोड़ें, फिर वह चेकआउट पर अपने आप दिखेगा। मैनुअल भुगतान स्क्रीनशॉट और संदर्भ संख्या से जाँचें।
GST व आय रिपोर्ट में हर महीने के भुगतान हुए ऑर्डर करयोग्य राशि, CGST, SGST और कुल सहित, सेवा व प्लान अनुसार दिखते हैं, और अकाउंटेंट के लिए Excel में खुलने वाली फ़ाइल डाउनलोड होती है।

6. कॉल
अपॉइंटमेंट स्लॉट में वे समय बनाएँ जो ग्राहक चुन सकें। कॉल बुकिंग में बुक की गई कॉल कैलेंडर पर दिखती हैं। कॉल स्वीकृत या पूर्ण ऑर्डर के भीतर करें।

7. सहायता टिकट और व्हाट्सएप
पूछताछ संपर्क फ़ॉर्म और चैटबॉट से आती हैं; हर लीड को नई, संपर्क किया या बंद करें। सहायता टिकट में ग्राहकों और एसोसिएट के बनाए टिकट दिखते हैं; टिकट खोलें, उत्तर दें और स्थिति तय करें। व्हाट्सएप चैट में ग्राहकों के संदेश दिखते हैं और API कीज़ में WhatsApp कुंजियाँ सहेजने के बाद आप उत्तर दे सकते हैं।

8. सहयोगी सेवाएँ
विवाह संस्कार (प्रोफ़ाइल स्वीकृत या अस्वीकृत, सशुल्क सदस्य), तीर्थ व यात्रा (अनुरोध, वाहन और चालक) और कर सहायता (दस्तावेज़ और फ़ाइलिंग स्थिति)।

9. अन्य सेवाएँ
सहयोगी सेवाओं के कार्ड: शीर्षक, सेवा का स्वरूप, दिन, तिथियाँ, दिन-वार कार्यक्रम, वीडियो, डेमो, लिंक और Book Now वेबसाइट।

10. एसोसिएट
आवेदन स्वीकृत या अस्वीकृत करें, कमीशन नियम तय करें और भुगतान अनुरोध देखें। एसोसिएट को स्वयं भुगतान करने के बाद ही भुगतान को "भुगतान किया गया" चिह्नित करें।

11. वेबसाइट सामग्री
वेबसाइट सेटिंग, हीरो स्लाइड, बैनर, स्क्रॉलिंग सूचना, पेज, लेख, गैलरी, समीक्षाएँ, FAQ, संस्थापक, टीम, प्रमाणपत्र, अनुवाद और चैटबॉट "वेबसाइट" समूह से बदले जाते हैं। बदलाव वेबसाइट पर तुरंत दिखते हैं।

12. गाइड
गाइड के शब्द पेज व कानूनी में बदलें। उपयोगकर्ता, एसोसिएट और एडमिन गाइड के चित्र और वीडियो गाइड व चित्र में जोड़ें।

13. कुंजियाँ और बैकअप
API कीज़ व एनालिटिक्स में Razorpay, SMS, ईमेल, Google, AstroSage और WhatsApp की कुंजियाँ एन्क्रिप्टेड रहती हैं। बैकअप खोलकर नियमित रूप से प्रति डाउनलोड करें और सुरक्षित रखें।`,
  },
};
