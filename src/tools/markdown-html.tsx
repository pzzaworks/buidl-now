"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { MdSwapVert } from "react-icons/md";
import { marked } from "marked";
import TurndownService from "turndown";

// Initialize turndown service
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});

export function MarkdownHtmlTool() {
  const t = useTranslations("toolUI.markdown-html");
  const [markdownInput, setMarkdownInput] = useState("");
  const [htmlInput, setHtmlInput] = useState("");
  const [error, setError] = useState("");
  const [lastEdited, setLastEdited] = useState<"markdown" | "html" | null>(null);

  // Auto-convert when Markdown input changes
  useEffect(() => {
    if (lastEdited === "markdown" && markdownInput) {
      try {
        const html = marked.parse(markdownInput, { async: false }) as string;
        setHtmlInput(html);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("invalidMarkdown"));
      }
    }
  }, [markdownInput, lastEdited]);

  // Auto-convert when HTML input changes
  useEffect(() => {
    if (lastEdited === "html" && htmlInput) {
      try {
        const markdown = turndownService.turndown(htmlInput);
        setMarkdownInput(markdown);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("invalidHtml"));
      }
    }
  }, [htmlInput, lastEdited]);

  const handleSwap = () => {
    const tempMarkdown = markdownInput;
    const tempHtml = htmlInput;
    setMarkdownInput(tempHtml);
    setHtmlInput(tempMarkdown);
    setLastEdited(null);
  };

  return (
    <div className="space-y-4">
      {/* Markdown Input */}
      <Textarea
        label="Markdown"
        value={markdownInput}
        onChange={(e) => {
          setMarkdownInput(e.target.value);
          setLastEdited("markdown");
        }}
        placeholder="# Hello World&#10;&#10;This is **bold** and this is *italic*."
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

      {/* HTML Input */}
      <Textarea
        label="HTML"
        value={htmlInput}
        onChange={(e) => {
          setHtmlInput(e.target.value);
          setLastEdited("html");
        }}
        placeholder="<h1>Hello World</h1>&#10;<p>This is <strong>bold</strong> and this is <em>italic</em>.</p>"
        className="font-mono text-sm"
        rows={8}
      />
    </div>
  );
}

export const markdownHtmlConfig: ToolConfig = {
  id: "markdown-html",
  name: "Markdown ⇔ HTML Converter",
  description: "Convert between Markdown and HTML formats",
  category: "converters",
  component: MarkdownHtmlTool,
  seo: {
    keywords: [
      "markdown to html converter",
      "html to markdown",
      "markdown html converter",
      "convert markdown to html",
      "md to html",
      "html to md",
      "markdown parser",
      "markdown renderer",
      "markdown converter online",
      "html to markdown online",
    ],
  },
  sections: [
    {
      title: "What is Markdown?",
      content:
        "Markdown is a lightweight markup language for creating formatted text using a plain-text editor. It was created by John Gruber in 2004 and is widely used for documentation, README files, and content writing. HTML (HyperText Markup Language) is the standard markup language for web pages.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Markdown to HTML conversion parses Markdown syntax (like # for headers, ** for bold) and generates equivalent HTML tags. HTML to Markdown reverses this process, detecting HTML elements and converting them back to Markdown syntax. The converter handles headings, paragraphs, lists, links, images, code blocks, and inline formatting.
          </p>

          <h4 className="text-base font-semibold mb-2">Common Markdown Syntax</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li># Heading 1, ## Heading 2, etc.</li>
            <li>**bold** or __bold__</li>
            <li>*italic* or _italic_</li>
            <li>[Link text](url)</li>
            <li>![Alt text](image-url)</li>
            <li>`inline code` and ```code blocks```</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm">
            Convert Markdown documentation to HTML for web publishing, or convert existing HTML content to Markdown for easier editing. Useful for blog posts, documentation, and content management systems.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Headings",
      content: "# Heading 1\n## Heading 2 ⇔ <h1>Heading 1</h1><h2>Heading 2</h2>",
      type: "code",
    },
    {
      title: "Formatting",
      content: "**bold** and *italic* ⇔ <strong>bold</strong> and <em>italic</em>",
      type: "code",
    },
    {
      title: "Links",
      content: "[Google](https://google.com) ⇔ <a href=\"https://google.com\">Google</a>",
      type: "code",
    },
  ],
  codeSnippet: `// npm install marked turndown
// npm install @types/turndown --save-dev

import { marked } from 'marked';
import TurndownService from 'turndown';

// Initialize Turndown service
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

// Example usage
console.log('=== Markdown to HTML ===');
const markdownInput = \`# Hello World

This is a **bold** statement and this is *italic*.

## Features
- Item 1
- Item 2
- Item 3

\\\`\\\`\\\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\\\`\\\`\\\`

[Visit Google](https://google.com)
\`;

const htmlOutput = markdownToHtml(markdownInput);
console.log(htmlOutput);

console.log('\\n=== HTML to Markdown ===');
const htmlInput = \`<h1>Hello World</h1>
<p>This is a <strong>bold</strong> statement and this is <em>italic</em>.</p>
<h2>Features</h2>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
<a href="https://google.com">Visit Google</a>
\`;

const markdownOutput = htmlToMarkdown(htmlInput);
console.log(markdownOutput);

// Output:
// === Markdown to HTML ===
// <h1>Hello World</h1>
// <p>This is a <strong>bold</strong> statement and this is <em>italic</em>.</p>
// <h2>Features</h2>
// <ul>
// <li>Item 1</li>
// <li>Item 2</li>
// <li>Item 3</li>
// </ul>
// <pre><code class="language-javascript">const greeting = "Hello, World!";
// console.log(greeting);
// </code></pre>
// <p><a href="https://google.com">Visit Google</a></p>
//
// === HTML to Markdown ===
// # Hello World
//
// This is a **bold** statement and this is *italic*.
//
// ## Features
//
// - Item 1
// - Item 2
// - Item 3
//
// [Visit Google](https://google.com)`,
  references: [
    {
      title: "Markdown Guide",
      url: "https://www.markdownguide.org/",
    },
    {
      title: "CommonMark Spec",
      url: "https://commonmark.org/",
    },
    {
      title: "marked.js",
      url: "https://marked.js.org/",
    },
    {
      title: "Turndown",
      url: "https://github.com/mixmark-io/turndown",
    },
  ],
};
