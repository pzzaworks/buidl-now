"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { keccak256, toBytes } from "viem";
import { ToolConfig } from "@/types/tool";

export function KeccakHashTool() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"text" | "hex">("text");
  const [hash, setHash] = useState("");

  const calculateHash = (value: string, type: "text" | "hex") => {
    if (!value) {
      setHash("");
      return;
    }

    try {
      let bytesData: Uint8Array;

      if (type === "hex") {
        const cleanHex = value.startsWith("0x") ? value : `0x${value}`;
        bytesData = toBytes(cleanHex as `0x${string}`);
      } else {
        bytesData = toBytes(value);
      }

      const hashResult = keccak256(bytesData);
      setHash(hashResult);
    } catch (e) {
      setHash("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    calculateHash(value, inputType);
  };

  const handleTypeChange = (type: "text" | "hex") => {
    setInputType(type);
    setHash("");
    calculateHash(input, type);
  };

  const handleReset = () => {
    setInput("");
    setHash("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={inputType === "text" ? "default" : "secondary"}
          onClick={() => handleTypeChange("text")}
          className="flex-1"
        >
          Text
        </Button>
        <Button
          variant={inputType === "hex" ? "default" : "secondary"}
          onClick={() => handleTypeChange("hex")}
          className="flex-1"
        >
          Hex
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          Input {inputType === "hex" ? "(Hexadecimal)" : "(Text)"}
        </Label>
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder={
            inputType === "hex"
              ? "Enter hex data (e.g., 0xdeadbeef)..."
              : "Enter text to hash..."
          }
          rows={8}
          className="text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={() => calculateHash(input, inputType)} className="flex-1">
            Hash
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <Input
        label="Keccak-256 Hash"
        value={hash}
        readOnly
        showCopy
        className="font-mono text-sm bg-[#0f0f0f]"
      />
    </div>
  );
}

export const keccakHashConfig: ToolConfig = {
  id: "keccak-hash",
  name: "Keccak-256 Hash",
  description: "Calculate Keccak-256 cryptographic hash (used in Ethereum)",
  category: "web3",
  component: KeccakHashTool,
  codeSnippet: `// npm install viem

import { keccak256, toBytes } from 'viem';

// Hash a text string
const text = "Hello, World!";
const textHash = keccak256(toBytes(text));
console.log(textHash);
// 0xacaf3289d7b601cbd114fb36c4d29c85bbfd5e133f14cb355c3fd8d99367964f

// Hash a function signature (for getting function selector)
const functionSig = "transfer(address,uint256)";
const functionHash = keccak256(toBytes(functionSig));
console.log(functionHash);
// 0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b

// Hash hexadecimal data
const hexData = "0xdeadbeef";
const hexHash = keccak256(toBytes(hexData as \`0x\${string}\`));
console.log(hexHash);
// 0xd4fd4e189132273036449fc9e11198c739161b4c0116a9a2dccdfa1c492006f1
`,
  seo: {
    keywords: [
      "keccak256",
      "keccak hash",
      "sha3",
      "ethereum hash",
      "solidity hash",
      "keccak256 calculator",
      "web3 hash",
      "blockchain hash",
      "crypto hash",
    ],
  },
  sections: [
    {
      title: "What is Keccak-256?",
      content:
        "Keccak-256 is a cryptographic hash function that is part of the SHA-3 family. It is widely used in Ethereum for various purposes including creating addresses, signing transactions, and generating function selectors.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">How is the hash calculated?</h4>
          <p className="text-sm">
            Keccak-256 processes input data through a series of permutation rounds using a sponge construction. The input is absorbed into the state through XOR operations, then transformed through multiple rounds of mixing operations (theta, rho, pi, chi, and iota). Finally, the hash is squeezed out as a 256-bit (32-byte) output. The algorithm ensures that even tiny changes in input produce completely different hash values, making it ideal for cryptographic applications in blockchain technology.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Hash a string",
      content: `Hello, World!
→ 0xacaf3289d7b601cbd114fb36c4d29c85bbfd5e133f14cb355c3fd8d99367964f`,
    },
    {
      title: "Hash a function signature",
      content: `transfer(address,uint256)
→ 0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b`,
    },
    {
      title: "Hash hexadecimal data",
      content: `0xdeadbeef
→ 0xd4fd4e189132273036449fc9e11198c739161b4c0116a9a2dccdfa1c492006f1`,
    },
  ],
  references: [
    {
      title: "Ethereum Keccak-256",
      url: "https://en.wikipedia.org/wiki/SHA-3",
    },
    {
      title: "Viem - keccak256",
      url: "https://viem.sh/docs/utilities/keccak256.html",
    },
  ],
};
