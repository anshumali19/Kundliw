import { AnalyticsGate } from "./AnalyticsGate";
import { getSection } from "@/lib/siteConfig/service";
import { getCredential } from "@/lib/config/credentials";

export async function GoogleAnalytics() {
  const analytics = await getSection("analytics");
  if (analytics.trackingEnabled === false) return null;

  const dbGaId = await getCredential("GOOGLE_ANALYTICS_ID").catch(() => null);
  const gaId =
    dbGaId ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID;

  // Only a genuine measurement ID is ever written into the page.
  if (!gaId || !/^(G|GT|AW|UA)-[A-Z0-9-]{4,20}$/i.test(gaId.trim())) {
    return null;
  }

  return <AnalyticsGate gaId={gaId.trim()} />;
}
