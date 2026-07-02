"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdContentCopy, MdCheck, MdClose } from "react-icons/md";

export function RegexTesterTool() {
  const t = useTranslations("toolUI.regex-tester");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTest = () => {
    if (!pattern || !testString) {
      setMatches([]);
      setError("");
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const globalRegex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");

      const allMatches: RegExpMatchArray[] = [];
      let match;

      while ((match = globalRegex.exec(testString)) !== null) {
        allMatches.push(match);
        if (!flags.includes("g")) break;
      }

      setMatches(allMatches);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("invalidRegex"));
      setMatches([]);
    }
  };

  const handlePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPattern(e.target.value);
    setError("");
  };

  const handleFlagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlags(e.target.value);
    setError("");
  };

  const handleTestStringChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTestString(e.target.value);
  };

  // Auto-test on changes
  useState(() => {
    handleTest();
  });

  const handleCopy = async () => {
    if (matches.length > 0) {
      const matchesText = matches
        .map((match, i) => {
          let text = `Match ${i + 1}: "${match[0]}"`;
          if (match.index !== undefined) {
            text += ` (Position: ${match.index})`;
          }
          if (match.length > 1) {
            text += ` [Groups: ${match.slice(1).map((g, i) => `$${i + 1}="${g}"`).join(", ")}]`;
          }
          return text;
        })
        .join("\n");
      await navigator.clipboard.writeText(matchesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pattern */}
      <div>
        <Label className="mb-2 block text-sm">{t("patternLabel")}</Label>
        <Input
          value={pattern}
          onChange={handlePatternChange}
          onKeyUp={handleTest}
          placeholder="\d+"
          className="font-mono text-sm"
        />
      </div>

      {/* Flags */}
      <div>
        <Label className="mb-2 block text-sm">{t("flagsLabel")}</Label>
        <Input
          value={flags}
          onChange={handleFlagsChange}
          onKeyUp={handleTest}
          placeholder="g"
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {t("flagsHelp")}
        </div>
      </div>

      {/* Test String */}
      <div>
        <Label className="mb-2 block text-sm">{t("testStringLabel")}</Label>
        <Textarea
          value={testString}
          onChange={handleTestStringChange}
          onKeyUp={handleTest}
          placeholder={t("testStringPlaceholder")}
          className="min-h-[150px]"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium flex items-center gap-1"><MdClose className="w-4 h-4" /> {error}</div>
        </div>
      )}

      {/* Matches */}
      {matches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-sm">
              {t("matches")} ({matches.length})
            </Label>
            {matches.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
                title={copied ? t("copied") : t("copyToClipboard")}
              >
                {copied ? (
                  <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                ) : (
                  <MdContentCopy style={{ width: 16, height: 16 }} />
                )}
              </button>
            )}
          </div>
          <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px] max-h-[300px] overflow-y-auto space-y-2">
            {matches.map((match, index) => (
              <div key={index} className="pb-2 border-b border-border last:border-0">
                <div className="text-sm font-mono text-[var(--color-green-500)]">
                  {t("match")} {index + 1}: "{match[0]}"
                </div>
                {match.index !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("position")} {match.index}
                  </div>
                )}
                {match.length > 1 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("groups")} {match.slice(1).map((g, i) => `$${i + 1}="${g}"`).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Matches */}
      {pattern && testString && matches.length === 0 && !error && (
        <div className="p-3 rounded-[12px] border bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
          <div className="text-sm font-medium">{t("noMatches")}</div>
        </div>
      )}
    </div>
  );
}

export const regexTesterConfig: ToolConfig = {
  id: "regex-tester",
  name: "Regular Expression Tester",
  description: "Test and debug regular expressions",
  category: "testers",
  component: RegexTesterTool,
  seo: {
    keywords: [
      "regex tester",
      "regular expression tester",
      "regex validator",
      "test regex online",
      "regex checker",
      "regex debugger",
      "regular expression validator",
      "regex pattern tester",
      "regex tool",
      "regexp tester",
      "regex match tester",
    ],
  },
  sections: [
    {
      title: "What are Regular Expressions?",
      content:
        "Regular expressions (regex) are powerful pattern-matching tools used to search, validate, and manipulate text. They use a special syntax to define patterns that can match specific sequences of characters, making them essential for tasks like input validation, text parsing, and data extraction.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Testing Process</h4>
          <p className="text-sm mb-4">The regex tester evaluates your pattern against test text in real-time. It compiles your regular expression with the specified flags, then searches through the test string to find all matches. Results show each match, its position in the text, and any captured groups defined by parentheses in your pattern.</p>

          <h4 className="text-base font-semibold mb-2">Regular Expression Flags</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>g: Global search (find all matches)</li>
            <li>i: Case-insensitive search</li>
            <li>m: Multi-line search</li>
            <li>s: Allows . to match newline characters</li>
            <li>u: Unicode; treat pattern as a sequence of unicode code points</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common Patterns</h4>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm mb-4">
            <li>\d: Match any digit (0-9)</li>
            <li>\w: Match any word character (a-z, A-Z, 0-9, _)</li>
            <li>\s: Match any whitespace character</li>
            <li>.: Match any character except newline</li>
            <li>+: Match 1 or more</li>
            <li>*: Match 0 or more</li>
            <li>?: Match 0 or 1</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Email pattern",
      content: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      type: "code",
    },
    {
      title: "Phone number",
      content: "\\d{3}-\\d{3}-\\d{4}",
      type: "code",
    },
    {
      title: "URL",
      content: "https?://[\\w\\-\\.]+\\.[a-z]{2,}",
      type: "code",
    },
  ],
  codeSnippet: `type RegexMatch = {
  match: string;
  index: number;
  groups: string[];
};

function testRegex(pattern: string, flags: string, testString: string): RegexMatch[] {
  try {
    const regex = new RegExp(pattern, flags);
    const globalRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const matches: RegexMatch[] = [];

    let match;
    while ((match = globalRegex.exec(testString)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
      });
      if (!flags.includes('g')) break;
    }

    return matches;
  } catch (e) {
    throw new Error(\`Invalid regular expression: \${e instanceof Error ? e.message : 'Unknown error'}\`);
  }
}

// Example usage
const pattern = '\\\\d{3}-\\\\d{3}-\\\\d{4}';
const flags = 'g';
const testString = 'Call me at 555-123-4567 or 555-987-6543';

const matches = testRegex(pattern, flags, testString);

matches.forEach((match, i) => {
  console.log(\`Match \${i + 1}: "\${match.match}" at position \${match.index}\`);
});
// Output:
// Match 1: "555-123-4567" at position 11
// Match 2: "555-987-6543" at position 27`,
  references: [
    {
      title: "MDN: Regular Expressions",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions",
    },
    {
      title: "Regex101 (Advanced Tester)",
      url: "https://regex101.com/",
    },
  ],
};
