import { MetadataRoute } from "next";
import { tools } from "@/lib/tools-list";
import { locales } from "@/i18n/locales";
import { languageAlternates, localeUrl } from "@/lib/site";

// Stable per-content release dates so the sitemap reports a real, fixed
// lastModified for each URL instead of stamping every entry with the
// build-time timestamp (which makes every lastmod churn on each deploy and
// is treated as noise by crawlers).
//
// `homepageReleaseDate` tracks the last meaningful homepage/site-wide change.
// `toolReleaseDate` is the catalogue release date shared by the tool routes;
// it only needs to move when the tool catalogue itself materially changes.
const homepageReleaseDate = new Date("2026-06-07T00:00:00.000Z");
const toolReleaseDate = new Date("2026-06-07T00:00:00.000Z");

// Each logical route is emitted once per locale, and every entry carries the
// full hreflang alternates map so crawlers can pair the language variants.
function entriesForPath(
  pathname: string,
  lastModified: Date,
  changeFrequency: "weekly" | "monthly",
  priority: number,
): MetadataRoute.Sitemap {
  const languages = languageAlternates(pathname);
  return locales.map((locale) => ({
    url: localeUrl(locale, pathname),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...entriesForPath("", homepageReleaseDate, "weekly", 1),
    ...tools.flatMap((tool) =>
      entriesForPath(tool.path, toolReleaseDate, "monthly", 0.8),
    ),
  ];
}
