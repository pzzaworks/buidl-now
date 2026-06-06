import { tools } from "@/lib/tools-list";
import { toolCategories, type ToolCategory } from "@/types/tools";

const baseUrl = "https://buidlnow.com";

// llms.txt route handler. Serves a structured, markdown-flavored map of the
// site so AI answer engines can discover the full tool catalog and surface
// specific tools by name and URL. Follows the llms.txt convention: an H1
// title, a blockquote summary, then categorized sections of links.
export const dynamic = "force-static";

function buildLlmsTxt(): string {
  const lines: string[] = [];

  lines.push("# Buidl Now!");
  lines.push("");
  lines.push(
    "> 110+ free online developer and Web3 tools to convert, encode, decode, hash, format, generate, and validate data. Most tools run in your browser with no signup and no installs.",
  );
  lines.push("");
  lines.push(
    "Buidl Now! is a single-page hub of browser-based developer utilities. Each tool has its own page at /tools/<id>. The homepage includes a searchable tool finder grouped by category. There is no account system, and most tools process input entirely in the browser. A few Web3 tools that read live on-chain data make read-only network requests to fetch it.",
  );
  lines.push("");

  // Key pages section.
  lines.push("## Key Pages");
  lines.push("");
  lines.push(`- [Homepage](${baseUrl}/): Tool finder, categories, and FAQ`);
  lines.push(`- [Sitemap](${baseUrl}/sitemap.xml): Full list of indexable URLs`);
  lines.push("");

  // Tools grouped by category, in the order defined by toolCategories.
  const orderedCategories = toolCategories.map((category) => category.id);
  const categorySet = new Set<ToolCategory>(orderedCategories);

  for (const categoryId of orderedCategories) {
    const category = toolCategories.find((entry) => entry.id === categoryId);
    if (!category) {
      continue;
    }

    const categoryTools = tools.filter((tool) => tool.category === categoryId);
    if (categoryTools.length === 0) {
      continue;
    }

    lines.push(`## ${category.name}`);
    lines.push("");
    lines.push(`${category.description}.`);
    lines.push("");

    for (const tool of categoryTools) {
      lines.push(`- [${tool.name}](${baseUrl}${tool.path}): ${tool.description}`);
    }

    lines.push("");
  }

  // Any tools whose category is not present in toolCategories (defensive).
  const uncategorized = tools.filter((tool) => !categorySet.has(tool.category));
  if (uncategorized.length > 0) {
    lines.push("## Other Tools");
    lines.push("");
    for (const tool of uncategorized) {
      lines.push(`- [${tool.name}](${baseUrl}${tool.path}): ${tool.description}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
