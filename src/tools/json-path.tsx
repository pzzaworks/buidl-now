"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";
import { MdCheck, MdClose } from "react-icons/md";

export function JsonPathTool() {
  const t = useTranslations("toolUI.json-path");
  const [jsonInput, setJsonInput] = useState("");
  const [pathExpression, setPathExpression] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const evaluatePath = (obj: unknown, path: string): unknown[] => {
    const results: unknown[] = [];

    // Handle root reference
    if (path === "$" || path === "") {
      return [obj];
    }

    // Remove leading $ if present
    let normalizedPath = path.startsWith("$") ? path.slice(1) : path;

    // Handle dot notation at the start
    if (normalizedPath.startsWith(".")) {
      normalizedPath = normalizedPath.slice(1);
    }

    const traverse = (current: unknown, remainingPath: string, accumulated: unknown[]) => {
      if (!remainingPath) {
        accumulated.push(current);
        return;
      }

      // Handle recursive descent (..)
      if (remainingPath.startsWith(".")) {
        const nextPath = remainingPath.slice(1);

        if (current && typeof current === "object") {
          // Try to match at current level
          traverse(current, nextPath, accumulated);

          // Recursively search all children
          if (Array.isArray(current)) {
            current.forEach(item => traverse(item, remainingPath, accumulated));
          } else {
            Object.values(current as Record<string, unknown>).forEach(val =>
              traverse(val, remainingPath, accumulated)
            );
          }
        }
        return;
      }

      // Match property name or array index
      const bracketMatch = remainingPath.match(/^\[([^\]]+)\](.*)/);
      const dotMatch = remainingPath.match(/^([^.[]+)(.*)/);

      if (bracketMatch) {
        const [, key, rest] = bracketMatch;

        // Handle wildcard [*]
        if (key === "*") {
          if (Array.isArray(current)) {
            current.forEach(item => traverse(item, rest, accumulated));
          } else if (current && typeof current === "object") {
            Object.values(current as Record<string, unknown>).forEach(val =>
              traverse(val, rest, accumulated)
            );
          }
          return;
        }

        // Handle array slice [start:end]
        const sliceMatch = key.match(/^(-?\d*):(-?\d*)$/);
        if (sliceMatch && Array.isArray(current)) {
          const [, startStr, endStr] = sliceMatch;
          const start = startStr ? parseInt(startStr) : 0;
          const end = endStr ? parseInt(endStr) : current.length;
          const sliced = current.slice(start, end);
          sliced.forEach(item => traverse(item, rest, accumulated));
          return;
        }

        // Handle numeric index or quoted property
        const cleanKey = key.replace(/^['"]|['"]$/g, "");
        const numKey = parseInt(cleanKey);

        if (Array.isArray(current) && !isNaN(numKey)) {
          const index = numKey < 0 ? current.length + numKey : numKey;
          if (current[index] !== undefined) {
            traverse(current[index], rest, accumulated);
          }
        } else if (current && typeof current === "object") {
          const obj = current as Record<string, unknown>;
          if (obj[cleanKey] !== undefined) {
            traverse(obj[cleanKey], rest, accumulated);
          }
        }
      } else if (dotMatch) {
        const [, key, rest] = dotMatch;

        // Handle wildcard *
        if (key === "*") {
          if (Array.isArray(current)) {
            current.forEach(item => traverse(item, rest.startsWith(".") ? rest.slice(1) : rest, accumulated));
          } else if (current && typeof current === "object") {
            Object.values(current as Record<string, unknown>).forEach(val =>
              traverse(val, rest.startsWith(".") ? rest.slice(1) : rest, accumulated)
            );
          }
          return;
        }

        if (current && typeof current === "object" && !Array.isArray(current)) {
          const obj = current as Record<string, unknown>;
          if (obj[key] !== undefined) {
            const nextPath = rest.startsWith(".") ? rest.slice(1) : rest;
            traverse(obj[key], nextPath, accumulated);
          }
        }
      }
    };

    traverse(obj, normalizedPath, results);
    return results;
  };

  const handleExtract = () => {
    if (!jsonInput) {
      setError(t("errEnterJson"));
      setResult("");
      setMatchCount(null);
      return;
    }

    if (!pathExpression) {
      setError(t("errEnterPath"));
      setResult("");
      setMatchCount(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const matches = evaluatePath(parsed, pathExpression);

      setMatchCount(matches.length);

      if (matches.length === 0) {
        setResult(t("noMatches"));
        setError("");
      } else if (matches.length === 1) {
        setResult(JSON.stringify(matches[0], null, 2));
        setError("");
      } else {
        setResult(JSON.stringify(matches, null, 2));
        setError("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("invalidJson"));
      setResult("");
      setMatchCount(null);
    }
  };

  const handleReset = () => {
    setJsonInput("");
    setPathExpression("");
    setResult("");
    setError("");
    setMatchCount(null);
  };

  return (
    <div className="space-y-6">
      {/* JSON Input */}
      <div>
        <Label className="mb-2 block text-sm">{t("jsonDataLabel")}</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"store":{"books":[{"title":"Book 1","price":10},{"title":"Book 2","price":15}]}}'
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Path Expression */}
      <div>
        <Label className="mb-2 block text-sm">{t("pathLabel")}</Label>
        <Input
          value={pathExpression}
          onChange={(e) => setPathExpression(e.target.value)}
          placeholder="$.store.books[0].title or store.books[*].price"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("examplesLabel")} $.property, $[0], $.array[*], $..recursive, $[0:2]
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleExtract} variant="primary" className="flex-1">
          {t("extract")}
        </Button>
        <Button onClick={handleReset} className="sm:flex-none">
          {t("reset")}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium flex items-center gap-1">
            <MdClose className="w-4 h-4" /> {error}
          </div>
        </div>
      )}

      {/* Match Count */}
      {matchCount !== null && !error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-green-50)] border-green-500/30 text-[var(--color-green-500)]">
          <div className="text-sm font-medium flex items-center gap-1">
            <MdCheck className="w-4 h-4" /> {t("matchesFound", { count: matchCount })}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !error && (
        <Textarea
          label={t("extractedValues")}
          value={result}
          readOnly
          showCopy
          className="font-mono min-h-[150px] bg-[var(--color-gray-0)]"
        />
      )}
    </div>
  );
}

export const jsonPathConfig: ToolConfig = {
  id: "json-path",
  name: "JSON Path Finder",
  description: "Find and extract values from JSON using path expressions",
  category: "utilities",
  component: JsonPathTool,
  seo: {
    keywords: [
      "json path",
      "jsonpath",
      "json query",
      "extract json values",
      "json selector",
      "json path finder",
      "json path tester",
      "json path online",
      "query json",
      "json path expression",
      "jmespath",
      "json xpath",
      "json path evaluator",
      "json data extractor",
      "parse json path",
    ],
  },
  sections: [
    {
      title: "What is JSON Path?",
      content:
        "JSON Path is a query language for JSON, similar to XPath for XML. It allows you to navigate and extract data from JSON documents using path expressions. This tool helps you test and validate your JSON path expressions.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Path Syntax</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">$</code> - Root element</li>
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">.property</code> - Child property</li>
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">[0]</code> - Array index</li>
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">[*]</code> - All elements</li>
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">..</code> - Recursive descent</li>
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">[0:2]</code> - Array slice</li>
            <li><code className="bg-[var(--color-gray-100)] px-1 rounded">[-1]</code> - Last element</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Extract specific fields from API responses</li>
            <li>Query nested data structures</li>
            <li>Test path expressions before using in code</li>
            <li>Debug JSON data extraction</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple property access",
      content: '$.store.name or store.name',
      type: "code",
    },
    {
      title: "Array indexing",
      content: '$.items[0] or $.items[-1] (last item)',
      type: "code",
    },
    {
      title: "Wildcard selection",
      content: '$.books[*].title (all book titles)',
      type: "code",
    },
    {
      title: "Recursive descent",
      content: '$..price (all price fields at any depth)',
      type: "code",
    },
  ],
  codeSnippet: `// Simple JSON Path implementation in TypeScript
// No external dependencies required

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function extractJsonPath(obj: JsonValue, path: string): JsonValue[] {
  const results: JsonValue[] = [];

  // Remove leading $ if present
  let normalizedPath = path.startsWith('$') ? path.slice(1) : path;
  if (normalizedPath.startsWith('.')) {
    normalizedPath = normalizedPath.slice(1);
  }

  function traverse(current: JsonValue, remainingPath: string) {
    if (!remainingPath) {
      results.push(current);
      return;
    }

    // Match property or array access
    const match = remainingPath.match(/^([^.[]+|\\[[^\\]]+\\])(.*)/);
    if (!match) return;

    const [, segment, rest] = match;
    const nextPath = rest.startsWith('.') ? rest.slice(1) : rest;

    // Handle array index [n] or wildcard [*]
    if (segment.startsWith('[')) {
      const key = segment.slice(1, -1);

      if (key === '*') {
        if (Array.isArray(current)) {
          current.forEach(item => traverse(item, nextPath));
        } else if (current && typeof current === 'object') {
          Object.values(current).forEach(val => traverse(val, nextPath));
        }
      } else {
        const index = parseInt(key);
        if (Array.isArray(current) && current[index] !== undefined) {
          traverse(current[index], nextPath);
        }
      }
    } else if (current && typeof current === 'object' && !Array.isArray(current)) {
      if (current[segment] !== undefined) {
        traverse(current[segment], nextPath);
      }
    }
  }

  traverse(obj, normalizedPath);
  return results;
}

// Example usage
const data = {
  store: {
    books: [
      { title: 'Book 1', price: 10 },
      { title: 'Book 2', price: 15 },
      { title: 'Book 3', price: 20 }
    ],
    name: 'My Bookstore'
  }
};

console.log('Store name:', extractJsonPath(data, '$.store.name'));
// Output: ['My Bookstore']

console.log('First book:', extractJsonPath(data, '$.store.books[0]'));
// Output: [{ title: 'Book 1', price: 10 }]

console.log('All titles:', extractJsonPath(data, '$.store.books[*].title'));
// Output: ['Book 1', 'Book 2', 'Book 3']

console.log('All prices:', extractJsonPath(data, '$.store.books[*].price'));
// Output: [10, 15, 20]`,
  references: [
    {
      title: "JSONPath - XPath for JSON",
      url: "https://goessner.net/articles/JsonPath/",
    },
    {
      title: "JSONPath Specification",
      url: "https://www.ietf.org/archive/id/draft-ietf-jsonpath-base-21.html",
    },
    {
      title: "JMESPath",
      url: "https://jmespath.org/",
    },
  ],
};
