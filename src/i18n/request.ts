import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMergedMessages } from "@/lib/i18n/translationService";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "hi" | "en")) {
    locale = routing.defaultLocale;
  }

  // Load base messages merged with dynamic database translation overrides
  const messages = await getMergedMessages(locale);

  return {
    locale,
    messages,
  };
});
