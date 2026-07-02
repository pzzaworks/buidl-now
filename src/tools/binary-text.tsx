"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdClose } from "react-icons/md";

export function BinaryTextTool() {
  const t = useTranslations("toolUI.binary-text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    try {
      if (mode === "encode") {
        // Text to Binary
        const binary = input
          .split("")
          .map((char) => {
            const bin = char.charCodeAt(0).toString(2);
            return bin.padStart(8, "0");
          })
          .join(" ");
        setOutput(binary);
      } else {
        // Binary to Text
        const binaryStr = input.replace(/\s/g, "");
        if (!/^[01]+$/.test(binaryStr)) {
          setError(t("invalidBinary"));
          setOutput("");
          return;
        }
        if (binaryStr.length % 8 !== 0) {
          setError(t("invalidLength"));
          setOutput("");
          return;
        }

        const text = binaryStr
          .match(/.{8}/g)!
          .map((byte) => String.fromCharCode(parseInt(byte, 2)))
          .join("");
        setOutput(text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("conversionFailed"));
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError("");
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
            setError("");
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
            setError("");
          }}
          className="flex-1"
        >
          {t("decode")}
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          {mode === "encode" ? t("text") : "Binary"}
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

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium flex items-center gap-1"><MdClose className="w-4 h-4" /> {error}</div>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <Textarea
          label={mode === "encode" ? "Binary" : t("text")}
          value={output}
          readOnly
          showCopy
          className="bg-[var(--color-gray-0)] text-sm"
          rows={8}
        />
      )}
    </div>
  );
}

export const binaryTextConfig: ToolConfig = {
  id: "binary-text",
  name: "Binary Encoder/Decoder",
  description: "Encode text to binary or decode binary back to text",
  category: "encoders-decoders",
  component: BinaryTextTool,
  seo: {
    keywords: [
      "binary to text",
      "text to binary",
      "binary converter",
      "ascii to binary",
      "binary decoder",
      "binary encoder",
      "binary translator",
      "convert text to binary",
      "binary code translator",
      "binary to ascii",
      "binary string converter",
      "8 bit binary converter",
    ],
  },
  sections: [
    {
      title: "What is Binary?",
      content:
        "Binary is a base-2 number system that uses only two digits: 0 and 1. In computers, text is stored as binary data where each character is represented by 8 bits (1 byte).",
    },
    {
      title: "How does it work?",
      content: (
        <p className="text-sm">
          Binary encoding converts text characters to their ASCII/Unicode numeric values, then represents each number in base-2 (binary). Each character becomes an 8-bit byte. For example, 'A' has ASCII value 65, which is 01000001 in binary. Decoding reverses this process by converting 8-bit chunks back to characters.
        </p>
      ),
    },
  ],
  examples: [
    {
      title: "Encode simple text",
      content: "Hello → 01001000 01100101 01101100 01101100 01101111",
      type: "code",
    },
    {
      title: "Encode single character",
      content: "A → 01000001",
      type: "code",
    },
    {
      title: "Decode binary",
      content: "01001000 01101001 → Hi",
      type: "code",
    },
  ],
  codeSnippet: `// Encode text to binary
function textToBinary(text: string): string {
  return text
    .split('')
    .map(char => {
      const binary = char.charCodeAt(0).toString(2);
      return binary.padStart(8, '0');
    })
    .join(' ');
}

// Decode binary to text
function binaryToText(binary: string): string {
  const binaryStr = binary.replace(/\\s/g, '');

  if (!/^[01]+$/.test(binaryStr)) {
    throw new Error('Invalid binary string. Only 0 and 1 are allowed.');
  }

  if (binaryStr.length % 8 !== 0) {
    throw new Error('Binary string length must be a multiple of 8.');
  }

  return binaryStr
    .match(/.{8}/g)!
    .map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('');
}

// Example usage
const text = "Hello";
const binary = textToBinary(text);
console.log(\`Text: \${text}\`);
console.log(\`Binary: \${binary}\`);
// Output: 01001000 01100101 01101100 01101100 01101111

const decoded = binaryToText(binary);
console.log(\`Decoded: \${decoded}\`); // Hello`,
  references: [
    {
      title: "Wikipedia: Binary Number",
      url: "https://en.wikipedia.org/wiki/Binary_number",
    },
    {
      title: "MDN: String.charCodeAt()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt",
    },
  ],
};
