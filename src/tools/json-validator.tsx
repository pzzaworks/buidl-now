"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function JsonValidatorTool() {
  const [input, setInput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState("");

  const handleFormat = () => {
    if (!input) {
      setIsValid(null);
      setError("");
      setParsed("");
      return;
    }

    try {
      const result = JSON.parse(input);
      setIsValid(true);
      setError("");
      setParsed(JSON.stringify(result, null, 2));
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setParsed("");
    }
  };

  const handleMinify = () => {
    if (!input) {
      setIsValid(null);
      setError("");
      setParsed("");
      return;
    }

    try {
      const result = JSON.parse(input);
      setIsValid(true);
      setError("");
      setParsed(JSON.stringify(result));
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setParsed("");
    }
  };

  const handleReset = () => {
    setInput("");
    setIsValid(null);
    setError("");
    setParsed("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Label className="mb-2 block text-sm">JSON Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"name":"John","age":30}'
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleFormat} className="flex-1">
          <span className="hidden sm:inline">Format (Pretty)</span>
          <span className="sm:hidden">Format</span>
        </Button>
        <Button onClick={handleMinify} className="flex-1 sm:flex-none">
          Minify
        </Button>
        <Button onClick={handleReset} variant="secondary" className="sm:flex-none">
          Reset
        </Button>
      </div>

      {/* Validation Result */}
      {isValid !== null && (
        <div
          className={`p-3 rounded border ${
            isValid
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="text-sm font-medium">
            {isValid ? "✓ Valid JSON" : `✗ Invalid JSON: ${error}`}
          </div>
        </div>
      )}

      {/* Parsed Output */}
      {parsed && (
        <Textarea
          label="Formatted JSON"
          value={parsed}
          readOnly
          showCopy
          className="font-mono min-h-[200px] bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const jsonValidatorConfig: ToolConfig = {
  id: "json-validator",
  name: "JSON Formatter",
  description: "Format, minify, and validate JSON data",
  category: "formatters",
  component: JsonValidatorTool,
  seo: {
    keywords: [
      "json formatter",
      "json beautifier",
      "json validator",
      "format json online",
      "prettify json",
      "json pretty print",
      "minify json",
      "json parser",
      "validate json",
      "json viewer",
      "json editor",
      "json checker",
      "json validation tool",
      "check json syntax",
      "json parser online",
      "json lint",
      "verify json",
      "json syntax checker",
    ],
  },
  sections: [
    {
      title: "What is JSON?",
      content:
        "JSON (JavaScript Object Notation) is a lightweight data interchange format. It's easy for humans to read and write, and easy for machines to parse and generate. This tool helps you format (prettify), minify, and validate JSON data.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Formatting vs Minifying</h4>
          <p className="text-sm mb-4">
            Formatting (prettifying) makes JSON more readable by adding indentation and line breaks. Minifying removes all unnecessary whitespace to reduce file size. Both operations validate the JSON syntax and report errors if found.
          </p>

          <h4 className="text-base font-semibold mb-2">Common JSON Errors</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Missing commas between properties</li>
            <li>Trailing commas (not allowed in JSON)</li>
            <li>Single quotes instead of double quotes</li>
            <li>Unquoted property names</li>
            <li>Comments (not allowed in standard JSON)</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">JSON Data Types</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>String: "text"</li>
            <li>Number: 123 or 123.45</li>
            <li>Boolean: true or false</li>
            <li>Null: null</li>
            <li>Array: [1, 2, 3]</li>
            <li>Object: &#123;"key": "value"&#125;</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple object",
      content: '{"name":"John","age":30,"city":"New York"}',
      type: "code",
    },
    {
      title: "Array",
      content: '[1,2,3,4,5]',
      type: "code",
    },
    {
      title: "Nested structure",
      content: '{"user":{"name":"Jane","profile":{"age":25,"email":"jane@example.com"}}}',
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in JSON methods

interface ValidationResult {
  valid: boolean;
  error?: string;
  formatted?: string;
  minified?: string;
}

function validateAndFormatJson(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      valid: true,
      formatted: JSON.stringify(parsed, null, 2),
      minified: JSON.stringify(parsed)
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}

function formatJson(jsonString: string, spaces: number = 2): string {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, spaces);
}

function minifyJson(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
}

function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

// Example usage
const unformattedJson = '{"name":"John Doe","age":30,"email":"john@example.com","hobbies":["reading","coding"]}';

console.log('Validating JSON...');
const result = validateAndFormatJson(unformattedJson);

if (result.valid) {
  console.log('Valid JSON!');

  console.log('\\nFormatted JSON:');
  console.log(result.formatted);

  console.log('\\nMinified JSON:');
  console.log(result.minified);
} else {
  console.log('Invalid JSON:', result.error);
}

// Example with invalid JSON
const invalidJson = '{"name": "John", age: 30}'; // Missing quotes around age
console.log('\\nValidating invalid JSON...');
console.log('Is valid:', isValidJson(invalidJson));

// Output:
// Validating JSON...
// Valid JSON!
//
// Formatted JSON:
// {
//   "name": "John Doe",
//   "age": 30,
//   "email": "john@example.com",
//   "hobbies": ["reading", "coding"]
// }
//
// Minified JSON:
// {"name":"John Doe","age":30,"email":"john@example.com","hobbies":["reading","coding"]}
//
// Validating invalid JSON...
// Is valid: false`,
  references: [
    {
      title: "JSON.org",
      url: "https://www.json.org/",
    },
    {
      title: "MDN: Working with JSON",
      url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON",
    },
  ],
};
