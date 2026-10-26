import { Facebook, Instagram, Linkedin, MessageCircle, Send, Share2, Twitter, Youtube } from "lucide-react";

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
