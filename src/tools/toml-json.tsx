"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { MdSwapVert } from "react-icons/md";
import TOML from "@iarna/toml";

export function TomlJsonTool() {
  const t = useTranslations("toolUI.toml-json");
  const [tomlInput, setTomlInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [lastEdited, setLastEdited] = useState<"toml" | "json" | null>(null);

  // Auto-convert when TOML input changes
  useEffect(() => {
    if (lastEdited === "toml" && tomlInput) {
      try {
        const parsed = TOML.parse(tomlInput);
        setJsonInput(JSON.stringify(parsed, null, 2));
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("invalidToml"));
      }
    }
  }, [tomlInput, lastEdited]);

  // Auto-convert when JSON input changes
  useEffect(() => {
    if (lastEdited === "json" && jsonInput) {
      try {
        const parsed = JSON.parse(jsonInput);
        const toml = TOML.stringify(parsed as TOML.JsonMap);
        setTomlInput(toml);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("invalidJson"));
      }
    }
  }, [jsonInput, lastEdited]);

  const handleSwap = () => {
    const tempToml = tomlInput;
    const tempJson = jsonInput;
    setTomlInput(tempJson);
    setJsonInput(tempToml);
    setLastEdited(null);
  };

  return (
    <div className="space-y-4">
      {/* TOML Input */}
      <Textarea
        label="TOML"
        value={tomlInput}
        onChange={(e) => {
          setTomlInput(e.target.value);
          setLastEdited("toml");
        }}
        placeholder='[package]&#10;name = "my-project"&#10;version = "1.0.0"'
        className="font-mono text-sm"
        rows={8}
      />

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="w-10 h-10 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
          title={t("swap")}
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

      {/* JSON Input */}
      <Textarea
        label="JSON"
        value={jsonInput}
        onChange={(e) => {
          setJsonInput(e.target.value);
          setLastEdited("json");
        }}
        placeholder='{"package":{"name":"my-project","version":"1.0.0"}}'
        className="font-mono text-sm"
        rows={8}
      />
    </div>
  );
}

export const tomlJsonConfig: ToolConfig = {
  id: "toml-json",
  name: "TOML ⇔ JSON Converter",
  description: "Convert between TOML and JSON formats",
  category: "converters",
  component: TomlJsonTool,
  seo: {
    keywords: [
      "toml to json converter",
      "json to toml",
      "toml json converter",
      "convert toml to json",
      "toml parser",
      "cargo toml to json",
      "pyproject toml converter",
      "toml converter online",
      "json to toml online",
      "toml validator",
    ],
  },
  sections: [
    {
      title: "What is TOML?",
      content:
        "TOML (Tom's Obvious Minimal Language) is a configuration file format that is easy to read due to its clear semantics. It is commonly used in Rust projects (Cargo.toml), Python (pyproject.toml), and many other applications. JSON (JavaScript Object Notation) is a widely-used data interchange format.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            TOML to JSON conversion parses TOML syntax including tables, arrays, and inline tables into a JavaScript object, then serializes it to JSON. JSON to TOML reverses this process, converting JSON objects into TOML sections and key-value pairs. The converter preserves data types like strings, integers, floats, booleans, dates, and arrays.
          </p>

          <h4 className="text-base font-semibold mb-2">TOML Syntax Basics</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>[section] - Creates a table (object)</li>
            <li>key = "value" - String assignment</li>
            <li>key = 123 - Integer assignment</li>
            <li>key = true - Boolean assignment</li>
            <li>array = [1, 2, 3] - Array assignment</li>
            <li>[[array.of.tables]] - Array of tables</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm">
            Convert Cargo.toml or pyproject.toml to JSON for programmatic access, or convert JSON configuration to TOML for better readability. Useful for build tools, package managers, and configuration management.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple key-value",
      content: 'name = "project" ⇔ {"name":"project"}',
      type: "code",
    },
    {
      title: "Table section",
      content: '[package]\nname = "app" ⇔ {"package":{"name":"app"}}',
      type: "code",
    },
    {
      title: "Array",
      content: 'ports = [8080, 8081] ⇔ {"ports":[8080,8081]}',
      type: "code",
    },
  ],
  codeSnippet: `// npm install @iarna/toml

import TOML from '@iarna/toml';

function tomlToJson(toml: string, pretty: boolean = true): string {
  const parsed = TOML.parse(toml);
  return JSON.stringify(parsed, null, pretty ? 2 : 0);
}

function jsonToToml(json: string): string {
  const parsed = JSON.parse(json);
  return TOML.stringify(parsed);
}

// Example usage
console.log('=== TOML to JSON ===');
const tomlInput = \`
[package]
name = "my-project"
version = "1.0.0"
authors = ["Developer <dev@example.com>"]

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }

[[bin]]
name = "my-app"
path = "src/main.rs"

[[bin]]
name = "my-cli"
path = "src/cli.rs"
\`;

const jsonOutput = tomlToJson(tomlInput);
console.log(jsonOutput);

console.log('\\n=== JSON to TOML ===');
const jsonInput = JSON.stringify({
  title: "My Config",
  database: {
    host: "localhost",
    port: 5432,
    enabled: true
  },
  servers: [
    { name: "alpha", ip: "10.0.0.1" },
    { name: "beta", ip: "10.0.0.2" }
  ]
});

const tomlOutput = jsonToToml(jsonInput);
console.log(tomlOutput);

console.log('\\n=== Cargo.toml Example ===');
const cargoToml = \`
[package]
name = "hello_world"
version = "0.1.0"
edition = "2021"

[dependencies]
rand = "0.8"
\`;

console.log(tomlToJson(cargoToml));

// Output:
// === TOML to JSON ===
// {
//   "package": {
//     "name": "my-project",
//     "version": "1.0.0",
//     "authors": ["Developer <dev@example.com>"]
//   },
//   "dependencies": {
//     "serde": "1.0",
//     "tokio": { "version": "1.0", "features": ["full"] }
//   },
//   "bin": [
//     { "name": "my-app", "path": "src/main.rs" },
//     { "name": "my-cli", "path": "src/cli.rs" }
//   ]
// }
//
// === JSON to TOML ===
// title = "My Config"
//
// [database]
// host = "localhost"
// port = 5432
// enabled = true
//
// [[servers]]
// name = "alpha"
// ip = "10.0.0.1"
//
// [[servers]]
// name = "beta"
// ip = "10.0.0.2"`,
  references: [
    {
      title: "TOML Specification",
      url: "https://toml.io/en/",
    },
    {
      title: "TOML on GitHub",
      url: "https://github.com/toml-lang/toml",
    },
    {
      title: "@iarna/toml",
      url: "https://www.npmjs.com/package/@iarna/toml",
    },
  ],
};
