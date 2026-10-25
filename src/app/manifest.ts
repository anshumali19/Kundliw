import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

/** Web app manifest: lets visitors install the site and lets PWABuilder package the Android app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Kanad Jyotish",
    description: "Vedic astrology services, Kundli, Panchang and consultations in Hindi and English.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#800000",
    lang: "hi",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
