"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function HexTextTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        // Text to Hex
        const hex = Array.from(input)
          .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("");
        setOutput(hex);
      } else {
        // Hex to Text
        // Remove any spaces or 0x prefix
        const cleanHex = input.replace(/\s/g, "").replace(/^0x/, "");

        // Validate hex string
        if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
          setOutput("");
          return;
        }

        // Must be even length
        if (cleanHex.length % 2 !== 0) {
          setOutput("");
          return;
        }

        // Convert hex to text
        let text = "";
        for (let i = 0; i < cleanHex.length; i += 2) {
          const hexByte = cleanHex.substr(i, 2);
          const charCode = parseInt(hexByte, 16);
          text += String.fromCharCode(charCode);
        }

        setOutput(text);
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
          variant={mode === "encode" ? "default" : "secondary"}
          onClick={() => {
            setMode("encode");
            setOutput("");
          }}
          className="flex-1"
        >
          Encode (Text → Hex)
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "secondary"}
          onClick={() => {
            setMode("decode");
            setOutput("");
          }}
          className="flex-1"
        >
          Decode (Hex → Text)
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          {mode === "encode" ? "Text Input" : "Hex Input"}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Enter text to encode to hex..."
              : "Enter hex string to decode (e.g., 48656c6c6f or 0x48656c6c6f)..."
          }
          rows={8}
          className="text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            {mode === "encode" ? "Encode to Hex" : "Decode to Text"}
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <Textarea
        label={mode === "encode" ? "Hex Output" : "Text Output"}
        value={output}
        readOnly
        showCopy
        className="bg-[#0f0f0f] text-sm"
        rows={8}
      />
    </div>
  );
}

export const hexTextConfig: ToolConfig = {
  id: "hex-text",
  name: "Hex Encoder/Decoder",
  description: "Convert text to hexadecimal and vice versa",
  category: "encoders-decoders",
  component: HexTextTool,
  seo: {
    keywords: [
      "hex to text",
      "text to hex",
      "hexadecimal converter",
      "hex encoder",
      "hex decoder",
      "ascii to hex",
      "hex to ascii",
      "hexadecimal to text",
      "hex string converter",
      "convert hex to string",
      "hex code converter",
      "hexadecimal encoder online",
    ],
  },
  sections: [
    {
      title: "What is Hexadecimal?",
      content:
        "Hexadecimal (hex) is a base-16 number system that uses 16 symbols: 0-9 and A-F. Each byte (8 bits) can be represented by exactly two hexadecimal digits, making it a compact way to represent binary data.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">How to use this tool?</h4>
          <p className="text-sm mb-4">
            Select Encode mode to convert text to hex, or Decode mode to convert hex back to text. When decoding, you can include or omit the '0x' prefix and spaces - they will be automatically removed.
          </p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Encoding data for blockchain transactions</li>
            <li>Representing binary data in a readable format</li>
            <li>Debugging and analyzing network protocols</li>
            <li>Working with color codes in web development</li>
            <li>Low-level programming and memory inspection</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Encode simple text",
      content: "Hello → 48656c6c6f",
      type: "code",
    },
    {
      title: "Encode with special characters",
      content: "Hello, World! → 48656c6c6f2c20576f726c6421",
      type: "code",
    },
    {
      title: "Decode with 0x prefix",
      content: "0x48656c6c6f → Hello",
      type: "code",
    },
    {
      title: "Decode with spaces",
      content: "48 65 6c 6c 6f → Hello",
      type: "code",
    },
  ],
  codeSnippet: `// Encode text to hexadecimal
function textToHex(text: string): string {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

// Decode hexadecimal to text
function hexToText(hex: string): string {
  // Remove any spaces or 0x prefix
  const cleanHex = hex.replace(/\\s/g, '').replace(/^0x/, '');

  // Validate hex string
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    throw new Error('Invalid hexadecimal string');
  }

  // Must be even length
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hexadecimal string must have even length');
  }

  // Convert hex to text
  let text = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    const hexByte = cleanHex.substr(i, 2);
    const charCode = parseInt(hexByte, 16);
    text += String.fromCharCode(charCode);
  }

  return text;
}

// Example usage
const text = "Hello, World!";
const hex = textToHex(text);
console.log(\`Text: \${text}\`);
console.log(\`Hex: \${hex}\`);
// Output: 48656c6c6f2c20576f726c6421

const decoded = hexToText(hex);
console.log(\`Decoded: \${decoded}\`);
// Output: Hello, World!

// Works with 0x prefix and spaces
console.log(hexToText("0x48656c6c6f"));        // Hello
console.log(hexToText("48 65 6c 6c 6f"));      // Hello`,
  references: [
    {
      title: "Hexadecimal - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Hexadecimal",
    },
    {
      title: "MDN - parseInt() with radix",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt",
    },
    {
      title: "Character Encoding",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Character_encoding",
    },
  ],
};
