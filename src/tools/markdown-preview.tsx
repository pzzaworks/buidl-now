"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import MarkdownIt from "markdown-it";

// Initialize markdown-it with GFM-like options
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

export function MarkdownPreviewTool() {
  const t = useTranslations("toolUI.markdown-preview");
  const [input, setInput] = useState("");
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!input.trim()) {
      setHtml("");
      return;
    }

    try {
      const rendered = md.render(input);
      setHtml(rendered);
    } catch {
      setHtml(`<p>${t("errorRendering")}</p>`);
    }
  }, [input, t]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">{t("inputLabel")}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`# Hello World

This is a **bold** text and this is *italic*.

## Features
- Item 1
- Item 2
- Item 3

\`\`\`javascript
const greeting = "Hello!";
console.log(greeting);
\`\`\`

[Visit Example](https://example.com)`}
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      {/* Preview Section */}
      <div>
        <Label className="mb-2 block text-sm">{t("livePreview")}</Label>
        <div
          className="min-h-[200px] p-4 rounded-[12px] border border-[var(--stroke-soft)] bg-[var(--color-gray-0)] prose prose-sm max-w-none dark:prose-invert"
          style={{
            // Custom prose styling for better readability
            lineHeight: "1.7",
          }}
        >
          {html ? (
            <div
              dangerouslySetInnerHTML={{ __html: html }}
              className="markdown-content"
              style={{
                // Override prose defaults for code blocks
                wordBreak: "break-word",
              }}
            />
          ) : (
            <p className="text-[var(--text-soft)] italic">
              {t("emptyPreview")}
            </p>
          )}
        </div>
      </div>

      {/* Raw HTML Output */}
      {html && (
        <Textarea
          label={t("generatedHtml")}
          value={html}
          readOnly
          showCopy
          className="bg-[var(--color-gray-0)] font-mono text-sm"
          rows={8}
        />
      )}

      {/* Styling for markdown content */}
      <style jsx global>{`
        .markdown-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .markdown-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content ul,
        .markdown-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content ul {
          list-style-type: disc;
        }
        .markdown-content ol {
          list-style-type: decimal;
        }
        .markdown-content code {
          background-color: var(--color-gray-100);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, monospace;
        }
        .markdown-content pre {
          background-color: var(--color-gray-100);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .markdown-content blockquote {
          border-left: 4px solid var(--color-gray-200);
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 1rem;
          color: var(--text-soft);
          font-style: italic;
        }
        .markdown-content a {
          color: var(--color-primary-500);
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: var(--color-primary-600);
        }
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .markdown-content th,
        .markdown-content td {
          border: 1px solid var(--color-gray-200);
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-content th {
          background-color: var(--color-gray-50);
          font-weight: 600;
        }
        .markdown-content hr {
          border: none;
          border-top: 1px solid var(--color-gray-200);
          margin: 1.5rem 0;
        }
        .markdown-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .markdown-content strong {
          font-weight: 600;
        }
        .markdown-content em {
          font-style: italic;
        }
        .markdown-content del {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}

export const markdownPreviewConfig: ToolConfig = {
  id: "markdown-preview",
  name: "Markdown Preview",
  description: "Live preview of Markdown content with GitHub Flavored Markdown support",
  category: "formatters",
  component: MarkdownPreviewTool,
  seo: {
    keywords: [
      "markdown preview",
      "markdown editor",
      "markdown viewer",
      "markdown renderer",
      "markdown to html",
      "gfm preview",
      "github markdown",
      "markdown live preview",
      "markdown parser",
      "markdown formatter",
      "readme preview",
      "markdown converter",
      "md preview",
      "markdown online",
    ],
  },
  sections: [
    {
      title: "What is Markdown?",
      content:
        "Markdown is a lightweight markup language for creating formatted text using a plain-text editor. It was created by John Gruber in 2004 and has become the standard for documentation, README files, and content writing in the software industry.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Type Markdown in the input area and see the rendered HTML preview in real-time. The
            tool supports GitHub Flavored Markdown (GFM) features including tables, task lists,
            strikethrough, and fenced code blocks.
          </p>

          <h4 className="text-base font-semibold mb-2">Supported Syntax</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>
              <strong>Headers:</strong> # H1, ## H2, ### H3
            </li>
            <li>
              <strong>Emphasis:</strong> *italic*, **bold**, ~~strikethrough~~
            </li>
            <li>
              <strong>Lists:</strong> - unordered, 1. ordered
            </li>
            <li>
              <strong>Links:</strong> [text](url)
            </li>
            <li>
              <strong>Images:</strong> ![alt](url)
            </li>
            <li>
              <strong>Code:</strong> `inline` or ``` fenced blocks
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">GFM Features</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Tables with | pipe | syntax |</li>
            <li>Task lists with - [ ] and - [x]</li>
            <li>Autolinked URLs</li>
            <li>Fenced code blocks with language hints</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Headers and text",
      content: "# Title\n\nThis is a paragraph with **bold** and *italic* text.",
      type: "code",
    },
    {
      title: "Lists",
      content: "- Item 1\n- Item 2\n  - Nested item\n- Item 3",
      type: "code",
    },
    {
      title: "Code block",
      content: "```javascript\nconst x = 42;\nconsole.log(x);\n```",
      type: "code",
    },
  ],
  codeSnippet: `// Using markdown-it library for Markdown parsing

import MarkdownIt from 'markdown-it';

// Initialize with GFM-like options
const md = new MarkdownIt({
  html: true,        // Enable HTML tags in source
  linkify: true,     // Autoconvert URL-like text to links
  typographer: true, // Enable smartquotes and other typographic replacements
  breaks: true       // Convert \\n to <br>
});

// Basic usage
function renderMarkdown(markdown: string): string {
  return md.render(markdown);
}

// Example
const markdown = \`
# Hello World

This is a **bold** text and *italic* text.

## Features
- Item 1
- Item 2
- Item 3

\\\`\\\`\\\`javascript
const greeting = "Hello!";
console.log(greeting);
\\\`\\\`\\\`

[Visit Example](https://example.com)
\`;

const html = renderMarkdown(markdown);
console.log(html);

// For React components, use dangerouslySetInnerHTML:
// <div dangerouslySetInnerHTML={{ __html: html }} />

// Or use a library like react-markdown for safer rendering`,
  references: [
    {
      title: "Markdown Guide",
      url: "https://www.markdownguide.org/",
    },
    {
      title: "GitHub Flavored Markdown Spec",
      url: "https://github.github.com/gfm/",
    },
    {
      title: "markdown-it Library",
      url: "https://github.com/markdown-it/markdown-it",
    },
  ],
};
