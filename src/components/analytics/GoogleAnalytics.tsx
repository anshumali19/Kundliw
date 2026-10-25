import Script from "next/script";
import { getCredential } from "@/lib/config/credentials";

export async function GoogleAnalytics() {
  const dbGaId = await getCredential("GOOGLE_ANALYTICS_ID").catch(() => null);
  const gaId =
    dbGaId ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID;

  if (!gaId || gaId.trim() === "") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId.trim()}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId.trim()}');
        `}
      </Script>
    </>
  );
}
