"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

type DelimiterType = "comma" | "semicolon" | "tab";

// CSV to JSON converter
function csvToJson(
  csv: string,
  delimiter: DelimiterType,
  hasHeaders: boolean
): string {
  if (!csv.trim()) {
    throw new Error("CSV input is empty");
  }

  const delimiterChar =
    delimiter === "comma" ? "," : delimiter === "semicolon" ? ";" : "\t";

  const lines = csv.trim().split("\n");
  if (lines.length === 0) {
    throw new Error("CSV input is empty");
  }

  // Parse a CSV line (handles quoted values)
  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiterChar && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  const firstLine = parseCsvLine(lines[0]);
  const headers = hasHeaders
    ? firstLine
    : firstLine.map((_, i) => `column${i + 1}`);

  const dataLines = hasHeaders ? lines.slice(1) : lines;
  const jsonArray = dataLines.map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    return obj;
  });

  return JSON.stringify(jsonArray, null, 2);
}

// JSON to CSV converter
function jsonToCsv(json: string, delimiter: DelimiterType): string {
  const data = JSON.parse(json);

  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of objects");
  }

  if (data.length === 0) {
    throw new Error("JSON array is empty");
  }

  const delimiterChar =
    delimiter === "comma" ? "," : delimiter === "semicolon" ? ";" : "\t";

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach((key) => allKeys.add(key));
    }
  });

  const headers = Array.from(allKeys);

  // Escape CSV value if needed
  function escapeCsvValue(value: any): string {
    const str = String(value ?? "");
    if (
      str.includes(delimiterChar) ||
      str.includes('"') ||
      str.includes("\n")
    ) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // Build CSV
  const csvLines: string[] = [];

  // Add headers
  csvLines.push(headers.map(escapeCsvValue).join(delimiterChar));

  // Add data rows
  data.forEach((item) => {
    const row = headers.map((header) => {
      const value = typeof item === "object" ? item[header] : "";
      return escapeCsvValue(value);
    });
    csvLines.push(row.join(delimiterChar));
  });

  return csvLines.join("\n");
}

export function CsvJsonTool() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterType>("comma");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [error, setError] = useState("");

  const handleCsvToJson = () => {
    if (!csvInput) {
      setJsonInput("");
      setError("");
      return;
    }

    try {
      const json = csvToJson(csvInput, delimiter, hasHeaders);
      setJsonInput(json);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid CSV");
      setJsonInput("");
    }
  };

  const handleJsonToCsv = () => {
    if (!jsonInput) {
      setCsvInput("");
      setError("");
      return;
    }

    try {
      const csv = jsonToCsv(jsonInput, delimiter);
      setCsvInput(csv);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setCsvInput("");
    }
  };

  const handleReset = () => {
    setCsvInput("");
    setJsonInput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="flex gap-4 p-4 rounded border border-border bg-card">
        <div className="flex-1">
          <Label className="mb-2 block text-sm">Delimiter</Label>
          <div className="flex gap-2">
            <Button
              onClick={() => setDelimiter("comma")}
              variant={delimiter === "comma" ? "default" : "secondary"}
              size="sm"
            >
              Comma (,)
            </Button>
            <Button
              onClick={() => setDelimiter("semicolon")}
              variant={delimiter === "semicolon" ? "default" : "secondary"}
              size="sm"
            >
              Semicolon (;)
            </Button>
            <Button
              onClick={() => setDelimiter("tab")}
              variant={delimiter === "tab" ? "default" : "secondary"}
              size="sm"
            >
              Tab
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <Label className="mb-2 block text-sm">First Row</Label>
          <div className="flex gap-2">
            <Button
              onClick={() => setHasHeaders(true)}
              variant={hasHeaders ? "default" : "secondary"}
              size="sm"
            >
              Contains Headers
            </Button>
            <Button
              onClick={() => setHasHeaders(false)}
              variant={!hasHeaders ? "default" : "secondary"}
              size="sm"
            >
              No Headers
            </Button>
          </div>
        </div>
      </div>

      {/* CSV Input */}
      <div>
        <Label className="mb-2 block text-sm">CSV</Label>
        <Textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder="name,age,city&#10;John,30,New York&#10;Jane,25,London"
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleCsvToJson} className="flex-1">
          <span className="hidden sm:inline">CSV → JSON</span>
          <span className="sm:hidden">To JSON</span>
        </Button>
        <Button onClick={handleJsonToCsv} className="flex-1 sm:flex-none">
          <span className="hidden sm:inline">JSON → CSV</span>
          <span className="sm:hidden">To CSV</span>
        </Button>
        <Button onClick={handleReset} variant="secondary" className="sm:flex-none">
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* JSON Input */}
      <div>
        <Label className="mb-2 block text-sm">JSON</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{"name":"John","age":"30","city":"New York"}]'
          className="font-mono min-h-[200px]"
        />
      </div>
    </div>
  );
}

export const csvJsonConfig: ToolConfig = {
  id: "csv-json",
  name: "CSV ⇔ JSON Converter",
  description: "Convert between CSV and JSON formats",
  category: "converters",
  component: CsvJsonTool,
  seo: {
    keywords: [
      "csv to json converter",
      "json to csv",
      "csv json converter",
      "convert csv to json",
      "csv parser",
      "json to csv online",
      "csv to json online",
      "parse csv to json",
      "csv file converter",
      "json array to csv",
    ],
  },
  sections: [
    {
      title: "What is CSV and JSON?",
      content:
        "CSV (Comma-Separated Values) is a simple tabular data format where each line represents a row and values are separated by delimiters. JSON (JavaScript Object Notation) represents data as arrays of objects with named properties, providing more structure and supporting nested data.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            CSV to JSON parses each line into an array, using the first row as property names (if headers enabled). Each subsequent row becomes a JSON object with those properties. JSON to CSV extracts all unique keys as headers, then maps each object's values to CSV rows, handling quotes for values containing delimiters or newlines.
          </p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm mb-4">
            CSV is commonly used for spreadsheet exports, data imports, and bulk data transfers. JSON is preferred for web APIs, configuration files, and modern data interchange. This tool helps convert between the two formats for different use cases.
          </p>

          <h4 className="text-base font-semibold mb-2">Delimiter Options</h4>
          <p className="text-sm">
            Choose the delimiter that matches your CSV file: comma (,) for standard CSV, semicolon (;) for European formats, or tab for TSV files. The first row can be treated as headers or as data.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple CSV",
      content: 'name,age\nJohn,30\nJane,25 ⇔ [{"name":"John","age":"30"},{"name":"Jane","age":"25"}]',
      type: "code",
    },
    {
      title: "CSV with quotes",
      content: 'name,message\nJohn,"Hello, World"\nJane,"She said ""Hi"""',
      type: "text",
    },
    {
      title: "Semicolon delimiter",
      content: "name;age;city\nJohn;30;New York\nJane;25;London",
      type: "text",
    },
  ],
  codeSnippet: `// No npm packages needed - pure Node.js/TypeScript

type DelimiterType = 'comma' | 'semicolon' | 'tab';

function getDelimiterChar(delimiter: DelimiterType): string {
  switch (delimiter) {
    case 'comma': return ',';
    case 'semicolon': return ';';
    case 'tab': return '\\t';
  }
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function csvToJson(csv: string, delimiter: DelimiterType, hasHeaders: boolean): string {
  const delimiterChar = getDelimiterChar(delimiter);
  const lines = csv.trim().split('\\n');

  if (lines.length === 0) {
    throw new Error('CSV input is empty');
  }

  const firstLine = parseCsvLine(lines[0], delimiterChar);
  const headers = hasHeaders
    ? firstLine
    : firstLine.map((_, i) => \`column\${i + 1}\`);

  const dataLines = hasHeaders ? lines.slice(1) : lines;
  const jsonArray = dataLines.map(line => {
    const values = parseCsvLine(line, delimiterChar);
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    return obj;
  });

  return JSON.stringify(jsonArray, null, 2);
}

function escapeCsvValue(value: any, delimiter: string): string {
  const str = String(value ?? '');
  if (str.includes(delimiter) || str.includes('"') || str.includes('\\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function jsonToCsv(json: string, delimiter: DelimiterType): string {
  const data = JSON.parse(json);

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects');
  }

  if (data.length === 0) {
    throw new Error('JSON array is empty');
  }

  const delimiterChar = getDelimiterChar(delimiter);

  // Get all unique keys
  const allKeys = new Set<string>();
  data.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });

  const headers = Array.from(allKeys);
  const csvLines: string[] = [];

  // Add headers
  csvLines.push(headers.map(h => escapeCsvValue(h, delimiterChar)).join(delimiterChar));

  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = typeof item === 'object' ? item[header] : '';
      return escapeCsvValue(value, delimiterChar);
    });
    csvLines.push(row.join(delimiterChar));
  });

  return csvLines.join('\\n');
}

// Example usage
console.log('=== CSV to JSON ===');
const csvInput = \`name,age,city
John,30,New York
Jane,25,London
Bob,35,Paris\`;

const jsonResult = csvToJson(csvInput, 'comma', true);
console.log(jsonResult);

console.log('\\n=== JSON to CSV ===');
const jsonInput = JSON.stringify([
  { name: 'Alice', age: 28, city: 'Tokyo' },
  { name: 'Charlie', age: 32, city: 'Berlin' }
]);

const csvResult = jsonToCsv(jsonInput, 'comma');
console.log(csvResult);

console.log('\\n=== CSV with Special Characters ===');
const csvWithQuotes = \`name,message
John,"Hello, World!"
Jane,"She said ""Hi"""\`;

const jsonWithQuotes = csvToJson(csvWithQuotes, 'comma', true);
console.log(jsonWithQuotes);

console.log('\\n=== Semicolon Delimiter ===');
const csvSemicolon = \`name;age;country
John;30;USA
Jane;25;UK\`;

const jsonSemicolon = csvToJson(csvSemicolon, 'semicolon', true);
console.log(jsonSemicolon);

// Output:
// === CSV to JSON ===
// [
//   { "name": "John", "age": "30", "city": "New York" },
//   { "name": "Jane", "age": "25", "city": "London" },
//   { "name": "Bob", "age": "35", "city": "Paris" }
// ]
//
// === JSON to CSV ===
// name,age,city
// Alice,28,Tokyo
// Charlie,32,Berlin`,
  references: [
    {
      title: "CSV Format - RFC 4180",
      url: "https://datatracker.ietf.org/doc/html/rfc4180",
    },
    {
      title: "JSON.org",
      url: "https://www.json.org/",
    },
    {
      title: "CSV vs JSON",
      url: "https://www.geeksforgeeks.org/difference-between-json-and-csv/",
    },
  ],
};
