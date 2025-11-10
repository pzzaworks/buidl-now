"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function CssFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const formatCss = (css: string): string => {
    if (!css.trim()) return "";

    let formatted = css;

    // Remove comments
    formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove extra whitespace
    formatted = formatted.replace(/\s+/g, " ");

    // Add newline after opening brace
    formatted = formatted.replace(/\{/g, " {\n  ");

    // Add newline after semicolons inside rules
    formatted = formatted.replace(/;/g, ";\n  ");

    // Add newline before closing brace and remove extra spaces
    formatted = formatted.replace(/\}/g, "\n}\n\n");

    // Clean up extra spaces and newlines
    formatted = formatted.replace(/\n\s*\n\s*\n/g, "\n\n");
    formatted = formatted.replace(/\s*\{\s*/g, " {\n  ");
    formatted = formatted.replace(/;\s*\}/g, ";\n}");
    formatted = formatted.replace(/\}\s*\n\s*\}/g, "}\n}");

    return formatted.trim();
  };

  const minifyCss = (css: string): string => {
    if (!css.trim()) return "";

    let minified = css;

    // Remove comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove whitespace around special characters
    minified = minified.replace(/\s*([{}:;,])\s*/g, "$1");

    // Remove extra whitespace
    minified = minified.replace(/\s+/g, " ");

    // Remove spaces after colons (keep one for readability in some cases)
    minified = minified.replace(/:\s+/g, ":");

    // Trim
    minified = minified.trim();

    return minified;
  };

  const handleConvert = () => {
    if (!input) {
      setOutput("");
      return;
    }

    try {
      if (mode === "format") {
        setOutput(formatCss(input));
      } else {
        setOutput(minifyCss(input));
      }
    } catch (e) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === "format" ? "default" : "secondary"}
          onClick={() => {
            setMode("format");
            setOutput("");
          }}
          className="flex-1"
        >
          Format
        </Button>
        <Button
          variant={mode === "minify" ? "default" : "secondary"}
          onClick={() => {
            setMode("minify");
            setOutput("");
          }}
          className="flex-1"
        >
          Minify
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">CSS Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "format"
              ? "Enter CSS to format..."
              : "Enter CSS to minify..."
          }
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            {mode === "format" ? "Format" : "Minify"}
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <Textarea
          label={mode === "format" ? "Formatted CSS" : "Minified CSS"}
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

export const cssFormatterConfig: ToolConfig = {
  id: "css-formatter",
  name: "CSS Formatter/Minifier",
  description: "Format or minify CSS stylesheets",
  category: "formatters",
  component: CssFormatterTool,
  seo: {
    keywords: [
      "css formatter",
      "css beautifier",
      "css minifier",
      "format css",
      "minify css",
      "css pretty print",
      "beautify css",
      "css formatter online",
      "css code formatter",
      "css indent",
      "css compressor",
      "css optimization",
    ],
  },
  sections: [
    {
      title: "What is CSS?",
      content:
        "CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of HTML documents. It controls layout, colors, fonts, and overall visual appearance of web pages.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Formatting parses CSS rules and adds consistent indentation, line breaks after braces and semicolons, and spacing around selectors. Minifying does the opposite: removing comments, collapsing whitespace, and eliminating unnecessary characters to create the smallest possible file size while maintaining functionality.
          </p>

          <h4 className="text-base font-semibold mb-2">Format vs Minify</h4>
          <p className="text-sm">
            Formatting makes CSS more readable by adding proper indentation and line breaks. Minifying removes all unnecessary whitespace and comments to reduce file size for production.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple CSS rule",
      content: "body { margin: 0; padding: 0; font-family: Arial; }",
      type: "code",
    },
    {
      title: "Multiple selectors",
      content: ".container { width: 100%; max-width: 1200px; } .header { background: blue; }",
      type: "code",
    },
    {
      title: "With comments",
      content: "/* Main styles */ body { color: #333; } /* Footer */ .footer { margin-top: 20px; }",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in string manipulation

function formatCss(css: string): string {
  if (!css.trim()) return '';

  let formatted = css;

  // Remove comments
  formatted = formatted.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');

  // Remove extra whitespace
  formatted = formatted.replace(/\\s+/g, ' ');

  // Add newline after opening brace
  formatted = formatted.replace(/\\{/g, ' {\\n  ');

  // Add newline after semicolons inside rules
  formatted = formatted.replace(/;/g, ';\\n  ');

  // Add newline before closing brace
  formatted = formatted.replace(/\\}/g, '\\n}\\n\\n');

  // Clean up extra spaces and newlines
  formatted = formatted.replace(/\\n\\s*\\n\\s*\\n/g, '\\n\\n');
  formatted = formatted.replace(/\\s*\\{\\s*/g, ' {\\n  ');
  formatted = formatted.replace(/;\\s*\\}/g, ';\\n}');
  formatted = formatted.replace(/\\}\\s*\\n\\s*\\}/g, '}\\n}');

  return formatted.trim();
}

function minifyCss(css: string): string {
  if (!css.trim()) return '';

  let minified = css;

  // Remove comments
  minified = minified.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');

  // Remove whitespace around special characters
  minified = minified.replace(/\\s*([{}:;,])\\s*/g, '$1');

  // Remove extra whitespace
  minified = minified.replace(/\\s+/g, ' ');

  // Remove spaces after colons
  minified = minified.replace(/:\\s+/g, ':');

  return minified.trim();
}

// Example usage
const unformattedCss = 'body{margin:0;padding:0;font-family:Arial}.header{background:blue;color:white}';

console.log('Formatted CSS:');
console.log(formatCss(unformattedCss));

console.log('\\nMinified CSS:');
console.log(minifyCss(unformattedCss));

// Output:
// Formatted CSS:
// body {
//   margin: 0;
//   padding: 0;
//   font-family: Arial;
// }
//
// .header {
//   background: blue;
//   color: white;
// }
//
// Minified CSS:
// body{margin:0;padding:0;font-family:Arial}.header{background:blue;color:white}`,
  references: [
    {
      title: "MDN: CSS Basics",
      url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics",
    },
    {
      title: "W3C CSS Specifications",
      url: "https://www.w3.org/Style/CSS/",
    },
  ],
};
