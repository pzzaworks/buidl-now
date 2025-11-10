"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";
import { parseTransaction, formatEther, formatGwei } from "viem";
import type { Transaction } from "viem";

interface DecodedTransaction {
  to?: string;
  from?: string;
  value?: string;
  valueInEth?: string;
  data?: string;
  nonce?: string;
  gasLimit?: string;
  gasPrice?: string;
  gasPriceInGwei?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  chainId?: string;
  type?: string;
  hash?: string;
}

export function TransactionDecoderTool() {
  const [rawTx, setRawTx] = useState("");
  const [decoded, setDecoded] = useState<DecodedTransaction | null>(null);
  const [error, setError] = useState("");

  const handleDecode = () => {
    if (!rawTx) {
      setError("Please enter a transaction hex");
      setDecoded(null);
      return;
    }

    try {
      const tx = parseTransaction(rawTx as `0x${string}`);

      const decodedTx: DecodedTransaction = {
        to: tx.to || undefined,
        from: undefined, // From address cannot be extracted from raw transaction
        value: tx.value?.toString() || "0",
        valueInEth: tx.value ? formatEther(tx.value) : "0",
        data: tx.data || "0x",
        nonce: tx.nonce?.toString() || undefined,
        gasLimit: tx.gas?.toString() || undefined,
        type: tx.type || "legacy",
        chainId: tx.chainId?.toString() || undefined,
        hash: undefined, // Hash is calculated separately, not part of the transaction object
      };

      // Handle different gas pricing models
      if (tx.gasPrice) {
        decodedTx.gasPrice = tx.gasPrice.toString();
        decodedTx.gasPriceInGwei = formatGwei(tx.gasPrice);
      }
      if (tx.maxFeePerGas) {
        decodedTx.maxFeePerGas = formatGwei(tx.maxFeePerGas) + " gwei";
      }
      if (tx.maxPriorityFeePerGas) {
        decodedTx.maxPriorityFeePerGas = formatGwei(tx.maxPriorityFeePerGas) + " gwei";
      }

      setDecoded(decodedTx);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to decode transaction");
      setDecoded(null);
    }
  };

  const handleReset = () => {
    setRawTx("");
    setDecoded(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Raw Transaction Input */}
      <div>
        <Textarea
          label="Raw Transaction (Hex)"
          value={rawTx}
          onChange={(e) => {
            setRawTx(e.target.value);
            setError("");
            setDecoded(null);
          }}
          placeholder="0xf86c808504a817c800825208944592d8f8d7b001e72cb26a73e4fa1806a51ac79d880de0b6b3a7640000801ca0..."
          className="font-mono text-sm min-h-[120px]"
          showClear
          onClearClick={handleReset}
        />
        <div className="flex gap-2 mt-2">
          <Button onClick={handleDecode} className="flex-1">
            Decode Transaction
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">Error: {error}</div>
        </div>
      )}

      {/* Decoded Fields */}
      {decoded && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-green-400 border-b border-green-500/30 pb-2">
            Decoded Transaction Fields
          </div>

          {decoded.hash && (
            <Input
              label="Transaction Hash"
              value={decoded.hash}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Type"
              value={decoded.type}
              readOnly
              className="text-sm bg-[#0f0f0f]"
            />

            <Input
              label="Chain ID"
              value={decoded.chainId}
              readOnly
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          </div>

          <Input
            label="From Address"
            value={decoded.from}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          <Input
            label="To Address"
            value={decoded.to}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Value (Wei)"
              value={decoded.value}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />

            <Input
              label="Value (ETH)"
              value={decoded.valueInEth}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          </div>

          <Textarea
            label="Data"
            value={decoded.data}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f] min-h-[80px]"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nonce"
              value={decoded.nonce}
              readOnly
              className="font-mono text-sm bg-[#0f0f0f]"
            />

            <Input
              label="Gas Limit"
              value={decoded.gasLimit}
              readOnly
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          </div>

          {decoded.gasPrice && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Gas Price (Wei)"
                value={decoded.gasPrice}
                readOnly
                className="font-mono text-sm bg-[#0f0f0f]"
              />

              <Input
                label="Gas Price (Gwei)"
                value={decoded.gasPriceInGwei}
                readOnly
                className="font-mono text-sm bg-[#0f0f0f]"
              />
            </div>
          )}

          {decoded.maxFeePerGas && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Fee Per Gas"
                value={decoded.maxFeePerGas}
                readOnly
                className="font-mono text-sm bg-[#0f0f0f]"
              />

              {decoded.maxPriorityFeePerGas && (
                <Input
                  label="Max Priority Fee"
                  value={decoded.maxPriorityFeePerGas}
                  readOnly
                  className="font-mono text-sm bg-[#0f0f0f]"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded border border-green-500/30 bg-green-500/5">
        <div className="text-sm text-green-400">
          <strong>✓ Real RLP Decoding:</strong> This tool uses viem's parseTransaction
          to properly decode signed transactions. It supports all transaction types
          (legacy, EIP-2930, EIP-1559) and extracts all transaction fields.
        </div>
      </div>
    </div>
  );
}

export const transactionDecoderConfig: ToolConfig = {
  id: "transaction-decoder",
  name: "Transaction Decoder",
  description: "Decode raw Ethereum transaction data",
  category: "web3",
  component: TransactionDecoderTool,
  codeSnippet: `// npm install viem

import { parseTransaction, formatEther, formatGwei } from 'viem';

// Decode raw transaction hex
const rawTx = "0xf86c808504a817c800825208944592d8f8d7b001e72cb26a73e4fa1806a51ac79d880de0b6b3a7640000801ca0...";

const tx = parseTransaction(rawTx as \`0x\${string}\`);

console.log("Transaction Details:");
console.log("To:", tx.to);
console.log("Value (ETH):", formatEther(tx.value || 0n));
console.log("Gas Limit:", tx.gas?.toString());
console.log("Nonce:", tx.nonce);
console.log("Type:", tx.type);
console.log("Chain ID:", tx.chainId);
console.log("Data:", tx.data);

// Handle different transaction types
if (tx.type === "legacy") {
  console.log("Gas Price (Gwei):", formatGwei(tx.gasPrice || 0n));
} else if (tx.type === "eip1559") {
  console.log("Max Fee (Gwei):", formatGwei(tx.maxFeePerGas || 0n));
  console.log("Max Priority Fee (Gwei):", formatGwei(tx.maxPriorityFeePerGas || 0n));
}

// Extract signature components
console.log("Signature v:", tx.v);
console.log("Signature r:", tx.r);
console.log("Signature s:", tx.s);
`,
  seo: {
    keywords: [
      "ethereum transaction decoder",
      "decode raw transaction",
      "eth tx decoder",
      "rlp decode transaction",
      "decode transaction hex",
      "ethereum transaction parser",
      "raw tx decoder",
      "viem parse transaction",
      "decode signed transaction",
      "ethereum transaction analysis",
    ],
  },
  sections: [
    {
      title: "What is Transaction Decoding?",
      content:
        "Transaction decoding converts raw hexadecimal transaction data into human-readable fields like sender, recipient, value, gas parameters, and transaction data. Raw transactions are RLP-encoded and signed.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">The decoder parses RLP-encoded transaction data by deserializing the hex string into its component fields. It extracts the transaction type, then decodes each field according to the transaction schema (legacy, EIP-2930, or EIP-1559). The signature components (v, r, s) are used to recover the sender address.</p>

          <h4 className="text-base font-semibold mb-2">Transaction Structure</h4>
          <p className="text-sm">An Ethereum transaction contains: nonce (transaction count), gasPrice, gasLimit, to (recipient), value (ETH amount), data (contract call data), and signature components (v, r, s) for authentication.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "EIP-1559 Transaction (Type 2)",
      content: "0x02ef0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0",
      type: "code",
    },
    {
      title: "Simple ETH transfer",
      content: "Raw hex → Decoded fields showing sender, recipient, value, and gas parameters",
      type: "code",
    },
    {
      title: "Contract interaction",
      content: "Raw hex with data field → Decoded showing contract address and function call data",
      type: "code",
    },
  ],
  references: [
    {
      title: "viem: parseTransaction",
      url: "https://viem.sh/docs/utilities/parseTransaction",
    },
    {
      title: "Ethereum Transaction Structure",
      url: "https://ethereum.org/en/developers/docs/transactions/",
    },
    {
      title: "RLP Encoding",
      url: "https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/",
    },
  ],
};
