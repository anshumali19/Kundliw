/** Helpers for the location map. The admin can type coordinates or paste a Google Maps link. */

export interface LatLng {
  lat: number;
  lng: number;
}

function valid(lat: number, lng: number): LatLng | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

/**
 * Reads a place from text the admin pastes: "25.3176, 82.9739", a Google Maps address
 * containing @lat,lng or !3dlat!4dlng or ?q=lat,lng, or an OpenStreetMap link (#map=z/lat/lng).
 * Short links (maps.app.goo.gl) cannot be read here; the admin should open them and copy the full address.
 */
export function parseMapInput(input: string): LatLng | null {
  const text = (input || "").trim();
  if (!text) return null;

  const plain = text.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (plain) return valid(parseFloat(plain[1]), parseFloat(plain[2]));

  const patterns: RegExp[] = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/,
    /#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/,
    /[?&]mlat=(-?\d+(?:\.\d+)?)&mlon=(-?\d+(?:\.\d+)?)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return valid(parseFloat(m[1]), parseFloat(m[2]));
  }
  return null;
}

const ALLOWED_EMBED_PREFIXES = [
  "https://www.google.com/maps/embed",
  "https://www.google.com/maps?",
  "https://maps.google.com/maps?",
  "https://www.openstreetmap.org/export/embed.html",
];

/** Accepts an iframe src or a whole pasted <iframe> tag; only map providers are allowed. */
export function safeMapEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  let value = input.trim();
  const fromTag = value.match(/src=["']([^"']+)["']/i);
  if (fromTag) value = fromTag[1];
  value = value.replace(/&amp;/g, "&");
  return ALLOWED_EMBED_PREFIXES.some((p) => value.startsWith(p)) ? value : null;
}

export interface MapSettings {
  mapEnabled?: boolean | null;
  mapZoom?: number | null;
  mapLatitude?: number | null;
  mapLongitude?: number | null;
  googleMapEmbedUrl?: string | null;
}

/** The address the map iframe loads, or null when no place has been chosen. */
export function mapIframeSrc(settings: MapSettings): string | null {
  if (settings.mapEnabled === false) return null;
  const embed = safeMapEmbedUrl(settings.googleMapEmbedUrl);
  if (embed) return embed;
  const lat = settings.mapLatitude;
  const lng = settings.mapLongitude;
  if (lat == null || lng == null || !valid(lat, lng)) return null;
  const zoom = Math.min(Math.max(Math.round(settings.mapZoom ?? 15), 3), 19);
  const d = 360 / Math.pow(2, zoom);
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].map((n) => n.toFixed(6)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

/** The pinned place inside a Google embed link (its destination, else its centre), when no coordinates were typed. */
function embedPlace(settings: MapSettings): LatLng | null {
  const embed = safeMapEmbedUrl(settings.googleMapEmbedUrl);
  if (!embed) return null;
  const pins = [...embed.matchAll(/!1d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/g)];
  const last = pins[pins.length - 1];
  if (last) return valid(parseFloat(last[1]), parseFloat(last[2]));
  const c = embed.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  return c ? valid(parseFloat(c[2]), parseFloat(c[1])) : null;
}

export function directionsUrl(settings: MapSettings): string | null {
  const lat = settings.mapLatitude;
  const lng = settings.mapLongitude;
  const place = lat != null && lng != null ? valid(lat, lng) : embedPlace(settings);
  if (!place) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}
