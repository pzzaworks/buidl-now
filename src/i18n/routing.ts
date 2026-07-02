import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./locales";

// `as-needed` keeps the default-locale (English) URLs unprefixed - buidlnow.com/
// and /tools/<id> stay exactly as they are today - while every other language
// is served under its own prefix (/es, /fr, /zh-Hant, ...). This preserves the
// existing indexed English URLs and avoids a sitewide redirect on launch.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeCookie: {
    // Remember an explicit language choice for a year so returning visitors
    // land on their picked language instead of re-negotiating every visit.
    maxAge: 60 * 60 * 24 * 365,
  },
});
