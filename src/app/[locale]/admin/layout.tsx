import { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminLayout(props: AdminLayoutProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  // Enforce server-side DB-verified admin check
  const admin = await requireAdmin(`/admin/services`, locale);
  const isHindi = locale === "hi";

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-surface text-on-surface text-left">
      {/* Admin Command Bar */}
      <div className="w-full bg-maroon-deep text-on-maroon border-b border-gold/30 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-gold text-on-gold font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
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
              className="inline-flex items-center gap-1 text-gold hover:underline"
            >
              <span>{isHindi ? "सार्वजनिक पोर्टल" : "Public Site"}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <SignOutButton label={isHindi ? "लॉग आउट" : "Log out"} className="!min-h-[36px] !px-3 !text-xs !bg-surface" />
          </div>
        </div>
      </div>

      {/* Menu + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">
        <AdminNav isHindi={isHindi} />
        <main className="flex-1 min-w-0 w-full text-left">{children}</main>
      </div>
    </div>
  );
}
