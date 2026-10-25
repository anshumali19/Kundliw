"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Mail,
  BookOpen,
  DollarSign,
  Flame,
  Layers,
} from "lucide-react";
import { Link } from "@/i18n/routing";

interface FaqItemData {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  category: string;
  orderIndex: number;
}

interface FaqClientProps {
  initialItems: FaqItemData[];
  locale: string;
}

export function FaqClient({ initialItems, locale }: FaqClientProps) {
  const isHindi = locale === "hi";
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    [initialItems[0]?.id || ""]: true,
  });

  const categories = [
    { key: "ALL", labelEn: "All Questions", labelHi: "सभी प्रश्न", icon: Layers },
    { key: "KUNDLI", labelEn: "Kundli & Janampatri", labelHi: "कुण्डली एवं जन्मपत्रिका", icon: BookOpen },
    { key: "PUJA", labelEn: "Puja & Anushthan", labelHi: "पूजा एवं अनुष्ठान", icon: Flame },
    { key: "PAYMENT", labelEn: "Dakshina & Orders", labelHi: "दक्षिणा एवं बुकिंग", icon: DollarSign },
    { key: "GENERAL", labelEn: "General", labelHi: "सामान्य एवं केंद्र", icon: HelpCircle },
  ];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = initialItems.filter((item) => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const q = isHindi ? item.questionHi : item.questionEn;
    const a = isHindi ? item.answerHi : item.answerEn;
    const s = search.toLowerCase().trim();
    const matchesSearch = !s || q.toLowerCase().includes(s) || a.toLowerCase().includes(s);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-left space-y-8">
      {/* Page Header */}
      <div className="text-center sm:text-left space-y-2 border-b border-outline-variant/30 pb-6">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>{isHindi ? "प्रश्नोत्तरी एवं जिज्ञासा समाधान" : "Frequently Asked Questions"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {isHindi ? "प्रायः पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
          {isHindi
            ? "कुण्डली निर्माण, दृश्य गणित पंचांग, दक्षिणा भुगतान एवं अनुष्ठान संकल्प से संबंधित सामान्य जिज्ञासाएं।"
            : "Answers to common queries regarding horoscope calculations, ephemeris standards, payments, and rituals."}
        </p>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isHindi ? cat.labelHi : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHindi ? "प्रश्न खोजें..." : "Search questions..."}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2">
            <HelpCircle className="w-8 h-8 text-on-surface-variant mx-auto opacity-50" />
            <p className="text-sm font-semibold text-on-surface">
              {isHindi ? "कोई प्रश्न नहीं मिला" : "No questions matched your search"}
            </p>
            <p className="text-xs text-on-surface-variant">
              {isHindi
                ? "कृपया कोई अन्य श्रेणी चुनें या सहायता चैट का उपयोग करें।"
                : "Try selecting another category or use Help Chat."}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isOpen = !!openIds[item.id];
            const q = isHindi ? item.questionHi : item.questionEn;
            const a = isHindi ? item.answerHi : item.answerEn;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-outline-variant/40 bg-surface shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-surface-container-low transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif font-bold text-sm sm:text-base text-secondary flex-1">
                    {q}
                  </span>
                  <div className="p-1 rounded-full bg-surface-container text-on-surface-variant shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/20 whitespace-pre-line bg-surface-container-lowest">
                    {a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions CTA */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="font-serif font-bold text-base text-secondary flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{isHindi ? "क्या आपका प्रश्न यहाँ नहीं है?" : "Still have an unanswered question?"}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {isHindi
              ? "सहायता चैट से पूछें या केंद्र को पूछताछ भेजें।"
              : "Ask Help Chat or submit an enquiry to the Kendra team."}
          </p>
        </div>

        <Link
          href="/contact"
          className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Mail className="w-4 h-4" />
          <span>{isHindi ? "पूछताछ भेजें" : "Submit Enquiry"}</span>
        </Link>
      </div>
    </div>
  );
}
