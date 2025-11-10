"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function JsonToTableTool() {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    if (!jsonInput) {
      setCsvOutput("");
      setError("");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);

      if (!Array.isArray(data)) {
        setError("Input must be a JSON array");
        setCsvOutput("");
        return;
      }

      if (data.length === 0) {
        setError("Array is empty");
        setCsvOutput("");
        return;
      }

      // Get all unique keys from all objects
      const keys = Array.from(
        new Set(data.flatMap((obj) => Object.keys(obj)))
      );

      // Create CSV header
      const header = keys.join(",");

      // Create CSV rows
      const rows = data.map((obj) =>
        keys.map((key) => {
          const value = obj[key];
          if (value === null || value === undefined) return "";
          const str = String(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (str.includes(",") || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      );

      const csv = [header, ...rows].join("\n");
      setCsvOutput(csv);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setCsvOutput("");
    }
  };

  const handleReset = () => {
    setJsonInput("");
    setCsvOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* JSON Input */}
      <div>
        <Label className="mb-2 block text-sm">JSON Array</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]'
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleConvert} className="flex-1">
          Convert to CSV
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* CSV Output */}
      {csvOutput && (
        <Textarea
          label="CSV Output"
          value={csvOutput}
          readOnly
          showCopy
          className="font-mono min-h-[200px] bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const jsonToTableConfig: ToolConfig = {
  id: "json-to-table",
  name: "JSON to Table/CSV",
  description: "Convert JSON arrays to CSV format",
  category: "converters",
  component: JsonToTableTool,
  seo: {
    keywords: [
      "json to csv converter",
      "json to table",
      "json array to csv",
      "convert json to csv",
      "json to excel",
      "json to spreadsheet",
      "json csv converter",
      "parse json to csv",
      "json data to table",
      "json export csv",
    ],
  },
  sections: [
    {
      title: "What is JSON to CSV conversion?",
      content:
        "JSON to CSV conversion transforms structured JSON data (typically arrays of objects) into CSV (Comma-Separated Values) format, which is a simple tabular format widely supported by spreadsheet applications like Excel and Google Sheets. This conversion makes it easy to analyze and visualize JSON data in spreadsheet software.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            This tool converts a JSON array of objects into CSV format by extracting all unique keys from the objects to create column headers. Each object in the array becomes a row, with values positioned according to their keys. Values containing commas or quotes are automatically wrapped in double quotes and escaped to maintain data integrity.
          </p>

          <h4 className="text-base font-semibold mb-2">CSV Format</h4>
          <p className="text-sm">
            CSV is a simple file format used to store tabular data. Values are separated by commas, and each line represents a row. Values containing commas or quotes are wrapped in double quotes.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple array",
      content: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
      type: "code",
    },
  ],
  codeSnippet: `// No npm packages needed - pure Node.js/TypeScript

function jsonToCSV(jsonArray: Array<Record<string, any>>): string {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    throw new Error('Input must be a non-empty array');
  }

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(jsonArray.flatMap(obj => Object.keys(obj)))
  );

  // Escape CSV value if needed
  function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Wrap in quotes if contains comma or quote
    if (str.includes(',') || str.includes('"')) {
      return \`"\${str.replace(/"/g, '""')}"\`;
    }
    return str;
  }

  // Create CSV header
  const header = keys.join(',');

  // Create CSV rows
  const rows = jsonArray.map(obj =>
    keys.map(key => escapeCsvValue(obj[key])).join(',')
  );

  return [header, ...rows].join('\\n');
}

function saveToFile(csv: string, filename: string): void {
  const fs = require('fs');
  fs.writeFileSync(filename, csv, 'utf8');
  console.log(\`CSV saved to \${filename}\`);
}

// Example usage
console.log('=== Basic Conversion ===');
const data = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'London' },
  { name: 'Bob', age: 35, city: 'Paris' }
];

const csv = jsonToCSV(data);
console.log(csv);

console.log('\\n=== Values with Commas ===');
const dataWithCommas = [
  { name: 'John Doe', message: 'Hello, World!', country: 'USA' },
  { name: 'Jane Smith', message: 'Hi, there!', country: 'UK' }
];
console.log(jsonToCSV(dataWithCommas));

console.log('\\n=== Complex Data ===');
const complexData = [
  { id: 1, product: 'Laptop', price: 999.99, tags: 'electronics,computers', inStock: true },
  { id: 2, product: 'Mouse', price: 29.99, tags: 'electronics,accessories', inStock: false },
  { id: 3, product: 'Keyboard', price: 79.99, tags: 'electronics,computers', inStock: true }
];
const complexCsv = jsonToCSV(complexData);
console.log(complexCsv);

// Uncomment to save to file:
// saveToFile(complexCsv, 'output.csv');

// Output:
// === Basic Conversion ===
// name,age,city
// John,30,New York
// Jane,25,London
// Bob,35,Paris
//
// === Values with Commas ===
// name,message,country
// John Doe,"Hello, World!",USA
// Jane Smith,"Hi, there!",UK
//
// === Complex Data ===
// id,product,price,tags,inStock
// 1,Laptop,999.99,"electronics,computers",true
// 2,Mouse,29.99,"electronics,accessories",false
// 3,Keyboard,79.99,"electronics,computers",true`,
  references: [
    {
      title: "CSV Format - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Comma-separated_values",
    },
  ],
};
