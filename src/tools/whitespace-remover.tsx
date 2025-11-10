"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function WhitespaceRemoverTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleTrim = () => {
    if (!input) {
      setOutput("");
      return;
    }

    // Trim leading and trailing whitespace from each line
    const trimmed = input
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    setOutput(trimmed);
  };

  const handleRemoveAll = () => {
    if (!input) {
      setOutput("");
      return;
    }

    // Remove all whitespace characters (spaces, tabs, newlines, etc.)
    const removed = input.replace(/\s+/g, "");
    setOutput(removed);
  };

  const handleNormalize = () => {
    if (!input) {
      setOutput("");
      return;
    }

    // Normalize whitespace: replace multiple spaces with single space, trim lines
    const normalized = input
      .split("\n")
      .map((line) => line.trim().replace(/\s+/g, " "))
      .filter((line) => line.length > 0) // Remove empty lines
      .join("\n");

    setOutput(normalized);
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
          placeholder="Enter text with whitespace..."
          className="min-h-[200px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={handleTrim} className="flex-1">
            Trim Lines
          </Button>
          <Button onClick={handleRemoveAll} className="flex-1">
            Remove All
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNormalize} className="flex-1">
            Normalize
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Description of actions */}
      <div className="text-sm text-muted-foreground space-y-2 p-4 bg-[#0f0f0f] border border-border rounded">
        <div>
          <strong>Trim Lines:</strong> Removes leading and trailing whitespace from each line
        </div>
        <div>
          <strong>Remove All:</strong> Removes all whitespace characters (spaces, tabs, newlines)
        </div>
        <div>
          <strong>Normalize:</strong> Replaces multiple spaces with single space, trims lines, and removes empty lines
        </div>
      </div>

      {/* Output */}
      {output && (
        <Textarea
          label="Output"
          value={output}
          readOnly
          showCopy
          className="min-h-[200px] bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const whitespaceRemoverConfig: ToolConfig = {
  id: "whitespace-remover",
  name: "Whitespace Remover",
  description: "Remove or normalize whitespace in text with multiple options",
  category: "text",
  component: WhitespaceRemoverTool,
  seo: {
    keywords: [
      "remove whitespace",
      "whitespace remover",
      "remove extra spaces",
      "trim text",
      "remove blank lines",
      "normalize whitespace",
      "remove spaces from text",
      "text trimmer",
      "remove leading spaces",
      "remove trailing spaces",
    ],
  },
  sections: [
    {
      title: "What is whitespace removal?",
      content:
        "Whitespace removal is the process of eliminating or normalizing spaces, tabs, newlines, and other invisible characters from text. It's essential for cleaning up data, formatting text, and removing unnecessary spacing from documents and code.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">This tool provides three methods: Trim Lines removes leading/trailing spaces from each line using the trim() function, Remove All strips all whitespace with regex replacement, and Normalize condenses multiple spaces into single spaces while removing empty lines.</p>

          <h4 className="text-base font-semibold mb-2">Available Operations</h4>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>Trim Lines:</strong> Removes leading and trailing whitespace
              from each line while preserving line breaks
            </li>
            <li>
              <strong>Remove All:</strong> Removes all whitespace characters
              including spaces, tabs, and newlines, resulting in a continuous
              string
            </li>
            <li>
              <strong>Normalize:</strong> Replaces multiple consecutive spaces
              with a single space, trims each line, and removes empty lines
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm">Useful for cleaning up copied text, formatting code snippets, preparing data for processing, or removing unnecessary whitespace from text files.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Trim example",
      content: '"  hello  " → "hello" (per line)',
      type: "code",
    },
    {
      title: "Remove all example",
      content: '"hello world" → "helloworld"',
      type: "code",
    },
    {
      title: "Normalize example",
      content: '"hello    world" → "hello world"',
      type: "code",
    },
  ],
  codeSnippet: `// Trim leading and trailing whitespace from each line
function trimLines(input: string): string {
  return input
    .split('\\n')
    .map((line) => line.trim())
    .join('\\n');
}

// Remove all whitespace characters
function removeAllWhitespace(input: string): string {
  return input.replace(/\\s+/g, '');
}

// Normalize whitespace (single space, trim lines, remove empty lines)
function normalizeWhitespace(input: string): string {
  return input
    .split('\\n')
    .map((line) => line.trim().replace(/\\s+/g, ' '))
    .filter((line) => line.length > 0)
    .join('\\n');
}

// Example usage
const input = \`  Hello   World
    This  is   a    test

  With  extra   spaces  \`;

console.log('Original:');
console.log(input);

console.log('\\nTrimmed lines:');
console.log(trimLines(input));

console.log('\\nAll whitespace removed:');
console.log(removeAllWhitespace(input));

console.log('\\nNormalized:');
console.log(normalizeWhitespace(input));
// Output:
// Hello World
// This is a test
// With extra spaces`,
  references: [
    {
      title: "String.prototype.trim() - MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim",
    },
    {
      title: "Regular Expressions - Whitespace",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes",
    },
  ],
};
