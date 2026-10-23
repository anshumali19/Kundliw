import { assertPlaceholderAllowed } from "@/lib/config/demo";
import {
  AstroProvider,
  KundliInput,
  KundliResult,
  MatchingInput,
  MatchingResult,
  PanchangInput,
  PanchangResult,
} from "./types";

/**
 * Demo Astro Provider returning sample Vedic data.
 * All responses carry a visible `isDemo: true` flag and demo disclaimer.
 */
export class DemoAstroProvider implements AstroProvider {
  name = "DemoAstroProvider";

  constructor() {
    assertPlaceholderAllowed("DemoAstroProvider");
  }

  async calculateKundli(input: KundliInput): Promise<KundliResult> {
    return {
      isDemo: true,
      ascendant: "Scorpio (वृश्चिक)",
      ascendantLord: "Mars (मंगल)",
      moonRashi: "Aries (मेष)",
      sunSign: "Leo (सिंह)",
      nakshatra: "Ashwini (अश्विनी)",
      nakshatraLord: "Ketu (केतु)",
      charan: 2,
      planetaryPositions: [
        { planet: "Surya (Sun)", rashi: "Leo (सिंह)", rashiLord: "Sun", degree: "14°28'", house: 10 },
        { planet: "Chandra (Moon)", rashi: "Aries (मेष)", rashiLord: "Mars", degree: "06°12'", house: 6 },
        { planet: "Mangal (Mars)", rashi: "Capricorn (मकर)", rashiLord: "Saturn", degree: "28°04'", house: 3 },
        { planet: "Budh (Mercury)", rashi: "Virgo (कन्या)", rashiLord: "Mercury", degree: "15°10'", house: 11 },
        { planet: "Guru (Jupiter)", rashi: "Sagittarius (धनु)", rashiLord: "Jupiter", degree: "19°45'", house: 2 },
        { planet: "Shukra (Venus)", rashi: "Libra (तुला)", rashiLord: "Venus", degree: "22°30'", house: 12 },
        { planet: "Shani (Saturn)", rashi: "Aquarius (कुम्भ)", rashiLord: "Saturn", degree: "08°15'", house: 4 },
        { planet: "Rahu", rashi: "Pisces (मीन)", rashiLord: "Jupiter", degree: "12°50'", house: 5, isRetrograde: true },
        { planet: "Ketu", rashi: "Virgo (कन्या)", rashiLord: "Mercury", degree: "12°50'", house: 11, isRetrograde: true },
      ],
      vimshottariDasha: {
        currentMahadasha: "Jupiter (बृहस्पति)",
        currentAntardasha: "Saturn (शनि)",
        endsAt: "Nov 2027",
      },
      sampleDisclaimer: "Sample output, not a real calculation • नमूना परिणाम, वास्तविक गणना नहीं",
    };
  }

  async calculateMatching(input: MatchingInput): Promise<MatchingResult> {
    return {
      isDemo: true,
      boyRashi: "Leo (सिंह)",
      boyNakshatra: "Magha (मघा)",
      girlRashi: "Aries (मेष)",
      girlNakshatra: "Ashwini (अश्विनी)",
      totalScore: 28,
      maxScore: 36,
      kootas: [
        { name: "Varna", nameHi: "वर्ण", score: 1, maxScore: 1, description: "Spiritual alignment" },
        { name: "Vashya", nameHi: "वश्य", score: 2, maxScore: 2, description: "Mutual harmony" },
        { name: "Tara", nameHi: "तारा", score: 1.5, maxScore: 3, description: "Destiny and health compatibility" },
        { name: "Yoni", nameHi: "योनि", score: 4, maxScore: 4, description: "Disposition and vitality" },
        { name: "Graha Maitri", nameHi: "ग्रह मैत्री", score: 5, maxScore: 5, description: "Psychological friendship" },
        { name: "Gana", nameHi: "गण", score: 6, maxScore: 6, description: "Temperament compatibility" },
        { name: "Bhakoot", nameHi: "भकूट", score: 0.5, maxScore: 7, description: "Family welfare and growth" },
        { name: "Nadi", nameHi: "नाड़ी", score: 8, maxScore: 8, description: "Genetic vitality and lineage" },
      ],
      manglikStatus: {
        isBoyManglik: false,
        isGirlManglik: false,
        compatibility: "Shubh (Auspicious Compatibility)",
      },
      nadiDosha: false,
      verdictEn: "Auspicious match (28 / 36 points). Mutual Graha Maitri and Shubh Nadi scores provide auspicious matrimonial prospects.",
      verdictHi: "शुभ मिलान (२८ / ३६ गुण)। ग्रह मैत्री एवं शुद्ध नाड़ी गुण सुखद दांपत्य जीवन के योग दर्शाते हैं।",
      sampleDisclaimer: "Sample output, not a real calculation • नमूना परिणाम, वास्तविक गणना नहीं",
    };
  }

  async calculatePanchang(input: PanchangInput): Promise<PanchangResult> {
    return {
      isDemo: true,
      date: input.date,
      samvat: "Vikram Samvat 2083 (कालयुक्त)",
      tithi: "Shukla Paksha Trayodashi (शुक्ल त्रयोदशी)",
      tithiEndTime: "06:42 PM",
      paksha: "Shukla (शुक्ल पक्ष)",
      nakshatra: "Uttara Phalguni (उत्तराफाल्गुनी)",
      yoga: "Shobhana (शोभन)",
      karana: "Taitila (तैतिल)",
      vaar: "Shukravar (Friday / शुक्रवार)",
      abhijitMuhurat: "11:48 AM - 12:36 PM",
      rahuKaal: "10:42 AM - 12:08 PM",
      sunrise: "06:14 AM",
      sunset: "05:42 PM",
    };
  }
}
