import type { PanchangResult } from "./types";

/**
 * Real Panchang calculated from the positions of the Sun and Moon (Meeus low-precision series,
 * Lahiri ayanamsha). Accurate to a few minutes, which is the normal accuracy of printed almanacs.
 * Tithi, nakshatra, yoga and karana are those running at local sunrise, as in a traditional Panchang.
 */

const RAD = Math.PI / 180;
const norm = (d: number) => ((d % 360) + 360) % 360;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);

export const DEFAULT_PLACE = { lat: 21.2092, lng: 81.3784 }; // Bhilai, Durg (the Kendra)
const IST_MIN = 330;

function toJD(ms: number): number {
  return ms / 86400000 + 2440587.5;
}
function fromJD(jd: number): number {
  return (jd - 2440587.5) * 86400000;
}

export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T;
  const C = (1.914602 - 0.004817 * T) * sin(M) + 0.019993 * sin(2 * M) + 0.000289 * sin(3 * M);
  const omega = 125.04 - 1934.136 * T;
  return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
}

export function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.272095 + 483202.0175233 * T;
  const lon =
    Lp +
    6.288774 * sin(Mp) +
    1.274027 * sin(2 * D - Mp) +
    0.658314 * sin(2 * D) +
    0.213618 * sin(2 * Mp) -
    0.185116 * sin(M) -
    0.114332 * sin(2 * F) +
    0.058793 * sin(2 * D - 2 * Mp) +
    0.057066 * sin(2 * D - M - Mp) +
    0.053322 * sin(2 * D + Mp) +
    0.045758 * sin(2 * D - M) -
    0.040923 * sin(M - Mp) -
    0.03472 * sin(D) -
    0.030383 * sin(M + Mp) +
    0.015327 * sin(2 * D - 2 * F) -
    0.012528 * sin(Mp + 2 * F) +
    0.01098 * sin(Mp - 2 * F) +
    0.010675 * sin(4 * D - Mp) +
    0.010034 * sin(3 * Mp) +
    0.008548 * sin(4 * D - 2 * Mp);
  return norm(lon);
}

/** Lahiri (Chitrapaksha) ayanamsha, degrees. */
export function lahiri(jd: number): number {
  const years = (jd - 2451545.0) / 365.2425;
  return 23.85306 + 0.013969 * years;
}

const elongation = (jd: number) => norm(moonLongitude(jd) - sunLongitude(jd));

/** Time (JD) at which the elongation next reaches `target` degrees, searching forward from jd. */
function nextElongation(jd: number, target: number): number {
  let lo = jd;
  let hi = jd + 2;
  // Walk back if we are already past the target within this window.
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const diff = norm(elongation(mid) - target);
    if (diff > 180) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function sunTimes(dateStr: string, lat: number, lng: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noonUtc = Date.UTC(y, m - 1, d, 12, 0, 0);
  const jd = toJD(noonUtc);
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  const M = 357.52911 + 35999.05029 * T;
  const e = 0.016708634 - 0.000042037 * T;
  const eps = 23.439291 - 0.0130042 * T;
  const C = (1.914602 - 0.004817 * T) * sin(M) + 0.019993 * sin(2 * M);
  const lam = L0 + C;
  const dec = Math.asin(sin(eps) * sin(lam)) / RAD;
  const yv = Math.tan((eps * RAD) / 2) ** 2;
  const eot =
    4 *
    (yv * sin(2 * L0) - 2 * e * sin(M) + 4 * e * yv * sin(M) * cos(2 * L0) - 0.5 * yv * yv * sin(4 * L0) - 1.25 * e * e * sin(2 * M)) /
    RAD;
  const ha = Math.acos(cos(90.833) / (cos(lat) * cos(dec)) - Math.tan(lat * RAD) * Math.tan(dec * RAD)) / RAD;
  const solarNoonMin = 720 - 4 * lng - eot; // UTC minutes
  const riseUtcMin = solarNoonMin - 4 * ha;
  const setUtcMin = solarNoonMin + 4 * ha;
  const dayStartUtc = Date.UTC(y, m - 1, d);
  return {
    sunriseMs: dayStartUtc + riseUtcMin * 60000,
    sunsetMs: dayStartUtc + setUtcMin * 60000,
    noonMs: dayStartUtc + solarNoonMin * 60000,
  };
}

const TITHIS: Array<[string, string]> = [
  ["Pratipada", "प्रतिपदा"], ["Dwitiya", "द्वितीया"], ["Tritiya", "तृतीया"], ["Chaturthi", "चतुर्थी"], ["Panchami", "पंचमी"],
  ["Shashthi", "षष्ठी"], ["Saptami", "सप्तमी"], ["Ashtami", "अष्टमी"], ["Navami", "नवमी"], ["Dashami", "दशमी"],
  ["Ekadashi", "एकादशी"], ["Dwadashi", "द्वादशी"], ["Trayodashi", "त्रयोदशी"], ["Chaturdashi", "चतुर्दशी"],
];
const NAKSHATRAS: Array<[string, string]> = [
  ["Ashwini", "अश्विनी"], ["Bharani", "भरणी"], ["Krittika", "कृत्तिका"], ["Rohini", "रोहिणी"], ["Mrigashira", "मृगशिरा"],
  ["Ardra", "आर्द्रा"], ["Punarvasu", "पुनर्वसु"], ["Pushya", "पुष्य"], ["Ashlesha", "आश्लेषा"], ["Magha", "मघा"],
  ["Purva Phalguni", "पूर्वाफाल्गुनी"], ["Uttara Phalguni", "उत्तराफाल्गुनी"], ["Hasta", "हस्त"], ["Chitra", "चित्रा"],
  ["Swati", "स्वाति"], ["Vishakha", "विशाखा"], ["Anuradha", "अनुराधा"], ["Jyeshtha", "ज्येष्ठा"], ["Mula", "मूल"],
  ["Purva Ashadha", "पूर्वाषाढ़ा"], ["Uttara Ashadha", "उत्तराषाढ़ा"], ["Shravana", "श्रवण"], ["Dhanishta", "धनिष्ठा"],
  ["Shatabhisha", "शतभिषा"], ["Purva Bhadrapada", "पूर्वभाद्रपदा"], ["Uttara Bhadrapada", "उत्तरभाद्रपदा"], ["Revati", "रेवती"],
];
const YOGAS: Array<[string, string]> = [
  ["Vishkambha", "विष्कम्भ"], ["Priti", "प्रीति"], ["Ayushman", "आयुष्मान"], ["Saubhagya", "सौभाग्य"], ["Shobhana", "शोभन"],
  ["Atiganda", "अतिगण्ड"], ["Sukarma", "सुकर्मा"], ["Dhriti", "धृति"], ["Shula", "शूल"], ["Ganda", "गण्ड"],
  ["Vriddhi", "वृद्धि"], ["Dhruva", "ध्रुव"], ["Vyaghata", "व्याघात"], ["Harshana", "हर्षण"], ["Vajra", "वज्र"],
  ["Siddhi", "सिद्धि"], ["Vyatipata", "व्यतीपात"], ["Variyan", "वरीयान"], ["Parigha", "परिघ"], ["Shiva", "शिव"],
  ["Siddha", "सिद्ध"], ["Sadhya", "साध्य"], ["Shubha", "शुभ"], ["Shukla", "शुक्ल"], ["Brahma", "ब्रह्म"],
  ["Indra", "इन्द्र"], ["Vaidhriti", "वैधृति"],
];
const REPEATING_KARANAS: Array<[string, string]> = [
  ["Bava", "बव"], ["Balava", "बालव"], ["Kaulava", "कौलव"], ["Taitila", "तैतिल"], ["Gara", "गर"], ["Vanija", "वणिज"], ["Vishti (Bhadra)", "विष्टि (भद्रा)"],
];
const VAAR: Array<[string, string]> = [
  ["Ravivar (Sunday)", "रविवार"], ["Somvar (Monday)", "सोमवार"], ["Mangalvar (Tuesday)", "मंगलवार"], ["Budhvar (Wednesday)", "बुधवार"],
  ["Guruvar (Thursday)", "गुरुवार"], ["Shukravar (Friday)", "शुक्रवार"], ["Shanivar (Saturday)", "शनिवार"],
];

export function tithiName(n: number): { en: string; hi: string; paksha: "Shukla" | "Krishna" } {
  if (n === 15) return { en: "Purnima", hi: "पूर्णिमा", paksha: "Shukla" };
  if (n === 30) return { en: "Amavasya", hi: "अमावस्या", paksha: "Krishna" };
  const [en, hi] = TITHIS[(n - 1) % 15];
  return { en, hi, paksha: n <= 15 ? "Shukla" : "Krishna" };
}

function karanaName(k: number): [string, string] {
  if (k === 0) return ["Kimstughna", "किंस्तुघ्न"];
  if (k === 57) return ["Shakuni", "शकुनि"];
  if (k === 58) return ["Chatushpada", "चतुष्पद"];
  if (k === 59) return ["Naga", "नाग"];
  return REPEATING_KARANAS[(k - 1) % 7];
}

const pad = (n: number) => String(n).padStart(2, "0");
function clock(ms: number, withDay?: string): string {
  const t = new Date(ms + IST_MIN * 60000);
  let h = t.getUTCHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const s = `${pad(h)}:${pad(t.getUTCMinutes())} ${ap}`;
  const day = t.toISOString().slice(0, 10);
  return withDay && day !== withDay ? `${s} (next day / अगले दिन)` : s;
}

/** Vikram Samvat begins after the new moon that falls while the Sun is in sidereal Pisces (Chaitra amavasya). */
export function vikramSamvat(jd: number): number {
  let t = jd;
  for (let i = 0; i < 16; i++) {
    // Move to the previous new moon.
    let nm = t - elongation(t) / 12.1907;
    for (let k = 0; k < 4; k++) nm -= ((elongation(nm) + 180) % 360 - 180) / 12.1907;
    const sid = norm(sunLongitude(nm) - lahiri(nm));
    if (sid >= 330 && sid < 360) {
      return new Date(fromJD(nm) + IST_MIN * 60000).getUTCFullYear() + 57;
    }
    t = nm - 1;
  }
  return new Date(fromJD(jd)).getUTCFullYear() + 57;
}

const MASAS: Array<[string, string]> = [
  ["Chaitra", "चैत्र"], ["Vaishakha", "वैशाख"], ["Jyeshtha", "ज्येष्ठ"], ["Ashadha", "आषाढ़"], ["Shravana", "श्रावण"], ["Bhadrapada", "भाद्रपद"],
  ["Ashwin", "आश्विन"], ["Kartika", "कार्तिक"], ["Margashirsha", "मार्गशीर्ष"], ["Pausha", "पौष"], ["Magha", "माघ"], ["Phalguna", "फाल्गुन"],
];

/** Lunar month (amanta): named after the sign the Sun is in at the last new moon. */
export function amantaMasaIndex(jd: number): number {
  let nm = jd - elongation(jd) / 12.1907;
  for (let k = 0; k < 4; k++) nm -= (((elongation(nm) + 180) % 360) - 180) / 12.1907;
  const rashi = Math.floor(norm(sunLongitude(nm) - lahiri(nm)) / 30);
  return (rashi + 1) % 12;
}

export function computePanchang(dateStr: string, place = DEFAULT_PLACE): PanchangResult {
  const [y, m, d] = dateStr.split("-").map(Number);
  const { sunriseMs, sunsetMs, noonMs } = sunTimes(dateStr, place.lat, place.lng);
  const jd = toJD(sunriseMs);

  const el = elongation(jd);
  const tithiNo = Math.floor(el / 12) + 1;
  const tn = tithiName(tithiNo);
  const endJd = nextElongation(jd, (tithiNo * 12) % 360);

  const ay = lahiri(jd);
  const sidMoon = norm(moonLongitude(jd) - ay);
  const sidSun = norm(sunLongitude(jd) - ay);
  const nak = NAKSHATRAS[Math.floor(sidMoon / (360 / 27)) % 27];
  const yoga = YOGAS[Math.floor(norm(sidMoon + sidSun) / (360 / 27)) % 27];
  const kar = karanaName(Math.floor(el / 6) % 60);

  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const dayLen = sunsetMs - sunriseMs;
  const seg = dayLen / 8;
  const rahuIndex = [8, 2, 7, 5, 6, 4, 3][weekday]; // Sun..Sat, 1-based part of the day
  const rahuStart = sunriseMs + (rahuIndex - 1) * seg;
  const abhijitHalf = dayLen / 30;

  // North India (Varanasi) follows the purnimanta month: the dark half belongs to the next month.
  const masaIdx = (amantaMasaIndex(jd) + (tn.paksha === "Krishna" ? 1 : 0)) % 12;
  const samvatYear = vikramSamvat(jd);
  const dayKey = dateStr;
  return {
    isDemo: false,
    date: dateStr,
    samvat: `Vikram Samvat ${vikramSamvat(jd)} (विक्रम संवत ${vikramSamvat(jd)})`,
    tithi: `${tn.paksha} Paksha ${tn.en} (${tn.paksha === "Shukla" ? "शुक्ल" : "कृष्ण"} ${tn.hi})`,
    tithiEndTime: clock(fromJD(endJd), dayKey),
    paksha: tn.paksha === "Shukla" ? "Shukla (शुक्ल पक्ष)" : "Krishna (कृष्ण पक्ष)",
    nakshatra: `${nak[0]} (${nak[1]})`,
    yoga: `${yoga[0]} (${yoga[1]})`,
    karana: `${kar[0]} (${kar[1]})`,
    vaar: `${VAAR[weekday][0]} / ${VAAR[weekday][1]}`,
    abhijitMuhurat: `${clock(noonMs - abhijitHalf)} - ${clock(noonMs + abhijitHalf)}`,
    rahuKaal: `${clock(rahuStart)} - ${clock(rahuStart + seg)}`,
    sunrise: clock(sunriseMs),
    sunset: clock(sunsetMs),
    masa: `${MASAS[masaIdx][0]} (${MASAS[masaIdx][1]})`,
    parts: {
      tithiEn: tn.en,
      tithiHi: tn.hi,
      pakshaEn: tn.paksha === "Shukla" ? "Shukla Paksha" : "Krishna Paksha",
      pakshaHi: tn.paksha === "Shukla" ? "शुक्ल पक्ष" : "कृष्ण पक्ष",
      masaEn: MASAS[masaIdx][0],
      masaHi: MASAS[masaIdx][1],
      samvat: samvatYear,
      tithiEnd: clock(fromJD(endJd)),
    },
  };
}
