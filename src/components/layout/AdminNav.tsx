"use client";

import { Link, usePathname } from "@/i18n/routing";
import {
  BadgeCheck,
  CalendarClock,
  Award,
  DatabaseBackup,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Languages,
  Layers,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Users,
  Handshake,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

interface Item {
  href: string;
  en: string;
  hi: string;
  icon: LucideIcon;
}

const GROUPS: Array<{ en: string; hi: string; items: Item[] }> = [
  {
    en: "Overview",
    hi: "अवलोकन",
    items: [{ href: "/admin", en: "Dashboard", hi: "डैशबोर्ड", icon: LayoutDashboard }],
  },
  {
    en: "Bookings & money",
    hi: "बुकिंग व भुगतान",
    items: [
      { href: "/admin/orders", en: "Orders", hi: "ऑर्डर", icon: ShoppingBag },
      { href: "/admin/services", en: "Services & plans", hi: "सेवाएँ व प्लान", icon: Layers },
      { href: "/admin/other-services", en: "Other services", hi: "अन्य सेवाएँ", icon: Sparkles },
      { href: "/admin/slots", en: "Appointment slots", hi: "अपॉइंटमेंट स्लॉट", icon: CalendarClock },
      { href: "/admin/offers", en: "Promo codes", hi: "प्रोमो कोड", icon: Tag },
      { href: "/admin/enquiries", en: "Enquiries", hi: "पूछताछ", icon: Inbox },
    ],
  },
  {
    en: "People",
    hi: "लोग",
    items: [
      { href: "/admin/users", en: "Users", hi: "उपयोगकर्ता", icon: Users },
      { href: "/admin/associates", en: "Associates", hi: "एसोसिएट", icon: Handshake },
      { href: "/admin/vault", en: "Customer files", hi: "ग्राहक फ़ाइलें", icon: ShieldAlert },
    ],
  },
  {
    en: "Website",
    hi: "वेबसाइट",
    items: [
      { href: "/admin/website", en: "Website settings", hi: "वेबसाइट सेटिंग", icon: Globe },
      { href: "/admin/banners", en: "Banners", hi: "बैनर", icon: ImageIcon },
      { href: "/admin/marquee", en: "Scrolling notice", hi: "स्क्रॉलिंग सूचना", icon: Megaphone },
      { href: "/admin/pages", en: "Pages & legal", hi: "पेज व कानूनी", icon: FileText },
      { href: "/admin/blogs", en: "Articles", hi: "लेख", icon: Newspaper },
      { href: "/admin/gallery", en: "Gallery", hi: "गैलरी", icon: ImageIcon },
      { href: "/admin/testimonials", en: "Reviews", hi: "समीक्षाएँ", icon: Star },
      { href: "/admin/faq", en: "FAQ", hi: "प्रश्नोत्तर", icon: HelpCircle },
      { href: "/admin/founder", en: "Founder", hi: "संस्थापक", icon: Award },
      { href: "/admin/team", en: "Team & assistants", hi: "सहायक व टीम", icon: Users },
      { href: "/admin/credentials", en: "Certificates", hi: "प्रमाणपत्र", icon: BadgeCheck },
      { href: "/admin/translations", en: "Translations", hi: "अनुवाद", icon: Languages },
      { href: "/admin/chatbot", en: "Chatbot", hi: "चैटबॉट", icon: MessageSquare },
    ],
  },
  {
    en: "System",
    hi: "सिस्टम",
    items: [
      { href: "/admin/settings", en: "Business settings", hi: "व्यवसाय सेटिंग", icon: Settings },
      { href: "/admin/settings/keys", en: "API keys & Analytics", hi: "API कीज़ व एनालिटिक्स", icon: KeyRound },
      { href: "/admin/backup", en: "Backups", hi: "बैकअप", icon: DatabaseBackup },
    ],
  },
];

/** Grouped admin menu: a sticky sidebar on large screens, a fold-out list on phones. */
export function AdminNav({ isHindi }: { isHindi: boolean }) {
  const pathname = usePathname();
  const all = GROUPS.flatMap((g) => g.items);
  // The most specific matching link is the active one (so /admin/settings/keys does not light up /admin/settings).
  const active = all
    .filter((i) => pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const list = (
    <nav aria-label={isHindi ? "एडमिन मेनू" : "Admin menu"} className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.en}>
          <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
            {isHindi ? g.hi : g.en}
          </div>
          <ul className="space-y-0.5">
            {g.items.map((i) => {
              const on = i.href === active;
              const Icon = i.icon;
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-2.5 min-h-[40px] px-3 rounded-lg text-sm font-semibold transition-colors ${
                      on
                        ? "bg-brand text-on-brand"
                        : "text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${on ? "text-gold" : "text-primary"}`} aria-hidden="true" />
                    <span>{isHindi ? i.hi : i.en}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <details className="lg:hidden bg-surface-container-lowest border border-outline-variant rounded-xl">
        <summary className="flex items-center gap-2 min-h-[48px] px-4 font-bold text-secondary cursor-pointer list-none">
          <Menu className="w-5 h-5 text-primary" aria-hidden="true" />
          {isHindi ? "एडमिन मेनू" : "Admin menu"}
        </summary>
        <div className="px-2 pb-4 pt-1 max-h-[70vh] overflow-y-auto overscroll-contain">{list}</div>
      </details>
      <aside className="hidden lg:block w-64 shrink-0 self-stretch">
        <div className="sticky top-[132px] max-h-[calc(100vh-150px)] overflow-y-auto overscroll-contain bg-surface-container-lowest border border-outline-variant rounded-xl p-3">
          {list}
        </div>
      </aside>
    </>
  );
}
