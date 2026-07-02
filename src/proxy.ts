import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 proxy (formerly middleware). Negotiates the locale
// (cookie -> Accept-Language -> default) and rewrites/redirects so each request
// is served under the right [locale] segment.
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals, and files with an
  // extension (static assets). This keeps sitemap.xml, robots.txt, manifest,
  // and /api handlers on their non-localized paths.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
