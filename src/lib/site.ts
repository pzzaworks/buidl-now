import { defaultLocale, locales } from "@/i18n/locales";

export const baseUrl = "https://buidlnow.com";

// Absolute URL for a path in a given locale. Default-locale URLs stay
// unprefixed (localePrefix: "as-needed"), every other locale is prefixed.
export function localeUrl(locale: string, pathname = ""): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${baseUrl}${prefix}${pathname}`;
}

// hreflang alternates map for a route, covering every locale plus x-default.
// `pathname` is the locale-agnostic path ("" for home, "/tools/abi-encoder").
export function languageAlternates(pathname = ""): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of locales) {
    map[locale] = localeUrl(locale, pathname);
  }
  map["x-default"] = localeUrl(defaultLocale, pathname);
  return map;
}
