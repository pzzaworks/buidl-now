"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdCheck, MdClose } from "react-icons/md";

export function JsFormatterTool() {
  const t = useTranslations("toolUI.js-formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const formatJs = (code: string): string => {
    if (!code.trim()) return "";

    let formatted = code;
    let indentLevel = 0;
    const indentStr = "  ";

    // Remove extra whitespace
    formatted = formatted.replace(/\s+/g, " ");

    // Add newlines after opening braces
    formatted = formatted.replace(/\{/g, " {\n");

    // Add newlines before closing braces
    formatted = formatted.replace(/\}/g, "\n}");

    // Add newlines after semicolons (but not in for loops)
    formatted = formatted.replace(/;(?![^(]*\))/g, ";\n");

    // Add newlines after commas in object/array literals
    formatted = formatted.replace(/,\s*(?=[^)]*[}\]])/g, ",\n");

    // Process lines and add indentation
    const lines = formatted.split("\n");
    const indentedLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Decrease indent for closing braces/brackets
      if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      indentedLines.push(indentStr.repeat(indentLevel) + trimmed);

      // Increase indent after opening braces/brackets
      if (trimmed.endsWith("{") || trimmed.endsWith("[") || trimmed.endsWith("(")) {
        indentLevel++;
      }
    }

    return indentedLines.join("\n");
  };

  const minifyJs = (code: string): string => {
    if (!code.trim()) return "";

    let minified = code;

    // Remove single-line comments
    minified = minified.replace(/\/\/.*$/gm, "");

    // Remove multi-line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove newlines and extra spaces
    minified = minified.replace(/\s+/g, " ");

    // Remove spaces around operators (be careful with strings)
    minified = minified.replace(/\s*([{}:;,=+\-*/<>!&|?()])\s*/g, "$1");

    // Add space after keywords
    const keywords = ["if", "else", "for", "while", "do", "switch", "case", "return", "function", "const", "let", "var", "class", "import", "export", "from", "async", "await", "try", "catch", "finally", "throw", "new", "typeof", "instanceof"];
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b([^\\s])`, "g");
      minified = minified.replace(regex, `${kw} $1`);
    });

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
        setOutput(formatJs(input));
      } else {
        setOutput(minifyJs(input));
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
              ? "const greeting = 'Hello'; function sayHello() { console.log(greeting); }"
              : t("minifyPlaceholder")
          }
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {mode === "format" ? t("formatCode") : t("minifyCode")}
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
          label={mode === "format" ? t("formattedCode") : t("minifiedCode")}
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

export const jsFormatterConfig: ToolConfig = {
  id: "js-formatter",
  name: "JavaScript/TypeScript Formatter",
  description: "Format and beautify JavaScript or TypeScript code, or minify it for production",
  category: "formatters",
  component: JsFormatterTool,
  seo: {
    keywords: [
      "javascript formatter",
      "js formatter",
      "typescript formatter",
      "ts formatter",
      "beautify javascript",
      "format js",
      "js beautifier",
      "minify javascript",
      "js minifier",
      "code formatter",
      "prettify javascript",
      "javascript pretty print",
      "format typescript",
      "ts beautifier",
      "javascript code formatter online",
    ],
  },
  sections: [
    {
      title: "What is JavaScript/TypeScript Formatting?",
      content:
        "JavaScript and TypeScript formatting restructures code to follow consistent style guidelines. It adds proper indentation, line breaks, and spacing to make code more readable. Minification does the opposite, removing all unnecessary characters to reduce file size for production.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Formatting parses your code and restructures it with consistent indentation and line
            breaks. Minification removes comments, whitespace, and newlines to create the smallest
            possible file while maintaining functionality.
          </p>

          <h4 className="text-base font-semibold mb-2">Format vs Minify</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>
              <strong>Format:</strong> Makes code readable with proper indentation and spacing
            </li>
            <li>
              <strong>Minify:</strong> Removes all unnecessary characters for production deployment
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Best Practices</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Use formatting during development for readability</li>
            <li>Use minification for production builds</li>
            <li>Consistent formatting improves code reviews</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple function",
      content: "function greet(name){return 'Hello, '+name+'!';}",
      type: "code",
    },
    {
      title: "Arrow function with object",
      content: "const user={name:'John',age:30};const getUser=()=>user;",
      type: "code",
    },
    {
      title: "Class definition",
      content:
        "class Person{constructor(name){this.name=name;}greet(){console.log('Hello, '+this.name);}}",
      type: "code",
    },
  ],
  codeSnippet: `// Simple JavaScript/TypeScript formatter

function formatJs(code: string): string {
  if (!code.trim()) return '';

  let formatted = code;
  let indentLevel = 0;
  const indentStr = '  ';

  // Remove extra whitespace
  formatted = formatted.replace(/\\s+/g, ' ');

  // Add newlines after opening braces
  formatted = formatted.replace(/\\{/g, ' {\\n');

  // Add newlines before closing braces
  formatted = formatted.replace(/\\}/g, '\\n}');

  // Add newlines after semicolons
  formatted = formatted.replace(/;(?![^(]*\\))/g, ';\\n');

  // Process lines and add indentation
  const lines = formatted.split('\\n');
  const indentedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    indentedLines.push(indentStr.repeat(indentLevel) + trimmed);

    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  return indentedLines.join('\\n');
}

function minifyJs(code: string): string {
  if (!code.trim()) return '';

  let minified = code;

  // Remove comments
  minified = minified.replace(/\\/\\/.*$/gm, '');
  minified = minified.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');

  // Remove whitespace
  minified = minified.replace(/\\s+/g, ' ');
  minified = minified.replace(/\\s*([{}:;,=+\\-*/<>!&|?()])\\s*/g, '$1');

  return minified.trim();
}

// Example usage
const code = 'function greet(name){return "Hello, "+name+"!";}';

console.log('Formatted:');
console.log(formatJs(code));

console.log('\\nMinified:');
console.log(minifyJs(code));`,
  references: [
    {
      title: "Prettier - Code Formatter",
      url: "https://prettier.io/",
    },
    {
      title: "ESLint - JavaScript Linter",
      url: "https://eslint.org/",
    },
    {
      title: "MDN: JavaScript Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    },
  ],
};
