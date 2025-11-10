"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

export function LineSorterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);

  const handleSort = () => {
    if (!input) {
      setOutput("");
      return;
    }

    let lines = input.split("\n");

    // Remove empty lines if option is enabled
    if (removeEmptyLines) {
      lines = lines.filter((line) => line.trim().length > 0);
    }

    // Remove duplicates if option is enabled
    if (removeDuplicates) {
      if (caseSensitive) {
        lines = Array.from(new Set(lines));
      } else {
        // Case-insensitive duplicate removal
        const seen = new Set<string>();
        lines = lines.filter((line) => {
          const lower = line.toLowerCase();
          if (seen.has(lower)) {
            return false;
          }
          seen.add(lower);
          return true;
        });
      }
    }

    // Sort lines
    const sorted = [...lines].sort((a, b) => {
      const strA = caseSensitive ? a : a.toLowerCase();
      const strB = caseSensitive ? b : b.toLowerCase();

      if (sortOrder === "asc") {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });

    setOutput(sorted.join("\n"));
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Textarea
          label="Input Text (one item per line)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="apple&#10;banana&#10;cherry&#10;apple&#10;date"
          className="min-h-[200px]"
        />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block text-sm">Sort Order</Label>
          <div className="flex gap-2">
            <Button
              variant={sortOrder === "asc" ? "default" : "secondary"}
              onClick={() => setSortOrder("asc")}
              className="flex-1"
              size="sm"
            >
              Ascending (A → Z)
            </Button>
            <Button
              variant={sortOrder === "desc" ? "default" : "secondary"}
              onClick={() => setSortOrder("desc")}
              className="flex-1"
              size="sm"
            >
              Descending (Z → A)
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Checkbox
            id="caseSensitive"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            label="Case Sensitive"
          />

          <Checkbox
            id="removeDuplicates"
            checked={removeDuplicates}
            onChange={(e) => setRemoveDuplicates(e.target.checked)}
            label="Remove Duplicates"
          />

          <Checkbox
            id="removeEmptyLines"
            checked={removeEmptyLines}
            onChange={(e) => setRemoveEmptyLines(e.target.checked)}
            label="Remove Empty Lines"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSort} className="flex-1">
          Sort Lines
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Output */}
      {output && (
        <Textarea
          label="Sorted Output"
          value={output}
          readOnly
          showCopy
          className="min-h-[200px]"
        />
      )}
    </div>
  );
}

export const lineSorterConfig: ToolConfig = {
  id: "line-sorter",
  name: "Line Sorter",
  description: "Sort lines of text alphabetically with options for case sensitivity, duplicate removal, and empty line handling",
  category: "text",
  component: LineSorterTool,
  seo: {
    keywords: [
      "line sorter",
      "sort lines alphabetically",
      "alphabetical line sorter",
      "text line organizer",
      "sort text lines",
      "alphabetize text",
      "line organizer",
      "sort and remove duplicates",
      "advanced line sorter",
      "text sorting tool",
    ],
  },
  sections: [
    {
      title: "What is line sorting?",
      content:
        "Line sorting is the process of organizing text by arranging lines in a specific order, typically alphabetically or numerically. This tool helps you quickly organize lists, clean up data files, and prepare sorted content for presentations or further processing.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            The tool processes your text line by line, applying your selected options in order: first removes empty lines (if enabled), then removes duplicates (if enabled), and finally sorts the remaining lines according to your chosen order and case sensitivity setting.
          </p>

          <h4 className="text-base font-semibold mb-2">Sorting Options</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Ascending (A → Z) - Sort from A to Z, 0 to 9</li>
            <li>Descending (Z → A) - Sort from Z to A, 9 to 0</li>
            <li>Case Sensitive - Treat uppercase and lowercase as different</li>
            <li>Remove Duplicates - Keep only unique lines</li>
            <li>Remove Empty Lines - Filter out blank lines</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Common Use Cases",
      content: "Sorting lists, organizing data, cleaning up CSV files, alphabetizing names, removing duplicate entries, preparing sorted lists for presentations",
      type: "text",
    },
  ],
  codeSnippet: `type SortOptions = {
  sortOrder: 'asc' | 'desc';
  caseSensitive: boolean;
  removeDuplicates: boolean;
  removeEmptyLines: boolean;
};

function sortLines(input: string, options: SortOptions): string {
  let lines = input.split('\\n');

  // Remove empty lines if option is enabled
  if (options.removeEmptyLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  }

  // Remove duplicates if option is enabled
  if (options.removeDuplicates) {
    if (options.caseSensitive) {
      lines = Array.from(new Set(lines));
    } else {
      // Case-insensitive duplicate removal
      const seen = new Set<string>();
      lines = lines.filter((line) => {
        const lower = line.toLowerCase();
        if (seen.has(lower)) {
          return false;
        }
        seen.add(lower);
        return true;
      });
    }
  }

  // Sort lines
  const sorted = [...lines].sort((a, b) => {
    const strA = options.caseSensitive ? a : a.toLowerCase();
    const strB = options.caseSensitive ? b : b.toLowerCase();

    if (options.sortOrder === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });

  return sorted.join('\\n');
}

// Example usage
const input = \`banana
apple
cherry
Apple
banana
date\`;

const options: SortOptions = {
  sortOrder: 'asc',
  caseSensitive: false,
  removeDuplicates: true,
  removeEmptyLines: true,
};

const sorted = sortLines(input, options);
console.log(sorted);
// Output:
// apple
// banana
// cherry
// date`,
  references: [
    {
      title: "String Collation",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare",
    },
  ],
};
