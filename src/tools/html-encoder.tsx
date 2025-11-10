"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
};

const reverseHtmlEntities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x2F;": "/",
  "&apos;": "'",
};

export function HtmlEncoderTool() {
  const [decoded, setDecoded] = useState("");
  const [encoded, setEncoded] = useState("");

  const handleEncode = () => {
    if (!decoded) {
      setEncoded("");
      return;
    }

    const result = decoded.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
    setEncoded(result);
  };

  const handleDecode = () => {
    if (!encoded) {
      setDecoded("");
      return;
    }

    let result = encoded;
    Object.entries(reverseHtmlEntities).forEach(([entity, char]) => {
      result = result.replaceAll(entity, char);
    });
    setDecoded(result);
  };

  const handleReset = () => {
    setDecoded("");
    setEncoded("");
  };

  return (
    <div className="space-y-6">
      {/* Decoded */}
      <div>
        <Label className="mb-2 block text-sm">Plain Text</Label>
        <Textarea
          value={decoded}
          onChange={(e) => setDecoded(e.target.value)}
          placeholder='<div class="example">Hello & goodbye</div>'
          className="min-h-[120px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleEncode} className="flex-1">
          Encode
        </Button>
        <Button onClick={handleDecode} className="flex-1 sm:flex-none">
          Decode
        </Button>
        <Button onClick={handleReset} variant="secondary" className="sm:flex-none">
          Reset
        </Button>
      </div>

      {/* Encoded */}
      <div>
        <Label className="mb-2 block text-sm">HTML Encoded Text</Label>
        <Textarea
          value={encoded}
          onChange={(e) => setEncoded(e.target.value)}
          placeholder="&lt;div class=&quot;example&quot;&gt;Hello &amp; goodbye&lt;&#x2F;div&gt;"
          className="font-mono min-h-[120px]"
        />
      </div>
    </div>
  );
}

export const htmlEncoderConfig: ToolConfig = {
  id: "html-encoder",
  name: "HTML Encoder/Decoder",
  description: "Encode and decode HTML entities",
  category: "encoders-decoders",
  component: HtmlEncoderTool,
  seo: {
    keywords: [
      "html entities",
      "encode html",
      "html escape",
      "html special characters",
      "html entity encoder",
      "html decode",
      "escape html characters",
      "html encoder online",
      "html entity decoder",
      "convert html entities",
      "ampersand escape",
      "html character reference",
    ],
  },
  sections: [
    {
      title: "What are HTML Entities?",
      content:
        "HTML entities are used to display reserved characters in HTML. They start with an ampersand (&) and end with a semicolon (;). This prevents the browser from interpreting these characters as HTML code.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Common Entities</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>&amp; → &amp;amp;</li>
            <li>&lt; → &amp;lt;</li>
            <li>&gt; → &amp;gt;</li>
            <li>&quot; → &amp;quot;</li>
            <li>&apos; → &amp;#39;</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Ampersand",
      content: "AT&T → AT&amp;T",
      type: "code",
    },
    {
      title: "HTML tags",
      content: '<div>Hello</div> → &lt;div&gt;Hello&lt;/div&gt;',
      type: "code",
    },
    {
      title: "Quotes",
      content: 'Say "Hello" → Say &quot;Hello&quot;',
      type: "code",
    },
  ],
  codeSnippet: `const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

const reverseHtmlEntities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x2F;': '/',
  '&apos;': "'",
};

// Encode HTML entities
function encodeHtml(input: string): string {
  return input.replace(/[&<>"'\\/]/g, (char) => htmlEntities[char] || char);
}

// Decode HTML entities
function decodeHtml(input: string): string {
  let result = input;
  Object.entries(reverseHtmlEntities).forEach(([entity, char]) => {
    result = result.replaceAll(entity, char);
  });
  return result;
}

// Example usage
const original = '<div class="example">Hello & goodbye</div>';
const encoded = encodeHtml(original);
console.log(\`Original: \${original}\`);
console.log(\`Encoded: \${encoded}\`);
// Output: &lt;div class=&quot;example&quot;&gt;Hello &amp; goodbye&lt;&#x2F;div&gt;

const decoded = decodeHtml(encoded);
console.log(\`Decoded: \${decoded}\`);
// Output: <div class="example">Hello & goodbye</div>`,
  references: [
    {
      title: "HTML Entities - MDN",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Entity",
    },
    {
      title: "HTML Character Entity Reference",
      url: "https://dev.w3.org/html5/html-author/charref",
    },
  ],
};
