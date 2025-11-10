"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

// Simple nanoid implementation without external dependencies
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

function generateNanoid(size: number = 21): string {
  let id = "";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);

  for (let i = 0; i < size; i++) {
    id += urlAlphabet[bytes[i] & 63];
  }

  return id;
}

export function NanoidGeneratorTool() {
  const [nanoid, setNanoid] = useState("");
  const [length, setLength] = useState("21");
  const [count, setCount] = useState("1");
  const [nanoids, setNanoids] = useState<string[]>([]);

  const handleGenerate = () => {
    const len = Math.min(Math.max(parseInt(length) || 21, 1), 128);
    const num = Math.min(Math.max(parseInt(count) || 1, 1), 100);

    if (num === 1) {
      const newNanoid = generateNanoid(len);
      setNanoid(newNanoid);
      setNanoids([]);
    } else {
      const newNanoids = Array.from({ length: num }, () => generateNanoid(len));
      setNanoids(newNanoids);
      setNanoid("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Length Input */}
      <div>
        <Label className="mb-2 block text-sm">Length (1-128)</Label>
        <Input
          type="number"
          min="1"
          max="128"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="21"
        />
      </div>

      {/* Count Input */}
      <div>
        <Label className="mb-2 block text-sm">Number of IDs (1-100)</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder="1"
        />
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate Nanoid{parseInt(count) > 1 ? "s" : ""}
      </Button>

      {/* Single Nanoid Output */}
      {nanoid && (
        <Input
          label="Generated Nanoid"
          value={nanoid}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}

      {/* Multiple Nanoids Output */}
      {nanoids.length > 0 && (
        <Textarea
          label={`Generated Nanoids (${nanoids.length})`}
          value={nanoids.join("\n")}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
          rows={Math.min(nanoids.length, 15)}
        />
      )}
    </div>
  );
}

export const nanoidGeneratorConfig: ToolConfig = {
  id: "nanoid-generator",
  name: "Nanoid Generator",
  description: "Generate compact, URL-safe unique IDs",
  category: "generators",
  component: NanoidGeneratorTool,
  seo: {
    keywords: [
      "nanoid",
      "generate nanoid",
      "unique id",
      "url safe id",
      "nanoid generator",
      "compact id generator",
      "short unique id",
      "url friendly id",
      "nanoid online",
      "unique identifier",
    ],
  },
  sections: [
    {
      title: "What is Nanoid?",
      content:
        "Nanoid is a tiny, secure, URL-friendly unique string ID generator. It's smaller and faster than UUID, and uses a larger alphabet than UUID (A-Za-z0-9_-), making it more compact.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Why use Nanoid?</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Small: Only 21 characters by default (vs 36 for UUID)</li>
            <li>Fast: 2x faster than UUID</li>
            <li>Safe: Uses cryptographically strong random API</li>
            <li>Compact: Uses larger alphabet (64 symbols vs 16 for UUID)</li>
            <li>URL-safe: Can be used in URLs without encoding</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Collision Probability</h4>
          <p className="text-sm mb-4">With the default 21 character length, you would need to generate 1 million IDs per second for approximately 4 million years to have a 1% probability of a collision.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Default length (21)",
      content: "V1StGXR8_Z5jdHi6B-myT",
      type: "text",
    },
    {
      title: "Shorter (10)",
      content: "IRFa-VaY2b",
      type: "text",
    },
    {
      title: "Custom length (32)",
      content: "ppBqWA9-TdOtWAFIj1nQH_FI5bw5xM9G",
      type: "text",
    },
  ],
  codeSnippet: `// npm install nanoid

import { nanoid, customAlphabet } from 'nanoid';

// Generate a standard nanoid (21 characters)
function generateNanoid(size: number = 21): string {
  return nanoid(size);
}

// Generate multiple nanoids
function generateMultipleNanoids(count: number, size: number = 21): string[] {
  return Array.from({ length: count }, () => nanoid(size));
}

// Generate nanoid with custom alphabet
function generateCustomNanoid(alphabet: string, size: number): string {
  const customNano = customAlphabet(alphabet, size);
  return customNano();
}

// Common custom alphabets
const ALPHABETS = {
  alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  hex: '0123456789abcdef'
};

// Example usage
console.log('Standard Nanoid (21 chars):');
console.log(generateNanoid());

console.log('\\nShort Nanoid (10 chars):');
console.log(generateNanoid(10));

console.log('\\nLong Nanoid (32 chars):');
console.log(generateNanoid(32));

console.log('\\nMultiple Nanoids (5):');
const nanoids = generateMultipleNanoids(5, 16);
nanoids.forEach((id, index) => {
  console.log(\`  \${index + 1}. \${id}\`);
});

console.log('\\nCustom Nanoid (numeric only, 12 chars):');
console.log(generateCustomNanoid(ALPHABETS.numeric, 12));

console.log('\\nCustom Nanoid (hex, 16 chars):');
console.log(generateCustomNanoid(ALPHABETS.hex, 16));

// Output:
// Standard Nanoid (21 chars):
// V1StGXR8_Z5jdHi6B-myT
//
// Short Nanoid (10 chars):
// IRFa-VaY2b
//
// Long Nanoid (32 chars):
// ppBqWA9-TdOtWAFIj1nQH_FI5bw5xM9G
//
// Multiple Nanoids (5):
//   1. Kx9mP2nQ8rT4vY6z
//   2. B3cD5fG7hJ1k4L8m
//   3. N6pQ9rS2tV5wX8y
//   4. Z1aC4dE7gH0jK3l
//   5. M6nP9qR2sT5uW8x`,
  references: [
    {
      title: "Nanoid - GitHub",
      url: "https://github.com/ai/nanoid",
    },
    {
      title: "Nanoid vs UUID",
      url: "https://zelark.github.io/nano-id-cc/",
    },
  ],
};
