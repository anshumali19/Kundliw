import { prisma } from "@/lib/prisma";
import { getCredential } from "@/lib/config/credentials";

export interface ChatbotResponse {
  matched: boolean;
  question?: string;
  answer: string;
  quickReplies: Array<{ label: string; query: string }>;
  whatsappUrl?: string;
  showTicketFallback?: boolean;
}

// Clean tokens from string
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Matches an inquiry against rule-based ChatbotQA entries in the database.
 * Completely deterministic without third-party paid LLM APIs.
 */
export async function matchChatbotQuery(
  rawQuery: string,
  locale: "hi" | "en" = "hi"
): Promise<ChatbotResponse> {
  const query = rawQuery.trim();
  const tokens = tokenize(query);

  // Fetch active Q&A records
  const allQA = await prisma.chatbotQA
    .findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    })
    .catch(() => []);

  // Fetch Kendra WhatsApp number and settings
  const settings = await prisma.adminSettings
    .findUnique({
      where: { id: "default" },
      select: { whatsappNumber: true, phone1: true, chatbotWelcomeEn: true, chatbotWelcomeHi: true },
    })
    .catch(() => null);

  const rawPhone = settings?.whatsappNumber || settings?.phone1 || "+919827991224";
  const cleanPhone = rawPhone.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    locale === "hi"
      ? `नमस्ते महर्षि कणाद ज्योतिष केंद्र, मुझे परामर्श के संदर्भ में जानकारी चाहिए: ${query}`
      : `Namaste Maharshi Kanad Jyotish Kendra, I have an inquiry regarding: ${query}`
  )}`;

  // Default quick replies to offer user
  const defaultQuickReplies = allQA
    .filter((q) => (locale === "hi" ? q.quickReplyHi : q.quickReplyEn))
    .slice(0, 4)
    .map((q) => ({
      label: (locale === "hi" ? q.quickReplyHi : q.quickReplyEn) as string,
      query: (locale === "hi" ? q.questionHi : q.questionEn) as string,
    }));

  if (!query || tokens.length === 0) {
    const welcome =
      locale === "hi"
        ? settings?.chatbotWelcomeHi ||
          "सादर प्रणाम! मैं महर्षि कणाद ज्योतिष केंद्र का सहायक हूँ। आप ज्योतिष सेवाओं, परामर्श दक्षिणा, मुहूर्त अथवा अपनी जन्मपत्री के विषय में प्रश्न पूछ सकते हैं।"
        : settings?.chatbotWelcomeEn ||
          "Namaste! I am your Vedic assistant at Maharshi Kanad Jyotish Kendra. You can ask about our astrology services, consultation fees, auspicious muhurta, or your Janampatri.";

    return {
      matched: true,
      answer: welcome,
      quickReplies: defaultQuickReplies,
      whatsappUrl,
      showTicketFallback: false,
    };
  }

  let bestQA: (typeof allQA)[0] | null = null;
  let highestScore = 0;

  for (const qa of allQA) {
    let score = 0;
    const qEnLower = qa.questionEn.toLowerCase();
    const qHiLower = qa.questionHi.toLowerCase();

    // 1. Direct substring match in question (+15 points)
    if (qEnLower.includes(query.toLowerCase()) || qHiLower.includes(query.toLowerCase())) {
      score += 15;
    }

    // 2. Keyword exact matches (+6 points each)
    const qaKeywords = (qa.keywords || []).map((k) => k.toLowerCase().trim());
    for (const token of tokens) {
      if (qaKeywords.includes(token)) {
        score += 6;
      }
      // Partial keyword match (+2 points)
      else if (qaKeywords.some((k) => k.includes(token) || token.includes(k))) {
        score += 2;
      }

      // Question word overlap (+3 points)
      if (qEnLower.includes(token) || qHiLower.includes(token)) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestQA = qa;
    }
  }

  // Minimum confidence threshold of 4 points
  if (bestQA && highestScore >= 4) {
    // Generate sibling quick replies in the same category
    const categoryReplies = allQA
      .filter(
        (q) =>
          q.id !== bestQA?.id &&
          q.category === bestQA?.category &&
          (locale === "hi" ? q.quickReplyHi : q.quickReplyEn)
      )
      .slice(0, 3)
      .map((q) => ({
        label: (locale === "hi" ? q.quickReplyHi : q.quickReplyEn) as string,
        query: (locale === "hi" ? q.questionHi : q.questionEn) as string,
      }));

    return {
      matched: true,
      question: locale === "hi" ? bestQA.questionHi : bestQA.questionEn,
      answer: locale === "hi" ? bestQA.answerHi : bestQA.answerEn,
      quickReplies: categoryReplies.length > 0 ? categoryReplies : defaultQuickReplies,
      whatsappUrl,
      showTicketFallback: false,
    };
  }

  // Fallback for queries with no match
  const fallbackAnswer =
    locale === "hi"
      ? "आपके प्रश्न का सीधा उत्तर केंद्र की सामान्य मार्गदर्शिका में उपलब्ध नहीं है। आप हमारे मुख्य आचार्य से सीधे WhatsApp पर परामर्श ले सकते हैं अथवा नीचे 'पूछताछ संदेश' छोड़ सकते हैं, हमारी टीम २४ घंटे में संपर्क करेगी।"
      : "We could not find an exact automated match for your query. You can connect directly with our Daivajna team on WhatsApp or submit a formal enquiry message below for personal assistance.";

  return {
    matched: false,
    answer: fallbackAnswer,
    quickReplies: defaultQuickReplies,
    whatsappUrl,
    showTicketFallback: true,
  };
}
