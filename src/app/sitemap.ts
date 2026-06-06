import { MetadataRoute } from "next";
import { tools } from "@/lib/tools-list";

const baseUrl = "https://buidlnow.com";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const homepage = {
    url: baseUrl,
    lastModified: homepageReleaseDate,
    changeFrequency: "weekly" as const,
    priority: 1,
  };

  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}${tool.path}`,
    lastModified: toolReleaseDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [homepage, ...toolPages];
}
