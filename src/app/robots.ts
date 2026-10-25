import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/en/admin",
          "/account",
          "/en/account",
          "/vault",
          "/en/vault",
          "/booking",
          "/en/booking",
          "/auth",
          "/en/auth",
          "/demo-gate",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
