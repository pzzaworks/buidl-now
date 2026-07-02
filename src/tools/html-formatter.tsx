"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdClose } from "react-icons/md";

export function HtmlFormatterTool() {
  const t = useTranslations("toolUI.html-formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const formatHtml = (html: string): string => {
    if (!html.trim()) return "";

    const indentStr = "  ";
    let indentLevel = 0;
    const result: string[] = [];

    // Self-closing and void elements
    const voidElements = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    // Inline elements that shouldn't cause line breaks
    const inlineElements = new Set([
      "a",
      "abbr",
      "b",
      "bdo",
      "br",
      "cite",
      "code",
      "dfn",
      "em",
      "i",
      "kbd",
      "mark",
      "q",
      "s",
      "samp",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "time",
      "u",
      "var",
    ]);

    // Normalize whitespace first
    let normalized = html.replace(/\s+/g, " ").trim();

    // Split by tags while keeping the tags
    const parts = normalized.split(/(<[^>]+>)/g).filter((p) => p.trim());

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      if (part.startsWith("</")) {
        // Closing tag
        indentLevel = Math.max(0, indentLevel - 1);
        result.push(indentStr.repeat(indentLevel) + part);
      } else if (part.startsWith("<")) {
        // Opening or self-closing tag
        const tagMatch = part.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/);
        const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";
        const isSelfClosing = part.endsWith("/>") || voidElements.has(tagName);
        const isInline = inlineElements.has(tagName);

        result.push(indentStr.repeat(indentLevel) + part);

        if (!isSelfClosing && !part.startsWith("<!") && !part.startsWith("<?") && !isInline) {
          indentLevel++;
        }
      } else {
        // Text content
        if (part.trim()) {
          result.push(indentStr.repeat(indentLevel) + part.trim());
        }
      }
    }

    return result.join("\n");
  };

  const minifyHtml = (html: string): string => {
    if (!html.trim()) return "";

    let minified = html;

    // Remove HTML comments
    minified = minified.replace(/<!--[\s\S]*?-->/g, "");

    // Remove whitespace between tags
    minified = minified.replace(/>\s+</g, "><");

    // Remove leading/trailing whitespace
    minified = minified.replace(/^\s+|\s+$/gm, "");

    // Collapse multiple spaces to single space
    minified = minified.replace(/\s+/g, " ");

    return minified.trim();
  };

  const handleConvert = () => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }

    try {
      if (mode === "format") {
        setOutput(formatHtml(input));
      } else {
        setOutput(minifyHtml(input));
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedToProcess"));
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === "format" ? "primary" : "secondary"}
          onClick={() => {
            setMode("format");
            setOutput("");
          }}
          className="flex-1"
        >
          {t("format")}
        </Button>
        <Button
          variant={mode === "minify" ? "primary" : "secondary"}
          onClick={() => {
            setMode("minify");
            setOutput("");
          }}
          className="flex-1"
        >
          {t("minify")}
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">{t("inputLabel")}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "format"
              ? "<div><p>Hello World</p></div>"
              : t("minifyPlaceholder")
          }
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {mode === "format" ? t("formatHtml") : t("minifyHtml")}
          </Button>
          <Button onClick={handleReset}>{t("reset")}</Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium flex items-center gap-1">
            <MdClose className="w-4 h-4" /> {error}
          </div>
        </div>
      )}

      {/* Output Section */}
      {output && !error && (
        <Textarea
          label={mode === "format" ? t("formattedHtml") : t("minifiedHtml")}
          value={output}
          readOnly
          showCopy
          className="bg-[var(--color-gray-0)] font-mono text-sm"
          rows={10}
        />
      )}
    </div>
  );
}

export const htmlFormatterConfig: ToolConfig = {
  id: "html-formatter",
  name: "HTML Formatter",
  description: "Format and beautify HTML code, or minify it for production",
  category: "formatters",
  component: HtmlFormatterTool,
  seo: {
    keywords: [
      "html formatter",
      "html beautifier",
      "format html",
      "html pretty print",
      "beautify html",
      "html minifier",
      "minify html",
      "html code formatter",
      "html formatter online",
      "format html online",
      "html indent",
      "html compressor",
      "html optimization",
      "html validator",
      "clean html",
    ],
  },
  sections: [
    {
      title: "What is HTML Formatting?",
      content:
        "HTML formatting restructures HTML code to follow consistent indentation and line break patterns. This makes the code more readable and easier to maintain. Minification removes all unnecessary whitespace and comments to reduce file size for faster page loads.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Formatting parses HTML tags and adds proper indentation based on nesting level.
            Self-closing and void elements like &lt;img&gt; and &lt;br&gt; are handled
            appropriately. Minification strips comments and collapses whitespace.
          </p>

          <h4 className="text-base font-semibold mb-2">Format vs Minify</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>
              <strong>Format:</strong> Adds indentation and line breaks for readability
            </li>
            <li>
              <strong>Minify:</strong> Removes all unnecessary characters to reduce file size
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Void Elements</h4>
          <p className="text-sm">
            Elements like &lt;img&gt;, &lt;br&gt;, &lt;hr&gt;, &lt;input&gt;, and &lt;meta&gt; are
            self-closing and don&apos;t increase indentation level.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple structure",
      content: "<div><p>Hello World</p></div>",
      type: "code",
    },
    {
      title: "With attributes",
      content: '<div class="container"><a href="https://example.com">Link</a></div>',
      type: "code",
    },
    {
      title: "Complex nesting",
      content:
        '<html><head><title>Page</title></head><body><div><h1>Title</h1><p>Content</p></div></body></html>',
      type: "code",
    },
  ],
  codeSnippet: `// Simple HTML formatter

function formatHtml(html: string): string {
  if (!html.trim()) return '';

  const indentStr = '  ';
  let indentLevel = 0;
  const result: string[] = [];

  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr',
    'img', 'input', 'link', 'meta', 'param',
    'source', 'track', 'wbr'
  ]);

  // Normalize whitespace
  let normalized = html.replace(/\\s+/g, ' ').trim();

  // Split by tags
  const parts = normalized.split(/(<[^>]+>)/g).filter(p => p.trim());

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('</')) {
      // Closing tag
      indentLevel = Math.max(0, indentLevel - 1);
      result.push(indentStr.repeat(indentLevel) + trimmed);
    } else if (trimmed.startsWith('<')) {
      // Opening tag
      const tagMatch = trimmed.match(/<\\/?([a-zA-Z][a-zA-Z0-9]*)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      const isSelfClosing = trimmed.endsWith('/>') || voidElements.has(tagName);

      result.push(indentStr.repeat(indentLevel) + trimmed);

      if (!isSelfClosing && !trimmed.startsWith('<!')) {
        indentLevel++;
      }
    } else {
      // Text content
      result.push(indentStr.repeat(indentLevel) + trimmed);
    }
  }

  return result.join('\\n');
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\\s\\S]*?-->/g, '') // Remove comments
    .replace(/>\\s+</g, '><')          // Remove whitespace between tags
    .replace(/\\s+/g, ' ')             // Collapse spaces
    .trim();
}

// Example
const html = '<div><p>Hello</p></div>';
console.log(formatHtml(html));`,
  references: [
    {
      title: "MDN: HTML Elements Reference",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
    },
    {
      title: "W3C HTML Validator",
      url: "https://validator.w3.org/",
    },
    {
      title: "HTML Best Practices",
      url: "https://www.w3schools.com/html/html5_syntax.asp",
    },
  ],
};
