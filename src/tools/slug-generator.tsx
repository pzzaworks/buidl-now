"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

// Character transliteration map for common diacritics
const TRANSLITERATION_MAP: Record<string, string> = {
  // Latin with diacritics
  "à": "a", "á": "a", "â": "a", "ã": "a", "ä": "a", "å": "a", "æ": "ae",
  "ç": "c", "è": "e", "é": "e", "ê": "e", "ë": "e",
  "ì": "i", "í": "i", "î": "i", "ï": "i",
  "ð": "d", "ñ": "n",
  "ò": "o", "ó": "o", "ô": "o", "õ": "o", "ö": "o", "ø": "o",
  "ù": "u", "ú": "u", "û": "u", "ü": "u",
  "ý": "y", "ÿ": "y", "þ": "th",
  // German
  "ß": "ss",
  // Polish
  "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ś": "s", "ź": "z", "ż": "z",
  // Turkish
  "ğ": "g", "ı": "i", "ş": "s",
  // Czech/Slovak
  "č": "c", "ď": "d", "ě": "e", "ň": "n", "ř": "r", "š": "s", "ť": "t", "ů": "u", "ž": "z",
  // Others
  "œ": "oe", "ā": "a", "ē": "e", "ī": "i", "ō": "o", "ū": "u",
};

export function SlugGeneratorTool() {
  const t = useTranslations("toolUI.slug-generator");
  const [input, setInput] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [separator, setSeparator] = useState<"dash" | "underscore">("dash");
  const [transliterate, setTransliterate] = useState(true);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!input) {
      setSlug("");
      return;
    }

    let result = input;

    // Apply transliteration if enabled
    if (transliterate) {
      result = result
        .split("")
        .map((char) => {
          const lower = char.toLowerCase();
          if (TRANSLITERATION_MAP[lower]) {
            // Preserve case for the first character of replacement
            return char === lower
              ? TRANSLITERATION_MAP[lower]
              : TRANSLITERATION_MAP[lower].charAt(0).toUpperCase() +
                  TRANSLITERATION_MAP[lower].slice(1);
          }
          return char;
        })
        .join("");
    }

    // Convert to lowercase if enabled
    if (lowercase) {
      result = result.toLowerCase();
    }

    // Replace spaces and special characters with separator
    const sep = separator === "dash" ? "-" : "_";
    result = result
      .replace(/[^\w\s-]/g, "") // Remove non-word characters except spaces and hyphens
      .replace(/[\s_-]+/g, sep) // Replace spaces, underscores, hyphens with separator
      .replace(new RegExp(`^${sep === "-" ? "\\-" : "_"}+|${sep === "-" ? "\\-" : "_"}+$`, "g"), ""); // Trim separators from ends

    setSlug(result);
  }, [input, lowercase, separator, transliterate]);

  const handleReset = () => {
    setInput("");
    setSlug("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Textarea
        label={t("inputLabel")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("inputPlaceholder")}
        className="min-h-[100px]"
      />

      {/* Options */}
      <div className="space-y-4">
        <Label className="text-sm block">{t("options")}</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Checkbox
              id="lowercase"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              label={t("lowercase")}
            />
            <Checkbox
              id="transliterate"
              checked={transliterate}
              onChange={(e) => setTransliterate(e.target.checked)}
              label={t("transliterate")}
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm">{t("separator")}</Label>
            <div className="flex gap-2">
              <Button
                variant={separator === "dash" ? "primary" : "secondary"}
                onClick={() => setSeparator("dash")}
                className="flex-1"
                size="sm"
              >
                {t("dash")}
              </Button>
              <Button
                variant={separator === "underscore" ? "primary" : "secondary"}
                onClick={() => setSeparator("underscore")}
                className="flex-1"
                size="sm"
              >
                {t("underscore")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} className="w-full sm:w-auto">
        {t("reset")}
      </Button>

      {/* Output */}
      {slug && (
        <Input
          label={t("generatedSlug")}
          value={slug}
          readOnly
          showCopy
          className="font-mono"
        />
      )}
    </div>
  );
}

export const slugGeneratorConfig: ToolConfig = {
  id: "slug-generator",
  name: "Slug Generator",
  description: "Generate URL-friendly slugs from text with transliteration support",
  category: "text",
  component: SlugGeneratorTool,
  seo: {
    keywords: [
      "slug generator",
      "url slug",
      "url-friendly text",
      "permalink generator",
      "seo slug",
      "text to slug",
      "slug converter",
      "url sanitizer",
      "string to slug",
      "slug maker",
      "blog slug generator",
      "clean url generator",
    ],
  },
  sections: [
    {
      title: "What is a URL Slug?",
      content:
        "A URL slug is the part of a web address that identifies a specific page in a user-friendly format. Slugs are typically lowercase, contain only letters, numbers, and hyphens, and are used to create clean, readable URLs that are also SEO-friendly.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Slug Generation Process</h4>
          <p className="text-sm mb-4">
            The generator processes your text through several steps: transliterating special characters (like accented letters), converting to lowercase, removing non-alphanumeric characters, and replacing spaces with your chosen separator.
          </p>

          <h4 className="text-base font-semibold mb-2">Options</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Lowercase: Convert all characters to lowercase for consistency</li>
            <li>Separator: Choose between hyphens (-) or underscores (_)</li>
            <li>Transliteration: Convert accented characters to ASCII equivalents</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Best Practices</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Keep slugs short and descriptive</li>
            <li>Use hyphens for better SEO (Google recommends hyphens over underscores)</li>
            <li>Avoid stop words like &quot;the&quot;, &quot;and&quot;, &quot;or&quot; when possible</li>
            <li>Include relevant keywords for SEO</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Blog post title",
      content: '"How to Build a REST API" → how-to-build-a-rest-api',
      type: "code",
    },
    {
      title: "With special characters",
      content: '"Café & Restaurant Guide" → cafe-restaurant-guide',
      type: "code",
    },
    {
      title: "International text",
      content: '"München Oktoberfest 2024" → muenchen-oktoberfest-2024',
      type: "code",
    },
  ],
  codeSnippet: `const TRANSLITERATION_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
  'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ñ': 'n', 'ö': 'o', 'ü': 'u', 'ß': 'ss',
  // ... more mappings
};

function generateSlug(
  text: string,
  options: {
    lowercase?: boolean;
    separator?: '-' | '_';
    transliterate?: boolean;
  } = {}
): string {
  const { lowercase = true, separator = '-', transliterate = true } = options;

  let result = text;

  // Apply transliteration
  if (transliterate) {
    result = result
      .split('')
      .map(char => {
        const lower = char.toLowerCase();
        return TRANSLITERATION_MAP[lower] || char;
      })
      .join('');
  }

  // Convert to lowercase
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Replace special characters and spaces
  result = result
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_-]+/g, separator)
    .replace(new RegExp(\`^\${separator}+|\${separator}+$\`, 'g'), '');

  return result;
}

// Example usage
console.log(generateSlug('Hello World!')); // 'hello-world'
console.log(generateSlug('Café au Lait')); // 'cafe-au-lait'
console.log(generateSlug('My Blog Post', { separator: '_' })); // 'my_blog_post'`,
  references: [
    {
      title: "Google URL Structure Guidelines",
      url: "https://developers.google.com/search/docs/crawling-indexing/url-structure",
    },
    {
      title: "Slug (web publishing) - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Clean_URL#Slug",
    },
  ],
};
