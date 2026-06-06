import { MetadataRoute } from "next";

// AI answer-engine and training crawlers we explicitly welcome. They are
// already covered by the default "*" rule, but listing them makes the intent
// unambiguous so these engines can confidently index and cite the tools.
const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/_next/", "/private/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow,
      })),
    ],
    sitemap: "https://buidlnow.com/sitemap.xml",
  };
}
