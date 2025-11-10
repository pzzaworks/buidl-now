"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

// Simple YAML parser and validator
function parseYaml(yaml: string): any {
  const lines = yaml.split("\n");
  const result: any = {};
  const stack: any[] = [{ obj: result, indent: -2 }];
  let currentArray: any[] | null = null;
  let currentArrayIndent = -1;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const indent = line.search(/\S/);
    if (indent === -1) continue;

    // Pop stack based on indentation
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
      if (currentArrayIndent >= indent) {
        currentArray = null;
        currentArrayIndent = -1;
      }
    }

    const currentObj = stack[stack.length - 1].obj;

    // Handle array items
    if (trimmed.startsWith("-")) {
      const value = trimmed.substring(1).trim();

      if (currentArray === null || currentArrayIndent !== indent) {
        // Start new array
        currentArray = [];
        currentArrayIndent = indent;

        // Find the parent key
        const parentKeys = Object.keys(currentObj);
        const lastKey = parentKeys[parentKeys.length - 1];

        if (lastKey && currentObj[lastKey] === null) {
          currentObj[lastKey] = currentArray;
        } else {
          throw new Error(
            `Line ${lineNum + 1}: Array item without parent key`
          );
        }
      }

      if (value.includes(":")) {
        // Array of objects
        const [key, ...valueParts] = value.split(":");
        const objValue = valueParts.join(":").trim();
        const newObj: any = {};
        currentArray.push(newObj);

        if (objValue === "") {
          newObj[key.trim()] = null;
          stack.push({ obj: newObj, indent });
        } else {
          newObj[key.trim()] = parseValue(objValue);
        }
      } else {
        // Simple array item
        currentArray.push(parseValue(value));
      }
    } else if (trimmed.includes(":")) {
      // Key-value pair
      const colonIndex = trimmed.indexOf(":");
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (!key) {
        throw new Error(`Line ${lineNum + 1}: Missing key before colon`);
      }

      if (value === "") {
        // Nested object or array will follow
        currentObj[key] = null;
        const newObj: any = {};
        currentObj[key] = newObj;
        stack.push({ obj: newObj, indent });
        currentArray = null;
        currentArrayIndent = -1;
      } else if (value === "|" || value === ">") {
        // Multiline string (simplified - just collect next indented lines)
        const stringLines: string[] = [];
        let i = lineNum + 1;
        const baseIndent = indent;

        while (i < lines.length) {
          const nextLine = lines[i];
          const nextIndent = nextLine.search(/\S/);

          if (nextIndent <= baseIndent && nextLine.trim() !== "") break;
          if (nextLine.trim() !== "") {
            stringLines.push(nextLine.substring(baseIndent + 2));
          }
          i++;
        }

        currentObj[key] = stringLines.join("\n");
        lineNum = i - 1;
      } else {
        currentObj[key] = parseValue(value);
      }
    } else {
      throw new Error(
        `Line ${lineNum + 1}: Invalid YAML syntax - expected key:value pair or array item`
      );
    }
  }

  return result;
}

function parseValue(value: string): any {
  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  // Parse boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // Parse null
  if (value === "null" || value === "~") return null;

  // Parse number
  if (!isNaN(Number(value)) && value !== "") {
    return Number(value);
  }

  // Return as string
  return value;
}

export function YamlValidatorTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const handleValidate = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(null);
      setError("");
      return;
    }

    try {
      const parsed = parseYaml(input);
      const json = JSON.stringify(parsed, null, 2);
      setOutput(json);
      setIsValid(true);
      setError("");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Invalid YAML syntax";
      setError(errorMsg);
      setOutput("");
      setIsValid(false);
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">YAML Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="name: John Doe&#10;age: 30&#10;hobbies:&#10;  - reading&#10;  - coding"
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleValidate} className="flex-1">
          Validate YAML
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Validation Result */}
      {isValid !== null && (
        <div
          className={`p-4 rounded border ${
            isValid
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {isValid ? "✓" : "✗"}
            <span>{isValid ? "Valid YAML" : "Invalid YAML"}</span>
          </div>
          {error && <div className="mt-2 text-sm">{error}</div>}
        </div>
      )}

      {/* Output Section */}
      {output && (
        <div>
          <Label className="mb-2 block text-sm">Parsed as JSON</Label>
          <Textarea
            value={output}
            readOnly
            showCopy
            className="bg-[#0f0f0f] font-mono text-sm"
            rows={12}
          />
        </div>
      )}

      {/* Info */}
      <div className="p-4 rounded border border-border bg-card text-sm text-muted-foreground">
        <p>
          This validator parses YAML and displays the result as JSON. It
          supports basic YAML features including nested objects, arrays,
          strings, numbers, booleans, and null values.
        </p>
      </div>
    </div>
  );
}

export const yamlValidatorConfig: ToolConfig = {
  id: "yaml-validator",
  name: "YAML Validator",
  description: "Validate YAML syntax and view parsed result as JSON",
  category: "formatters",
  component: YamlValidatorTool,
  seo: {
    keywords: [
      "yaml validator",
      "validate yaml",
      "yaml checker",
      "yaml parser online",
      "yaml syntax checker",
      "yaml lint",
      "check yaml syntax",
      "yaml to json",
      "yaml validation tool",
      "verify yaml",
      "yaml formatter",
    ],
  },
  sections: [
    {
      title: "What is YAML?",
      content:
        "YAML (YAML Ain't Markup Language) is a human-readable data serialization format. It uses indentation to represent structure and is commonly used for configuration files in tools like Docker, Kubernetes, and CI/CD pipelines.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">Paste your YAML content in the input field and click Validate. The tool will check the syntax and display the parsed result as JSON. If there are errors, you'll see detailed error messages with line numbers.</p>

          <h4 className="text-base font-semibold mb-2">Common YAML Syntax</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Key-value pairs: key: value</li>
            <li>Nested objects: use indentation (2 spaces)</li>
            <li>Arrays: use dash (-) prefix</li>
            <li>Comments: start with # character</li>
            <li>Strings: can be quoted or unquoted</li>
            <li>Booleans: true, false</li>
            <li>Null: null or ~</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple object",
      content: "name: John Doe\nage: 30\nemail: john@example.com",
      type: "text",
    },
    {
      title: "Nested structure",
      content:
        "user:\n  name: John\n  address:\n    city: New York\n    country: USA",
      type: "text",
    },
    {
      title: "Arrays",
      content: "colors:\n  - red\n  - green\n  - blue",
      type: "text",
    },
    {
      title: "Array of objects",
      content:
        "users:\n  - name: John\n    age: 30\n  - name: Jane\n    age: 25",
      type: "text",
    },
  ],
  codeSnippet: `// npm install js-yaml
// npm install @types/js-yaml --save-dev

import * as yaml from 'js-yaml';

interface YamlData {
  [key: string]: any;
}

function parseYaml(yamlString: string): YamlData {
  try {
    const parsed = yaml.load(yamlString) as YamlData;
    return parsed;
  } catch (error) {
    throw new Error(\`YAML parsing error: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}

function validateYaml(yamlString: string): { valid: boolean; error?: string; data?: YamlData } {
  try {
    const data = parseYaml(yamlString);
    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid YAML'
    };
  }
}

function yamlToJson(yamlString: string): string {
  const parsed = parseYaml(yamlString);
  return JSON.stringify(parsed, null, 2);
}

function jsonToYaml(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return yaml.dump(parsed);
}

// Example usage
const yamlExample = \`
name: John Doe
age: 30
hobbies:
  - reading
  - coding
  - gaming
address:
  city: New York
  country: USA
\`;

console.log('Validating YAML...');
const result = validateYaml(yamlExample);

if (result.valid) {
  console.log('Valid YAML!');
  console.log('\\nParsed data:');
  console.log(result.data);

  console.log('\\nConverted to JSON:');
  console.log(yamlToJson(yamlExample));
} else {
  console.log('Invalid YAML:', result.error);
}

// Output:
// Validating YAML...
// Valid YAML!
//
// Parsed data:
// { name: 'John Doe', age: 30, hobbies: ['reading', 'coding', 'gaming'], address: { city: 'New York', country: 'USA' } }
//
// Converted to JSON:
// {
//   "name": "John Doe",
//   "age": 30,
//   "hobbies": ["reading", "coding", "gaming"],
//   "address": { "city": "New York", "country": "USA" }
// }`,
  references: [
    {
      title: "YAML Official Site",
      url: "https://yaml.org/",
    },
    {
      title: "YAML Specification",
      url: "https://yaml.org/spec/1.2/spec.html",
    },
    {
      title: "Learn YAML in Y Minutes",
      url: "https://learnxinyminutes.com/docs/yaml/",
    },
  ],
};
