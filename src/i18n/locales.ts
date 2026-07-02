// Central locale registry. Every i18n surface (middleware, routing, the
// language switcher, hreflang alternates, the sitemap, and the message
// catalogs) reads from this single source, so adding or removing a language
// is a one-line change here plus its message catalog.

export const locales = [
  "en",
  "es",
  "pt-BR",
  "fr",
  "de",
  "it",
  "ja",
  "ko",
  "zh-Hans",
  "zh-Hant",
  "vi",
  "sk",
  "tr",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Locales that render right-to-left. Kept as a set so layout direction and the
// <html dir> attribute are derived, never hardcoded per component.
export const rtlLocales: readonly Locale[] = [];

export interface LocaleMeta {
  /** BCP-47 code, also used as the URL prefix and hreflang value. */
  code: Locale;
  /** Native, self-referential language name shown in the switcher. */
  label: string;
  /** English name, used for accessible labels and tooling. */
  english: string;
  /** ISO 3166-1 alpha-2 country code, used to render an SVG flag in the
   * switcher (region-representative, not language-official). */
  country: string;
  /** Text direction. */
  dir: "ltr" | "rtl";
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { code: "en", label: "English", english: "English", country: "GB", dir: "ltr" },
  es: { code: "es", label: "Español", english: "Spanish", country: "ES", dir: "ltr" },
  "pt-BR": {
    code: "pt-BR",
    label: "Português",
    english: "Portuguese (Brazil)",
    country: "BR",
    dir: "ltr",
  },
  fr: { code: "fr", label: "Français", english: "French", country: "FR", dir: "ltr" },
  de: { code: "de", label: "Deutsch", english: "German", country: "DE", dir: "ltr" },
  it: { code: "it", label: "Italiano", english: "Italian", country: "IT", dir: "ltr" },
  ja: { code: "ja", label: "日本語", english: "Japanese", country: "JP", dir: "ltr" },
  ko: { code: "ko", label: "한국어", english: "Korean", country: "KR", dir: "ltr" },
  "zh-Hans": {
    code: "zh-Hans",
    label: "简体中文",
    english: "Chinese (Simplified)",
    country: "CN",
    dir: "ltr",
  },
  "zh-Hant": {
    code: "zh-Hant",
    label: "繁體中文",
    english: "Chinese (Traditional)",
    country: "HK",
    dir: "ltr",
  },
  vi: { code: "vi", label: "Tiếng Việt", english: "Vietnamese", country: "VN", dir: "ltr" },
  sk: { code: "sk", label: "Slovenčina", english: "Slovak", country: "SK", dir: "ltr" },
  tr: { code: "tr", label: "Türkçe", english: "Turkish", country: "TR", dir: "ltr" },
};

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export function localeDirection(locale: string): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export const localeList: LocaleMeta[] = locales.map((code) => localeMeta[code]);
