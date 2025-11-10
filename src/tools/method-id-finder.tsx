"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function MethodIdFinderTool() {
  const [methodId, setMethodId] = useState("");
  const [error, setError] = useState("");

  const handleSearch = () => {
    setError("");

    if (!methodId) {
      setError("Please enter a method ID");
      return;
    }

    // Remove 0x prefix if present
    const cleanId = methodId.trim().replace(/^0x/, "");

    // Validate hex format and length (4 bytes = 8 hex characters)
    if (!/^[a-fA-F0-9]{8}$/.test(cleanId)) {
      setError("Invalid method ID format. Must be 4 bytes (8 hex characters)");
      return;
    }

    // Open 4byte.directory in new tab
    const url = `https://www.4byte.directory/signatures/?bytes4_signature=0x${cleanId}`;
    window.open(url, "_blank");
  };

  const handleReset = () => {
    setMethodId("");
    setError("");
  };

  const exampleMethodIds = [
    { id: "0xa9059cbb", name: "transfer(address,uint256)" },
    { id: "0x095ea7b3", name: "approve(address,uint256)" },
    { id: "0x23b872dd", name: "transferFrom(address,address,uint256)" },
  ];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Input
          label="Method ID (4 bytes)"
          value={methodId}
          onChange={(e) => setMethodId(e.target.value)}
          placeholder="0xa9059cbb"
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Enter the first 4 bytes of a function selector to look it up
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1">
          Search on 4byte.directory
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Common Examples</div>
        <div className="space-y-2">
          {exampleMethodIds.map((example) => (
            <Button
              key={example.id}
              variant="outline"
              onClick={() => setMethodId(example.id)}
              className="w-full justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-mono text-sm text-blue-400">{example.id}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {example.name}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
        <div className="text-sm text-blue-400">
          <strong>How it works:</strong> This tool searches the 4byte.directory
          database, which maintains a registry of Ethereum function signatures and
          their corresponding 4-byte method IDs. Click "Search" to open results in a
          new tab.
        </div>
      </div>
    </div>
  );
}

export const methodIdFinderConfig: ToolConfig = {
  id: "method-id-finder",
  name: "Smart Contract Method ID Finder",
  description: "Look up smart contract method signatures by their 4-byte method ID",
  category: "web3",
  component: MethodIdFinderTool,
  codeSnippet: `// npm install viem

import { keccak256, toBytes } from 'viem';

// Get method ID (4-byte selector) from function signature
function getMethodId(signature: string): string {
  const hash = keccak256(toBytes(signature));
  return hash.slice(0, 10); // First 4 bytes (8 hex chars + "0x")
}

// Common ERC-20 function signatures
const transfer = getMethodId("transfer(address,uint256)");
console.log(transfer); // 0xa9059cbb

const approve = getMethodId("approve(address,uint256)");
console.log(approve); // 0x095ea7b3

const transferFrom = getMethodId("transferFrom(address,address,uint256)");
console.log(transferFrom); // 0x23b872dd

// Look up unknown method ID on 4byte.directory
const unknownMethodId = "0xa9059cbb";
const lookupUrl = \`https://www.4byte.directory/api/v1/signatures/?hex_signature=\${unknownMethodId}\`;
// Fetch from API to get human-readable signature
`,
  seo: {
    keywords: [
      "method id lookup",
      "function selector finder",
      "4byte directory",
      "smart contract method",
      "function signature lookup",
      "method id decoder",
      "ethereum function selector",
      "contract method finder",
      "4byte signature",
      "solidity function id",
    ],
  },
  sections: [
    {
      title: "What is a Method ID?",
      content:
        "A method ID (or function selector) is the first 4 bytes of the Keccak-256 hash of a function signature. It's used to identify which function to call in a smart contract transaction.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">4byte.directory</h4>
          <p className="text-sm mb-4">4byte.directory is a community-maintained database of Ethereum function signatures. When you see an unknown method ID in a transaction, you can look it up here to find the human-readable function signature.</p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Identify unknown function calls in transactions</li>
            <li>Reverse-engineer contract interactions</li>
            <li>Understand what a transaction is trying to do</li>
            <li>Verify function signatures match expected values</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "ERC-20 transfer",
      content: "0xa9059cbb → transfer(address,uint256)",
      type: "code",
    },
    {
      title: "ERC-20 approve",
      content: "0x095ea7b3 → approve(address,uint256)",
      type: "code",
    },
    {
      title: "ERC-20 transferFrom",
      content: "0x23b872dd → transferFrom(address,address,uint256)",
      type: "code",
    },
  ],
  references: [
    {
      title: "4byte.directory",
      url: "https://www.4byte.directory/",
    },
    {
      title: "Function Selector Explained",
      url: "https://docs.soliditylang.org/en/latest/abi-spec.html#function-selector",
    },
  ],
};
