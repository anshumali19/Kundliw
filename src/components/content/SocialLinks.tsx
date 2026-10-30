import { getActiveSocialLinks } from "@/lib/siteConfig/service";
import { SocialIcon, socialBackground } from "./SocialIcon";

/** Round icon buttons for every social page the admin has switched on. */
export async function SocialLinks({ className = "" }: { className?: string; tone?: "dark" | "light" }) {
  // WhatsApp has its own floating button, so it is not repeated here
  const links = (await getActiveSocialLinks()).filter((l) => l.id !== "whatsapp");
  if (links.length === 0) return null;
  // every network in its own colour, white icon (same on light and dark backgrounds)
  const color = "text-white shadow-sm ring-1 ring-white/30 hover:scale-110 hover:brightness-110";
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Social media">
      {links.map((l) => (
        <li key={l.id}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.name}
            title={l.name}
            style={{ background: socialBackground(l.id) }}
            className={`w-10 h-10 inline-flex items-center justify-center rounded-full transition ${color}`}
          >
            <SocialIcon id={l.id} />
          </a>
        </li>
      ))}
    </ul>
  );
}
