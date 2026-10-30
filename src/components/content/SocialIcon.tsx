import { Facebook, Instagram, Linkedin, MessageCircle, Send, Share2, Twitter, Youtube } from "lucide-react";

/** Each network's own colour (Instagram's is its sunset gradient), used as the round icon's background */
export function socialBackground(id: string): string {
  switch (id) {
    case "facebook":
      return "#1877F2";
    case "instagram":
      return "linear-gradient(45deg, #FEDA75 0%, #FA7E1E 25%, #D62976 50%, #962FBF 75%, #4F5BD5 100%)";
    case "youtube":
      return "#FF0000";
    case "twitter":
      return "#1DA1F2";
    case "linkedin":
      return "#0A66C2";
    case "whatsapp":
      return "#25D366";
    case "telegram":
      return "#229ED9";
    default:
      return "#6B7280";
  }
}

export function SocialIcon({ id, className = "w-4 h-4" }: { id: string; className?: string }) {
  switch (id) {
    case "facebook":
      return <Facebook className={className} aria-hidden="true" />;
    case "instagram":
      return <Instagram className={className} aria-hidden="true" />;
    case "youtube":
      return <Youtube className={className} aria-hidden="true" />;
    case "twitter":
      return <Twitter className={className} aria-hidden="true" />;
    case "linkedin":
      return <Linkedin className={className} aria-hidden="true" />;
    case "whatsapp":
      return <MessageCircle className={className} aria-hidden="true" />;
    case "telegram":
      return <Send className={className} aria-hidden="true" />;
    default:
      return <Share2 className={className} aria-hidden="true" />;
  }
}
