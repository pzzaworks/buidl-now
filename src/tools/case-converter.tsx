"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

export function CaseConverterTool() {
  const [text, setText] = useState("");
  const [conversions, setConversions] = useState({
    uppercase: "",
    lowercase: "",
    titleCase: "",
    camelCase: "",
    pascalCase: "",
    snakeCase: "",
    kebabCase: "",
    constantCase: "",
  });

  useEffect(() => {
    if (!text) {
      setConversions({
        uppercase: "",
        lowercase: "",
        titleCase: "",
        camelCase: "",
        pascalCase: "",
        snakeCase: "",
        kebabCase: "",
        constantCase: "",
      });
      return;
    }

    const uppercase = text.toUpperCase();
    const lowercase = text.toLowerCase();

    // Title Case: Capitalize first letter of each word
    const titleCase = text
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Split text into words (handle spaces, underscores, hyphens, and camelCase)
    const words = text
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
      .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word.toLowerCase());

    // camelCase: first word lowercase, rest capitalized
    const camelCase = words
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");

    // PascalCase: all words capitalized
    const pascalCase = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    // snake_case: lowercase with underscores
    const snakeCase = words.join("_");

    // kebab-case: lowercase with hyphens
    const kebabCase = words.join("-");

    // CONSTANT_CASE: uppercase with underscores
    const constantCase = words.map((w) => w.toUpperCase()).join("_");

    setConversions({
      uppercase,
      lowercase,
      titleCase,
      camelCase,
      pascalCase,
      snakeCase,
      kebabCase,
      constantCase,
    });
  }, [text]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Textarea
          label="Input Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert..."
          className="min-h-[100px]"
        />
      </div>

      {/* Conversions */}
      <div className="space-y-3">
        <div className="text-sm font-medium">Conversions</div>

        <Input
          label="UPPERCASE"
          value={conversions.uppercase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="lowercase"
          value={conversions.lowercase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="Title Case"
          value={conversions.titleCase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="camelCase"
          value={conversions.camelCase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="PascalCase"
          value={conversions.pascalCase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="snake_case"
          value={conversions.snakeCase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="kebab-case"
          value={conversions.kebabCase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />

        <Input
          label="CONSTANT_CASE"
          value={conversions.constantCase}
          readOnly
          showCopy
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}

export const caseConverterConfig: ToolConfig = {
  id: "case-converter",
  name: "Case Converter",
  description: "Convert text between different case formats (camelCase, snake_case, kebab-case, etc.)",
  category: "text",
  component: CaseConverterTool,
  seo: {
    keywords: [
      "case converter",
      "camelCase converter",
      "snake_case converter",
      "kebab-case converter",
      "uppercase converter",
      "lowercase converter",
      "PascalCase converter",
      "title case converter",
      "text case changer",
      "string case converter",
      "convert to camelCase",
      "naming convention converter",
    ],
  },
  sections: [
    {
      title: "What is Case Conversion?",
      content:
        "Case conversion transforms text between different capitalization and word-separation formats. These naming conventions are used across programming languages, with each serving specific purposes in code organization and readability.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            The converter first parses the input by detecting word boundaries (spaces, underscores, hyphens, or camelCase transitions). It then applies the selected format's rules: capitalizing specific letters, adding separators, or removing spaces. Each format follows language-specific conventions.
          </p>

          <h4 className="text-base font-semibold mb-2">Available Formats</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>UPPERCASE - All characters uppercase</li>
            <li>lowercase - All characters lowercase</li>
            <li>Title Case - First letter of each word capitalized</li>
            <li>camelCase - First word lowercase, rest capitalized (no spaces)</li>
            <li>PascalCase - All words capitalized (no spaces)</li>
            <li>snake_case - Lowercase with underscores</li>
            <li>kebab-case - Lowercase with hyphens</li>
            <li>CONSTANT_CASE - Uppercase with underscores</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>camelCase: JavaScript variables and functions</li>
            <li>PascalCase: Class names, React components</li>
            <li>snake_case: Python variables, database columns</li>
            <li>kebab-case: CSS classes, URLs</li>
            <li>CONSTANT_CASE: Environment variables, constants</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Example: hello world",
      content: "camelCase: helloWorld, snake_case: hello_world, kebab-case: hello-world",
      type: "text",
    },
    {
      title: "Example: user profile data",
      content: "camelCase: userProfileData, PascalCase: UserProfileData, CONSTANT_CASE: USER_PROFILE_DATA",
      type: "code",
    },
  ],
  codeSnippet: `type CaseConversions = {
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
};

function convertCase(text: string): CaseConversions {
  // Split text into words (handle spaces, underscores, hyphens, and camelCase)
  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .split(/\\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.toLowerCase());

  // camelCase: first word lowercase, rest capitalized
  const camelCase = words
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');

  // PascalCase: all words capitalized
  const pascalCase = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // snake_case: lowercase with underscores
  const snakeCase = words.join('_');

  // kebab-case: lowercase with hyphens
  const kebabCase = words.join('-');

  // CONSTANT_CASE: uppercase with underscores
  const constantCase = words.map((w) => w.toUpperCase()).join('_');

  return { camelCase, pascalCase, snakeCase, kebabCase, constantCase };
}

// Example usage
const input = "hello world example";
const conversions = convertCase(input);

console.log(\`camelCase: \${conversions.camelCase}\`);       // helloWorldExample
console.log(\`PascalCase: \${conversions.pascalCase}\`);     // HelloWorldExample
console.log(\`snake_case: \${conversions.snakeCase}\`);      // hello_world_example
console.log(\`kebab-case: \${conversions.kebabCase}\`);      // hello-world-example
console.log(\`CONSTANT_CASE: \${conversions.constantCase}\`); // HELLO_WORLD_EXAMPLE`,
  references: [
    {
      title: "Naming Conventions in Programming",
      url: "https://en.wikipedia.org/wiki/Naming_convention_(programming)",
    },
  ],
};
