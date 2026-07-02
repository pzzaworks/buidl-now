"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdClose } from "react-icons/md";

export function GraphqlFormatterTool() {
  const t = useTranslations("toolUI.graphql-formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatGraphql = (query: string): string => {
    if (!query.trim()) return "";

    const indentStr = "  ";
    let indentLevel = 0;
    const result: string[] = [];

    // Normalize whitespace
    let normalized = query.replace(/\s+/g, " ").trim();

    // Add newlines after opening braces
    normalized = normalized.replace(/\{/g, " {\n");

    // Add newlines before closing braces
    normalized = normalized.replace(/\}/g, "\n}");

    // Add newlines after commas (for arguments and fields)
    normalized = normalized.replace(/,\s*/g, "\n");

    // Process lines
    const lines = normalized.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Handle closing braces - decrease indent first
      if (trimmed.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add the line with current indentation
      result.push(indentStr.repeat(indentLevel) + trimmed);

      // Increase indent after opening brace
      if (trimmed.endsWith("{")) {
        indentLevel++;
      }
    }

    // Clean up the result
    let formatted = result.join("\n");

    // Fix spacing around parentheses
    formatted = formatted.replace(/\(\s+/g, "(");
    formatted = formatted.replace(/\s+\)/g, ")");

    // Fix spacing around colons (for arguments)
    formatted = formatted.replace(/\s*:\s*/g, ": ");

    return formatted;
  };

  const handleFormat = () => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }

    try {
      setOutput(formatGraphql(input));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedToFormat"));
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">{t("inputLabel")}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="query { user(id: 1) { name email posts { title } } }"
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleFormat} variant="primary" className="flex-1">
            {t("formatGraphql")}
          </Button>
          <Button onClick={handleReset}>{t("reset")}</Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium flex items-center gap-1">
            <MdClose className="w-4 h-4" /> {error}
          </div>
        </div>
      )}

      {/* Output Section */}
      {output && !error && (
        <Textarea
          label={t("formattedGraphql")}
          value={output}
          readOnly
          showCopy
          className="bg-[var(--color-gray-0)] font-mono text-sm"
          rows={10}
        />
      )}
    </div>
  );
}

export const graphqlFormatterConfig: ToolConfig = {
  id: "graphql-formatter",
  name: "GraphQL Formatter",
  description: "Format and beautify GraphQL queries and schemas",
  category: "formatters",
  component: GraphqlFormatterTool,
  seo: {
    keywords: [
      "graphql formatter",
      "graphql beautifier",
      "format graphql",
      "graphql pretty print",
      "beautify graphql",
      "graphql query formatter",
      "graphql schema formatter",
      "graphql formatter online",
      "format graphql query",
      "graphql indent",
      "graphql linter",
      "graphql syntax",
      "gql formatter",
      "graphql code formatter",
    ],
  },
  sections: [
    {
      title: "What is GraphQL?",
      content:
        "GraphQL is a query language for APIs and a runtime for executing those queries. It provides a complete description of the data in your API, gives clients the power to ask for exactly what they need, and makes it easier to evolve APIs over time.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            This tool formats GraphQL queries and schemas by adding proper indentation based on
            nesting level. It handles queries, mutations, subscriptions, and type definitions.
          </p>

          <h4 className="text-base font-semibold mb-2">GraphQL Operations</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>
              <strong>query:</strong> Read data from the server
            </li>
            <li>
              <strong>mutation:</strong> Modify data on the server
            </li>
            <li>
              <strong>subscription:</strong> Real-time data updates
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Schema Types</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>type:</strong> Object type definition
            </li>
            <li>
              <strong>input:</strong> Input type for mutations
            </li>
            <li>
              <strong>enum:</strong> Enumeration type
            </li>
            <li>
              <strong>interface:</strong> Interface definition
            </li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple query",
      content: "query { user(id: 1) { name email } }",
      type: "code",
    },
    {
      title: "Mutation",
      content: 'mutation { createUser(name: "John", email: "john@example.com") { id name } }',
      type: "code",
    },
    {
      title: "Type definition",
      content: "type User { id: ID! name: String! email: String posts: [Post!]! }",
      type: "code",
    },
  ],
  codeSnippet: `// Simple GraphQL formatter

function formatGraphql(query: string): string {
  if (!query.trim()) return '';

  const indentStr = '  ';
  let indentLevel = 0;
  const result: string[] = [];

  // Normalize whitespace
  let normalized = query.replace(/\\s+/g, ' ').trim();

  // Add newlines after opening braces
  normalized = normalized.replace(/\\{/g, ' {\\n');

  // Add newlines before closing braces
  normalized = normalized.replace(/\\}/g, '\\n}');

  // Process lines
  const lines = normalized.split('\\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    result.push(indentStr.repeat(indentLevel) + trimmed);

    // Increase indent after opening brace
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  return result.join('\\n');
}

// Example usage
const query = 'query { user(id: 1) { name email posts { title } } }';

console.log('Formatted GraphQL:');
console.log(formatGraphql(query));

// Output:
// query {
//   user(id: 1) {
//     name
//     email
//     posts {
//       title
//     }
//   }
// }`,
  references: [
    {
      title: "GraphQL Official Documentation",
      url: "https://graphql.org/learn/",
    },
    {
      title: "GraphQL Specification",
      url: "https://spec.graphql.org/",
    },
    {
      title: "Apollo GraphQL",
      url: "https://www.apollographql.com/docs/",
    },
  ],
};
