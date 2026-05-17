import type { Tool } from "@/types/tools";

export const externalLinkRel = "nofollow noopener noreferrer";

const minimumMetaDescriptionLength = 120;
const maximumMetaDescriptionLength = 155;

const categoryLabels: Record<Tool["category"], string> = {
  converters: "converter",
  text: "text",
  "encoders-decoders": "encoder and decoder",
  formatters: "formatter",
  generators: "generator",
  web3: "Web3",
  utilities: "developer",
};

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

  if (baseDescription.length >= minimumMetaDescriptionLength) {
    return truncateAtWord(baseDescription, maximumMetaDescriptionLength);
  }

  const categoryLabel = categoryLabels[tool.category];
  const conciseDescription = normalizeDescription(
    `${tool.name}: ${lowerFirst(baseDescription)}. Free local ${categoryLabel} utility for developers.`,
  );

  if (conciseDescription.length >= minimumMetaDescriptionLength) {
    return truncateAtWord(conciseDescription, maximumMetaDescriptionLength);
  }

  return truncateAtWord(
    `${conciseDescription} Runs in your browser without signup or server-side storage.`,
    maximumMetaDescriptionLength,
  );
}
