"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function UrlEncoderTool() {
  const [decoded, setDecoded] = useState("");
  const [encoded, setEncoded] = useState("");

  const handleEncode = () => {
    if (!decoded) {
      setEncoded("");
      return;
    }

    try {
      const result = encodeURIComponent(decoded);
      setEncoded(result);
    } catch (e) {
      setEncoded("");
    }
  };

  const handleDecode = () => {
    if (!encoded) {
      setDecoded("");
      return;
    }

    try {
      const result = decodeURIComponent(encoded);
      setDecoded(result);
    } catch (e) {
      setDecoded("");
    }
  };

  const handleReset = () => {
    setDecoded("");
    setEncoded("");
  };

  return (
    <div className="space-y-6">
      {/* Decoded */}
      <div>
        <Label className="mb-2 block text-sm">Decoded Text</Label>
        <Textarea
          value={decoded}
          onChange={(e) => setDecoded(e.target.value)}
          placeholder="Hello World! How are you?"
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
        <Label className="mb-2 block text-sm">URL Encoded Text</Label>
        <Textarea
          value={encoded}
          onChange={(e) => setEncoded(e.target.value)}
          placeholder="Hello%20World!%20How%20are%20you%3F"
          className="font-mono min-h-[120px]"
        />
      </div>
    </div>
  );
}

export const urlEncoderConfig: ToolConfig = {
  id: "url-encoder",
  name: "URL Encoder/Decoder",
  description: "Encode and decode URL components",
  category: "encoders-decoders",
  component: UrlEncoderTool,
  seo: {
    keywords: [
      "url encode",
      "url decode",
      "percent encoding",
      "uri encoder",
      "escape url",
      "url encoder online",
      "encode url parameters",
      "decode url string",
      "percent encode",
      "url encoding tool",
      "encodeURIComponent",
      "decodeURIComponent",
    ],
  },
  sections: [
    {
      title: "What is URL Encoding?",
      content:
        "URL encoding converts characters into a format that can be transmitted over the Internet. Special characters are replaced with a '%' followed by two hexadecimal digits.",
    },
    {
      title: "How does it work?",
      content:
        "Use URL encoding when you need to include special characters in URL query parameters or when building URLs programmatically. Common use cases include encoding spaces, special characters, and non-ASCII characters.",
    },
  ],
  examples: [
    {
      title: "Space encoding",
      content: "Hello World → Hello%20World",
      type: "code",
    },
    {
      title: "Special characters",
      content: "user@example.com → user%40example.com",
      type: "code",
    },
    {
      title: "Query parameters",
      content: "name=John Doe&age=25 → name%3DJohn%20Doe%26age%3D25",
      type: "code",
    },
  ],
  codeSnippet: `// Encode URL component (replaces special characters with percent-encoded values)
function encodeUrl(text: string): string {
  return encodeURIComponent(text);
}

// Decode URL component
function decodeUrl(encodedText: string): string {
  return decodeURIComponent(encodedText);
}

// Example usage
const url = "Hello World! How are you?";
const encoded = encodeUrl(url);
console.log(\`Original: \${url}\`);
console.log(\`Encoded: \${encoded}\`);
// Output: Hello%20World!%20How%20are%20you%3F

const decoded = decodeUrl(encoded);
console.log(\`Decoded: \${decoded}\`);
// Output: Hello World! How are you?

// Building query parameters
const params = {
  name: "John Doe",
  email: "user@example.com",
  message: "Hello & welcome!"
};

const queryString = Object.entries(params)
  .map(([key, value]) => \`\${encodeUrl(key)}=\${encodeUrl(value)}\`)
  .join('&');

console.log(\`Query string: \${queryString}\`);
// Output: name=John%20Doe&email=user%40example.com&message=Hello%20%26%20welcome!`,
  references: [
    {
      title: "Percent-encoding - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Percent-encoding",
    },
    {
      title: "MDN: encodeURIComponent",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent",
    },
  ],
};
