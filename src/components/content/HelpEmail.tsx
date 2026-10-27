import { Mail } from "lucide-react";
import { KENDRA_EMAIL } from "@/lib/content/contact";

/** "Need help? Email us" line shown on booking, payment and tracking screens. */
export function HelpEmail({ isHindi, email, className = "" }: { isHindi: boolean; email?: string; className?: string }) {
  const address = (email || "").trim() || KENDRA_EMAIL;
  return (
    <a
      href={`mailto:${address}`}
      className={`flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary ${className}`}
    >
      <Mail className="w-4 h-4 text-primary shrink-0" />
      <span className="break-all">{isHindi ? "सहायता के लिए ईमेल करें:" : "Need help? Email us:"} <strong>{address}</strong></span>
    </a>
  );
}
