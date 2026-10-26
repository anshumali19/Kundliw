export interface KundliInput {
  name: string;
  gender?: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:mm
  pob: string;
  lat?: number;
  lng?: number;
  timezone?: string;
}

export interface PlanetaryPosition {
  planet: string;
  rashi: string;
  rashiLord: string;
  degree: string;
  house: number;
  isRetrograde?: boolean;
}

export interface KundliResult {
  isDemo: boolean;
  ascendant: string;
  ascendantLord: string;
  moonRashi: string;
  sunSign: string;
  nakshatra: string;
  nakshatraLord: string;
  charan: number;
  planetaryPositions: PlanetaryPosition[];
  vimshottariDasha: {
    currentMahadasha: string;
    currentAntardasha: string;
    endsAt: string;
  };
  sampleDisclaimer: string;
}

export interface MatchingInput {
  boy: KundliInput;
  girl: KundliInput;
}

export interface MatchingKoota {
  name: string;
  nameHi: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MatchingResult {
  isDemo: boolean;
  boyRashi: string;
  boyNakshatra: string;
  girlRashi: string;
  girlNakshatra: string;
  totalScore: number;
  maxScore: number;
  kootas: MatchingKoota[];
  manglikStatus: {
    isBoyManglik: boolean;
    isGirlManglik: boolean;
    compatibility: string;
  };
  nadiDosha: boolean;
  verdictEn: string;
  verdictHi: string;
  sampleDisclaimer: string;
}

export interface PanchangInput {
  date: string; // YYYY-MM-DD
  city?: string;
  lat?: number;
  lng?: number;
}

export interface PanchangResult {
  isDemo: boolean;
  date: string;
  samvat: string;
  tithi: string;
  tithiEndTime: string;
  paksha: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vaar: string;
  abhijitMuhurat: string;
  rahuKaal: string;
  sunrise: string;
  sunset: string;
  masa?: string;
  parts?: {
    tithiEn: string;
    tithiHi: string;
    pakshaEn: string;
    pakshaHi: string;
    masaEn: string;
    masaHi: string;
    samvat: number;
    tithiEnd: string;
  };
}

export interface AstroProvider {
  name: string;
  calculateKundli(input: KundliInput): Promise<KundliResult>;
  calculateMatching(input: MatchingInput): Promise<MatchingResult>;
  calculatePanchang(input: PanchangInput): Promise<PanchangResult>;
}
