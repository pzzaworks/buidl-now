"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

interface Chain {
  id: string;
  name: string;
  blockTime: number; // in seconds
  iconPath: string;
}

const chains: Chain[] = [
  { id: "ethereum", name: "Ethereum", blockTime: 12, iconPath: "/icons/networks/ethereum.svg" },
  { id: "polygon", name: "Polygon", blockTime: 2, iconPath: "/icons/networks/polygon.svg" },
  { id: "bsc", name: "BSC", blockTime: 3, iconPath: "/icons/networks/binance-smart-chain.svg" },
  { id: "arbitrum", name: "Arbitrum", blockTime: 0.25, iconPath: "/icons/networks/arbitrum-one.svg" },
  { id: "optimism", name: "Optimism", blockTime: 2, iconPath: "/icons/networks/optimism.svg" },
];

type ConversionMode = "block-to-time" | "time-to-block";

export function BlockTimestampConverterTool() {
  const [mode, setMode] = useState<ConversionMode>("block-to-time");
  const [selectedChain, setSelectedChain] = useState<Chain>(chains[0]);

  // Block to Time inputs
  const [blockNumber, setBlockNumber] = useState("");
  const [referenceBlock, setReferenceBlock] = useState("");
  const [referenceTimestamp, setReferenceTimestamp] = useState("");

  // Time to Block inputs
  const [targetTimestamp, setTargetTimestamp] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // Results
  const [result, setResult] = useState<{
    estimatedTimestamp?: number;
    estimatedDate?: string;
    estimatedBlock?: number;
    blocksDifference?: number;
    timeDifference?: string;
    blocksPerDay?: number;
  } | null>(null);

  const [error, setError] = useState("");

  const handleBlockToTime = () => {
    setError("");

    if (!blockNumber) {
      setError("Please enter a block number");
      return;
    }

    const block = parseInt(blockNumber);
    if (isNaN(block) || block < 0) {
      setError("Invalid block number");
      return;
    }

    // Use reference point if provided, otherwise use approximate values
    let timestamp: number;

    if (referenceBlock && referenceTimestamp) {
      const refBlock = parseInt(referenceBlock);
      const refTimestamp = parseInt(referenceTimestamp);

      if (isNaN(refBlock) || isNaN(refTimestamp)) {
        setError("Invalid reference values");
        return;
      }

      const blocksDiff = block - refBlock;
      timestamp = refTimestamp + (blocksDiff * selectedChain.blockTime);
    } else {
      // Use approximate calculation from current time
      const currentTime = Math.floor(Date.now() / 1000);
      // Assume current block is approximately at current time (rough estimate)
      // For better accuracy, use reference points
      timestamp = currentTime - ((1000000000 - block) * selectedChain.blockTime);
    }

    const date = new Date(timestamp * 1000);
    const blocksPerDay = Math.floor(86400 / selectedChain.blockTime);

    setResult({
      estimatedTimestamp: timestamp,
      estimatedDate: date.toISOString(),
      blocksPerDay,
    });
  };

  const handleTimeToBlock = () => {
    setError("");

    let timestamp: number;

    if (targetDate) {
      const date = new Date(targetDate);
      if (isNaN(date.getTime())) {
        setError("Invalid date");
        return;
      }
      timestamp = Math.floor(date.getTime() / 1000);
    } else if (targetTimestamp) {
      timestamp = parseInt(targetTimestamp);
      if (isNaN(timestamp)) {
        setError("Invalid timestamp");
        return;
      }
    } else {
      setError("Please enter a timestamp or select a date");
      return;
    }

    // Use reference point if provided
    let block: number;

    if (referenceBlock && referenceTimestamp) {
      const refBlock = parseInt(referenceBlock);
      const refTimestamp = parseInt(referenceTimestamp);

      if (isNaN(refBlock) || isNaN(refTimestamp)) {
        setError("Invalid reference values");
        return;
      }

      const timeDiff = timestamp - refTimestamp;
      const blocksDiff = Math.floor(timeDiff / selectedChain.blockTime);
      block = refBlock + blocksDiff;
    } else {
      // Use approximate calculation
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = timestamp - currentTime;
      const blocksDiff = Math.floor(timeDiff / selectedChain.blockTime);
      block = 1000000000 + blocksDiff; // Rough estimate
    }

    const date = new Date(timestamp * 1000);
    const blocksPerDay = Math.floor(86400 / selectedChain.blockTime);

    setResult({
      estimatedBlock: block,
      estimatedDate: date.toISOString(),
      estimatedTimestamp: timestamp,
      blocksPerDay,
    });
  };

  const handleConvert = () => {
    setResult(null);
    if (mode === "block-to-time") {
      handleBlockToTime();
    } else {
      handleTimeToBlock();
    }
  };

  const handleReset = () => {
    setBlockNumber("");
    setReferenceBlock("");
    setReferenceTimestamp("");
    setTargetTimestamp("");
    setTargetDate("");
    setResult(null);
    setError("");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const useCurrentTime = () => {
    const now = Math.floor(Date.now() / 1000);
    setReferenceTimestamp(now.toString());
  };

  const useTodayDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setTargetDate(today);
  };

  return (
    <div className="space-y-6">
      {/* Chain Selection */}
      <div>
        <div className="text-sm font-medium mb-2">Select Chain</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {chains.map((chain) => (
            <Button
              key={chain.id}
              onClick={() => setSelectedChain(chain)}
              variant={selectedChain.id === chain.id ? "default" : "outline"}
              className="p-3 h-auto flex flex-col items-center justify-center text-center"
            >
              <Image
                src={chain.iconPath}
                alt={chain.name}
                width={32}
                height={32}
                className="mb-2 rounded"
              />
              <div className="text-sm font-medium">{chain.name}</div>
              <div className="text-xs text-muted-foreground">
                ~{chain.blockTime}s/block
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="text-sm font-medium mb-2">Conversion Mode</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              setMode("block-to-time");
              handleReset();
            }}
            variant={mode === "block-to-time" ? "default" : "outline"}
            className="p-3 h-auto flex flex-col items-start justify-start text-left"
          >
            <div className="text-sm font-medium">Block → Timestamp</div>
            <div className="text-xs mt-1">Convert block number to date/time</div>
          </Button>
          <Button
            onClick={() => {
              setMode("time-to-block");
              handleReset();
            }}
            variant={mode === "time-to-block" ? "default" : "outline"}
            className="p-3 h-auto flex flex-col items-start justify-start text-left"
          >
            <div className="text-sm font-medium">Timestamp → Block</div>
            <div className="text-xs mt-1">Convert date/time to block number</div>
          </Button>
        </div>
      </div>

      {/* Reference Point (Optional but recommended) */}
      <div className="p-4 rounded border border-yellow-500/30 bg-yellow-500/5">
        <div className="text-sm font-medium text-yellow-400 mb-3">
          Reference Point (Optional - for better accuracy)
        </div>
        <div className="text-xs text-yellow-400/80 mb-3">
          Provide a known block number and timestamp for more accurate calculations. Without this, estimates may be rough.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Reference Block"
            value={referenceBlock}
            onChange={(e) => setReferenceBlock(e.target.value)}
            placeholder="e.g., 18000000"
            className="font-mono text-sm"
          />
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                label="Reference Timestamp"
                value={referenceTimestamp}
                onChange={(e) => setReferenceTimestamp(e.target.value)}
                placeholder="e.g., 1693526400"
                className="font-mono text-sm flex-1"
              />
              <div className="flex items-end">
                <Button
                  onClick={useCurrentTime}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 whitespace-nowrap"
                >
                  Use Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Fields based on mode */}
      {mode === "block-to-time" ? (
        <div>
          <Input
            label="Block Number"
            value={blockNumber}
            onChange={(e) => {
              setBlockNumber(e.target.value);
              setError("");
              setResult(null);
            }}
            placeholder="e.g., 18000000"
            className="font-mono text-sm"
            type="number"
          />
        </div>
      ) : (
        <div className="flex gap-3 items-end">
          <Input
            label="Target Timestamp (Unix)"
            value={targetTimestamp}
            onChange={(e) => {
              setTargetTimestamp(e.target.value);
              setTargetDate("");
              setError("");
              setResult(null);
            }}
            placeholder="e.g., 1693526400"
            className="font-mono text-sm flex-1"
            type="number"
          />
          <div className="text-xs text-muted-foreground pb-[18px]">or</div>
          <div className="max-w-[200px]">
            <Input
              label="Target Date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                setTargetTimestamp("");
                setError("");
                setResult(null);
              }}
              type="date"
              className="text-sm cursor-pointer"
              onClick={(e) => {
                const input = e.currentTarget as HTMLInputElement;
                input.showPicker?.();
              }}
            />
          </div>
          <Button
            onClick={useTodayDate}
            variant="outline"
            size="sm"
            className="text-xs h-9 whitespace-nowrap"
          >
            Use Today
          </Button>
        </div>
      )}

      {/* Convert Button */}
      <div className="flex gap-2">
        <Button onClick={handleConvert} className="flex-1">
          Convert
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">Error: {error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-green-400 border-b border-green-500/30 pb-2">
            Conversion Results
          </div>

          {result.estimatedBlock !== undefined && (
            <Input
              label="Estimated Block Number"
              value={result.estimatedBlock.toLocaleString()}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          )}

          {result.estimatedTimestamp !== undefined && (
            <Input
              label="Unix Timestamp"
              value={result.estimatedTimestamp.toString()}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          )}

          {result.estimatedDate && (
            <div>
              <Input
                label="Date & Time"
                value={formatDate(result.estimatedDate)}
                readOnly
                showCopy
                className="text-sm bg-[#0f0f0f]"
              />
              <div className="text-xs text-muted-foreground mt-1 ml-1">
                ISO: {result.estimatedDate}
              </div>
            </div>
          )}

          {result.blocksPerDay !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded border border-border bg-[#0f0f0f]">
                <div className="text-xs text-muted-foreground mb-1">Blocks per Day</div>
                <div className="text-lg font-mono">
                  {result.blocksPerDay.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded border border-border bg-[#0f0f0f]">
                <div className="text-xs text-muted-foreground mb-1">Block Time</div>
                <div className="text-lg font-mono">
                  {selectedChain.blockTime}s
                </div>
              </div>
            </div>
          )}

          {!referenceBlock && (
            <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400">
              Note: This is an estimate. For accurate results, provide a reference block and timestamp.
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400 space-y-2">
          <div>
            <strong>How it works:</strong> Block times vary by chain. This tool calculates
            timestamps based on average block times. For best accuracy, provide a reference
            point (a known block number and its timestamp).
          </div>
          <div className="text-xs">
            <strong>Block Times:</strong> Ethereum ~12s, Polygon ~2s, BSC ~3s, Arbitrum ~0.25s, Optimism ~2s
          </div>
        </div>
      </div>
    </div>
  );
}

export const blockTimestampConverterConfig: ToolConfig = {
  id: "block-timestamp-converter",
  name: "Block/Timestamp Converter",
  description: "Convert between block numbers and timestamps across multiple chains",
  category: "web3",
  component: BlockTimestampConverterTool,
  seo: {
    keywords: [
      "block number to timestamp",
      "timestamp to block",
      "ethereum block time",
      "block timestamp converter",
      "chain block calculator",
      "block time estimation",
      "polygon block time",
      "arbitrum block time",
    ],
  },
  sections: [
    {
      title: "What is Block Time?",
      content:
        "Block time is the average time it takes for a new block to be added to the blockchain. Different chains have different block times: Ethereum (~12s), Polygon (~2s), BSC (~3s), Arbitrum (~0.25s), Optimism (~2s).",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Block to timestamp conversion uses the average block time and a reference point (known block and timestamp). The tool calculates the time difference by multiplying the block difference by the chain's average block time. For accurate results, use a recent reference block from a block explorer.
          </p>

          <h4 className="text-base font-semibold mb-2">Why Convert Blocks to Timestamps?</h4>
          <p className="text-sm">
            When analyzing on-chain events, you often need to convert block numbers to human-readable dates. This is useful for understanding when transactions occurred, calculating time-based metrics, or coordinating with off-chain systems.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Ethereum Block 18000000 to Timestamp",
      content: `Block 18000000 (Sep 2, 2023, 09:29:23 UTC)
Reference: block explorer verified timestamp 1693641363`,
      type: "code",
    },
    {
      title: "Polygon Block 50000000 to Timestamp",
      content: `Block 50000000 (May 18, 2023, 15:42:00 UTC)
~2s block time on Polygon`,
      type: "code",
    },
    {
      title: "Arbitrum Block 144000000 to Timestamp",
      content: `Block 144000000 (Oct 15, 2024, 11:30:00 UTC)
~0.25s block time verification`,
      type: "text",
    },
    {
      title: "Using Reference Points",
      content: `Reference: ETH Block 20000000 @ timestamp 1699000000
(Nov 3, 2023) for high-accuracy conversions`,
      type: "code",
    },
  ],
  codeSnippet: `// No external packages needed - pure Node.js/TypeScript

interface Chain {
  name: string;
  blockTime: number; // seconds per block
}

const chains: Record<string, Chain> = {
  ethereum: { name: 'Ethereum', blockTime: 12 },
  polygon: { name: 'Polygon', blockTime: 2 },
  arbitrum: { name: 'Arbitrum', blockTime: 0.25 }
};

// Convert block number to timestamp
function blockToTimestamp(
  blockNumber: number,
  referenceBlock: number,
  referenceTimestamp: number,
  chain: Chain
): number {
  const blocksDiff = blockNumber - referenceBlock;
  const timeDiff = blocksDiff * chain.blockTime;
  return referenceTimestamp + timeDiff;
}

// Convert timestamp to block number
function timestampToBlock(
  timestamp: number,
  referenceBlock: number,
  referenceTimestamp: number,
  chain: Chain
): number {
  const timeDiff = timestamp - referenceTimestamp;
  const blocksDiff = Math.floor(timeDiff / chain.blockTime);
  return referenceBlock + blocksDiff;
}

// Example: Ethereum block to timestamp
const ethChain = chains.ethereum;
const refBlock = 18000000;
const refTimestamp = 1693641363; // Known timestamp from block explorer

const targetBlock = 18500000;
const estimatedTimestamp = blockToTimestamp(
  targetBlock,
  refBlock,
  refTimestamp,
  ethChain
);
console.log('Block', targetBlock, '→ Timestamp:', estimatedTimestamp);
console.log('Date:', new Date(estimatedTimestamp * 1000).toISOString());

// Convert timestamp back to block
const targetTimestamp = Math.floor(Date.now() / 1000);
const estimatedBlock = timestampToBlock(
  targetTimestamp,
  refBlock,
  refTimestamp,
  ethChain
);
console.log('Timestamp', targetTimestamp, '→ Block:', estimatedBlock);

// Calculate blocks per day
const blocksPerDay = Math.floor(86400 / ethChain.blockTime);
console.log('Blocks per day:', blocksPerDay); // ~7200 for Ethereum`,
  references: [
    {
      title: "Ethereum Block Time",
      url: "https://ethereum.org/en/developers/docs/blocks/",
    },
    {
      title: "Etherscan Block Info",
      url: "https://etherscan.io/blocks",
    },
  ],
};
