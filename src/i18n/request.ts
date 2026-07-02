import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Per-request i18n config consumed by next-intl on the server. The active
// locale comes from the [locale] route segment; anything invalid falls back to
// the default. Messages are the merged chrome + tool catalog for that locale.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`./messages/${locale}.json`)).default;

  return { locale, messages };
});
