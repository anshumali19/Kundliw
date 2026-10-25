/* eslint-disable */
/**
 * Adds starter chatbot Q&A (Popular Topics) only when the table is empty.
 * Answers avoid prices, addresses and timings; the admin edits them in /admin/chatbot.
 *
 *   node scripts/seed-chatbot-qa.js
 */
const { PrismaClient } = require("@prisma/client");

const QA = [
  {
    category: "SERVICES",
    questionEn: "What services does the Kendra offer?",
    questionHi: "केंद्र कौन-कौन सी सेवाएँ देता है?",
    answerEn: "Maharshi Kanad Jyotish Kendra offers kundli and horoscope services, marriage matching, muhurta guidance, puja and gemstone guidance, plus free tools such as panchang and kundli calculators. Open the Services page to see the current list.",
    answerHi: "महर्षि कणाद ज्योतिष केंद्र कुंडली एवं जन्मपत्री, विवाह मिलान, मुहूर्त मार्गदर्शन, पूजा एवं रत्न परामर्श के साथ पंचांग और कुंडली जैसे निःशुल्क टूल उपलब्ध कराता है। वर्तमान सूची के लिए सेवाएँ पृष्ठ देखें।",
    keywords: ["services", "service", "सेवा", "सेवाएँ", "offer"],
    quickReplyEn: "Our Services",
    quickReplyHi: "हमारी सेवाएँ",
  },
  {
    category: "SERVICES",
    questionEn: "How do I book a consultation?",
    questionHi: "परामर्श कैसे बुक करें?",
    answerEn: "Choose a service on the Book page, enter your birth details, pay online and upload the payment proof if asked. Your order is then confirmed and the report or consultation is delivered through your account.",
    answerHi: "बुक पृष्ठ पर सेवा चुनें, अपना जन्म विवरण भरें, ऑनलाइन भुगतान करें और माँगे जाने पर भुगतान प्रमाण अपलोड करें। इसके बाद आपका ऑर्डर पुष्ट होकर रिपोर्ट या परामर्श आपके खाते में उपलब्ध कराया जाता है।",
    keywords: ["book", "booking", "consultation", "बुक", "परामर्श", "order"],
    quickReplyEn: "Book a Consultation",
    quickReplyHi: "परामर्श बुक करें",
  },
  {
    category: "KUNDLI",
    questionEn: "Can I get a free kundli?",
    questionHi: "क्या मुझे निःशुल्क कुंडली मिल सकती है?",
    answerEn: "Yes. The free tools section lets you generate a basic kundli and check panchang details without paying. Detailed written reports are paid services.",
    answerHi: "जी हाँ। निःशुल्क टूल अनुभाग में आप बिना शुल्क बुनियादी कुंडली बना सकते हैं और पंचांग देख सकते हैं। विस्तृत लिखित रिपोर्ट सशुल्क सेवा है।",
    keywords: ["free", "kundli", "horoscope", "निःशुल्क", "कुंडली", "जन्मपत्री"],
    quickReplyEn: "Free Kundli",
    quickReplyHi: "निःशुल्क कुंडली",
  },
  {
    category: "GENERAL",
    questionEn: "How do I register or log in?",
    questionHi: "रजिस्टर या लॉगिन कैसे करें?",
    answerEn: "Use Register to create a User or Associate account and Login to sign in as User, Associate or Super Admin. Users can sign in with a mobile OTP; Associates use email and password.",
    answerHi: "यूज़र या एसोसिएट खाता बनाने के लिए रजिस्टर और यूज़र, एसोसिएट या सुपर एडमिन के रूप में प्रवेश के लिए लॉगिन का उपयोग करें। यूज़र मोबाइल OTP से तथा एसोसिएट ईमेल और पासवर्ड से लॉगिन करते हैं।",
    keywords: ["register", "login", "signin", "account", "रजिस्टर", "लॉगिन", "खाता"],
    quickReplyEn: "Register / Login",
    quickReplyHi: "रजिस्टर / लॉगिन",
  },
  {
    category: "GENERAL",
    questionEn: "What is the Associate program?",
    questionHi: "एसोसिएट प्रोग्राम क्या है?",
    answerEn: "Associates are registered partners of the Kendra with their own login. Register as an Associate and the Kendra team will guide you on the next steps.",
    answerHi: "एसोसिएट केंद्र के पंजीकृत सहयोगी हैं जिनका अपना लॉगिन होता है। एसोसिएट के रूप में रजिस्टर करें, आगे की जानकारी केंद्र की टीम देगी।",
    keywords: ["associate", "partner", "एसोसिएट", "सहयोगी"],
    quickReplyEn: "Associate Program",
    quickReplyHi: "एसोसिएट प्रोग्राम",
  },
  {
    category: "CONTACT",
    questionEn: "How can I contact the Kendra?",
    questionHi: "केंद्र से संपर्क कैसे करें?",
    answerEn: "Use the Call and WhatsApp buttons on this page, the Chat button to leave your details, or the Contact page to send an enquiry. The team will get back to you.",
    answerHi: "इस पृष्ठ पर कॉल और व्हाट्सएप बटन, अपना विवरण छोड़ने के लिए चैट बटन, या पूछताछ भेजने के लिए संपर्क पृष्ठ का उपयोग करें। टीम आपसे संपर्क करेगी।",
    keywords: ["contact", "call", "phone", "whatsapp", "संपर्क", "फोन", "कॉल"],
    quickReplyEn: "Contact Support",
    quickReplyHi: "संपर्क सहायता",
  },
];

(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.chatbotQA.count();
    if (count > 0) return console.log(`Skipped: ${count} Q&A already exist.`);
    await prisma.chatbotQA.createMany({ data: QA.map((q, i) => ({ ...q, orderIndex: i })) });
    console.log(`Created ${QA.length} chatbot Q&A.`);
  } finally {
    await prisma.$disconnect();
  }
})();
