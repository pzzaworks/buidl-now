"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

export function RemoveDuplicatesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });

  const handleRemoveDuplicates = () => {
    if (!input) {
      setOutput("");
      setStats({ original: 0, unique: 0, removed: 0 });
      return;
    }

    const lines = input.split("\n");
    const originalCount = lines.length;

    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    lines.forEach((line) => {
      const key = caseSensitive ? line : line.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      }
    });

    const uniqueCount = uniqueLines.length;
    const removedCount = originalCount - uniqueCount;

    setOutput(uniqueLines.join("\n"));
    setStats({
      original: originalCount,
      unique: uniqueCount,
      removed: removedCount,
    });
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setStats({ original: 0, unique: 0, removed: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div>
        <Checkbox
          id="caseSensitive"
          checked={caseSensitive}
          onChange={(e) => {
            setCaseSensitive(e.target.checked);
            setOutput("");
            setStats({ original: 0, unique: 0, removed: 0 });
          }}
          label="Case Sensitive"
        />
      </div>

      {/* Input */}
      <div>
        <Label className="mb-2 block text-sm">Input Text (one line per item)</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter lines with potential duplicates...&#10;apple&#10;banana&#10;apple&#10;cherry"
          className="min-h-[200px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleRemoveDuplicates} className="flex-1">
          Remove Duplicates
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Statistics */}
      {output && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-[#0f0f0f] border border-border rounded">
            <div className="text-lg font-bold">{stats.original}</div>
            <div className="text-sm text-muted-foreground">Original Lines</div>
          </div>
          <div className="p-4 bg-[#0f0f0f] border border-border rounded">
            <div className="text-lg font-bold">{stats.unique}</div>
            <div className="text-sm text-muted-foreground">Unique Lines</div>
          </div>
          <div className="p-4 bg-[#0f0f0f] border border-border rounded">
            <div className="text-lg font-bold text-blue-400">{stats.removed}</div>
            <div className="text-sm text-muted-foreground">Duplicates Removed</div>
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <Textarea
          label="Output (Duplicates Removed)"
          value={output}
          readOnly
          showCopy
          className="min-h-[200px] bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const removeDuplicatesConfig: ToolConfig = {
  id: "remove-duplicates",
  name: "Remove Duplicates",
  description: "Remove duplicate lines from text while preserving the first occurrence",
  category: "text",
  component: RemoveDuplicatesTool,
  seo: {
    keywords: [
      "remove duplicate lines",
      "remove duplicates from text",
      "duplicate line remover",
      "delete duplicate lines",
      "unique lines only",
      "remove repeated lines",
      "duplicate text remover",
      "find and remove duplicates",
      "text deduplication",
      "remove duplicate entries",
    ],
  },
  sections: [
    {
      title: "What is duplicate removal?",
      content:
        "Duplicate removal is the process of identifying and eliminating repeated entries from a list or text. This tool helps clean up data by keeping only unique entries while maintaining the original order and preserving the first occurrence of each item.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Removal Process</h4>
          <p className="text-sm mb-4">This tool removes duplicate lines from your text, keeping only the first occurrence of each unique line. The order of lines is preserved.</p>

          <h4 className="text-base font-semibold mb-2">Case Sensitivity</h4>
          <p className="text-sm mb-4">When case-sensitive mode is off (default), 'Apple' and 'apple' are considered duplicates. When enabled, they are treated as different lines.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Basic duplicate removal",
      content: "apple, banana, apple, cherry → apple, banana, cherry (removed 1 duplicate)",
      type: "code",
    },
    {
      title: "Case insensitive (default)",
      content: "Apple, banana, apple → Apple, banana (removed 1 duplicate)",
      type: "code",
    },
    {
      title: "Case sensitive",
      content: "Apple, banana, apple → Apple, banana, apple (no duplicates when case sensitive)",
      type: "code",
    },
  ],
  codeSnippet: `type RemoveDuplicatesOptions = {
  caseSensitive: boolean;
};

function removeDuplicates(input: string, options: RemoveDuplicatesOptions): string {
  const lines = input.split('\\n');
  const seen = new Set<string>();
  const uniqueLines: string[] = [];

  lines.forEach((line) => {
    const key = options.caseSensitive ? line : line.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      uniqueLines.push(line);
    }
  });

  return uniqueLines.join('\\n');
}

// Example usage
const input = \`apple
banana
Apple
cherry
banana
apple\`;

// Case insensitive (default behavior)
const result1 = removeDuplicates(input, { caseSensitive: false });
console.log('Case insensitive:');
console.log(result1);
// Output:
// apple
// banana
// cherry

// Case sensitive
const result2 = removeDuplicates(input, { caseSensitive: true });
console.log('\\nCase sensitive:');
console.log(result2);
// Output:
// apple
// banana
// Apple
// cherry`,
  references: [
    {
      title: "Set - JavaScript | MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set",
    },
  ],
};
