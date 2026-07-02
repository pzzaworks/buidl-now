"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function Base64TextTool() {
  const t = useTranslations("toolUI.base64-text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        const encoded = btoa(input);
        setOutput(encoded);
      } else {
        const decoded = atob(input);
        setOutput(decoded);
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
          variant={mode === "encode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("encode");
            setOutput("");
          }}
          className="flex-1"
        >
          {t("encode")}
        </Button>
        <Button
          variant={mode === "decode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("decode");
            setOutput("");
          }}
          className="flex-1"
        >
          {t("decode")}
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          {mode === "encode" ? t("text") : "Base64"}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? t("encodePlaceholder")
              : t("decodePlaceholder")
          }
          rows={8}
          className="text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {mode === "encode" ? t("encode") : t("decode")}
          </Button>
          <Button onClick={handleReset}>
            {t("reset")}
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <Textarea
        label={mode === "encode" ? "Base64" : t("text")}
        value={output}
        readOnly
        showCopy
        className="bg-[var(--color-gray-0)] text-sm"
        rows={8}
      />
    </div>
  );
}

export const base64TextConfig: ToolConfig = {
  id: "base64-text",
  name: "Base64 Text Encoder/Decoder",
  description: "Encode text to Base64 or decode Base64 back to text",
  category: "encoders-decoders",
  component: Base64TextTool,
  seo: {
    keywords: [
      "base64 encoder",
      "base64 decoder",
      "encode base64 online",
      "decode base64 online",
      "base64 converter",
      "text to base64",
      "base64 to text",
      "base64 encoding tool",
      "base64 decoding tool",
      "online base64",
    ],
  },
  sections: [
    {
      title: "What is Base64?",
      content:
        "Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It's commonly used to encode data that needs to be stored or transferred over media designed to deal with text.",
    },
    {
      title: "How does it work?",
      content: (
        <p className="text-sm">
          Base64 converts binary data into text by dividing the input into 6-bit groups and mapping each to one of 64 ASCII characters (A-Z, a-z, 0-9, +, /). Every 3 bytes of input produces 4 characters of output. Padding with '=' characters is added when the input length isn't divisible by 3.
        </p>
      ),
    },
  ],
  examples: [
    {
      title: "Encode simple text",
      content: "Hello, World! → SGVsbG8sIFdvcmxkIQ==",
      type: "code",
    },
    {
      title: "Encode with special characters",
      content: "Build Now → QnVpbGQgTm93",
      type: "code",
    },
    {
      title: "Longer text encoding",
      content: "Base64 encoding → QmFzZTY0IGVuY29kaW5n",
      type: "code",
    },
  ],
  codeSnippet: `// Encode text to Base64
function encodeBase64(text: string): string {
  return Buffer.from(text, 'utf-8').toString('base64');
}

// Decode Base64 to text
function decodeBase64(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// Example usage
const text = "Hello, World!";
const encoded = encodeBase64(text);
console.log(\`Encoded: \${encoded}\`); // SGVsbG8sIFdvcmxkIQ==

const decoded = decodeBase64(encoded);
console.log(\`Decoded: \${decoded}\`); // Hello, World!

// With special characters
const specialText = "Build Now 🚀";
const encodedSpecial = encodeBase64(specialText);
console.log(\`Encoded: \${encodedSpecial}\`); // QnVpbGQgTm93IPCfmoA=`,
  references: [
    {
      title: "MDN Web Docs: Base64",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Base64",
    },
    {
      title: "Wikipedia: Base64",
      url: "https://en.wikipedia.org/wiki/Base64",
    },
  ],
};
