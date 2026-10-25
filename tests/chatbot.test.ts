import { describe, it, expect, beforeEach, vi } from "vitest";
import { matchChatbotQuery } from "@/lib/chatbot/matcher";
import { prisma } from "@/lib/prisma";

describe("Phase 16: Vedic Rule-Based Chatbot Engine", () => {
  const sampleQAs = [
    {
      id: "qa-1",
      category: "PRICING",
      orderIndex: 0,
      keywords: ["fees", "cost", "price", "dakshina", "शुल्क", "दक्षिणा"],
      questionEn: "What is the fee for Kundli consultation?",
      questionHi: "कुंडली परामर्श की दक्षिणा क्या है?",
      answerEn: "Our detailed Kundli consultation starts at ₹501 for a complete chart review.",
      answerHi: "महर्षि कणाद ज्योतिष केंद्र में संपूर्ण कुंडली परामर्श ₹५०१ से प्रारंभ होता है।",
      quickReplyEn: "Consultation Fees",
      quickReplyHi: "परामर्श दक्षिणा",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "qa-2",
      category: "LOCATION",
      orderIndex: 1,
      keywords: ["address", "location", "varanasi", "kashi", "पता", "स्थान", "दशाश्वमेध"],
      questionEn: "Where is Maharshi Kanad Jyotish Kendra located?",
      questionHi: "महर्षि कणाद ज्योतिष केंद्र कहाँ स्थित है?",
      answerEn: "We are located at Dashashwamedh Ghat, Varanasi, Uttar Pradesh - 221001.",
      answerHi: "हमारा केंद्र दशाश्वमेध घाट, वाराणसी, उत्तर प्रदेश - २२१००१ में स्थित है।",
      quickReplyEn: "Kendra Location",
      quickReplyHi: "केंद्र का पता",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma.chatbotQA, "findMany").mockResolvedValue(sampleQAs as any);
    vi.spyOn(prisma.adminSettings, "findUnique").mockResolvedValue({
      id: "default",
      phone1: "+91-9827991224",
      whatsappNumber: "+91-9827991224",
    } as any);
  });

  it("should return welcome greeting and quick reply chips on empty query", async () => {
    const resHi = await matchChatbotQuery("", "hi");
    expect(resHi.matched).toBe(true);
    expect(resHi.answer).toContain("सादर प्रणाम");
    expect(resHi.quickReplies.length).toBeGreaterThan(0);
    expect(resHi.quickReplies[0].label).toBe("परामर्श दक्षिणा");

    const resEn = await matchChatbotQuery("", "en");
    expect(resEn.matched).toBe(true);
    expect(resEn.answer).toContain("Namaste");
    expect(resEn.quickReplies[0].label).toBe("Consultation Fees");
  });

  it("should match query by keyword in Hindi", async () => {
    const res = await matchChatbotQuery("परामर्श की दक्षिणा कितनी है?", "hi");
    expect(res.matched).toBe(true);
    expect(res.question).toBe("कुंडली परामर्श की दक्षिणा क्या है?");
    expect(res.answer).toContain("₹५०१");
    expect(res.showTicketFallback).toBe(false);
  });

  it("should match query by keyword in English", async () => {
    const res = await matchChatbotQuery("Where is your location in Varanasi?", "en");
    expect(res.matched).toBe(true);
    expect(res.question).toBe("Where is Maharshi Kanad Jyotish Kendra located?");
    expect(res.answer).toContain("Dashashwamedh Ghat");
    expect(res.showTicketFallback).toBe(false);
  });

  it("should trigger fallback with WhatsApp URL and ticket fallback flag when no keyword matches", async () => {
    const res = await matchChatbotQuery("Can you predict stock market crypto bitcoin prices tomorrow?", "en");
    expect(res.matched).toBe(false);
    expect(res.answer).toContain("We could not find an exact automated match");
    expect(res.whatsappUrl).toContain("https://wa.me/919827991224");
    expect(res.showTicketFallback).toBe(true);
  });
});
