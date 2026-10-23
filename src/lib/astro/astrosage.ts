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
 * Production AstroSage / Swiss Ephemeris Provider stub.
 * Fails loudly in production if API keys are missing.
 */
export class AstroSageProvider implements AstroProvider {
  name = "AstroSageProvider";
  private userId: string;
  private apiKey: string;

  constructor() {
    this.userId = process.env.ASTROSAGE_USER_ID || "";
    this.apiKey = process.env.ASTROSAGE_API_KEY || "";

    if (!this.userId || !this.apiKey) {
      throw new Error(
        "CRITICAL ASTRO CONFIGURATION ERROR: AstroSage credentials are not configured. Set ASTROSAGE_USER_ID and ASTROSAGE_API_KEY in environment variables."
      );
    }
  }

  async calculateKundli(): Promise<KundliResult> {
    throw new Error("AstroSageProvider API call not yet integrated. Configure API keys or use DemoAstroProvider.");
  }

  async calculateMatching(): Promise<MatchingResult> {
    throw new Error("AstroSageProvider API call not yet integrated. Configure API keys or use DemoAstroProvider.");
  }

  async calculatePanchang(): Promise<PanchangResult> {
    throw new Error("AstroSageProvider API call not yet integrated. Configure API keys or use DemoAstroProvider.");
  }
}
