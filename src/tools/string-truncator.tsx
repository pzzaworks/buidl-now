"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

type EllipsisPosition = "end" | "middle" | "start";

export function StringTruncatorTool() {
  const t = useTranslations("toolUI.string-truncator");
  const [input, setInput] = useState("");
  const [maxLength, setMaxLength] = useState("50");
  const [ellipsisPosition, setEllipsisPosition] = useState<EllipsisPosition>("end");
  const [wordBoundary, setWordBoundary] = useState(true);
  const [customEllipsis, setCustomEllipsis] = useState("...");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    const max = parseInt(maxLength) || 50;
    const ellipsis = customEllipsis || "...";

    if (input.length <= max) {
      setOutput(input);
      return;
    }

    let result = "";
    const ellipsisLength = ellipsis.length;

    if (ellipsisPosition === "end") {
      let truncated = input.slice(0, max - ellipsisLength);

      if (wordBoundary) {
        const lastSpace = truncated.lastIndexOf(" ");
        if (lastSpace > max * 0.3) {
          truncated = truncated.slice(0, lastSpace);
        }
      }

      result = truncated.trimEnd() + ellipsis;
    } else if (ellipsisPosition === "start") {
      let truncated = input.slice(-(max - ellipsisLength));

      if (wordBoundary) {
        const firstSpace = truncated.indexOf(" ");
        if (firstSpace > 0 && firstSpace < truncated.length * 0.7) {
          truncated = truncated.slice(firstSpace + 1);
        }
      }

      result = ellipsis + truncated.trimStart();
    } else {
      // Middle truncation
      const availableLength = max - ellipsisLength;
      const startLength = Math.ceil(availableLength / 2);
      const endLength = Math.floor(availableLength / 2);

      let startPart = input.slice(0, startLength);
      let endPart = input.slice(-endLength);

      if (wordBoundary) {
        const lastSpaceStart = startPart.lastIndexOf(" ");
        if (lastSpaceStart > startLength * 0.5) {
          startPart = startPart.slice(0, lastSpaceStart);
        }

        const firstSpaceEnd = endPart.indexOf(" ");
        if (firstSpaceEnd > 0 && firstSpaceEnd < endLength * 0.5) {
          endPart = endPart.slice(firstSpaceEnd + 1);
        }
      }

      result = startPart.trimEnd() + ellipsis + endPart.trimStart();
    }

    setOutput(result);
  }, [input, maxLength, ellipsisPosition, wordBoundary, customEllipsis]);

  const handleReset = () => {
    setInput("");
    setMaxLength("50");
    setEllipsisPosition("end");
    setWordBoundary(true);
    setCustomEllipsis("...");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Textarea
        label={t("inputLabel")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("inputPlaceholder")}
        className="min-h-[150px]"
      />

      {/* Stats */}
      {input && (
        <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
          <div className="text-sm text-muted-foreground">
            {t("inputLength")} <span className="font-mono font-medium text-foreground">{input.length}</span> {t("charactersUnit")}
            {output && (
              <>
                {" | "}
                {t("outputLength")} <span className="font-mono font-medium text-foreground">{output.length}</span> {t("charactersUnit")}
              </>
            )}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("maxLength")}
            type="number"
            min="1"
            max="10000"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            placeholder="50"
          />
          <Input
            label={t("ellipsisChars")}
            value={customEllipsis}
            onChange={(e) => setCustomEllipsis(e.target.value)}
            placeholder="..."
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">{t("ellipsisPosition")}</Label>
          <div className="flex gap-2">
            <Button
              variant={ellipsisPosition === "end" ? "primary" : "secondary"}
              onClick={() => setEllipsisPosition("end")}
              className="flex-1"
              size="sm"
            >
              {t("end")}
            </Button>
            <Button
              variant={ellipsisPosition === "middle" ? "primary" : "secondary"}
              onClick={() => setEllipsisPosition("middle")}
              className="flex-1"
              size="sm"
            >
              {t("middle")}
            </Button>
            <Button
              variant={ellipsisPosition === "start" ? "primary" : "secondary"}
              onClick={() => setEllipsisPosition("start")}
              className="flex-1"
              size="sm"
            >
              {t("start")}
            </Button>
          </div>
        </div>

        <Checkbox
          id="wordBoundary"
          checked={wordBoundary}
          onChange={(e) => setWordBoundary(e.target.checked)}
          label={t("wordBoundary")}
        />
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} className="w-full sm:w-auto">
        {t("reset")}
      </Button>

      {/* Output */}
      {output && (
        <Textarea
          label={t("truncatedLabel")}
          value={output}
          readOnly
          showCopy
          className="min-h-[100px]"
        />
      )}
    </div>
  );
}

export const stringTruncatorConfig: ToolConfig = {
  id: "string-truncator",
  name: "String Truncator",
  description: "Truncate strings with various options for ellipsis position and word boundaries",
  category: "text",
  component: StringTruncatorTool,
  seo: {
    keywords: [
      "string truncator",
      "text truncator",
      "truncate text",
      "shorten text",
      "ellipsis text",
      "text shortener",
      "string shortener",
      "character limit",
      "text cutter",
      "truncate string online",
      "word boundary truncate",
      "middle ellipsis",
    ],
  },
  sections: [
    {
      title: "What is String Truncation?",
      content:
        "String truncation is the process of shortening text to fit within a specific character limit while indicating that the text has been shortened, typically using an ellipsis (...). This is commonly used in user interfaces to display previews of longer content.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Truncation Methods</h4>
          <p className="text-sm mb-4">
            This tool offers three truncation methods: end truncation (most common), middle truncation (useful for file paths), and start truncation (for showing the end of text).
          </p>

          <h4 className="text-base font-semibold mb-2">Options</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Max Length: The maximum number of characters in the output (including ellipsis)</li>
            <li>Ellipsis Position: Where to place the ellipsis (end, middle, or start)</li>
            <li>Word Boundary: Avoid cutting words in the middle for better readability</li>
            <li>Custom Ellipsis: Use any character(s) as the truncation indicator</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>UI text previews (blog excerpts, product descriptions)</li>
            <li>File path display (middle truncation)</li>
            <li>Meta descriptions for SEO</li>
            <li>Social media character limits</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "End truncation",
      content: '"The quick brown fox jumps over the lazy dog" → "The quick brown fox..."',
      type: "code",
    },
    {
      title: "Middle truncation (file paths)",
      content: '"/Users/documents/projects/my-app/src/index.ts" → "/Users/.../index.ts"',
      type: "code",
    },
    {
      title: "Start truncation",
      content: '"This is a very long sentence" → "...very long sentence"',
      type: "code",
    },
  ],
  codeSnippet: `type EllipsisPosition = 'end' | 'middle' | 'start';

interface TruncateOptions {
  maxLength?: number;
  ellipsis?: string;
  position?: EllipsisPosition;
  wordBoundary?: boolean;
}

function truncateString(
  text: string,
  options: TruncateOptions = {}
): string {
  const {
    maxLength = 50,
    ellipsis = '...',
    position = 'end',
    wordBoundary = true
  } = options;

  if (text.length <= maxLength) {
    return text;
  }

  const ellipsisLength = ellipsis.length;

  if (position === 'end') {
    let truncated = text.slice(0, maxLength - ellipsisLength);

    if (wordBoundary) {
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > maxLength * 0.3) {
        truncated = truncated.slice(0, lastSpace);
      }
    }

    return truncated.trimEnd() + ellipsis;
  }

  if (position === 'start') {
    let truncated = text.slice(-(maxLength - ellipsisLength));

    if (wordBoundary) {
      const firstSpace = truncated.indexOf(' ');
      if (firstSpace > 0 && firstSpace < truncated.length * 0.7) {
        truncated = truncated.slice(firstSpace + 1);
      }
    }

    return ellipsis + truncated.trimStart();
  }

  // Middle truncation
  const availableLength = maxLength - ellipsisLength;
  const startLength = Math.ceil(availableLength / 2);
  const endLength = Math.floor(availableLength / 2);

  return text.slice(0, startLength) + ellipsis + text.slice(-endLength);
}

// Example usage
const longText = 'The quick brown fox jumps over the lazy dog';

console.log(truncateString(longText, { maxLength: 25 }));
// Output: "The quick brown fox..."

console.log(truncateString(longText, { maxLength: 25, position: 'middle' }));
// Output: "The quick...lazy dog"

console.log(truncateString(longText, { maxLength: 25, position: 'start' }));
// Output: "...over the lazy dog"`,
  references: [
    {
      title: "CSS text-overflow Property",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow",
    },
    {
      title: "String Truncation Best Practices",
      url: "https://uxdesign.cc/the-art-of-text-truncation-eb0ef13ce0f8",
    },
  ],
};
