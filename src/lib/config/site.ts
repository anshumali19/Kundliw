export interface SiteLocationConfig {
  cityEn: string;
  cityHi: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const FALLBACK_SITE_CONFIG: SiteLocationConfig = {
  cityEn: "Bhilai",
  cityHi: "भिलाई",
  latitude: 21.2092,
  longitude: 81.3784,
  timezone: "Asia/Kolkata",
};
