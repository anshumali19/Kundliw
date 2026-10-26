import { MapPin, Navigation } from "lucide-react";
import { MapSettings, directionsUrl, mapIframeSrc } from "@/lib/content/map";

/** The Kendra's location on a map, with a Get directions button. Renders nothing until a place is set. */
export function LocationMap({
  settings,
  title,
  address,
  isHindi,
  compact = false,
  onDark = false,
}: {
  settings: MapSettings;
  title?: string | null;
  address?: string | null;
  isHindi: boolean;
  compact?: boolean;
  onDark?: boolean;
}) {
  const src = mapIframeSrc(settings);
  if (!src) return null;
  const directions = directionsUrl(settings);

  return (
    <section aria-label={isHindi ? "हमारा स्थान" : "Our location"} className="space-y-2">
      {(title || !compact) && (
        <div className={`flex items-center gap-2 font-bold ${compact ? "text-xs uppercase tracking-wider" : "text-base"} ${onDark ? "text-gold" : "text-secondary"}`}>
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{title || (isHindi ? "हमारा स्थान" : "Our location")}</span>
        </div>
      )}
      <div className={`rounded-xl overflow-hidden border ${onDark ? "border-gold/40" : "border-outline-variant"} bg-surface-container ${compact ? "h-40" : "h-72 sm:h-80"}`}>
        <iframe
          src={src}
          title={isHindi ? "स्थान का नक्शा" : "Location map"}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      </div>
      {address && !compact && <p className="text-sm text-on-surface-variant">{address}</p>}
      {directions && (
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold hover:underline ${onDark ? "text-gold" : "text-primary"}`}
        >
          <Navigation className="w-4 h-4" aria-hidden="true" />
          {isHindi ? "रास्ता देखें" : "Get directions"}
        </a>
      )}
    </section>
  );
}
