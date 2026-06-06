"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { MdSwapVert, MdInfo } from "react-icons/md";

/**
 * Converts JSON to TOON (Token-Oriented Object Notation) format
 */
function jsonToToon(jsonString: string): string {
  const obj = JSON.parse(jsonString);
  return objectToToon(obj, 0);
}

/**
 * Converts an object to TOON format recursively
 */
function objectToToon(obj: any, indent: number = 0): string {
  const indentStr = "  ".repeat(indent);

  if (obj === null) return "null";
  if (typeof obj === "undefined") return "undefined";
  if (typeof obj === "boolean") return obj.toString();
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "string") {
    // Quote if contains special characters or whitespace
    if (obj.includes(",") || obj.includes("\n") || obj.includes(":") || obj.trim() !== obj || obj === "") {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";

    // Check if array is uniform (all objects with same keys)
    const isUniformArray = obj.every(item =>
      typeof item === "object" &&
      item !== null &&
      !Array.isArray(item)
    );

    if (isUniformArray && obj.length > 0) {
      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      obj.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      // Check if all objects have the same keys
      const keys = Array.from(allKeys);
      const sameKeys = obj.every(item => {
        const itemKeys = Object.keys(item).sort();
        return keys.length === itemKeys.length &&
               keys.every(key => itemKeys.includes(key));
      });

      if (sameKeys && keys.length > 0) {
        // Tabular format
        const sortedKeys = keys.sort();
        let result = `[${obj.length}]{${sortedKeys.join(",")}}:\n`;

        obj.forEach(item => {
          const values = sortedKeys.map(key => {
            const value = item[key];
            if (value === null || value === undefined) return "";
            if (typeof value === "string") {
              if (value.includes(",") || value.includes("\n") || value.includes(":") || value.trim() !== value || value === "") {
                return `"${value.replace(/"/g, '\\"')}"`;
              }
              return value;
            }
            if (typeof value === "object") {
              return JSON.stringify(value).replace(/"/g, '\\"');
            }
            return String(value);
          });
          result += `${indentStr} ${values.join(",")}\n`;
        });

        return result.trimEnd();
      }
    }

    // Non-uniform array - list each item
    let result = "";
    obj.forEach((item, index) => {
      const itemStr = objectToToon(item, indent + 1);
      if (itemStr.includes("\n")) {
        result += `${indentStr}- \n${indentStr}  ${itemStr.split("\n").join("\n" + indentStr + "  ")}\n`;
      } else {
        result += `${indentStr}- ${itemStr}\n`;
      }
    });
    return result.trimEnd();
  }

  // Regular object
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";

    let result = "";
    entries.forEach(([key, value]) => {
      const valueStr = objectToToon(value, indent + 1);

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Nested object
        result += `${indentStr}${key}:\n${valueStr}\n`;
      } else if (Array.isArray(value)) {
        // Array value
        if (valueStr.includes("\n")) {
          result += `${indentStr}${key}: ${valueStr.split("\n").map((line, i) =>
            i === 0 ? line : indentStr + "  " + line
          ).join("\n")}\n`;
        } else {
          result += `${indentStr}${key}: ${valueStr}\n`;
        }
      } else {
        // Primitive value
        result += `${indentStr}${key}: ${valueStr}\n`;
      }
    });

    return result.trimEnd();
  }

  return String(obj);
}

/**
 * Converts TOON to JSON format
 */
function toonToJson(toonString: string): string {
  try {
    const lines = toonString.trim().split("\n");

    // Check if it's a simple tabular format: [N]{keys}:
    const tabularMatch = lines[0].match(/^\[(\d+)\]\{([^}]+)\}:$/);

    if (tabularMatch) {
      // Parse tabular TOON format
      const count = parseInt(tabularMatch[1]);
      const keys = tabularMatch[2].split(",").map(k => k.trim());
      const result: any[] = [];

      // Read the next N lines as data rows
      for (let i = 1; i <= count && i < lines.length; i++) {
        const dataLine = lines[i].trim();
        const values = parseCSVLine(dataLine);

        const obj: any = {};
        keys.forEach((key, idx) => {
          if (idx < values.length) {
            obj[key] = parseValue(values[idx]);
          }
        });
        result.push(obj);
      }

      return JSON.stringify(result, null, 2);
    }

    // Check if it's object format: key: [N]{keys}:
    const objectMatch = lines[0].match(/^(\w+):\s*\[(\d+)\]\{([^}]+)\}:$/);

    if (objectMatch) {
      const objKey = objectMatch[1];
      const count = parseInt(objectMatch[2]);
      const keys = objectMatch[3].split(",").map(k => k.trim());
      const array: any[] = [];

      // Read the next N lines as data rows
      for (let i = 1; i <= count && i < lines.length; i++) {
        const dataLine = lines[i].trim();
        const values = parseCSVLine(dataLine);

        const obj: any = {};
        keys.forEach((key, idx) => {
          if (idx < values.length) {
            obj[key] = parseValue(values[idx]);
          }
        });
        array.push(obj);
      }

      const result: any = {};
      result[objKey] = array;
      return JSON.stringify(result, null, 2);
    }

    // If not recognized format, return error
    throw new Error("Invalid TOON format");
  } catch (err) {
    throw new Error(`Failed to parse TOON: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Parse a CSV-like line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      // Don't include quotes in the value
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current) {
    values.push(current.trim());
  }

  return values;
}

/**
 * Parse a scalar value (string, number, boolean, null)
 */
function parseValue(value: string): any {
  const trimmed = value.trim();

  if (trimmed === "null") return null;
  if (trimmed === "undefined") return undefined;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "") return "";

  // Try to parse as number
  if (!isNaN(Number(trimmed)) && trimmed !== "") {
    return Number(trimmed);
  }

  // Return as string
  return trimmed;
}

export function JsonToonTool() {
  const [jsonInput, setJsonInput] = useState("");
  const [toonInput, setToonInput] = useState("");
  const [error, setError] = useState("");
  const [lastEdited, setLastEdited] = useState<"json" | "toon" | null>(null);

  // Auto-convert when JSON input changes
  useEffect(() => {
    if (lastEdited === "json" && jsonInput) {
      try {
        const toon = jsonToToon(jsonInput);
        setToonInput(toon);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    }
  }, [jsonInput, lastEdited]);

  // Auto-convert when TOON input changes
  useEffect(() => {
    if (lastEdited === "toon" && toonInput) {
      try {
        const json = toonToJson(toonInput);
        setJsonInput(json);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid TOON");
      }
    }
  }, [toonInput, lastEdited]);

  const handleSwap = () => {
    const tempJson = jsonInput;
    const tempToon = toonInput;
    setJsonInput(tempToon);
    setToonInput(tempJson);
    setLastEdited(null);
  };

  return (
    <div className="space-y-4">
      {/* JSON Input */}
      <Textarea
        label="JSON"
        value={jsonInput}
        onChange={(e) => {
          setJsonInput(e.target.value);
          setLastEdited("json");
        }}
        placeholder='{"key": "value"}'
        className="font-mono text-sm"
        rows={8}
      />

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="w-10 h-10 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
          title="Swap"
        >
          <MdSwapVert className="w-5 h-5" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* TOON Input */}
      <Textarea
        label="TOON"
        value={toonInput}
        onChange={(e) => {
          setToonInput(e.target.value);
          setLastEdited("toon");
        }}
        placeholder="key: value"
        className="font-mono text-sm"
        rows={8}
      />

      {/* Info Box */}
      <div className="p-4 rounded-[12px] border bg-[var(--color-blue-50)] border-[var(--color-blue-500)]/30">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2"><MdInfo className="w-5 h-5" /> About TOON Format</div>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>30-60% fewer tokens on large uniform arrays vs JSON</li>
          <li>Tabular arrays: Declare keys once, stream data as rows</li>
          <li>Indentation-based: Like YAML, uses whitespace instead of braces</li>
          <li>Minimal syntax: Removes redundant punctuation</li>
        </ul>
      </div>
    </div>
  );
}

export const jsonToonConfig: ToolConfig = {
  id: "json-toon",
  name: "JSON to TOON",
  description: "Convert between JSON and TOON (Token-Oriented Object Notation) for efficient LLM communication. TOON reduces token count by 30-60% while maintaining accuracy.",
  category: "converters",
  component: JsonToonTool,
  seo: {
    keywords: [
      "json to toon",
      "toon to json",
      "token-oriented object notation",
      "llm optimization",
      "token efficiency",
      "ai data format",
      "json converter",
      "toon converter",
      "reduce tokens",
      "llm cost optimization"
    ],
  },
  sections: [
    {
      title: "What is TOON?",
      content:
        "TOON (Token-Oriented Object Notation) is a data format designed to make communication with Large Language Models (LLMs) more accurate and token-efficient. It typically achieves 30-60% fewer tokens on large uniform arrays compared to formatted JSON. TOON uses a tabular format where keys are declared once and values are listed as rows, similar to CSV but with richer type support. This makes it ideal for API responses, database results, and agentic systems where token cost matters.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            TOON optimizes JSON by using a tabular format for uniform arrays. Instead of repeating object keys for each array item, TOON declares the structure once using the format [length]&#123;keys&#125;: followed by comma-separated values. When converting JSON to TOON, uniform arrays are detected and transformed into this compact table format. When converting TOON back to JSON, the table structure is expanded into full JSON objects.
          </p>

          <div className="text-base font-semibold mb-2">Use Cases</div>
          <p className="text-sm mb-4">
            TOON is most effective for large arrays with uniform structure like API responses, database query results, and data tables. A typical shopping cart with 4 items can save 43% in tokens (~520 tokens in JSON vs ~295 in TOON).
          </p>

          <div className="text-base font-semibold mb-2">When NOT to Use</div>
          <p className="text-sm">
            Avoid TOON for deeply nested structures, non-uniform arrays, or small datasets where savings are minimal. Human readability should take priority over token efficiency in documentation and configuration files.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple array conversion",
      content: `JSON: [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]
↓
TOON: [2]{id,name}:
 1,Alice
 2,Bob`,
      type: "code"
    },
    {
      title: "Shopping cart (43% token savings)",
      content: `JSON: {"items":[{"id":"A1","name":"iPhone","price":999},{"id":"A2","name":"MacBook","price":1999}]}
↓
TOON: items: [2]{id,name,price}:
 A1,iPhone,999
 A2,MacBook,1999`,
      type: "code"
    }
  ],
  codeSnippet: `// TypeScript: Convert JSON to TOON and vice versa

function jsonToToon(jsonString: string): string {
  const obj = JSON.parse(jsonString);

  // Check if uniform array
  if (Array.isArray(obj) && obj.length > 0) {
    const keys = Object.keys(obj[0]);
    const isUniform = obj.every(item =>
      Object.keys(item).length === keys.length &&
      Object.keys(item).every(k => keys.includes(k))
    );

    if (isUniform) {
      // Tabular format: [length]{keys}: values
      let toon = \`[\${obj.length}]{\${keys.join(",")}}:\\n\`;
      obj.forEach(item => {
        const values = keys.map(k => {
          const val = item[k];
          // Quote if contains comma or whitespace
          if (typeof val === 'string' && (val.includes(',') || val.trim() !== val)) {
            return \`"\${val}"\`;
          }
          return val;
        });
        toon += \`  \${values.join(",")}\\n\`;
      });
      return toon.trim();
    }
  }

  return jsonString; // Return as-is if not uniform array
}

function toonToJson(toonString: string): string {
  const lines = toonString.split('\\n');
  const match = lines[0].match(/^\\[(\\d+)\\]\\{([^}]+)\\}:$/);

  if (!match) {
    return toonString; // Not valid TOON format
  }

  const keys = match[2].split(',');
  const array = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].trim().split(',');
    const obj: any = {};
    keys.forEach((key, idx) => {
      let val = values[idx];
      // Remove quotes and parse numbers
      if (val?.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (!isNaN(Number(val))) {
        val = Number(val);
      }
      obj[key] = val;
    });
    array.push(obj);
  }

  return JSON.stringify(array, null, 2);
}

// Example usage
const json = '[{"id":1,"name":"Item","price":99.99}]';
const toon = jsonToToon(json);
console.log('TOON:', toon);
// [1]{id,name,price}:
//   1,Item,99.99

const backToJson = toonToJson(toon);
console.log('JSON:', backToJson);`,
  references: [
    {
      title: "TOON Format Documentation",
      url: "https://github.com/google/toon"
    }
  ]
};
