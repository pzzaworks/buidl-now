import { type Tool, toolCategories } from "@/types/tools";

export const externalLinkRel = "nofollow noopener noreferrer";

export function getToolCategoryLabel(category: Tool["category"]): string {
  const match = toolCategories.find((entry) => entry.id === category);
  return match?.name ?? category;
}

export function getToolCategoryKindLabel(category: Tool["category"]): string {
  return categoryLabels[category];
}

const minimumMetaDescriptionLength = 120;
const maximumMetaDescriptionLength = 160;

// Reserved length for the brand suffix appended by the title template
// (" | Buidl Now!"). The page-specific title part should stay short enough
// that the full rendered <title> stays within ~60 characters.
const titleBrandSuffixLength = " | Buidl Now!".length;
const maximumTitlePartLength = 60 - titleBrandSuffixLength;

const categoryLabels: Record<Tool["category"], string> = {
  converters: "converter",
  text: "text",
  "encoders-decoders": "encoder and decoder",
  formatters: "formatter",
  generators: "generator",
  web3: "Web3",
  utilities: "developer",
};

// Search-intent qualifier appended to the tool name in the page title.
// Primary qualifier leads with the angle a user would search for; the
// fallback is used when the primary noun already appears in the tool name
// (avoids "Generator ... Generator" style duplication) or when the primary
// qualifier would push the title past the length budget.
const titleQualifiers: Record<
  Tool["category"],
  { primary: string; primaryNoun: string; fallback: string }
> = {
  converters: {
    primary: "Online Converter Tool",
    primaryNoun: "converter",
    fallback: "Free Online Tool",
  },
  text: {
    primary: "Online Text Tool",
    primaryNoun: "text",
    fallback: "Free Online Tool",
  },
  "encoders-decoders": {
    primary: "Online Encoder & Decoder",
    primaryNoun: "encod",
    fallback: "Free Online Tool",
  },
  formatters: {
    primary: "Online Formatter Tool",
    primaryNoun: "format",
    fallback: "Free Online Tool",
  },
  generators: {
    primary: "Free Online Generator",
    primaryNoun: "generat",
    fallback: "Free Online Tool",
  },
  web3: {
    primary: "Online Web3 Tool",
    primaryNoun: "web3",
    fallback: "Online Ethereum Tool",
  },
  utilities: {
    primary: "Free Online Tool",
    primaryNoun: "qwertyx", // no natural overlap; keep primary
    fallback: "Online Developer Tool",
  },
};

// Action verb that describes what the tool does, used to make descriptions
// read as a clear call to action when the source description is short.
const categoryActionPhrases: Record<Tool["category"], string> = {
  converters: "Convert and transform data",
  text: "Transform and analyze text",
  "encoders-decoders": "Encode and decode data",
  formatters: "Format, beautify, and validate",
  generators: "Generate",
  web3: "Build, debug, and inspect onchain data",
  utilities: "Calculate, look up, and inspect",
};

/**
 * Builds an intent-optimized page title that leads with the tool name plus a
 * short qualifier matching how users search for it. The brand suffix is added
 * separately by the Next.js title template, so this returns only the page part.
 */
export function buildToolSeoTitle(tool: Tool): string {
  const name = tool.name.trim();
  const qualifier = titleQualifiers[tool.category];
  const nameLower = name.toLowerCase();

  const primaryFits =
    `${name} - ${qualifier.primary}`.length <= maximumTitlePartLength;
  const primaryDuplicates = nameLower.includes(qualifier.primaryNoun);

  let chosen: string | null = null;
  if (!primaryDuplicates && primaryFits) {
    chosen = qualifier.primary;
  } else if (
    `${name} - ${qualifier.fallback}`.length <= maximumTitlePartLength
  ) {
    chosen = qualifier.fallback;
  } else if (`${name} - Free Online Tool`.length <= maximumTitlePartLength) {
    chosen = "Free Online Tool";
  }

  return chosen ? `${name} - ${chosen}` : name;
}

function normalizeDescription(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/\.+$/, "");
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function truncateAtWord(value: string, maxLength: number): string {
  const text = normalizeDescription(value);

  if (text.length <= maxLength) {
    return `${text}.`;
  }

  const truncated = text.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const clean =
    lastSpace > Math.floor(maxLength * 0.65)
      ? truncated.slice(0, lastSpace)
      : truncated;

  return `${clean.replace(/[.,;:!?-]+$/g, "")}.`;
}

export function buildToolSeoDescription(
  tool: Tool,
  preferredDescription?: string,
): string {
  const baseDescription = normalizeDescription(
    preferredDescription || tool.description,
  );

  // A long, hand-written override is already meta-ready; just length-guard it.
  if (baseDescription.length >= minimumMetaDescriptionLength) {
    return truncateAtWord(baseDescription, maximumMetaDescriptionLength);
  }

  // Lead with the action so the description reads as a clear, clickable
  // call to action and naturally contains the primary keyword. If the source
  // already opens with the same verb, drop the prefix to avoid stutter
  // (e.g. "Generate: generate ..." -> "Generate ...").
  const action = categoryActionPhrases[tool.category];
  const firstActionWord = action.split(/[\s,]/)[0].toLowerCase();
  const intent = baseDescription.toLowerCase().startsWith(firstActionWord)
    ? normalizeDescription(baseDescription)
    : normalizeDescription(`${action}: ${lowerFirst(baseDescription)}`);

  // Click-through angle: free, in-browser, no signup. Choose the closing that
  // best fills the ideal window without exceeding the max length, so the
  // description is never cut mid-thought.
  // Graduated closings from longest to shortest so a complete closing can
  // always be appended whole without cutting it mid-phrase.
  const closings = [
    "Free online tool that runs in your browser with no signup and no data leaving your device.",
    "Free online tool that runs entirely in your browser, no signup and no upload required.",
    "100% free, runs in your browser, no signup or installs and your data never leaves the page.",
    "Free, fast, and private, running fully in your browser with no signup required.",
    "Free online developer tool, runs in your browser with no signup.",
    "Free, fast, and runs entirely in your browser, no signup required.",
    "Free and runs in your browser, no signup required.",
    "Free, in-browser, no signup.",
    "Free online developer tool.",
  ];

  const candidates = closings
    .map((closing) => `${intent}. ${closing}`)
    .sort((a, b) => b.length - a.length);

  // Prefer the longest complete candidate that fits the max length and reaches
  // the minimum, so it lands naturally in the 140-160 window with no mid-phrase
  // truncation.
  const inWindow = candidates.find(
    (candidate) =>
      candidate.length <= maximumMetaDescriptionLength &&
      candidate.length >= minimumMetaDescriptionLength,
  );
  if (inWindow) {
    return `${normalizeDescription(inWindow)}.`;
  }

  // No closing lands in the window. Take the longest complete candidate that
  // still fits the max length (may be under the soft minimum, but reads
  // cleanly and is never cut mid-phrase).
  const longestFitting = candidates.find(
    (candidate) => candidate.length <= maximumMetaDescriptionLength,
  );
  if (longestFitting) {
    return `${normalizeDescription(longestFitting)}.`;
  }

  // The intent alone already exceeds the max; word-safe truncate it.
  return truncateAtWord(intent, maximumMetaDescriptionLength);
}

const stopWords = new Set([
  "and",
  "or",
  "the",
  "a",
  "an",
  "to",
  "from",
  "with",
  "for",
  "of",
  "in",
  "on",
  "between",
  "into",
  "your",
  "various",
  "different",
  "etc",
]);

// Per-category keyword angles that match real search phrasing.
const categoryKeywordAngles: Record<Tool["category"], string[]> = {
  converters: ["online converter", "free converter"],
  text: ["online text tool", "text utility"],
  "encoders-decoders": ["online encoder decoder", "encode decode online"],
  formatters: ["online formatter", "beautifier"],
  generators: ["online generator", "free generator"],
  web3: ["ethereum tool", "web3 developer tool", "blockchain tool"],
  utilities: ["developer tool", "online utility"],
};

/**
 * Builds a page-specific keyword set for a tool. Author-provided keywords from
 * the tool config lead (they are hand-tuned for intent), followed by derived
 * terms from the tool's own name and category. The list is de-duplicated
 * case-insensitively and capped so it stays focused and avoids stuffing.
 */
export function buildToolSeoKeywords(
  tool: Tool,
  customKeywords: string[] = [],
): string[] {
  const name = tool.name.trim();
  // Normalize separators (slashes, arrows, dashes, parentheses) to spaces so
  // the full-name keyword reads like a real search phrase, not "a / b" or
  // "a <-> b". Collapse the resulting whitespace.
  const nameLower = name
    .toLowerCase()
    .replace(/[/⇔↔<>()|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Tokenize the tool name into meaningful single words for natural variants.
  const nameTokens = nameLower
    .split(/[\s\-–—]+/)
    .map((token) => token.replace(/[^a-z0-9.+#]/g, ""))
    .filter((token) => token.length > 1 && !stopWords.has(token));

  const derived: string[] = [
    nameLower,
    `${nameLower} online`,
    `${nameLower} free`,
    ...nameTokens,
    ...categoryKeywordAngles[tool.category],
    getToolCategoryLabel(tool.category).toLowerCase(),
  ];

  const ordered = [...customKeywords, ...derived];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of ordered) {
    const keyword = raw.trim();
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(keyword);
    if (result.length >= 12) break;
  }

  return result;
}
