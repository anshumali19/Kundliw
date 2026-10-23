/**
 * Configuration and safety assertions for Demo Mode.
 *
 * Rules:
 * - One env flag, DEMO_MODE=true, gates all placeholder adapters.
 * - If NODE_ENV=production and DEMO_MODE is not true, any placeholder adapter
 *   MUST throw at startup with a clear message to prevent fakes in production.
 */

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function assertPlaceholderAllowed(adapterName: string): void {
  if (process.env.NODE_ENV === "production" && !isDemoMode()) {
    throw new Error(
      `CRITICAL PRODUCTION GUARD: Placeholder adapter "${adapterName}" cannot be initialized in production when DEMO_MODE is not "true". Please configure production credentials or set DEMO_MODE=true for client demonstration.`
    );
  }
}
