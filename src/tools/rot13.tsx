"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function Rot13Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const rot13 = (text: string): string => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= "Z" ? 65 : 97;
      return String.fromCharCode(
        ((char.charCodeAt(0) - start + 13) % 26) + start
      );
    });
  };

  const handleConvert = () => {
    if (!input) {
      setOutput("");
      return;
    }
    setOutput(rot13(input));
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">Input Text</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode/decode with ROT13..."
          rows={8}
          className="text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert (ROT13)
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <Textarea
          label="ROT13 Output"
          value={output}
          readOnly
          showCopy
          className="bg-[#0f0f0f] text-sm"
          rows={8}
        />
      )}
    </div>
  );
}

export const rot13Config: ToolConfig = {
  id: "rot13",
  name: "ROT13 Cipher",
  description: "Encode and decode text using the ROT13 Caesar cipher",
  category: "encoders-decoders",
  component: Rot13Tool,
  seo: {
    keywords: [
      "rot13 cipher",
      "caesar cipher",
      "rot13 decoder",
      "rotate 13",
      "rot13 encoder",
      "rot13 converter",
      "rot13 online",
      "caesar cipher decoder",
      "rot13 encryption",
      "letter substitution cipher",
      "rot13 translate",
      "rotate by 13 places",
    ],
  },
  sections: [
    {
      title: "What is ROT13?",
      content:
        "ROT13 (rotate by 13 places) is a simple letter substitution cipher that replaces each letter with the letter 13 positions after it in the alphabet. Since there are 26 letters, applying ROT13 twice returns the original text, making it a self-inverse cipher.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Using This Tool</h4>
          <p className="text-sm mb-4">Enter any text in the input field and click Convert. The same operation both encodes and decodes text. Non-alphabetic characters (numbers, punctuation, spaces) remain unchanged.</p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm mb-4">ROT13 is commonly used to obscure spoilers, puzzle solutions, or potentially offensive content in online forums. It's not secure encryption - just simple obfuscation.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple text",
      content: "Hello World → Uryyb Jbeyq",
      type: "code",
    },
    {
      title: "With numbers and symbols",
      content: "Test123! → Grfg123!",
      type: "code",
    },
    {
      title: "Double conversion returns original",
      content: "ABC → NOP → ABC",
      type: "code",
    },
  ],
  codeSnippet: `// ROT13 cipher - self-inverse encryption/decryption
function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(
      ((char.charCodeAt(0) - start + 13) % 26) + start
    );
  });
}

// Example usage
const original = "Hello World";
const encoded = rot13(original);
console.log(\`Original: \${original}\`);  // Hello World
console.log(\`Encoded: \${encoded}\`);    // Uryyb Jbeyq

// ROT13 is self-inverse: applying it twice returns the original
const decoded = rot13(encoded);
console.log(\`Decoded: \${decoded}\`);    // Hello World

// Non-alphabetic characters remain unchanged
const withNumbers = "Test123!";
console.log(rot13(withNumbers));        // Grfg123!`,
  references: [
    {
      title: "Wikipedia: ROT13",
      url: "https://en.wikipedia.org/wiki/ROT13",
    },
    {
      title: "Wikipedia: Caesar Cipher",
      url: "https://en.wikipedia.org/wiki/Caesar_cipher",
    },
  ],
};
