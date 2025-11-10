"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

interface DecodedError {
  selector: string;
  errorName?: string;
  signature?: string;
  decodedMessage?: string;
  rawData?: string;
  isPanic?: boolean;
  panicCode?: string;
  panicDescription?: string;
  isCustomError?: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

// Common error signatures from 4byte directory
const commonErrors: Record<string, { name: string; signature: string }> = {
  "0x08c379a0": {
    name: "Error",
    signature: "Error(string)",
  },
  "0x4e487b71": {
    name: "Panic",
    signature: "Panic(uint256)",
  },
};

// Panic codes from Solidity
const panicCodes: Record<string, string> = {
  "0x00": "Generic panic",
  "0x01": "Assert failed",
  "0x11": "Arithmetic overflow/underflow",
  "0x12": "Division or modulo by zero",
  "0x21": "Invalid enum value",
  "0x22": "Invalid storage byte array access",
  "0x31": "Pop on empty array",
  "0x32": "Array index out of bounds",
  "0x41": "Out of memory",
  "0x51": "Invalid internal function call",
};

export function RevertReasonDecoderTool() {
  const [inputMode, setInputMode] = useState<"hex" | "tx">("hex");
  const [revertData, setRevertData] = useState("");
  const [txHash, setTxHash] = useState("");
  const [rpcUrl, setRpcUrl] = useState("");
  const [decoded, setDecoded] = useState<DecodedError | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const decodeHexString = (hex: string): string => {
    try {
      // Remove 0x prefix if present
      const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

      // Convert hex to bytes
      const bytes = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
      }

      // Convert bytes to string, filtering out non-printable characters
      let result = "";
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] >= 32 && bytes[i] <= 126) {
          result += String.fromCharCode(bytes[i]);
        }
      }

      return result;
    } catch (e) {
      return "";
    }
  };

  const decodeErrorData = (data: string): DecodedError | null => {
    if (!data || data.length < 10) {
      return null;
    }

    // Ensure 0x prefix
    const errorData = data.startsWith("0x") ? data : `0x${data}`;

    // Extract selector (first 4 bytes)
    const selector = errorData.slice(0, 10);

    const result: DecodedError = {
      selector,
      rawData: errorData,
    };

    // Check if it's a known error
    const knownError = commonErrors[selector];
    if (knownError) {
      result.errorName = knownError.name;
      result.signature = knownError.signature;

      // Decode based on error type
      if (selector === "0x08c379a0") {
        // Error(string) - Standard revert with message
        try {
          // Skip selector (10 chars) and first 32 bytes (offset), get the length
          const dataWithoutSelector = errorData.slice(10);

          // The actual string data starts after offset and length
          // This is a simplified decoder - for production use a proper ABI decoder
          const stringHex = dataWithoutSelector.slice(128); // Skip offset (64) + length (64)
          result.decodedMessage = decodeHexString(stringHex);
        } catch (e) {
          result.decodedMessage = "Failed to decode message";
        }
      } else if (selector === "0x4e487b71") {
        // Panic(uint256)
        result.isPanic = true;
        const panicCodeHex = errorData.slice(10);
        const shortCode = "0x" + panicCodeHex.slice(-2);
        result.panicCode = shortCode;
        result.panicDescription = panicCodes[shortCode] || "Unknown panic code";
      }
    } else {
      // Custom error or unknown
      result.isCustomError = true;
      result.errorName = "Custom Error";
    }

    return result;
  };

  const handleDecodeHex = () => {
    setError("");
    setDecoded(null);

    if (!revertData) {
      setError("Please enter revert data");
      return;
    }

    try {
      const result = decodeErrorData(revertData);
      if (result) {
        setDecoded(result);
      } else {
        setError("Invalid revert data format");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to decode revert data");
    }
  };

  const handleDecodeTx = async () => {
    setError("");
    setDecoded(null);

    if (!txHash) {
      setError("Please enter transaction hash");
      return;
    }

    if (!rpcUrl) {
      setError("Please enter RPC URL");
      return;
    }

    setLoading(true);

    try {
      // Call eth_getTransactionReceipt
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [txHash],
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(`RPC Error: ${data.error.message}`);
        setLoading(false);
        return;
      }

      const receipt = data.result;

      if (!receipt) {
        setError("Transaction not found");
        setLoading(false);
        return;
      }

      if (receipt.status === "0x1") {
        setError("Transaction succeeded - no revert data");
        setLoading(false);
        return;
      }

      // Try to get revert reason using eth_call
      const txResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionByHash",
          params: [txHash],
          id: 2,
        }),
      });

      const txData = await txResponse.json();
      const tx = txData.result;

      if (tx) {
        // Try to replay transaction to get revert reason
        const callResponse = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                from: tx.from,
                to: tx.to,
                data: tx.input,
                value: tx.value,
                gas: tx.gas,
              },
              receipt.blockNumber,
            ],
            id: 3,
          }),
        });

        const callData = await callResponse.json();

        if (callData.error && callData.error.data) {
          const revertHex = callData.error.data;
          const result = decodeErrorData(revertHex);
          if (result) {
            setDecoded(result);
          } else {
            setError("Could not decode revert reason");
          }
        } else {
          setError("Could not retrieve revert reason from transaction");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch transaction data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRevertData("");
    setTxHash("");
    setRpcUrl("");
    setDecoded(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input Mode Selection */}
      <div>
        <div className="text-sm font-medium mb-2">Input Method</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              setInputMode("hex");
              handleReset();
            }}
            variant={inputMode === "hex" ? "default" : "secondary"}
            className="h-auto p-3 flex flex-col items-start justify-start"
          >
            <div className="text-sm font-medium">Revert Data (Hex)</div>
            <div className="text-xs mt-1">Decode error data directly</div>
          </Button>
          <Button
            onClick={() => {
              setInputMode("tx");
              handleReset();
            }}
            variant={inputMode === "tx" ? "default" : "secondary"}
            className="h-auto p-3 flex flex-col items-start justify-start"
          >
            <div className="text-sm font-medium">Transaction Hash</div>
            <div className="text-xs mt-1">Fetch from failed transaction</div>
          </Button>
        </div>
      </div>

      {/* Input Fields */}
      {inputMode === "hex" ? (
        <div>
          <Textarea
            label="Revert Data (Hex)"
            value={revertData}
            onChange={(e) => {
              setRevertData(e.target.value);
              setError("");
              setDecoded(null);
            }}
            placeholder="0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000..."
            className="font-mono text-sm min-h-[120px]"
            showClear
            onClearClick={handleReset}
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleDecodeHex} className="flex-1">
              Decode Revert Data
            </Button>
            <Button onClick={handleReset} variant="secondary">
              Reset
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            label="Transaction Hash"
            value={txHash}
            onChange={(e) => {
              setTxHash(e.target.value);
              setError("");
              setDecoded(null);
            }}
            placeholder="0x..."
            className="font-mono text-sm"
          />
          <Input
            label="RPC URL"
            value={rpcUrl}
            onChange={(e) => {
              setRpcUrl(e.target.value);
              setError("");
              setDecoded(null);
            }}
            placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleDecodeTx}
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch & Decode"}
            </Button>
            <Button onClick={handleReset} variant="secondary" disabled={loading}>
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">Error: {error}</div>
        </div>
      )}

      {/* Decoded Results */}
      {decoded && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-green-400 border-b border-green-500/30 pb-2">
            Decoded Error
          </div>

          <Input
            label="Error Selector"
            value={decoded.selector}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          {decoded.errorName && (
            <Input
              label="Error Name"
              value={decoded.errorName}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          )}

          {decoded.signature && (
            <Input
              label="Error Signature"
              value={decoded.signature}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          )}

          {decoded.decodedMessage && (
            <Textarea
              label="Decoded Message"
              value={decoded.decodedMessage}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f] min-h-[80px]"
            />
          )}

          {decoded.isPanic && (
            <div className="p-4 rounded border border-red-500/30 bg-red-500/5">
              <div className="text-sm font-medium text-red-400 mb-2">
                Panic Error Detected
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Code:</span>
                  <span className="font-mono text-sm text-red-400">
                    {decoded.panicCode}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">
                    Description:
                  </span>
                  <span className="text-sm text-red-400">
                    {decoded.panicDescription}
                  </span>
                </div>
              </div>
            </div>
          )}

          {decoded.isCustomError && (
            <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/5">
              <div className="text-sm text-yellow-400">
                This appears to be a custom error. Custom errors are more gas-efficient
                but require the contract ABI to decode parameter values. The selector is:{" "}
                <code className="px-1 py-0.5 rounded bg-[#0f0f0f]">{decoded.selector}</code>
              </div>
            </div>
          )}

          {decoded.rawData && (
            <Textarea
              label="Raw Revert Data"
              value={decoded.rawData}
              readOnly
              showCopy
              className="font-mono text-xs bg-[#0f0f0f] min-h-[100px]"
            />
          )}
        </div>
      )}

      {/* Common Error Reference */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-blue-400 border-b border-blue-500/30 pb-2">
          Common Error Selectors
        </div>
        <div className="space-y-2">
          {Object.entries(commonErrors).map(([selector, info]) => (
            <div
              key={selector}
              className="p-3 rounded border border-border bg-[#1a1a1a] text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-blue-400">{selector}</span>
                <span className="text-xs text-muted-foreground">{info.name}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {info.signature}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panic Codes Reference */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-blue-400 border-b border-blue-500/30 pb-2">
          Panic Codes Reference
        </div>
        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
          {Object.entries(panicCodes).map(([code, description]) => (
            <div
              key={code}
              className="p-3 rounded border border-border bg-[#1a1a1a] text-sm"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-red-400 shrink-0">{code}</span>
                <span className="text-muted-foreground">{description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400 space-y-2">
          <div>
            <strong>Error Types:</strong> Solidity has three main error types:
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 ml-2">
            <li>
              <strong>require()</strong>: Returns Error(string) with custom message
            </li>
            <li>
              <strong>revert CustomError()</strong>: Custom errors with parameters (more gas efficient)
            </li>
            <li>
              <strong>Panic</strong>: System errors like overflow, divide by zero, array bounds
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const revertReasonDecoderConfig: ToolConfig = {
  id: "revert-reason-decoder",
  name: "Revert Reason Decoder",
  description: "Decode Ethereum transaction revert reasons and error messages",
  category: "web3",
  component: RevertReasonDecoderTool,
  codeSnippet: `// Decode revert reasons from failed transactions

// Common error selectors
const ERROR_SELECTOR = "0x08c379a0"; // Error(string)
const PANIC_SELECTOR = "0x4e487b71"; // Panic(uint256)

function decodeRevertReason(errorData: string): string {
  const selector = errorData.slice(0, 10);

  if (selector === ERROR_SELECTOR) {
    // Error(string) - decode the string message
    const dataWithoutSelector = errorData.slice(10);
    // Skip offset (64 chars) and length (64 chars)
    const messageHex = dataWithoutSelector.slice(128);

    // Convert hex to string
    const bytes = [];
    for (let i = 0; i < messageHex.length; i += 2) {
      const byte = parseInt(messageHex.substr(i, 2), 16);
      if (byte >= 32 && byte <= 126) {
        bytes.push(String.fromCharCode(byte));
      }
    }
    return bytes.join("");
  }

  if (selector === PANIC_SELECTOR) {
    // Panic(uint256) - decode the panic code
    const panicCode = "0x" + errorData.slice(-2);
    const panicCodes: Record<string, string> = {
      "0x01": "Assert failed",
      "0x11": "Arithmetic overflow/underflow",
      "0x12": "Division by zero",
      "0x32": "Array index out of bounds"
    };
    return panicCodes[panicCode] || "Unknown panic";
  }

  return "Custom error: " + selector;
}

// Example usage
const revertData = "0x08c379a00000000000000000000000000000000000000000000000000000000000000020...";
console.log(decodeRevertReason(revertData));
`,
  seo: {
    keywords: [
      "revert reason decoder",
      "ethereum error decoder",
      "decode revert",
      "solidity error decoder",
      "panic code",
      "custom error decoder",
      "transaction failed",
      "decode error message",
    ],
  },
  sections: [
    {
      title: "What are Revert Reasons?",
      content:
        "When a transaction fails on Ethereum, it reverts with an error message. This error is encoded as hex data. Common error types include require() messages, custom errors, and panic codes from system failures.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Error Types</h4>
          <p className="text-sm mb-4">require() errors return Error(string) with a message. Custom errors are more gas-efficient but need the ABI to decode. Panic errors indicate system failures like overflow, division by zero, or array bounds violations.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Require Message - Insufficient Balance",
      content: `0x08c379a000000000000000000000000000000000000000000000000000000000
→ 'Insufficient token balance' (Uniswap router revert)`,
      type: "code",
    },
    {
      title: "Panic Code 0x11 - Arithmetic Overflow",
      content: `0x4e487b710000000000000000000000000000000000000000000000000000000000
→ Arithmetic overflow/underflow (Compound example)`,
      type: "code",
    },
    {
      title: "Custom Error - InsufficientLiquidity",
      content: `0x0901f85f → Custom error selector (Uniswap V3)
Requires contract ABI to decode parameters`,
      type: "code",
    },
    {
      title: "Actual Failed TX Example",
      content: `TX: 0x123abc...
→ Extract revert data from block explorer and decode`,
      type: "code",
    },
  ],
  references: [
    {
      title: "Solidity Errors",
      url: "https://docs.soliditylang.org/en/latest/control-structures.html#error-handling-assert-require-revert-and-exceptions",
    },
    {
      title: "4byte Directory",
      url: "https://www.4byte.directory/",
    },
  ],
};
