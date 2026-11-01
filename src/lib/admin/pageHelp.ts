/** Plain-words help for every admin page: what it does and why you would use it. */
export interface PageHelp {
  what: [string, string];
  why: [string, string];
}

export const PAGE_HELP: Record<string, PageHelp> = {
  "/admin": {
    what: ["A summary of the business today: new orders, pending Kundlis, calls, new users, earnings and recent orders.", "आज के कामकाज का सार: नए ऑर्डर, लंबित कुंडली, कॉल, नए उपयोगकर्ता, आय और हाल के ऑर्डर।"],
    why: ["Start here every day to see what needs your attention.", "रोज़ यहीं से शुरू करें और देखें किस पर ध्यान देना है।"],
  },
  "/admin/orders": {
    what: ["Every booking with the client's birth details and questions. You move each one through its stages, check manual payments, add the courier tracking number and open the invoice.", "हर बुकिंग, ग्राहक के जन्म विवरण और प्रश्नों सहित। यहाँ चरण बदलें, मैनुअल भुगतान जाँचें, कूरियर ट्रैकिंग नंबर डालें और इनवॉइस खोलें।"],
    why: ["This is where the Kendra's daily work is done and the client is kept informed.", "केंद्र का रोज़ का काम यहीं होता है और ग्राहक को जानकारी मिलती रहती है।"],
  },
  "/admin/payments": {
    what: ["Successful online payments and manual bank, UPI or QR payments waiting to be checked, with invoice links.", "सफल ऑनलाइन भुगतान और जाँच के लिए रुके बैंक, UPI या QR भुगतान, इनवॉइस लिंक सहित।"],
    why: ["To see money received and confirm transfers made outside the gateway.", "प्राप्त राशि देखने और गेटवे के बाहर किए गए भुगतान पक्के करने के लिए।"],
  },
  "/admin/reports": {
    what: ["The month's paid orders with taxable amount, CGST, SGST and total, grouped by service and plan. Download it as a file that opens in Excel.", "महीने के भुगतान हुए ऑर्डर: करयोग्य राशि, CGST, SGST और कुल, सेवा व प्लान अनुसार। Excel में खुलने वाली फ़ाइल डाउनलोड करें।"],
    why: ["Your accountant needs this every month to file GST.", "GST भरने के लिए आपके अकाउंटेंट को यह हर महीने चाहिए।"],
  },
  "/admin/services": {
    what: ["Step 1 of the catalogue: the list of services. Add a service, edit its picture, video, description and demos.", "सूची का चरण 1: सेवाओं की सूची। सेवा जोड़ें, उसका चित्र, वीडियो, विवरण और डेमो बदलें।"],
    why: ["Services are what visitors see on the website. Packages, plans and offers hang under them.", "वेबसाइट पर आगंतुक सेवाएँ ही देखते हैं। पैकेज, प्लान और ऑफ़र इनके नीचे जुड़ते हैं।"],
  },
  "/admin/packages": {
    what: ["Step 2: choose a service, then add or move its packages.", "चरण 2: सेवा चुनें, फिर उसके पैकेज जोड़ें या दूसरी सेवा में ले जाएँ।"],
    why: ["A package is a version of a service, for example Basic or Premium.", "पैकेज सेवा का एक रूप है, जैसे साधारण या उत्तम।"],
  },
  "/admin/plans": {
    what: ["Step 3: choose a service and a package, then add or move its plans with prices.", "चरण 3: सेवा और पैकेज चुनें, फिर कीमत सहित प्लान जोड़ें या ले जाएँ।"],
    why: ["A plan is what the customer actually buys and pays for.", "प्लान वही है जो ग्राहक खरीदता और जिसका भुगतान करता है।"],
  },
  "/admin/offers": {
    what: ["Step 4: promo codes and automatic offers, tied to a plan or a whole package.", "चरण 4: प्रोमो कोड और स्वचालित ऑफ़र, किसी प्लान या पूरे पैकेज से जुड़े।"],
    why: ["To give discounts at festivals or to bring in new customers.", "त्योहारों पर छूट देने या नए ग्राहक लाने के लिए।"],
  },
  "/admin/other-services": {
    what: ["The cards on the Other Services page: heading, nature of service, days and dates, day-wise schedule, video, demos, links and the Book Now website.", "अन्य सेवाओं के कार्ड: शीर्षक, सेवा का स्वरूप, दिन और तिथियाँ, दिन-वार कार्यक्रम, वीडियो, डेमो, लिंक और Book Now वेबसाइट।"],
    why: ["For services run by partner websites, like matrimony and pilgrimage tours.", "सहयोगी वेबसाइटों की सेवाओं के लिए, जैसे विवाह और तीर्थ यात्रा।"],
  },
  "/admin/slots": {
    what: ["Create the time slots clients can pick for a call.", "वे समय बनाएँ जिन्हें ग्राहक कॉल के लिए चुन सकते हैं।"],
    why: ["Clients can only book a call in a slot you have opened.", "ग्राहक केवल आपके खोले गए समय में ही कॉल बुक कर सकते हैं।"],
  },
  "/admin/calls": {
    what: ["A month calendar of the calls clients have booked.", "ग्राहकों की बुक की हुई कॉल का मासिक कैलेंडर।"],
    why: ["To plan the day and not miss a consultation.", "दिन की योजना बनाने और कोई परामर्श न छूटने के लिए।"],
  },
  "/admin/enquiries": {
    what: ["Messages sent from the Contact form, the chatbot and the service enquiry pop-up.", "संपर्क फ़ॉर्म, चैटबॉट और सेवा पूछताछ से आए संदेश।"],
    why: ["To answer people who wrote to the Kendra, and mark them done.", "केंद्र को लिखने वालों को उत्तर देने और काम पूरा चिह्नित करने के लिए।"],
  },
  "/admin/tickets": {
    what: ["Help requests raised by customers and associates from their dashboard. Open a ticket, read the thread, reply and set its status.", "ग्राहकों और एसोसिएट द्वारा डैशबोर्ड से बनाए सहायता अनुरोध। टिकट खोलें, बातचीत पढ़ें, उत्तर दें और स्थिति तय करें।"],
    why: ["Customers know where to ask for help, and nothing gets lost in phone calls. The ready-made questions customers can pick are edited at the top of this page.", "ग्राहक को पता रहता है कि मदद कहाँ माँगें, और फ़ोन कॉल में कुछ खोता नहीं।"],
  },
  "/admin/whatsapp": {
    what: ["WhatsApp chats of clients who message the Kendra's business number, with replies from here. Works once the WhatsApp keys are saved.", "केंद्र के बिज़नेस नंबर पर संदेश भेजने वालों की व्हाट्सएप चैट, और यहीं से उत्तर। WhatsApp कुंजियाँ सहेजने के बाद चालू होती है।"],
    why: ["To keep every client conversation in one place.", "हर ग्राहक की बातचीत एक जगह रखने के लिए।"],
  },
  "/admin/matrimony": {
    what: ["Matrimony profiles to approve or reject, and the paid members with their membership dates.", "स्वीकृत या अस्वीकृत करने के विवाह प्रोफ़ाइल, और सशुल्क सदस्य उनकी अवधि सहित।"],
    why: ["To keep the Vindhya Vivah Sanskar list clean and track paying members.", "विंध्य विवाह संस्कार की सूची साफ़ रखने और सशुल्क सदस्यों का हिसाब रखने के लिए।"],
  },
  "/admin/travel": {
    what: ["Pilgrimage and tour requests with their booking status, plus the vehicles and drivers.", "तीर्थ व यात्रा अनुरोध उनकी बुकिंग स्थिति सहित, तथा वाहन और चालक।"],
    why: ["To see which trip is confirmed and which vehicle is free.", "कौन सी यात्रा पक्की है और कौन सा वाहन खाली है, यह देखने के लिए।"],
  },
  "/admin/tax": {
    what: ["Tax documents clients submitted and where each filing stands.", "ग्राहकों द्वारा दिए कर दस्तावेज़ और हर फ़ाइलिंग की स्थिति।"],
    why: ["So no ITR file is forgotten and clients can be told its status.", "ताकि कोई ITR फ़ाइल न छूटे और ग्राहक को स्थिति बताई जा सके।"],
  },
  "/admin/users": {
    what: ["All registered customers and associates.", "सभी पंजीकृत ग्राहक और एसोसिएट।"],
    why: ["To look up a person, check their role or help them with their account.", "किसी व्यक्ति को खोजने, उसकी भूमिका देखने या खाते में मदद के लिए।"],
  },
  "/admin/associates": {
    what: ["Associate applications, approvals, commission rules and payout requests.", "एसोसिएट के आवेदन, स्वीकृति, कमीशन नियम और भुगतान अनुरोध।"],
    why: ["Associates bring clients through their referral link and are paid commission from here.", "एसोसिएट अपने रेफ़रल लिंक से ग्राहक लाते हैं और यहीं से कमीशन पाते हैं।"],
  },
  "/admin/vault": {
    what: ["Upload a finished Kundli PDF into a client's private vault.", "तैयार कुंडली PDF को ग्राहक की निजी तिजोरी में डालें।"],
    why: ["The client can then download it from their own account.", "फिर ग्राहक अपने खाते से इसे डाउनलोड कर सकता है।"],
  },
  "/admin/guides": {
    what: ["Add pictures and videos to the User, Associate and Admin guides.", "उपयोगकर्ता, एसोसिएट और एडमिन गाइड में चित्र और वीडियो जोड़ें।"],
    why: ["So people can learn the dashboard, orders and invoices by looking, not only reading.", "ताकि लोग केवल पढ़कर नहीं, देखकर भी डैशबोर्ड, ऑर्डर और इनवॉइस समझ सकें।"],
  },
  "/admin/website": {
    what: ["Site-wide words, pictures, colours, menus and social links.", "पूरी साइट के शब्द, चित्र, रंग, मेनू और सोशल लिंक।"],
    why: ["To change how the website looks and reads without a developer.", "बिना डेवलपर के वेबसाइट का रूप और शब्द बदलने के लिए।"],
  },
  "/admin/hero-slides": {
    what: ["The big pictures that slide on the home page.", "होम पेज पर चलने वाले बड़े चित्र।"],
    why: ["They are the first thing visitors see.", "आगंतुक सबसे पहले यही देखते हैं।"],
  },
  "/admin/banners": {
    what: ["Side banners shown on pages.", "पेजों पर दिखने वाले साइड बैनर।"],
    why: ["To promote an offer or an event.", "किसी ऑफ़र या कार्यक्रम का प्रचार करने के लिए।"],
  },
  "/admin/marquee": {
    what: ["The scrolling notice strip.", "चलती हुई सूचना पट्टी।"],
    why: ["For quick announcements like festival dates.", "त्योहार की तिथि जैसी जल्दी की घोषणाओं के लिए।"],
  },
  "/admin/pages": {
    what: ["Edit pages such as About, Privacy, Terms and the three guides.", "About, Privacy, Terms और तीनों गाइड जैसे पेज बदलें।"],
    why: ["Legal pages must be correct, and guides must match how the site works.", "कानूनी पेज सही होने चाहिए और गाइड साइट के काम से मेल खानी चाहिए।"],
  },
  "/admin/blogs": {
    what: ["Write, edit and publish astrology articles.", "ज्योतिष लेख लिखें, बदलें और प्रकाशित करें।"],
    why: ["Articles bring visitors from search engines and build trust.", "लेख खोज से आगंतुक लाते हैं और भरोसा बनाते हैं।"],
  },
  "/admin/gallery": {
    what: ["Pictures and videos for the Gallery page.", "गैलरी पेज के चित्र और वीडियो।"],
    why: ["To show the Kendra's work and events.", "केंद्र का काम और कार्यक्रम दिखाने के लिए।"],
  },
  "/admin/testimonials": {
    what: ["Client reviews to show or hide.", "दिखाने या छिपाने के लिए ग्राहक समीक्षाएँ।"],
    why: ["Good reviews help new clients decide.", "अच्छी समीक्षाएँ नए ग्राहकों को निर्णय लेने में मदद करती हैं।"],
  },
  "/admin/faq": {
    what: ["Questions and answers shown on the FAQ page.", "FAQ पेज पर दिखने वाले प्रश्न और उत्तर।"],
    why: ["Answers common doubts so fewer people need to call.", "आम शंकाएँ दूर करते हैं ताकि कम लोगों को फ़ोन करना पड़े।"],
  },
  "/admin/founder": {
    what: ["The founder's profile.", "संस्थापक का परिचय।"],
    why: ["People trust a face and a story.", "लोग चेहरे और कहानी पर भरोसा करते हैं।"],
  },
  "/admin/team": {
    what: ["Team members and assistants shown on the site.", "साइट पर दिखने वाले टीम सदस्य और सहायक।"],
    why: ["To introduce the people behind the Kendra.", "केंद्र के पीछे के लोगों से परिचय कराने के लिए।"],
  },
  "/admin/credentials": {
    what: ["Certificates and credentials shown on the site.", "साइट पर दिखने वाले प्रमाणपत्र।"],
    why: ["Proof of training and recognition.", "प्रशिक्षण और मान्यता का प्रमाण।"],
  },
  "/admin/translations": {
    what: ["Change any fixed word or sentence on the site in English and Hindi.", "साइट का कोई भी तय शब्द या वाक्य हिन्दी और अंग्रेज़ी में बदलें।"],
    why: ["For small wording fixes without touching code.", "बिना कोड छुए छोटे शब्द सुधारने के लिए।"],
  },
  "/admin/chatbot": {
    what: ["Questions and answers the website chatbot knows.", "वेबसाइट चैटबॉट के जाने प्रश्न और उत्तर।"],
    why: ["A better chatbot answers visitors when nobody is free.", "बेहतर चैटबॉट तब उत्तर देता है जब कोई उपलब्ध नहीं।"],
  },
  "/admin/settings": {
    what: ["Business details: phone, address, GSTIN, bank and UPI details, Panchang location.", "व्यवसाय विवरण: फ़ोन, पता, GSTIN, बैंक व UPI, पंचांग स्थान।"],
    why: ["These appear on invoices, the contact page and payment screens.", "ये इनवॉइस, संपर्क पेज और भुगतान पेज पर दिखते हैं।"],
  },
  "/admin/settings/keys": {
    what: ["Secret keys for Razorpay, SMS, email, AstroSage, WhatsApp, Analytics and Maps. Stored encrypted.", "Razorpay, SMS, ईमेल, AstroSage, WhatsApp, Analytics और Maps की गुप्त कुंजियाँ, एन्क्रिप्ट होकर सुरक्षित।"],
    why: ["Each outside service only starts working after its key is saved here.", "हर बाहरी सेवा अपनी कुंजी यहाँ सहेजने के बाद ही चालू होती है।"],
  },
  "/admin/backup": {
    what: ["Download or restore a copy of the site's data.", "साइट के डेटा की प्रति डाउनलोड या बहाल करें।"],
    why: ["A safety net if something is deleted by mistake.", "गलती से कुछ हट जाए तो सुरक्षा का साधन।"],
  },
};

/** Finds the help for the current admin path (the longest match wins). */
export function helpFor(pathname: string): { path: string; help: PageHelp } | null {
  const clean = pathname.replace(/^\/(en|hi)(?=\/)/, "");
  const key = Object.keys(PAGE_HELP)
    .filter((k) => clean === k || (k !== "/admin" && clean.startsWith(k + "/")))
    .sort((a, b) => b.length - a.length)[0];
  return key ? { path: key, help: PAGE_HELP[key] } : null;
}

/** SiteConfig key holding the demo each admin page shows: { "/admin/orders": "https://..." } */
export const PAGE_DEMOS_KEY = "admin-page-demos";
