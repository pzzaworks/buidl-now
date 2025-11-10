"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function EscapeUnescapeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleEscape = () => {
    if (!input) {
      setOutput("");
      return;
    }

    // Escape special characters for JavaScript strings
    const escaped = input
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");

    setOutput(escaped);
  };

  const handleUnescape = () => {
    if (!input) {
      setOutput("");
      return;
    }

    try {
      // Unescape special characters
      const unescaped = input
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");

      setOutput(unescaped);
    } catch (e) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Label className="mb-2 block text-sm">Input Text</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text with special characters..."
          className="min-h-[150px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleEscape} className="flex-1">
          Escape
        </Button>
        <Button onClick={handleUnescape} className="flex-1 sm:flex-none">
          Unescape
        </Button>
        <Button onClick={handleReset} variant="secondary" className="sm:flex-none">
          Reset
        </Button>
      </div>

      {/* Output */}
      {output && (
        <Textarea
          label="Output"
          value={output}
          readOnly
          showCopy
          className="min-h-[150px] bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const escapeUnescapeConfig: ToolConfig = {
  id: "escape-unescape",
  name: "Escape / Unescape",
  description: "Escape or unescape special characters in text",
  category: "text",
  component: EscapeUnescapeTool,
  seo: {
    keywords: [
      "escape string",
      "unescape string",
      "escape characters",
      "javascript escape",
      "escape special characters",
      "string escape tool",
      "unescape javascript",
      "escape quotes",
      "escape newline",
      "backslash escape",
      "escape sequence",
      "string escape online",
    ],
  },
  sections: [
    {
      title: "What are Escape Sequences?",
      content:
        "Escape sequences are special character combinations that represent characters which cannot be directly typed or would have special meaning in text. They start with a backslash (\\) followed by a character code, allowing you to include special characters like newlines, tabs, and quotes in strings.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Escaping replaces special characters with their escape sequence equivalents (e.g., a newline becomes \\n). Unescaping reverses this process, converting escape sequences back into their actual characters. This is essential for programming when you need to include special characters in strings, especially for JSON, JavaScript, or text containing quotes and line breaks.
          </p>

          <h4 className="text-base font-semibold mb-2">Common Escape Sequences</h4>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm">
            <li>\\n: Newline</li>
            <li>\\r: Carriage return</li>
            <li>\\t: Tab</li>
            <li>\\": Double quote</li>
            <li>\\': Single quote</li>
            <li>\\\\: Backslash</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Newline escape",
      content: 'Line 1\nLine 2 → Line 1\\nLine 2',
      type: "code",
    },
    {
      title: "Quote escape",
      content: 'He said "Hello" → He said \\"Hello\\"',
      type: "code",
    },
  ],
  codeSnippet: `// Escape special characters for JavaScript strings
function escapeString(input: string): string {
  return input
    .replace(/\\\\/g, '\\\\\\\\')
    .replace(/"/g, '\\\\"')
    .replace(/'/g, "\\\\'")
    .replace(/\\n/g, '\\\\n')
    .replace(/\\r/g, '\\\\r')
    .replace(/\\t/g, '\\\\t');
}

// Unescape special characters
function unescapeString(input: string): string {
  return input
    .replace(/\\\\n/g, '\\n')
    .replace(/\\\\r/g, '\\r')
    .replace(/\\\\t/g, '\\t')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\'/g, "'")
    .replace(/\\\\\\\\/g, '\\\\');
}

// Example usage
const original = \`Line 1
Line 2
He said "Hello"\`;

const escaped = escapeString(original);
console.log('Escaped:', escaped);
// Output: Line 1\\nLine 2\\nHe said \\"Hello\\"

const unescaped = unescapeString(escaped);
console.log('Unescaped:', unescaped);
// Output: Line 1
// Line 2
// He said "Hello"`,
  references: [
    {
      title: "Escape Sequences - MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#escape_sequences",
    },
  ],
};
