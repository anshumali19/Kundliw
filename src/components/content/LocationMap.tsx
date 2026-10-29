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
  const addr = (address || "").trim();
  // No saved pin or embed: fall back to searching the typed address so the map still shows
  const src = mapIframeSrc(settings) || (settings.mapEnabled !== false && addr ? `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed` : null);
  const directions = directionsUrl(settings) || (addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}` : null);
  if (!src) {
    if (settings.mapEnabled === false) return null;
    return (
      <section aria-label={isHindi ? "हमारा स्थान" : "Our location"} className="space-y-2">
        <div className="flex items-center gap-2 font-bold text-base text-secondary">
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{title || (isHindi ? "हमारा स्थान" : "Our location")}</span>
        </div>
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container h-72 sm:h-80 flex items-center justify-center p-6 text-center text-sm text-on-surface-variant">
          {isHindi ? "नक्शा जल्द उपलब्ध होगा। (एडमिन > सेटिंग्स में पता या मैप लिंक जोड़ें)" : "Map coming soon. (Admin: add the address or map link in Settings.)"}
        </div>
      </section>
    );
  }

  return (
    <section aria-label={isHindi ? "हमारा स्थान" : "Our location"} className="space-y-2">
      {(title || !compact) && (
        <div className={`flex items-center gap-2 font-bold ${compact ? "text-xs uppercase tracking-wider" : "text-base"} ${onDark ? "text-white" : "text-secondary"}`}>
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
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full text-sm font-bold shadow-sm transition-colors ${onDark ? "bg-gold text-on-gold hover:opacity-90" : "bg-[#4CAF50] text-white border border-[#2E7D32]/50 hover:bg-[#3E9B42]"}`}>
          <Navigation className="w-4 h-4" aria-hidden="true" />
          {isHindi ? "रास्ता देखें" : "Get directions"}
        </a>
      )}
    </section>
  );
}
