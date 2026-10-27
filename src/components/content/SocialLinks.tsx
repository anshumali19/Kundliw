import { getActiveSocialLinks } from "@/lib/siteConfig/service";
import { SocialIcon } from "./SocialIcon";

/** Round icon buttons for every social page the admin has switched on. */
export async function SocialLinks({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  // WhatsApp has its own floating button, so it is not repeated here
  const links = (await getActiveSocialLinks()).filter((l) => l.id !== "whatsapp");
  if (links.length === 0) return null;
  const color =
    tone === "light"
      ? "border-white/60 text-white hover:bg-white/15"
      : "border-outline-variant text-secondary hover:bg-surface-container-high";
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
            className={`w-10 h-10 inline-flex items-center justify-center rounded-full border transition-colors ${color}`}
          >
            <SocialIcon id={l.id} />
          </a>
        </li>
      ))}
    </ul>
  );
}
