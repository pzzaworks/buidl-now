"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

type EscapeFormat = "javascript" | "python" | "css" | "html";

function encodeUnicodeEscape(text: string, format: EscapeFormat): string {
  const result: string[] = [];

  for (const char of text) {
    const codePoint = char.codePointAt(0)!;

    // Keep ASCII printable characters as-is (except for specific formats)
    if (codePoint >= 32 && codePoint <= 126) {
      result.push(char);
      continue;
    }

    switch (format) {
      case "javascript":
        if (codePoint <= 0xFFFF) {
          result.push(`\\u${codePoint.toString(16).padStart(4, "0")}`);
        } else {
          // Use surrogate pairs for characters outside BMP
          const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
          const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
          result.push(`\\u${high.toString(16)}\\u${low.toString(16)}`);
        }
        break;
      case "python":
        if (codePoint <= 0xFFFF) {
          result.push(`\\u${codePoint.toString(16).padStart(4, "0")}`);
        } else {
          result.push(`\\U${codePoint.toString(16).padStart(8, "0")}`);
        }
        break;
      case "css":
        result.push(`\\${codePoint.toString(16)} `);
        break;
      case "html":
        result.push(`&#x${codePoint.toString(16)};`);
        break;
    }
  }

  return result.join("");
}

function decodeUnicodeEscape(text: string, format: EscapeFormat): string {
  let result = text;

  switch (format) {
    case "javascript":
    case "python":
      // Handle \UXXXXXXXX (Python extended)
      result = result.replace(/\\U([0-9a-fA-F]{8})/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      // Handle \uXXXX
      result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      break;
    case "css":
      // Handle \XXXX (with optional trailing space)
      result = result.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      break;
    case "html":
      // Handle &#xXXXX; and &#DDDD;
      result = result.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      result = result.replace(/&#(\d+);/g, (_, dec) => {
        return String.fromCodePoint(parseInt(dec, 10));
      });
      break;
  }

  return result;
}

function encodeAllCharacters(text: string, format: EscapeFormat): string {
  const result: string[] = [];

  for (const char of text) {
    const codePoint = char.codePointAt(0)!;

    switch (format) {
      case "javascript":
        if (codePoint <= 0xFFFF) {
          result.push(`\\u${codePoint.toString(16).padStart(4, "0")}`);
        } else {
          const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
          const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
          result.push(`\\u${high.toString(16)}\\u${low.toString(16)}`);
        }
        break;
      case "python":
        if (codePoint <= 0xFFFF) {
          result.push(`\\u${codePoint.toString(16).padStart(4, "0")}`);
        } else {
          result.push(`\\U${codePoint.toString(16).padStart(8, "0")}`);
        }
        break;
      case "css":
        result.push(`\\${codePoint.toString(16)} `);
        break;
      case "html":
        result.push(`&#x${codePoint.toString(16)};`);
        break;
    }
  }

  return result.join("");
}

export function UnicodeEscapeTool() {
  const t = useTranslations("toolUI.unicode-escape");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [format, setFormat] = useState<EscapeFormat>("javascript");
  const [encodeAll, setEncodeAll] = useState(false);

  const handleConvert = () => {
    if (!input) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(encodeAll ? encodeAllCharacters(input, format) : encodeUnicodeEscape(input, format));
      } else {
        setOutput(decodeUnicodeEscape(input, format));
      }
    } catch {
      setOutput(t("invalidInput"));
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  const formatLabels: Record<EscapeFormat, string> = {
    javascript: "JavaScript (\\uXXXX)",
    python: "Python (\\uXXXX / \\UXXXXXXXX)",
    css: "CSS (\\XXXX)",
    html: "HTML (&#xXXXX;)",
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === "encode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("encode");
            setOutput("");
          }}
          className="flex-1"
        >
          {t("encode")}
        </Button>
        <Button
          variant={mode === "decode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("decode");
            setOutput("");
          }}
          className="flex-1"
        >
          {t("decode")}
        </Button>
      </div>

      {/* Format Selection */}
      <div>
        <Label className="mb-2 block text-sm">{t("escapeFormatLabel")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(formatLabels) as EscapeFormat[]).map((fmt) => (
            <Button
              key={fmt}
              variant={format === fmt ? "primary" : "secondary"}
              onClick={() => {
                setFormat(fmt);
                setOutput("");
              }}
              className="text-xs sm:text-sm"
            >
              {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-gray-500)] mt-1">
          {formatLabels[format]}
        </p>
      </div>

      {/* Encode All Option */}
      {mode === "encode" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="encodeAll"
            checked={encodeAll}
            onChange={(e) => setEncodeAll(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-gray-300)]"
          />
          <Label htmlFor="encodeAll" className="text-sm cursor-pointer">
            {t("encodeAllLabel")}
          </Label>
        </div>
      )}

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          {mode === "encode" ? t("textInputLabel") : t("escapedInputLabel")}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? t("textPlaceholder")
              : t("escapedPlaceholder")
          }
          rows={6}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {mode === "encode" ? t("encode") : t("decode")}
          </Button>
          <Button onClick={handleReset}>{t("reset")}</Button>
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <Textarea
          label={mode === "encode" ? t("escapedOutputLabel") : t("decodedTextLabel")}
          value={output}
          readOnly
          showCopy
          className="font-mono bg-[var(--color-gray-0)] text-sm"
          rows={6}
        />
      )}
    </div>
  );
}

export const unicodeEscapeConfig: ToolConfig = {
  id: "unicode-escape",
  name: "Unicode Escape Encoder",
  description:
    "Convert text to and from Unicode escape sequences in various formats",
  category: "encoders-decoders",
  component: UnicodeEscapeTool,
  seo: {
    keywords: [
      "unicode escape",
      "unicode encoder",
      "unicode decoder",
      "\\u escape sequence",
      "javascript unicode",
      "python unicode escape",
      "css unicode",
      "html unicode entity",
      "unicode converter",
      "escape sequence converter",
      "unicode to text",
      "text to unicode",
    ],
  },
  sections: [
    {
      title: "What are Unicode Escape Sequences?",
      content:
        "Unicode escape sequences are a way to represent Unicode characters using ASCII characters. They are commonly used in programming languages and markup languages to include special characters that might not be directly typable or visible in source code.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Supported Formats</h4>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>JavaScript:</strong> Uses \uXXXX for BMP characters. Surrogate pairs for characters above U+FFFF.
            </li>
            <li>
              <strong>Python:</strong> Uses \uXXXX for BMP and \UXXXXXXXX for extended characters.
            </li>
            <li>
              <strong>CSS:</strong> Uses \XXXX followed by a space.
            </li>
            <li>
              <strong>HTML:</strong> Uses &amp;#xXXXX; hexadecimal entities.
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Embedding special characters in source code</li>
            <li>Debugging character encoding issues</li>
            <li>Creating portable text representations</li>
            <li>Working with internationalized content</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "JavaScript format",
      content: 'Hello -> \\u0048\\u0065\\u006c\\u006c\\u006f',
      type: "code",
    },
    {
      title: "HTML entities",
      content: "Cafe -> Caf&#xe9;",
      type: "code",
    },
    {
      title: "CSS escapes",
      content: "heart -> \\2665 (shows as heart symbol)",
      type: "code",
    },
  ],
  codeSnippet: `// Unicode escape encoding in different formats

function toJavaScriptEscape(text: string): string {
  return Array.from(text)
    .map(char => {
      const cp = char.codePointAt(0)!;
      if (cp <= 0xFFFF) {
        return \`\\\\u\${cp.toString(16).padStart(4, '0')}\`;
      }
      // Surrogate pairs for characters outside BMP
      const high = Math.floor((cp - 0x10000) / 0x400) + 0xD800;
      const low = ((cp - 0x10000) % 0x400) + 0xDC00;
      return \`\\\\u\${high.toString(16)}\\\\u\${low.toString(16)}\`;
    })
    .join('');
}

function toPythonEscape(text: string): string {
  return Array.from(text)
    .map(char => {
      const cp = char.codePointAt(0)!;
      if (cp <= 0xFFFF) {
        return \`\\\\u\${cp.toString(16).padStart(4, '0')}\`;
      }
      return \`\\\\U\${cp.toString(16).padStart(8, '0')}\`;
    })
    .join('');
}

function toHTMLEntity(text: string): string {
  return Array.from(text)
    .map(char => \`&#x\${char.codePointAt(0)!.toString(16)};\`)
    .join('');
}

// Example usage
const text = "Hello World!";
console.log(toJavaScriptEscape(text));
// \\u0048\\u0065\\u006c\\u006c\\u006f...

const emoji = "Hello";
console.log(toPythonEscape(emoji));
// \\U0001f44b

console.log(toHTMLEntity("cafe"));
// &#x63;&#x61;&#x66;&#xe9;`,
  references: [
    {
      title: "MDN: Unicode in JavaScript",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#unicode_escape_sequences",
    },
    {
      title: "Python: Unicode HOWTO",
      url: "https://docs.python.org/3/howto/unicode.html",
    },
    {
      title: "CSS: Using Unicode",
      url: "https://www.w3.org/International/questions/qa-escapes",
    },
  ],
};
