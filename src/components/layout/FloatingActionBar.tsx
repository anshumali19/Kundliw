"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  MessageSquare,
  X,
  Send,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Mail,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  quickReplies?: Array<{ label: string; query: string }>;
  whatsappUrl?: string;
  showTicketFallback?: boolean;
}

interface FloatingActionBarProps {
  phone?: string;
  whatsappNumber?: string;
}

type LeadStep = "ASK_NAME" | "ASK_PHONE" | "ASK_NEED" | "COMPLETE";

const FAB_CIRCLE =
  "flex items-center justify-center w-14 h-14 rounded-full border-2 border-white text-white transition-transform active:scale-95 hover:scale-105";

/** Renders **bold** segments from chat text without exposing the asterisks. */
function renderBold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function FabLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-inverse-surface text-inverse-on-surface border border-white text-xs font-bold leading-none whitespace-nowrap">
      {children}
    </span>
  );
}

export function FloatingActionBar({
  phone,
  whatsappNumber,
}: FloatingActionBarProps) {
  const locale = useLocale();
  const isHindi = locale === "hi";

  const [isOpen, setIsOpen] = useState(false);
  // "chat": talk to the Kendra team (collects name and phone first)
  // "ai": instant answers from the Kendra knowledge base, no sign-up
  const [mode, setMode] = useState<"chat" | "ai">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadStep, setLeadStep] = useState<LeadStep>("COMPLETE");
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const callHref = (phone || "").replace(/[^\d+]/g, "") ? `tel:${(phone || "").replace(/[^\d+]/g, "")}` : "";
  const cleanWhatsapp = (whatsappNumber || "").replace(/[^\d]/g, "");
  const defaultWhatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
        isHindi
          ? "सादर प्रणाम, मुझे महर्षि कणाद ज्योतिष केंद्र की सेवाओं के बारे में जानकारी चाहिए।"
          : "Namaste, I would like to inquire about Maharshi Kanad Jyotish Kendra services."
      )}`
    : "";

  const openAssistant = (next: "chat" | "ai") => {
    if (isOpen && mode === next) {
      setIsOpen(false);
      return;
    }
    setMode(next);
    setMessages([]);
    setIsOpen(true);
  };

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Check whether visitor lead was already collected in this browser session
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("kanad_chatbot_lead");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name && parsed?.phone) {
            setLeadStep("COMPLETE");
            setLeadName(parsed.name);
            setLeadPhone(parsed.phone);
            return;
          }
        }
      } catch {
        // sessionStorage unavailable, default to ask name
      }
      setLeadStep("ASK_NAME");
    }
  }, []);

  const fetchWelcomeMessage = useCallback(async () => {
    setLoading(true);

    // If visitor lead is not yet collected, start with polite name request
    if (mode === "chat" && leadStep === "ASK_NAME") {
      setMessages([
        {
          id: "welcome-lead-name",
          sender: "bot",
          text: isHindi
            ? "सादर प्रणाम! महर्षि कणाद ज्योतिष केंद्र के सहायता चैट में आपका स्वागत है।\n\nउचित परामर्श एवं सेवा सहायता हेतु, कृपया पहले अपना **शुभ नाम** बताएं:"
            : "Namaste! Welcome to Help Chat at Maharshi Kanad Jyotish Kendra.\n\nTo assist you accurately, please share your **full name**:",
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/chatbot/ask?q=&locale=${locale}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: data.answer,
            quickReplies: data.quickReplies,
            whatsappUrl: data.whatsappUrl,
            showTicketFallback: data.showTicketFallback,
          },
        ]);
      }
    } catch {
      setMessages([
        {
          id: "fallback-welcome",
          sender: "bot",
          text: isHindi
            ? "नमस्ते! महर्षि कणाद ज्योतिष केंद्र में आपका स्वागत है। मैं आपकी क्या सहायता कर सकता हूँ?"
            : "Namaste! Welcome to Maharshi Kanad Jyotish Kendra. How may I assist you today?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [locale, isHindi, leadStep, mode]);

  // Load initial welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchWelcomeMessage();
    }
  }, [isOpen, messages.length, fetchWelcomeMessage]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, sender: "user", text: textToSend },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Lead capture state machine
    if (mode === "chat" && leadStep === "ASK_NAME") {
      if (textToSend.length < 2) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-val-${Date.now()}`,
            sender: "bot",
            text: isHindi
              ? "कृपया अपना पूरा नाम लिखें (कम से कम 2 अक्षर):"
              : "Please enter your full name (at least 2 characters):",
          },
        ]);
        setLoading(false);
        return;
      }

      setLeadName(textToSend);
      setLeadStep("ASK_PHONE");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-ask-phone-${Date.now()}`,
          sender: "bot",
          text: isHindi
            ? `धन्यवाद ${textToSend} जी। कृपया अपना 10 अंकों का **मोबाइल नंबर** दर्ज करें ताकि केंद्र के ज्योतिषी अथवा सहायक आपसे संपर्क कर सकें:`
            : `Thank you, ${textToSend}. Please enter your 10-digit **mobile phone number** so our astrologers or team can follow up:`,
        },
      ]);
      setLoading(false);
      return;
    }

    if (mode === "chat" && leadStep === "ASK_PHONE") {
      const digitsOnly = textToSend.replace(/[^\d]/g, "");
      if (digitsOnly.length < 10) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-val-phone-${Date.now()}`,
            sender: "bot",
            text: isHindi
              ? "कृपया एक मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (उदा. 9876543210):"
              : "Please enter a valid 10-digit mobile number (e.g. 9876543210):",
          },
        ]);
        setLoading(false);
        return;
      }

      setLeadPhone(textToSend);
      setLeadStep("ASK_NEED");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-ask-need-${Date.now()}`,
          sender: "bot",
          text: isHindi
            ? "धन्यवाद! अब कृपया बताएं कि आपको किस विषय या सेवा में परामर्श चाहिए (उदा. जन्मपत्रिका, विवाह मिलान, पूजा दक्षिणा, मुहूर्त, रत्न, ग्रह शांति):"
            : "Thank you! Please describe what service or question you would like guidance on (e.g. Kundli, marriage matching, puja rituals, muhurta, gemstones):",
        },
      ]);
      setLoading(false);
      return;
    }

    if (mode === "chat" && leadStep === "ASK_NEED") {
      // Save visitor lead to backend as ContactEnquiry with source "CHATBOT_LEAD"
      try {
        await fetch("/api/contact/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: leadName || "Website Visitor",
            phone: leadPhone || "0000000000",
            message: textToSend,
            source: "CHATBOT_LEAD",
          }),
        });

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "kanad_chatbot_lead",
              JSON.stringify({ name: leadName, phone: leadPhone })
            );
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error("Failed to save chatbot lead:", err);
      }

      setLeadStep("COMPLETE");
    }

    // Process astrological Q&A query
    try {
      const res = await fetch(
        `/api/chatbot/ask?q=${encodeURIComponent(textToSend)}&locale=${locale}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.answer,
            quickReplies: data.quickReplies,
            whatsappUrl: data.whatsappUrl,
            showTicketFallback: data.showTicketFallback,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: "bot",
            text: isHindi
              ? "तकनीकी त्रुटि के कारण उत्तर प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें अथवा व्हाट्सएप पर संपर्क करें।"
              : "Could not retrieve answer due to a technical error. Please retry or contact us on WhatsApp.",
            whatsappUrl: defaultWhatsappUrl,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-neterr-${Date.now()}`,
          sender: "bot",
          text: isHindi
            ? "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।"
            : "Network error. Please check your internet connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating quick actions: Call + WhatsApp on the left, AI + Chat on the right (mobile).
          They sit above the fixed marquee strip and the bottom navigation. */}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-[7.75rem] xl:bottom-14 sm:inset-x-auto sm:right-6 z-40 flex items-end justify-between sm:flex-col sm:items-end sm:gap-4"
        role="region"
        aria-label="Quick contact and assistance"
      >
        <div className="pointer-events-auto flex flex-col gap-4">
          {callHref && (
            <a
              href={callHref}
              className="relative pb-2 flex flex-col items-center"
              aria-label={isHindi ? "कॉल करें" : "Call us"}
            >
              <span className={`${FAB_CIRCLE} bg-secondary`}>
                <Phone className="w-6 h-6" />
              </span>
              <FabLabel>{isHindi ? "कॉल" : "Call"}</FabLabel>
            </a>
          )}
          {defaultWhatsappUrl && (
            <a
              href={defaultWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative pb-2 flex flex-col items-center"
              aria-label={isHindi ? "व्हाट्सएप पर संदेश भेजें" : "Message us on WhatsApp"}
            >
              <span className={`${FAB_CIRCLE} bg-[#178a45]`}>
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.805 1.554 5.352L2.016 22l4.773-1.523c1.5 0.922 3.266 1.453 5.242 1.453 5.536 0 10.031-4.495 10.031-10.031S17.567 2 12.031 2zm0 18.234c-1.742 0-3.359-0.5-4.734-1.375l-0.344-0.219-3.328 1.062 1.094-3.234-0.234-0.375c-0.969-1.422-1.516-3.125-1.516-4.938 0-4.523 3.68-8.203 8.203-8.203 4.523 0 8.203 3.68 8.203 8.203 0 4.523-3.68 8.203-8.203 8.203zm4.531-6.141c-0.25-0.125-1.469-0.727-1.703-0.812-0.234-0.086-0.406-0.125-0.578 0.125s-0.664 0.812-0.812 0.984c-0.156 0.172-0.305 0.187-0.555 0.062s-1.055-0.391-2.016-1.242c-0.742-0.664-1.242-1.484-1.391-1.734s-0.016-0.383 0.109-0.508c0.109-0.109 0.25-0.281 0.375-0.422s0.172-0.234 0.25-0.391c0.078-0.156 0.039-0.297-0.02-0.422s-0.578-1.391-0.797-1.906c-0.211-0.5-0.43-0.43-0.594-0.438-0.156-0.008-0.336-0.008-0.516-0.008s-0.469 0.062-0.719 0.336c-0.25 0.266-0.953 0.93-0.953 2.273s0.977 2.641 1.109 2.82c0.141 0.18 1.922 2.938 4.656 4.117 0.656 0.281 1.164 0.453 1.562 0.578 0.656 0.211 1.258 0.18 1.734 0.109 0.531-0.078 1.469-0.602 1.68-1.188s0.211-1.086 0.148-1.188c-0.062-0.109-0.234-0.172-0.484-0.297z" />
                </svg>
              </span>
              <FabLabel>WA</FabLabel>
            </a>
          )}
        </div>

        <div className="pointer-events-auto flex flex-col gap-4">
          <button
            type="button"
            onClick={() => openAssistant("ai")}
            className="relative pb-2 flex flex-col items-center"
            aria-expanded={isOpen && mode === "ai"}
            aria-label={isHindi ? "एआई से पूछें" : "Ask AI"}
          >
            <span className={`${FAB_CIRCLE} bg-tertiary`}>
              <Sparkles className="w-6 h-6" />
            </span>
            <FabLabel>AI</FabLabel>
          </button>
          <button
            type="button"
            onClick={() => openAssistant("chat")}
            className="relative pb-2 flex flex-col items-center"
            aria-expanded={isOpen && mode === "chat"}
            aria-label={isHindi ? "चैट खोलें" : "Open chat"}
          >
            <span className={`${FAB_CIRCLE} bg-primary`}>
              {isOpen && mode === "chat" ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </span>
            <FabLabel>{isHindi ? "चैट" : "Chat"}</FabLabel>
          </button>
        </div>
      </div>

      {/* Vedic Assistant Dialog Modal */}
      {isOpen && (
        <div
          className="fixed inset-x-3 bottom-[7.75rem] sm:inset-x-auto sm:bottom-24 sm:right-6 z-50 sm:w-96 h-[520px] max-h-[70vh] sm:max-h-[80vh] bg-surface rounded-2xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-heading"
        >
          {/* Drawer Header */}
          <div className="bg-surface-container-high px-4 py-3.5 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3
                  id="chatbot-heading"
                  className="font-serif font-bold text-xs sm:text-sm text-on-surface leading-tight"
                >
                  {mode === "ai"
                    ? isHindi
                      ? "एआई से पूछें"
                      : "Ask AI"
                    : isHindi
                      ? "केंद्र सहायता चैट"
                      : "Kendra Help Chat"}
                </h3>
                <span className="text-[10px] text-secondary flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span>{mode === "ai" ? (isHindi ? "तुरंत उत्तर • निःशुल्क" : "Instant answers • Free") : (isHindi ? "ऑनलाइन • निःशुल्क" : "Online • Free")}</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-left">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    isBot ? "items-start" : "items-end"
                  } space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      isBot
                        ? "bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-tl-sm shadow-sm"
                        : "bg-primary text-on-primary rounded-tr-sm shadow"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{renderBold(m.text)}</p>
                  </div>

                  {/* Fallback actions if provided by bot */}
                  {isBot && (m.whatsappUrl || m.showTicketFallback) && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {m.whatsappUrl && (
                        <a
                          href={m.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366] text-white text-[11px] font-medium shadow-sm hover:opacity-95"
                        >
                          <span>{isHindi ? "WhatsApp पर पूछें" : "Ask on WhatsApp"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {m.showTicketFallback && (
                        <Link
                          href="/contact"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary text-on-secondary text-[11px] font-medium shadow-sm hover:opacity-95"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{isHindi ? "संदेश भेजें" : "Submit Enquiry"}</span>
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Quick reply chip pills */}
                  {isBot && m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                      {m.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(qr.query)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 text-[11px] transition-colors"
                        >
                          <Zap className="w-2.5 h-2.5 text-primary" />
                          <span>{qr.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant py-1">
                <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                <span>
                  {isHindi
                    ? "कृपया प्रतीक्षा करें..."
                    : "Please wait..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-surface-container-high border-t border-outline-variant flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isHindi
                  ? "प्रश्न पूछें (उदा. कुंडली दक्षिणा, मुहूर्त)..."
                  : "Ask anything (e.g. fees, kundli, muhurta)..."
              }
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-40 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
