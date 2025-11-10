"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { keccak256, toBytes, toEventSignature } from "viem";
import { ToolConfig } from "@/types/tool";

export function EventTopicTool() {
  const [eventSig, setEventSig] = useState("");
  const [topic, setTopic] = useState("");

  const calculateTopic = (signature: string) => {
    if (!signature) {
      setTopic("");
      return;
    }

    try {
      const cleanSig = signature.trim();
      if (!cleanSig.includes("(") || !cleanSig.includes(")")) {
        setTopic("");
        return;
      }

      const hash = keccak256(toBytes(cleanSig));
      setTopic(hash);
    } catch (e) {
      setTopic("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEventSig(value);
    calculateTopic(value);
  };

  const handleReset = () => {
    setEventSig("");
    setTopic("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">Event Signature</Label>
        <Input
          value={eventSig}
          onChange={handleInputChange}
          placeholder="Transfer(address,address,uint256)"
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={() => calculateTopic(eventSig)} className="flex-1">
            Calculate
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <Input
        label="Event Topic (Topic0 - 32 bytes)"
        value={topic}
        readOnly
        showCopy
        className="font-mono text-sm bg-[#0f0f0f]"
      />
    </div>
  );
}

export const eventTopicConfig: ToolConfig = {
  id: "event-topic",
  name: "Event Topic Calculator",
  description: "Calculate event signature hashes (topic0) for Solidity events",
  category: "web3",
  component: EventTopicTool,
  seo: {
    keywords: [
      "event topic",
      "solidity event",
      "event signature",
      "topic0",
      "ethereum event hash",
      "event hash calculator",
      "smart contract events",
      "log topics",
    ],
  },
  sections: [
    {
      title: "What are Event Topics?",
      content:
        "In Ethereum, events are stored in transaction logs. The first topic (topic0) is always the keccak256 hash of the event signature. This is used to filter and identify specific events.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Event Signature Format</h4>
          <p className="text-sm">
            Event signatures follow the format: EventName(type1,type2,...). Note that parameter names are omitted, only types are included. For example: Transfer(address,address,uint256)
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "ERC-20 Transfer event",
      content: `Transfer(address,address,uint256)
→ 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`,
      type: "code",
    },
    {
      title: "ERC-20 Approval event",
      content: `Approval(address,address,uint256)
→ 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925`,
      type: "code",
    },
    {
      title: "ERC-721 Transfer event",
      content: `Transfer(address,address,uint256)
→ 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { keccak256, toBytes, toEventSignature } from 'viem';

// Calculate event topic (Topic0) from event signature
function getEventTopic(eventSignature: string): string {
  // Hash the event signature with keccak256
  const topic = keccak256(toBytes(eventSignature));
  return topic;
}

// Alternative: Use viem's toEventSignature helper
function getEventTopicFromABI(eventName: string, paramTypes: string[]): string {
  // Build event signature
  const signature = \`\${eventName}(\${paramTypes.join(',')})\`;
  return keccak256(toBytes(signature));
}

// Examples
const transferTopic = getEventTopic('Transfer(address,address,uint256)');
console.log('Transfer event topic:', transferTopic);
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

const approvalTopic = getEventTopic('Approval(address,address,uint256)');
console.log('Approval event topic:', approvalTopic);
// 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925

// Using the helper function
const swapTopic = getEventTopicFromABI('Swap', [
  'address',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
  'address'
]);
console.log('Uniswap Swap event topic:', swapTopic);

// Filter logs by event topic
// const logs = await publicClient.getLogs({
//   address: '0x...',
//   event: {
//     type: 'event',
//     name: 'Transfer',
//     inputs: [
//       { type: 'address', indexed: true, name: 'from' },
//       { type: 'address', indexed: true, name: 'to' },
//       { type: 'uint256', indexed: false, name: 'value' }
//     ]
//   },
//   fromBlock: 'earliest',
//   toBlock: 'latest'
// });`,
  references: [
    {
      title: "Solidity Events Documentation",
      url: "https://docs.soliditylang.org/en/latest/contracts.html#events",
    },
    {
      title: "Understanding Event Logs",
      url: "https://ethereum.org/en/developers/docs/smart-contracts/anatomy/#events-and-logs",
    },
  ],
};
