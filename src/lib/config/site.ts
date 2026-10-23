export interface SiteLocationConfig {
  cityEn: string;
  cityHi: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const FALLBACK_SITE_CONFIG: SiteLocationConfig = {
  cityEn: "Varanasi",
  cityHi: "वाराणसी",
  latitude: 25.3176,
  longitude: 82.9739,
  timezone: "Asia/Kolkata",
};
