"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

interface CommonPattern {
  nameKey: string;
  pattern: string;
  descKey: string;
}

const commonPatterns: CommonPattern[] = [
  { nameKey: "patternEmailName", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", descKey: "patternEmailDesc" },
  { nameKey: "patternPhoneName", pattern: "\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}", descKey: "patternPhoneDesc" },
  { nameKey: "patternUrlName", pattern: "https?:\\/\\/[\\w\\-\\.]+\\.[a-zA-Z]{2,}(\\/[\\w\\-\\.\\/\\?\\=\\&\\%]*)?", descKey: "patternUrlDesc" },
  { nameKey: "patternIpv4Name", pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b", descKey: "patternIpv4Desc" },
  { nameKey: "patternIpv6Name", pattern: "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}", descKey: "patternIpv6Desc" },
  { nameKey: "patternDateIsoName", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", descKey: "patternDateIsoDesc" },
  { nameKey: "patternDateUsName", pattern: "(?:0[1-9]|1[0-2])\\/(?:0[1-9]|[12]\\d|3[01])\\/\\d{4}", descKey: "patternDateUsDesc" },
  { nameKey: "patternTimeName", pattern: "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?", descKey: "patternTimeDesc" },
  { nameKey: "patternCreditCardName", pattern: "\\b(?:\\d{4}[- ]?){3}\\d{4}\\b", descKey: "patternCreditCardDesc" },
  { nameKey: "patternHexColorName", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", descKey: "patternHexColorDesc" },
  { nameKey: "patternUsernameName", pattern: "[a-zA-Z][a-zA-Z0-9_]{2,15}", descKey: "patternUsernameDesc" },
  { nameKey: "patternPasswordName", pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}", descKey: "patternPasswordDesc" },
  { nameKey: "patternSlugName", pattern: "[a-z0-9]+(?:-[a-z0-9]+)*", descKey: "patternSlugDesc" },
  { nameKey: "patternHtmlTagName", pattern: "<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)", descKey: "patternHtmlTagDesc" },
  { nameKey: "patternZipName", pattern: "\\b\\d{5}(?:-\\d{4})?\\b", descKey: "patternZipDesc" },
];

export function RegexGeneratorTool() {
  const t = useTranslations("toolUI.regex-generator");

  // Builds a localized, human-readable explanation of a regex pattern. Kept as
  // an inner function so it can compose the explanation from translated t()
  // fragments while the regex tokens and matched literals stay untouched.
  const explainRegex = (pattern: string): string[] => {
    const explanations: string[] = [];

    const tokens: { pattern: RegExp; explain: (match: string) => string }[] = [
      { pattern: /^\^/, explain: () => t("explainStart") },
      { pattern: /\$$/, explain: () => t("explainEnd") },
      { pattern: /\\d/, explain: () => t("explainDigit") },
      { pattern: /\\D/, explain: () => t("explainNonDigit") },
      { pattern: /\\w/, explain: () => t("explainWord") },
      { pattern: /\\W/, explain: () => t("explainNonWord") },
      { pattern: /\\s/, explain: () => t("explainWhitespace") },
      { pattern: /\\S/, explain: () => t("explainNonWhitespace") },
      { pattern: /\\b/, explain: () => t("explainWordBoundary") },
      { pattern: /\\B/, explain: () => t("explainNonWordBoundary") },
      { pattern: /\./, explain: () => t("explainAnyChar") },
      { pattern: /\+/, explain: () => t("explainOneOrMore") },
      { pattern: /\*/, explain: () => t("explainZeroOrMore") },
      { pattern: /\?/, explain: () => t("explainOptional") },
      { pattern: /\{(\d+)\}/, explain: (m) => t("explainExactly", { count: Number(m.match(/\d+/)?.[0] ?? 0) }) },
      { pattern: /\{(\d+),\}/, explain: (m) => t("explainNOrMore", { count: Number(m.match(/\d+/)?.[0] ?? 0) }) },
      { pattern: /\{(\d+),(\d+)\}/, explain: (m) => { const nums = m.match(/\d+/g); return t("explainBetween", { min: Number(nums?.[0] ?? 0), max: Number(nums?.[1] ?? 0) }); } },
      { pattern: /\[([^\]]+)\]/, explain: (m) => t("explainCharClass", { chars: m.slice(1, -1) }) },
      { pattern: /\[^([^\]]+)\]/, explain: (m) => t("explainNegatedCharClass", { chars: m.slice(2, -1) }) },
      { pattern: /\(([^)]+)\)/, explain: () => t("explainCapturingGroup") },
      { pattern: /\(\?:([^)]+)\)/, explain: () => t("explainNonCapturingGroup") },
      { pattern: /\(\?=([^)]+)\)/, explain: () => t("explainPositiveLookahead") },
      { pattern: /\(\?!([^)]+)\)/, explain: () => t("explainNegativeLookahead") },
      { pattern: /\|/, explain: () => t("explainAlternation") },
    ];

    for (const token of tokens) {
      if (token.pattern.test(pattern)) {
        const match = pattern.match(token.pattern);
        if (match) {
          explanations.push(token.explain(match[0]));
        }
      }
    }

    if (explanations.length === 0) {
      explanations.push(t("explainLiteral"));
    }

    return explanations;
  };

  const [description, setDescription] = useState("");
  const [generatedPattern, setGeneratedPattern] = useState("");
  const [explanation, setExplanation] = useState<string[]>([]);
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleSelectPattern = (pattern: CommonPattern) => {
    setGeneratedPattern(pattern.pattern);
    setExplanation(explainRegex(pattern.pattern));
    setError("");
  };

  const handleGenerateFromDescription = () => {
    if (!description.trim()) {
      setError(t("errorEmptyDescription"));
      return;
    }

    const desc = description.toLowerCase();
    let pattern = "";

    if (desc.includes("email")) {
      pattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
    } else if (desc.includes("phone") || desc.includes("telephone")) {
      pattern = "\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}";
    } else if (desc.includes("url") || desc.includes("link") || desc.includes("website")) {
      pattern = "https?:\\/\\/[\\w\\-\\.]+\\.[a-zA-Z]{2,}(\\/[\\w\\-\\.\\/\\?\\=\\&\\%]*)?";
    } else if (desc.includes("ip") && desc.includes("v6")) {
      pattern = "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}";
    } else if (desc.includes("ip") || desc.includes("ipv4")) {
      pattern = "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b";
    } else if (desc.includes("date") && (desc.includes("iso") || desc.includes("yyyy"))) {
      pattern = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])";
    } else if (desc.includes("date")) {
      pattern = "(?:0[1-9]|1[0-2])\\/(?:0[1-9]|[12]\\d|3[01])\\/\\d{4}";
    } else if (desc.includes("time")) {
      pattern = "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?";
    } else if (desc.includes("hex") || desc.includes("color")) {
      pattern = "#(?:[0-9a-fA-F]{3}){1,2}\\b";
    } else if (desc.includes("credit") || desc.includes("card")) {
      pattern = "\\b(?:\\d{4}[- ]?){3}\\d{4}\\b";
    } else if (desc.includes("zip") || desc.includes("postal")) {
      pattern = "\\b\\d{5}(?:-\\d{4})?\\b";
    } else if (desc.includes("username")) {
      pattern = "[a-zA-Z][a-zA-Z0-9_]{2,15}";
    } else if (desc.includes("password")) {
      pattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}";
    } else if (desc.includes("number") || desc.includes("digit")) {
      pattern = "\\d+";
    } else if (desc.includes("word")) {
      pattern = "\\w+";
    } else if (desc.includes("slug")) {
      pattern = "[a-z0-9]+(?:-[a-z0-9]+)*";
    } else if (desc.includes("html") || desc.includes("tag")) {
      pattern = "<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)";
    } else {
      setError(t("errorNoPattern"));
      return;
    }

    setGeneratedPattern(pattern);
    setExplanation(explainRegex(pattern));
    setError("");
  };

  const handleTestPattern = () => {
    if (!generatedPattern || !testString) {
      setMatches([]);
      return;
    }

    try {
      const regex = new RegExp(generatedPattern, "g");
      const found = testString.match(regex) || [];
      setMatches(found);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorInvalidPattern"));
      setMatches([]);
    }
  };

  const handleReset = () => {
    setDescription("");
    setGeneratedPattern("");
    setExplanation([]);
    setTestString("");
    setMatches([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Description Input */}
      <div>
        <Label className="mb-2 block text-sm">{t("describeLabel")}</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("describePlaceholder")}
          className="text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleGenerateFromDescription} variant="primary" className="flex-1">
          {t("generate")}
        </Button>
        <Button onClick={handleReset} className="sm:flex-none">
          {t("reset")}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-[var(--color-red-50)] border border-[var(--color-red-200)] rounded-[12px] text-[var(--color-red-500)] text-sm">
          {error}
        </div>
      )}

      {/* Common Patterns */}
      <div>
        <Label className="mb-2 block text-sm">{t("commonPatternsLabel")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
          {commonPatterns.map((p) => (
            <button
              key={p.nameKey}
              onClick={() => handleSelectPattern(p)}
              className="text-left p-2 text-xs rounded-[8px] border border-[var(--color-gray-200)] hover:border-[var(--color-blue-500)] hover:bg-[var(--color-blue-50)] transition-colors cursor-pointer"
              title={t(p.descKey)}
            >
              {t(p.nameKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Pattern */}
      {generatedPattern && (
        <>
          <Input
            label={t("generatedLabel")}
            value={generatedPattern}
            readOnly
            showCopy
            className="font-mono text-sm bg-[var(--color-gray-0)]"
          />

          {/* Explanation */}
          {explanation.length > 0 && (
            <div>
              <Label className="mb-2 block text-sm">{t("explanationLabel")}</Label>
              <div className="p-3 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[12px] space-y-1">
                {explanation.map((exp, i) => (
                  <div key={i} className="text-sm font-mono text-[var(--color-gray-600)]">
                    {exp}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Section */}
          <div>
            <Label className="mb-2 block text-sm">{t("testStringLabel")}</Label>
            <Textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder={t("testPlaceholder")}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleTestPattern} variant="primary" className="w-full">
            {t("test")}
          </Button>

          {/* Test Results */}
          {matches.length > 0 && (
            <div>
              <Label className="mb-2 block text-sm">{t("matches", { count: matches.length })}</Label>
              <div className="p-3 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[12px] space-y-1 max-h-[200px] overflow-y-auto">
                {matches.map((match, i) => (
                  <div key={i} className="text-sm font-mono text-[var(--color-green-500)]">
                    {i + 1}. &quot;{match}&quot;
                  </div>
                ))}
              </div>
            </div>
          )}

          {testString && matches.length === 0 && !error && (
            <div className="p-3 rounded-[12px] border bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
              <div className="text-sm font-medium">{t("noMatches")}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const regexGeneratorConfig: ToolConfig = {
  id: "regex-generator",
  name: "Regex Generator",
  description: "Generate regular expressions from descriptions and common patterns",
  category: "generators",
  component: RegexGeneratorTool,
  seo: {
    keywords: [
      "regex generator",
      "regular expression generator",
      "regex builder",
      "regex creator",
      "generate regex",
      "regex from text",
      "regex pattern generator",
      "regex maker",
      "create regex",
      "regex helper",
      "regex explainer",
      "common regex patterns",
    ],
  },
  sections: [
    {
      title: "What is a Regex Generator?",
      content:
        "A regex generator helps you create regular expressions without memorizing complex syntax. Simply describe what you want to match or select from common patterns, and the tool generates the appropriate regex for you.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            This tool provides two ways to generate regex patterns: by description or by selecting common patterns. When you describe what you want to match, it analyzes your description and suggests an appropriate pattern. The tool also explains each part of the generated regex to help you understand how it works.
          </p>

          <h4 className="text-base font-semibold mb-2">Common Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Validating email addresses, phone numbers, URLs</li>
            <li>Extracting dates, times, IP addresses from text</li>
            <li>Matching patterns in log files or data</li>
            <li>Form input validation</li>
            <li>Search and replace operations</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Email validation",
      content: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      type: "code",
    },
    {
      title: "US Phone number",
      content: "\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}",
      type: "code",
    },
    {
      title: "IPv4 Address",
      content: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in RegExp

interface RegexPattern {
  pattern: string;
  description: string;
}

// Common regex patterns library
const patterns: Record<string, RegexPattern> = {
  email: {
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}',
    description: 'Matches standard email addresses'
  },
  phone: {
    pattern: '\\\\(?\\\\d{3}\\\\)?[-\\\\s]?\\\\d{3}[-\\\\s]?\\\\d{4}',
    description: 'Matches US phone numbers'
  },
  url: {
    pattern: 'https?:\\\\/\\\\/[\\\\w\\\\-\\\\.]+\\\\.[a-zA-Z]{2,}',
    description: 'Matches HTTP/HTTPS URLs'
  },
  ipv4: {
    pattern: '\\\\b(?:(?:25[0-5]|2[0-4]\\\\d|[01]?\\\\d\\\\d?)\\\\.){3}(?:25[0-5]|2[0-4]\\\\d|[01]?\\\\d\\\\d?)\\\\b',
    description: 'Matches IPv4 addresses'
  },
  date: {
    pattern: '\\\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\\\d|3[01])',
    description: 'Matches ISO date format (YYYY-MM-DD)'
  }
};

function getPattern(type: string): RegexPattern | null {
  return patterns[type] || null;
}

function testPattern(pattern: string, text: string): string[] {
  try {
    const regex = new RegExp(pattern, 'g');
    return text.match(regex) || [];
  } catch {
    return [];
  }
}

function validatePattern(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

// Example usage
const emailPattern = getPattern('email');
if (emailPattern) {
  console.log('Email Pattern:', emailPattern.pattern);
  console.log('Description:', emailPattern.description);

  const testText = 'Contact us at hello@example.com or support@test.org';
  const matches = testPattern(emailPattern.pattern, testText);
  console.log('Matches:', matches);
}

// Output:
// Email Pattern: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}
// Description: Matches standard email addresses
// Matches: ['hello@example.com', 'support@test.org']`,
  references: [
    {
      title: "MDN: Regular Expressions",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions",
    },
    {
      title: "RegExr - Learn, Build & Test RegEx",
      url: "https://regexr.com/",
    },
  ],
};
