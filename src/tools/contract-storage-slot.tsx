"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { keccak256, encodePacked, pad, toHex } from "viem";
import { ToolConfig } from "@/types/tool";

export function ContractStorageSlotTool() {
  const [mappingKey, setMappingKey] = useState("");
  const [slotNumber, setSlotNumber] = useState("");
  const [storageSlot, setStorageSlot] = useState("");
  const [error, setError] = useState("");

  const calculateSlot = () => {
    if (!mappingKey || !slotNumber) {
      setStorageSlot("");
      setError("");
      return;
    }

    try {
      // Parse slot number
      const slot = BigInt(slotNumber);

      // Determine if the key is an address or uint256
      let key: `0x${string}`;

      if (mappingKey.startsWith("0x")) {
        // Hex value - could be address or uint256
        key = mappingKey as `0x${string}`;

        // Pad to 32 bytes if it's an address (20 bytes)
        if (key.length === 42) {
          key = pad(key, { size: 32 }) as `0x${string}`;
        }
      } else {
        // Assume it's a decimal number
        const numKey = BigInt(mappingKey);
        key = pad(toHex(numKey), { size: 32 }) as `0x${string}`;
      }

      // Calculate storage slot: keccak256(key . slot)
      const slotPadded = pad(toHex(slot), { size: 32 }) as `0x${string}`;
      const packed = encodePacked(["bytes32", "bytes32"], [key, slotPadded]);
      const calculatedSlot = keccak256(packed);

      setStorageSlot(calculatedSlot);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
      setStorageSlot("");
    }
  };

  const handleReset = () => {
    setMappingKey("");
    setSlotNumber("");
    setStorageSlot("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">Mapping Key (address or uint256)</Label>
        <Input
          value={mappingKey}
          onChange={(e) => setMappingKey(e.target.value)}
          placeholder="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 or 123"
          className="font-mono text-sm mb-4"
        />

        <Label className="mb-2 block text-sm">Storage Slot Number</Label>
        <Input
          value={slotNumber}
          onChange={(e) => setSlotNumber(e.target.value)}
          placeholder="0"
          className="font-mono text-sm mb-2"
        />

        <div className="flex gap-2">
          <Button onClick={calculateSlot} className="flex-1">
            Calculate
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* Output Section */}
      {storageSlot && (
        <>
          <Input
            label="Storage Slot"
            value={storageSlot}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">How to use with eth_getStorageAt</Label>
            <Code language="javascript">
{`// Using viem
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

const value = await client.getStorageAt({
  address: '0x...', // Contract address
  slot: '${storageSlot}'
});

console.log('Storage value:', value);`}
            </Code>
          </div>
        </>
      )}
    </div>
  );
}

export const contractStorageSlotConfig: ToolConfig = {
  id: "contract-storage-slot",
  name: "Contract Storage Slot Calculator",
  description: "Calculate storage slots for mappings and arrays in Solidity smart contracts",
  category: "web3",
  component: ContractStorageSlotTool,
  seo: {
    keywords: [
      "storage slot calculator",
      "solidity storage layout",
      "ethereum storage slot",
      "mapping storage slot",
      "eth_getStorageAt",
      "contract storage calculator",
      "solidity mapping slot",
      "storage proof calculator",
      "contract storage layout",
      "evm storage slots",
    ],
  },
  sections: [
    {
      title: "What is a storage slot?",
      content:
        "In Ethereum smart contracts, storage is organized into 32-byte slots. Each state variable occupies a specific slot, and mappings use a calculated slot based on the key and base slot number.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            For mappings, the storage slot is calculated as: <code className="text-xs bg-[#0f0f0f] px-1 py-0.5 rounded">keccak256(key . slot)</code>
          </p>
          <p className="text-sm mb-4">
            Where <code className="text-xs bg-[#0f0f0f] px-1 py-0.5 rounded">key</code> is the mapping key (padded to 32 bytes) and <code className="text-xs bg-[#0f0f0f] px-1 py-0.5 rounded">slot</code> is the base slot number of the mapping.
          </p>
          <div className="mb-4">
            <Code language="solidity">
{`// Example: Calculate slot for balances[user]
contract ERC20 {
    mapping(address => uint256) public balances; // slot 0

    function getBalanceSlot(address user) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, uint256(0)));
    }
}`}
            </Code>
          </div>

          <h4 className="text-base font-semibold mb-2">Use cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Reading storage directly with eth_getStorageAt</li>
            <li>Storage proofs for L2 bridges</li>
            <li>Off-chain verification of contract state</li>
            <li>Advanced contract analysis and debugging</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "ERC-20 balance mapping",
      content: `Key: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Slot: 0
→ Storage Slot: 0xfca351f4d96129454cfc8ef7930b638ac71fea35eb69ee3b8d959496beb04a33`,
      type: "code",
    },
    {
      title: "NFT owner mapping (uint256 key)",
      content: `Key: 1 (token ID)
Slot: 2
→ Use for mapping(uint256 => address) ownerOf`,
      type: "code",
    },
    {
      title: "Nested mapping",
      content: "First calculate outer mapping slot, then use result as slot for inner key",
      type: "text",
    },
  ],
  codeSnippet: `// npm install viem

import { keccak256, encodePacked, pad, toHex } from 'viem';

// Calculate storage slot for mapping
function getMappingSlot(key: string, slotNumber: number): string {
  let keyBytes: \`0x\${string}\`;

  // Handle address (20 bytes) or uint256 (32 bytes)
  if (key.startsWith('0x')) {
    keyBytes = key as \`0x\${string}\`;
    // Pad address to 32 bytes if needed
    if (keyBytes.length === 42) {
      keyBytes = pad(keyBytes, { size: 32 }) as \`0x\${string}\`;
    }
  } else {
    // Convert decimal number to bytes32
    const numKey = BigInt(key);
    keyBytes = pad(toHex(numKey), { size: 32 }) as \`0x\${string}\`;
  }

  // Pad slot number to 32 bytes
  const slotBytes = pad(toHex(slotNumber), { size: 32 }) as \`0x\${string}\`;

  // Calculate: keccak256(key . slot)
  const packed = encodePacked(['bytes32', 'bytes32'], [keyBytes, slotBytes]);
  const storageSlot = keccak256(packed);

  return storageSlot;
}

// Example: ERC-20 balances mapping at slot 0
const userAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const balanceSlot = getMappingSlot(userAddress, 0);
console.log('Balance storage slot:', balanceSlot);
// 0xfca351f4d96129454cfc8ef7930b638ac71fea35eb69ee3b8d959496beb04a33

// Example: NFT owner mapping at slot 2
const tokenId = '1';
const ownerSlot = getMappingSlot(tokenId, 2);
console.log('Owner storage slot:', ownerSlot);

// Usage with eth_getStorageAt
// const value = await publicClient.getStorageAt({
//   address: '0x...', // Contract address
//   slot: balanceSlot
// });`,
  references: [
    {
      title: "Ethereum Storage Layout",
      url: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html",
    },
    {
      title: "eth_getStorageAt JSON-RPC",
      url: "https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat",
    },
    {
      title: "viem: getStorageAt",
      url: "https://viem.sh/docs/actions/public/getStorageAt",
    },
  ],
};
