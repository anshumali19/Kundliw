import { CalendarDays, CheckCircle2, XCircle, Package as PackageIcon, Users } from "lucide-react";
import { RichText } from "@/components/content/RichText";
import { LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc, normalizeLinks } from "@/lib/content/media";

export interface PackageAvailabilityDTO {
  status: "open" | "full" | "closed";
  seatsLeft: number | null;
  reason?: "full" | "started" | "ended";
}

export interface PackageDetailDTO {
  id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string | null;
  descriptionHi?: string | null;
  numberOfDays?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  itineraryDays?: unknown;
  inclusionsEn?: string[];
  inclusionsHi?: string[];
  exclusionsEn?: string[];
  exclusionsHi?: string[];
  materialsEn?: string[];
  materialsHi?: string[];
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  additionalLinks?: unknown;
  availability?: PackageAvailabilityDTO;
}

interface Day {
  titleEn: string;
  titleHi: string;
  detailsEn: string;
  detailsHi: string;
}

function days(raw: unknown): Day[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((d) => {
    const r = (d ?? {}) as Record<string, unknown>;
    return {
      titleEn: String(r.titleEn ?? ""),
      titleHi: String(r.titleHi ?? ""),
      detailsEn: String(r.detailsEn ?? ""),
      detailsHi: String(r.detailsHi ?? ""),
    };
  });
}

const fmt = (iso: string, hi: boolean) =>
  new Date(iso).toLocaleDateString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Everything the admin wrote about a package: days, dates, programme, lists, picture, video and links. */
export function PackageDetails({ pkg, isHindi }: { pkg: PackageDetailDTO; isHindi: boolean }) {
  const pick = (en?: string | null, hi?: string | null) => (isHindi ? hi || en : en || hi) || "";
  const description = pick(pkg.descriptionEn, pkg.descriptionHi);
  const itinerary = days(pkg.itineraryDays);
  const inc = (isHindi && pkg.inclusionsHi?.length ? pkg.inclusionsHi : pkg.inclusionsEn) ?? [];
  const exc = (isHindi && pkg.exclusionsHi?.length ? pkg.exclusionsHi : pkg.exclusionsEn) ?? [];
  const mat = (isHindi && pkg.materialsHi?.length ? pkg.materialsHi : pkg.materialsEn) ?? [];
  const links = normalizeLinks(pkg.additionalLinks);
  const a = pkg.availability;

  const empty =
    !description &&
    !pkg.numberOfDays &&
    !pkg.startDate &&
    itinerary.length === 0 &&
    inc.length === 0 &&
    exc.length === 0 &&
    mat.length === 0 &&
    !pkg.youtubeUrl &&
    !isSafeImageSrc(pkg.imageUrl) &&
    links.length === 0 &&
    !(a && a.status !== "open");
  if (empty) return null;

  return (
    <div className="mt-6 rounded-xl border border-outline-variant/50 bg-surface p-5 sm:p-6 space-y-6 text-left">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-xl font-bold text-secondary flex items-center gap-2">
          <PackageIcon className="w-5 h-5 text-primary" aria-hidden="true" />
          {isHindi ? pkg.titleHi : pkg.titleEn}
        </h3>
        {pkg.numberOfDays ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-secondary">
            {pkg.numberOfDays} {isHindi ? "दिन" : pkg.numberOfDays === 1 ? "day" : "days"}
          </span>
        ) : null}
        {pkg.startDate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-secondary">
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
            {fmt(pkg.startDate, isHindi)}
            {pkg.endDate ? ` → ${fmt(pkg.endDate, isHindi)}` : ""}
          </span>
        ) : null}
        {a && a.status === "open" && a.seatsLeft != null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {isHindi ? `${a.seatsLeft} स्थान शेष` : `${a.seatsLeft} seat${a.seatsLeft === 1 ? "" : "s"} left`}
          </span>
        ) : null}
        {a && a.status !== "open" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-3 py-1 text-xs font-bold text-on-error-container">
            {a.reason === "full"
              ? isHindi
                ? "सभी स्थान भर चुके हैं"
                : "Fully booked"
              : a.reason === "ended"
                ? isHindi
                  ? "समाप्त"
                  : "Ended"
                : isHindi
                  ? "बुकिंग बंद (आरंभ हो चुका)"
                  : "Booking closed (already started)"}
          </span>
        ) : null}
      </div>

      {(description || isSafeImageSrc(pkg.imageUrl)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {isSafeImageSrc(pkg.imageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pkg.imageUrl} alt={isHindi ? pkg.titleHi : pkg.titleEn} className="w-full rounded-lg border border-outline-variant/40 object-cover max-h-64 md:col-span-1" loading="lazy" />
          )}
          {description && (
            <div className={`text-sm text-on-surface leading-relaxed space-y-2 ${isSafeImageSrc(pkg.imageUrl) ? "md:col-span-2" : "md:col-span-3"}`}>
              <RichText text={description} />
            </div>
          )}
        </div>
      )}

      {itinerary.length > 0 && (
        <div>
          <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary mb-3">
            {isHindi ? "दिन-वार कार्यक्रम" : "Day by day itinerary"}
          </h4>
          <ol className="space-y-3">
            {itinerary.map((d, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-14 text-center rounded bg-maroon text-on-maroon text-xs font-bold py-1.5 h-fit">
                  {isHindi ? `दिन ${i + 1}` : `Day ${i + 1}`}
                </span>
                <div className="min-w-0">
                  {pick(d.titleEn, d.titleHi) && <div className="font-semibold text-secondary text-sm">{pick(d.titleEn, d.titleHi)}</div>}
                  {pick(d.detailsEn, d.detailsHi) && (
                    <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{pick(d.detailsEn, d.detailsHi)}</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(inc.length > 0 || exc.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {inc.length > 0 && (
            <div>
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary mb-2">{isHindi ? "सम्मिलित" : "Inclusions"}</h4>
              <ul className="space-y-1.5">
                {inc.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {exc.length > 0 && (
            <div>
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary mb-2">{isHindi ? "सम्मिलित नहीं" : "Exclusions"}</h4>
              <ul className="space-y-1.5">
                {exc.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                    <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {mat.length > 0 && (
        <div>
          <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary mb-2">{isHindi ? "सामग्री सूची" : "Material list"}</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-5 text-sm text-on-surface">
            {mat.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {pkg.youtubeUrl && <YouTubeEmbed url={pkg.youtubeUrl} title={isHindi ? pkg.titleHi : pkg.titleEn} isHindi={isHindi} />}

      {links.length > 0 && <LinkList links={links} isHindi={isHindi} heading={isHindi ? "अतिरिक्त लिंक" : "Additional links"} />}
    </div>
  );
}
