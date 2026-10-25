import { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import {
  ShieldAlert,
  Layers,
  Tag,
  Settings,
  Users,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Languages,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function AdminLayout({
  children,
  params: { locale },
}: AdminLayoutProps) {
  // Enforce server-side DB-verified admin check
  const admin = await requireAdmin(`/admin/services`, locale);
  const isHindi = locale === "hi";

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-surface text-on-surface text-left">
      {/* Admin Command Bar */}
      <div className="w-full bg-secondary text-on-secondary border-b border-secondary/50 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <span className="p-1 rounded bg-secondary-fixed text-on-secondary-container font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CMS Admin</span>
            </span>
            <span className="font-serif font-bold text-sm sm:text-base">
              {isHindi
                ? "महर्षि कणाद ज्योतिष केंद्र • प्रबंधन नियंत्रण कक्ष"
                : "Maharshi Kanad Jyotish Kendra • Master Control"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono opacity-90">
            <span>
              {isHindi ? "प्रशासक:" : "Admin:"} {admin.email || admin.phone || admin.name}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-tertiary-fixed hover:underline"
            >
              <span>{isHindi ? "सार्वजनिक पोर्टल" : "Public Site"}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Broadsheet Secondary Navigation */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/40 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          <Link
            href="/admin/services"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-secondary hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? "सेवाएँ (Services)" : "Services"}</span>
          </Link>

          <Link
            href="/admin/offers"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <Tag className="w-3.5 h-3.5 text-tertiary" />
            <span>{isHindi ? "कूपन (Offers)" : "Offers"}</span>
          </Link>

          <Link
            href="/admin/orders"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-secondary" />
            <span>{isHindi ? "आदेश (Orders)" : "Orders"}</span>
          </Link>

          <Link
            href="/admin/vault"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? "वॉल्ट (Vault)" : "Vault"}</span>
          </Link>

          <Link
            href="/admin/banners"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <span>{isHindi ? "बैनर (Banners)" : "Banners"}</span>
          </Link>

          <Link
            href="/admin/marquee"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <span>{isHindi ? "मार्की (Marquee)" : "Marquee"}</span>
          </Link>

          <Link
            href="/admin/pages"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <span>{isHindi ? "स्थैतिक पृष्ठ (Pages)" : "Pages"}</span>
          </Link>

          <Link
            href="/admin/blogs"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <span>{isHindi ? "लेख (Articles)" : "Articles"}</span>
          </Link>

          <Link
            href="/admin/testimonials"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <span>{isHindi ? "संस्तुतियाँ (Reviews)" : "Testimonials"}</span>
          </Link>

          <Link
            href="/admin/gallery"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <span>{isHindi ? "दीर्घा (Gallery)" : "Gallery"}</span>
          </Link>

          <Link
            href="/admin/translations"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? "अनुवाद (Translations)" : "Translations"}</span>
          </Link>

          <Link
            href="/admin/settings"
            className="min-h-[40px] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-on-surface hover:bg-surface border border-outline-variant/40 transition-colors shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-secondary" />
            <span>{isHindi ? "सेटिंग्स (Settings)" : "Settings"}</span>
          </Link>
        </div>
      </div>

      {/* Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        {children}
      </main>
    </div>
  );
}
