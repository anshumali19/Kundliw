"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
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
  "flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-md border border-gold/60 text-maroon shadow-[0_6px_18px_rgba(64,36,28,0.16)] transition-all duration-200 group-hover:bg-maroon group-hover:text-white group-hover:border-maroon group-hover:-translate-y-0.5 active:scale-95";

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

function FabLabel({ children, side = "right" }: { children: React.ReactNode; side?: "left" | "right" }) {
  return (
    <span
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 hidden lg:block whitespace-nowrap rounded bg-maroon px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 ${side === "right" ? "left-full ml-2" : "right-full mr-2"}`}
    >
      {children}
    </span>
  );
}

export function FloatingActionBar({
  phone,
  whatsappNumber,
}: FloatingActionBarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const isHindi = locale === "hi";
  // The admin console is a working screen: no floating visitor widgets over its forms
  const hideOnAdmin = /\/admin(\/|$)/.test(pathname || "");

  const [isOpen, setIsOpen] = useState(false);
  // The four round buttons slide out of the way while the page is being scrolled, then return.
  const [tuckedAway, setTuckedAway] = useState(false);
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
  // Popular topics come from the admin-managed chatbot Q&A list
  const [topics, setTopics] = useState<Array<{ label: string; query: string }>>([]);
  const [barInput, setBarInput] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [hintIdx, setHintIdx] = useState(0);

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

  // Load popular topics once so the Ask AI bar can show rotating suggestions
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 24) setTuckedAway(true);
      lastY = y;
      clearTimeout(timer);
      timer = setTimeout(() => setTuckedAway(false), 180);
    };
    const onScrollEnd = () => {
      clearTimeout(timer);
      setTuckedAway(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chatbot/ask?q=&locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.success && Array.isArray(d.quickReplies)) setTopics(d.quickReplies);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Auto-rotate the suggested question shown in the Ask AI bar
  useEffect(() => {
    if (topics.length < 2) return;
    const timer = setInterval(() => setHintIdx((i) => (i + 1) % topics.length), 3500);
    return () => clearInterval(timer);
  }, [topics.length]);

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
            quickReplies: mode === "ai" ? undefined : data.quickReplies,
            whatsappUrl: data.whatsappUrl,
            showTicketFallback: data.showTicketFallback,
          },
        ]);
        if (Array.isArray(data.quickReplies)) setTopics(data.quickReplies);
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

  // Question typed in the Ask AI bar: send it as soon as the panel has loaded
  useEffect(() => {
    if (pendingQuestion && isOpen && mode === "ai" && messages.length > 0 && !loading) {
      const q = pendingQuestion;
      setPendingQuestion("");
      handleSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion, isOpen, mode, messages.length, loading]);

  const submitBar = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (barInput.trim() || topics[hintIdx]?.query || "").trim();
    setBarInput("");
    if (q) setPendingQuestion(q);
    if (!(isOpen && mode === "ai")) {
      setMode("ai");
      setMessages([]);
      setIsOpen(true);
    }
  };

  const barHint = topics[hintIdx]?.query || (isHindi ? "अपना प्रश्न पूछें..." : "Ask your question...");

  if (hideOnAdmin) return null;

  return (
    <>
      {/* Ask AI bar (tablet and desktop): shows a rotating suggested question */}
      {!isOpen && (
        <form
          onSubmit={submitBar}
          className={`fixed left-1/2 -translate-x-1/2 bottom-[7.75rem] xl:bottom-14 z-40 hidden lg:flex items-center gap-2 w-[min(25rem,calc(100vw-18rem))] bg-white/90 backdrop-blur-md rounded-full border border-gold/60 shadow-[0_8px_24px_rgba(64,36,28,0.14)] p-1.5 transition-all duration-200 ${tuckedAway && !isOpen ? "opacity-0 translate-y-4 pointer-events-none" : "pointer-events-auto opacity-100"}`}
          aria-label={isHindi ? "एआई से पूछें" : "Ask AI"}
        >
          <span className="w-9 h-9 shrink-0 rounded-full bg-brand text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={barInput}
            onChange={(e) => setBarInput(e.target.value)}
            placeholder={barHint}
            maxLength={300}
            className="flex-1 min-w-0 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            aria-label={isHindi ? "अपना प्रश्न लिखें" : "Type your question"}
          />
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-on-brand text-sm font-bold"
          >
            <Send className="w-4 h-4" />
            <span>{isHindi ? "एआई से पूछें" : "Ask AI"}</span>
          </button>
        </form>
      )}

      {/* Floating quick actions: Call + WhatsApp on the left, AI + Chat on the right (mobile).
          They sit above the fixed marquee strip and the bottom navigation. */}
      <div
        className={`pointer-events-none fixed inset-x-3 bottom-[7.75rem] xl:bottom-14 sm:inset-x-6 z-40 flex items-end justify-between transition-all duration-200 ${tuckedAway && !isOpen ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}`}
        role="region"
        aria-label="Quick contact and assistance"
      >
        <div className="pointer-events-auto flex flex-col gap-3">
          {callHref && (
            <a
              href={callHref}
              className="group relative flex items-center"
              aria-label={isHindi ? "कॉल करें" : "Call us"}
            >
              <span className={FAB_CIRCLE}>
                <Phone className="w-5 h-5" />
              </span>
              <FabLabel>{isHindi ? "कॉल करें" : "Call us"}</FabLabel>
            </a>
          )}
          {defaultWhatsappUrl && (
            <a
              href={defaultWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center"
              aria-label={isHindi ? "व्हाट्सएप पर संदेश भेजें" : "Message us on WhatsApp"}
            >
              <span className={`${FAB_CIRCLE} !text-[#1F7A45] group-hover:!text-white`}>
                <svg className="block h-[18px] w-[18px] shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              </span>
              <FabLabel>WhatsApp</FabLabel>
            </a>
          )}
        </div>

        <div className="pointer-events-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => openAssistant("ai")}
            className="group relative flex items-center"
            aria-expanded={isOpen && mode === "ai"}
            aria-label={isHindi ? "एआई से पूछें" : "Ask AI"}
          >
            <span className={FAB_CIRCLE}>
              <Sparkles className="w-5 h-5" />
            </span>
            <FabLabel side="left">{isHindi ? "एआई से पूछें" : "Ask AI"}</FabLabel>
          </button>
          <button
            type="button"
            onClick={() => openAssistant("chat")}
            className="group relative flex items-center"
            aria-expanded={isOpen && mode === "chat"}
            aria-label={isHindi ? "चैट खोलें" : "Open chat"}
          >
            <span className={FAB_CIRCLE}>
              {isOpen && mode === "chat" ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </span>
            <FabLabel side="left">{isHindi ? "चैट करें" : "Chat with us"}</FabLabel>
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
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-primary">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
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

          {/* Popular topics (AI mode) */}
          {mode === "ai" && topics.length > 0 && (
            <div className="px-3 pt-3 pb-2 border-b border-outline-variant/40 bg-surface-container-low text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-maroon mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-signal" />
                {isHindi ? "प्रमुख विषय:" : "Popular topics:"}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {topics.map((tp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(tp.query)}
                    disabled={loading}
                    className="px-2.5 py-1.5 rounded-full bg-surface border border-maroon/40 hover:bg-gold text-on-surface text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                        : "bg-brand text-on-brand rounded-tr-sm shadow"
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand text-on-brand text-[11px] font-medium shadow-sm hover:opacity-95"
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
                  ? mode === "ai"
                    ? "अगला प्रश्न पूछें..."
                    : "प्रश्न पूछें (उदा. कुंडली दक्षिणा, मुहूर्त)..."
                  : mode === "ai"
                    ? "Ask a follow-up question..."
                    : "Ask anything (e.g. fees, kundli, muhurta)..."
              }
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-brand text-on-brand hover:bg-brand-hover disabled:opacity-40 transition-colors"
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
