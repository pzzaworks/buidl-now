"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

// Simple YAML to JSON converter (handles basic YAML)
function yamlToJson(yaml: string): string {
  const lines = yaml.split("\n");
  const result: any = {};
  let currentObj: any = result;
  const stack: any[] = [result];
  let lastIndent = 0;

  for (const line of lines) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;

    const indent = line.search(/\S/);
    const content = line.trim();

    if (indent < lastIndent) {
      const levels = (lastIndent - indent) / 2;
      for (let i = 0; i < levels; i++) {
        stack.pop();
      }
      currentObj = stack[stack.length - 1];
    }

    if (content.includes(":")) {
      const [key, ...valueParts] = content.split(":");
      const value = valueParts.join(":").trim();

      if (value === "") {
        currentObj[key.trim()] = {};
        stack.push(currentObj[key.trim()]);
        currentObj = currentObj[key.trim()];
      } else {
        // Try to parse as number or boolean
        if (value === "true") currentObj[key.trim()] = true;
        else if (value === "false") currentObj[key.trim()] = false;
        else if (value === "null") currentObj[key.trim()] = null;
        else if (!isNaN(Number(value)) && value !== "")
          currentObj[key.trim()] = Number(value);
        else currentObj[key.trim()] = value.replace(/['"]/g, "");
      }
    } else if (content.startsWith("-")) {
      const value = content.substring(1).trim();
      if (!Array.isArray(currentObj)) {
        const parent = stack[stack.length - 2];
        const keys = Object.keys(parent);
        const lastKey = keys[keys.length - 1];
        parent[lastKey] = [];
        currentObj = parent[lastKey];
      }
      currentObj.push(value.replace(/['"]/g, ""));
    }

    lastIndent = indent;
  }

  return JSON.stringify(result, null, 2);
}

// Simple JSON to YAML converter
function jsonToYaml(json: string, indent = 0): string {
  const obj = JSON.parse(json);
  let yaml = "";
  const spaces = "  ".repeat(indent);

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === "object") {
        yaml += `${spaces}-\n${jsonToYaml(JSON.stringify(item), indent + 1)}`;
      } else {
        yaml += `${spaces}- ${item}\n`;
      }
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        yaml += `${spaces}${key}:\n${jsonToYaml(JSON.stringify(value), indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    });
  }

  return yaml;
}

export function JsonYamlTool() {
  const [jsonInput, setJsonInput] = useState("");
  const [yamlInput, setYamlInput] = useState("");
  const [error, setError] = useState("");

  const handleJsonToYaml = () => {
    if (!jsonInput) {
      setYamlInput("");
      setError("");
      return;
    }

    try {
      const yaml = jsonToYaml(jsonInput);
      setYamlInput(yaml);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setYamlInput("");
    }
  };

  const handleYamlToJson = () => {
    if (!yamlInput) {
      setJsonInput("");
      setError("");
      return;
    }

    try {
      const json = yamlToJson(yamlInput);
      setJsonInput(json);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid YAML");
      setJsonInput("");
    }
  };

  const handleReset = () => {
    setJsonInput("");
    setYamlInput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* JSON Input */}
      <div>
        <Label className="mb-2 block text-sm">JSON</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"name":"John","age":30}'
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleJsonToYaml} className="flex-1">
          <span className="hidden sm:inline">JSON → YAML</span>
          <span className="sm:hidden">To YAML</span>
        </Button>
        <Button onClick={handleYamlToJson} className="flex-1 sm:flex-none">
          <span className="hidden sm:inline">YAML → JSON</span>
          <span className="sm:hidden">To JSON</span>
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

      {/* YAML Input */}
      <div>
        <Label className="mb-2 block text-sm">YAML</Label>
        <Textarea
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          placeholder="name: John\nage: 30"
          className="font-mono min-h-[200px]"
        />
      </div>
    </div>
  );
}

export const jsonYamlConfig: ToolConfig = {
  id: "json-yaml",
  name: "JSON ⇔ YAML Converter",
  description: "Convert between JSON and YAML formats",
  category: "converters",
  component: JsonYamlTool,
  seo: {
    keywords: [
      "json to yaml converter",
      "yaml to json",
      "json yaml converter",
      "yml to json",
      "json to yml",
      "yaml parser",
      "json parser",
      "convert json to yaml",
      "yaml converter online",
      "json formatter",
    ],
  },
  sections: [
    {
      title: "What is JSON and YAML?",
      content:
        "JSON (JavaScript Object Notation) is a lightweight data format using brackets and braces to structure data. YAML (YAML Ain't Markup Language) is a more human-readable format that uses indentation instead of brackets. Both are commonly used for configuration files and data exchange between systems.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            The converter parses the structure of your input format and transforms it to the target format while preserving the data hierarchy. When converting JSON to YAML, brackets are replaced with indentation and colons. When converting YAML to JSON, indentation is analyzed to determine nesting levels and converted to bracket notation. Both conversions maintain data types like strings, numbers, booleans, arrays, and objects.
          </p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm">
            JSON is widely used in web APIs and JavaScript applications. YAML is popular for configuration files (Docker Compose, Kubernetes, CI/CD pipelines) due to its readability.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple object",
      content: 'JSON: {"name":"John","age":30} ⇔ YAML: name: John\nage: 30',
      type: "code",
    },
  ],
  codeSnippet: `// npm install js-yaml
// npm install @types/js-yaml --save-dev

import yaml from 'js-yaml';

function jsonToYaml(jsonString: string): string {
  const obj = JSON.parse(jsonString);
  return yaml.dump(obj, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}

function yamlToJson(yamlString: string): string {
  const obj = yaml.load(yamlString);
  return JSON.stringify(obj, null, 2);
}

function readFile(path: string): string {
  const fs = require('fs');
  return fs.readFileSync(path, 'utf8');
}

function writeFile(path: string, content: string): void {
  const fs = require('fs');
  fs.writeFileSync(path, content, 'utf8');
  console.log(\`File saved to \${path}\`);
}

// Example usage
console.log('=== JSON to YAML ===');
const jsonData = {
  name: 'John',
  age: 30,
  skills: ['JavaScript', 'TypeScript', 'React'],
  address: {
    city: 'New York',
    country: 'USA'
  },
  active: true
};

const jsonStr = JSON.stringify(jsonData);
const yamlStr = jsonToYaml(jsonStr);
console.log(yamlStr);

console.log('\\n=== YAML to JSON ===');
const yamlInput = \`
name: Jane
age: 25
skills:
  - Python
  - Django
  - PostgreSQL
address:
  city: London
  country: UK
active: false
\`;

const jsonOutput = yamlToJson(yamlInput);
console.log(jsonOutput);

console.log('\\n=== Complex Example ===');
const complexData = {
  version: '1.0',
  services: [
    { name: 'api', port: 3000, environment: ['NODE_ENV=production'] },
    { name: 'db', port: 5432, environment: ['POSTGRES_DB=myapp'] }
  ],
  metadata: {
    created: '2024-01-01',
    author: 'Developer'
  }
};

const complexYaml = jsonToYaml(JSON.stringify(complexData));
console.log(complexYaml);

// Uncomment to save files:
// writeFile('output.yaml', yamlStr);
// writeFile('output.json', jsonOutput);

// Output:
// === JSON to YAML ===
// name: John
// age: 30
// skills:
//   - JavaScript
//   - TypeScript
//   - React
// address:
//   city: New York
//   country: USA
// active: true
//
// === YAML to JSON ===
// {
//   "name": "Jane",
//   "age": 25,
//   "skills": ["Python", "Django", "PostgreSQL"],
//   "address": { "city": "London", "country": "UK" },
//   "active": false
// }`,
  references: [
    {
      title: "JSON.org",
      url: "https://www.json.org/",
    },
    {
      title: "YAML.org",
      url: "https://yaml.org/",
    },
  ],
};
