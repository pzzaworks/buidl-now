"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function SqlFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatSql = (sql: string): string => {
    if (!sql.trim()) return "";

    const keywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "AND",
      "OR",
      "ORDER BY",
      "GROUP BY",
      "HAVING",
      "JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "INNER JOIN",
      "OUTER JOIN",
      "ON",
      "AS",
      "INSERT INTO",
      "VALUES",
      "UPDATE",
      "SET",
      "DELETE FROM",
      "CREATE TABLE",
      "DROP TABLE",
      "ALTER TABLE",
      "LIMIT",
      "OFFSET",
      "UNION",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
      "IN",
      "NOT",
      "NULL",
      "IS",
      "LIKE",
      "BETWEEN",
    ];

    // Remove extra whitespace
    let formatted = sql.replace(/\s+/g, " ").trim();

    // Convert keywords to uppercase
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      formatted = formatted.replace(regex, keyword);
    });

    // Add newlines before major keywords
    const majorKeywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "ORDER BY",
      "GROUP BY",
      "HAVING",
      "LEFT JOIN",
      "RIGHT JOIN",
      "INNER JOIN",
      "OUTER JOIN",
      "JOIN",
      "INSERT INTO",
      "UPDATE",
      "DELETE FROM",
      "CREATE TABLE",
      "UNION",
    ];

    majorKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      formatted = formatted.replace(regex, `\n${keyword}`);
    });

    // Add newlines after commas in SELECT clause
    formatted = formatted.replace(/,\s*/g, ",\n  ");

    // Add indentation
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const indentedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return "";

      // Decrease indent for closing items
      if (trimmedLine.match(/^\)/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indented = "  ".repeat(indentLevel) + trimmedLine;

      // Increase indent for opening items
      if (trimmedLine.match(/\($/)) {
        indentLevel++;
      }

      // Add indent for items after SELECT
      if (index > 0 && lines[index - 1].trim().startsWith("SELECT")) {
        return "  " + indented;
      }

      return indented;
    });

    return indentedLines.join("\n").trim();
  };

  const handleFormat = () => {
    if (!input) {
      setOutput("");
      return;
    }
    setOutput(formatSql(input));
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">SQL Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter SQL query to format..."
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleFormat} className="flex-1">
            Format SQL
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <Textarea
          label="Formatted SQL"
          value={output}
          readOnly
          showCopy
          className="bg-[#0f0f0f] font-mono text-sm"
          rows={10}
        />
      )}
    </div>
  );
}

export const sqlFormatterConfig: ToolConfig = {
  id: "sql-formatter",
  name: "SQL Formatter",
  description: "Format and beautify SQL queries with proper indentation",
  category: "formatters",
  component: SqlFormatterTool,
  seo: {
    keywords: [
      "format sql",
      "sql beautifier",
      "sql pretty print",
      "sql formatter online",
      "beautify sql",
      "sql code formatter",
      "sql query formatter",
      "sql indent",
      "sql formatting tool",
      "format sql query",
      "sql prettify",
      "online sql formatter",
    ],
  },
  sections: [
    {
      title: "What is SQL?",
      content:
        "SQL (Structured Query Language) is a standard language for managing and manipulating relational databases. Proper formatting makes SQL queries more readable and easier to maintain.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">Paste your SQL query in the input field and click Format SQL. The tool will uppercase keywords, add proper indentation, and organize the query for better readability.</p>

          <h4 className="text-base font-semibold mb-2">Formatting Features</h4>
          <p className="text-sm">This tool converts keywords to uppercase, adds line breaks before major clauses, indents nested queries, and formats SELECT column lists with proper spacing.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple SELECT query",
      content: "select id, name, email from users where active = true",
      type: "code",
    },
    {
      title: "Query with JOIN",
      content: `select u.name, o.total
from users u
join orders o on u.id = o.user_id`,
      type: "code",
    },
    {
      title: "Complex query",
      content: `select id, name
from users
where status = 'active'
  and created_at > '2024-01-01'
order by name`,
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in string manipulation

function formatSql(sql: string): string {
  if (!sql.trim()) return '';

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
    'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
    'ON', 'AS', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'CREATE TABLE', 'LIMIT', 'UNION', 'CASE',
    'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'NOT', 'NULL', 'IS',
    'LIKE', 'BETWEEN'
  ];

  // Remove extra whitespace
  let formatted = sql.replace(/\\s+/g, ' ').trim();

  // Convert keywords to uppercase
  keywords.forEach((keyword) => {
    const regex = new RegExp(\`\\\\b\${keyword}\\\\b\`, 'gi');
    formatted = formatted.replace(regex, keyword);
  });

  // Add newlines before major keywords
  const majorKeywords = [
    'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN',
    'INSERT INTO', 'UPDATE', 'DELETE FROM', 'UNION'
  ];

  majorKeywords.forEach((keyword) => {
    const regex = new RegExp(\`\\\\b\${keyword}\\\\b\`, 'g');
    formatted = formatted.replace(regex, \`\\n\${keyword}\`);
  });

  // Add newlines after commas
  formatted = formatted.replace(/,\\s*/g, ',\\n  ');

  return formatted.trim();
}

// Example usage
const unformattedSql = 'select id, name, email from users where active = true and created_at > \\'2024-01-01\\' order by name';

console.log('Formatted SQL:');
console.log(formatSql(unformattedSql));

// Output:
// Formatted SQL:
// SELECT id,
//   name,
//   email
// FROM users
// WHERE active = true AND created_at > '2024-01-01'
// ORDER BY name`,
  references: [
    {
      title: "SQL Tutorial - W3Schools",
      url: "https://www.w3schools.com/sql/",
    },
    {
      title: "SQL Style Guide",
      url: "https://www.sqlstyle.guide/",
    },
  ],
};
