"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { MdCheck } from "react-icons/md";

interface DiffResult {
  similarity: number;
  differences: DiffSegment[];
  metadata1?: string;
  metadata2?: string;
  constructorArgs1?: string;
  constructorArgs2?: string;
}

interface DiffSegment {
  type: "match" | "differ" | "metadata";
  bytecode1: string;
  bytecode2: string;
  position: number;
}

export function BytecodeDifferTool() {
  const [mode, setMode] = useState<"direct" | "fetch">("direct");
  const [bytecode1, setBytecode1] = useState("");
  const [bytecode2, setBytecode2] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [rpcUrl, setRpcUrl] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeHex = (hex: string): string => {
    const cleaned = hex.trim().toLowerCase().replace(/^0x/, "");
    return cleaned;
  };

  const extractMetadata = (bytecode: string): { code: string; metadata: string; constructorArgs: string } => {
    // CBOR-encoded metadata starts with 0xa264/0xa165 and ends with 0x0033
    // Solidity appends metadata at the end: <bytecode><metadata><length (2 bytes)>
    const metadataPattern = /a264.*?0033$/;
    const match = bytecode.match(metadataPattern);

    if (match) {
      const metadataWithLength = match[0];
      const metadata = metadataWithLength.slice(0, -4);
      const lengthHex = metadataWithLength.slice(-4);
      const code = bytecode.slice(0, -metadataWithLength.length);

      // Try to detect constructor arguments after metadata
      const constructorArgs = "";

      return { code, metadata, constructorArgs };
    }

    return { code: bytecode, metadata: "", constructorArgs: "" };
  };

  const calculateDiff = (bc1: string, bc2: string): DiffResult => {
    const normalized1 = normalizeHex(bc1);
    const normalized2 = normalizeHex(bc2);

    const { code: code1, metadata: metadata1, constructorArgs: constructorArgs1 } = extractMetadata(normalized1);
    const { code: code2, metadata: metadata2, constructorArgs: constructorArgs2 } = extractMetadata(normalized2);

    const minLength = Math.min(code1.length, code2.length);
    const maxLength = Math.max(code1.length, code2.length);

    let matchCount = 0;
    const differences: DiffSegment[] = [];
    let currentSegment: DiffSegment | null = null;

    for (let i = 0; i < maxLength; i += 2) {
      const byte1 = code1.slice(i, i + 2) || "  ";
      const byte2 = code2.slice(i, i + 2) || "  ";
      const isMatch = byte1 === byte2 && byte1 !== "  ";

      if (isMatch) matchCount += 2;

      const segmentType: "match" | "differ" = isMatch ? "match" : "differ";

      if (!currentSegment || currentSegment.type !== segmentType) {
        if (currentSegment) {
          differences.push(currentSegment);
        }
        currentSegment = {
          type: segmentType,
          bytecode1: byte1,
          bytecode2: byte2,
          position: i / 2,
        };
      } else {
        currentSegment.bytecode1 += byte1;
        currentSegment.bytecode2 += byte2;
      }
    }

    if (currentSegment) {
      differences.push(currentSegment);
    }

    // Add metadata as a separate segment if present
    if (metadata1 || metadata2) {
      differences.push({
        type: "metadata",
        bytecode1: metadata1,
        bytecode2: metadata2,
        position: code1.length / 2,
      });
    }

    const similarity = maxLength > 0 ? (matchCount / maxLength) * 100 : 0;

    return {
      similarity: Math.round(similarity * 100) / 100,
      differences,
      metadata1: metadata1 || undefined,
      metadata2: metadata2 || undefined,
      constructorArgs1: constructorArgs1 || undefined,
      constructorArgs2: constructorArgs2 || undefined,
    };
  };

  const fetchBytecode = async (address: string, rpc: string): Promise<string> => {
    const response = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getCode",
        params: [address, "latest"],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  };

  const handleCompare = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let bc1 = bytecode1;
      let bc2 = bytecode2;

      if (mode === "fetch") {
        if (!address1 || !address2 || !rpcUrl) {
          throw new Error("Please provide both addresses and RPC URL");
        }
        bc1 = await fetchBytecode(address1, rpcUrl);
        bc2 = await fetchBytecode(address2, rpcUrl);
        setBytecode1(bc1);
        setBytecode2(bc2);
      }

      if (!bc1 || !bc2) {
        throw new Error("Please provide both bytecodes");
      }

      const diffResult = calculateDiff(bc1, bc2);
      setResult(diffResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBytecode1("");
    setBytecode2("");
    setAddress1("");
    setAddress2("");
    setRpcUrl("");
    setResult(null);
    setError("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <Label className="mb-2 block text-sm">Input Mode</Label>
        <div className="flex gap-2">
          <Button
            onClick={() => setMode("direct")}
            variant={mode === "direct" ? "primary" : "secondary"}
            className="flex-1"
          >
            Direct Bytecode
          </Button>
          <Button
            onClick={() => setMode("fetch")}
            variant={mode === "fetch" ? "primary" : "secondary"}
            className="flex-1"
          >
            Fetch from RPC
          </Button>
        </div>
      </div>

      {mode === "direct" ? (
        <>
          {/* Bytecode 1 */}
          <div>
            <Label className="mb-2 block text-sm">Bytecode 1 (hex)</Label>
            <Textarea
              value={bytecode1}
              onChange={(e) => setBytecode1(e.target.value)}
              placeholder="0x608060405234801561001057600080fd5b50..."
              className="font-mono text-xs min-h-[120px]"
            />
          </div>

          {/* Bytecode 2 */}
          <div>
            <Label className="mb-2 block text-sm">Bytecode 2 (hex)</Label>
            <Textarea
              value={bytecode2}
              onChange={(e) => setBytecode2(e.target.value)}
              placeholder="0x608060405234801561001057600080fd5b50..."
              className="font-mono text-xs min-h-[120px]"
            />
          </div>
        </>
      ) : (
        <>
          {/* RPC URL */}
          <div>
            <Label className="mb-2 block text-sm">RPC URL</Label>
            <Input
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              placeholder="https://eth-mainnet.g.alchemy.com/v2/your-api-key"
              className="font-mono text-sm"
            />
          </div>

          {/* Address 1 */}
          <div>
            <Label className="mb-2 block text-sm">Contract Address 1</Label>
            <Input
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
          </div>

          {/* Address 2 */}
          <div>
            <Label className="mb-2 block text-sm">Contract Address 2</Label>
            <Input
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleCompare} variant="primary" className="flex-1" disabled={loading}>
          {loading ? "Comparing..." : "Compare Bytecode"}
        </Button>
        <Button onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Similarity Score */}
          <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Similarity Score</Label>
              <span className={`text-lg font-bold ${
                result.similarity === 100 ? "text-[var(--color-green-500)]" :
                result.similarity >= 90 ? "text-yellow-400" :
                "text-[var(--color-red-500)]"
              }`}>
                {result.similarity}%
              </span>
            </div>
            <div className="w-full bg-[var(--color-gray-0)] rounded-[12px] h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  result.similarity === 100 ? "bg-green-500" :
                  result.similarity >= 90 ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${result.similarity}%` }}
              />
            </div>
          </div>

          {/* Exact Match Status */}
          <div className={`p-3 rounded-[12px] border ${
            result.similarity === 100
              ? "bg-[var(--color-green-50)] border-green-500/30 text-[var(--color-green-500)]"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          }`}>
            <div className="text-sm font-medium flex items-center gap-1">
              {result.similarity === 100
                ? <><MdCheck className="w-4 h-4" /> Bytecodes are identical</>
                : `${result.differences.filter(d => d.type === "differ").length} difference(s) detected`}
            </div>
          </div>

          {/* Metadata */}
          {(result.metadata1 || result.metadata2) && (
            <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
              <Label className="text-sm mb-2 block">Metadata Hash</Label>
              <div className="space-y-2">
                {result.metadata1 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Bytecode 1:</div>
                    <div className="font-mono text-xs break-all text-yellow-400">
                      {result.metadata1}
                    </div>
                  </div>
                )}
                {result.metadata2 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Bytecode 2:</div>
                    <div className="font-mono text-xs break-all text-yellow-400">
                      {result.metadata2}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diff View */}
          <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm">Diff View</Label>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded-[12px]" />
                  <span className="text-gray-400">Match</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500/30 border border-red-500/50 rounded-[12px]" />
                  <span className="text-gray-400">Differ</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500/50 rounded-[12px]" />
                  <span className="text-gray-400">Metadata</span>
                </div>
              </div>
            </div>
            <div className="max-h-[400px] overflow-auto">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="text-gray-400 font-semibold pb-2 border-b border-[var(--color-gray-200)]">
                  Bytecode 1
                </div>
                <div className="text-gray-400 font-semibold pb-2 border-b border-[var(--color-gray-200)]">
                  Bytecode 2
                </div>
                {result.differences.map((diff, idx) => (
                  <>
                    <div
                      key={`${idx}-1`}
                      className={`p-2 rounded-[12px] break-all ${
                        diff.type === "match"
                          ? "bg-[var(--color-green-50)] border border-green-500/30 text-[var(--color-green-500)]"
                          : diff.type === "metadata"
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                          : "bg-[var(--color-red-50)] border border-red-500/30 text-[var(--color-red-500)]"
                      }`}
                    >
                      {diff.bytecode1 || "(empty)"}
                    </div>
                    <div
                      key={`${idx}-2`}
                      className={`p-2 rounded-[12px] break-all ${
                        diff.type === "match"
                          ? "bg-[var(--color-green-50)] border border-green-500/30 text-[var(--color-green-500)]"
                          : diff.type === "metadata"
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                          : "bg-[var(--color-red-50)] border border-red-500/30 text-[var(--color-red-500)]"
                      }`}
                    >
                      {diff.bytecode2 || "(empty)"}
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const bytecodeDifferConfig: ToolConfig = {
  id: "bytecode-differ",
  name: "Bytecode Differ",
  description: "Compare two contract bytecodes and identify differences",
  category: "web3",
  component: BytecodeDifferTool,
  seo: {
    keywords: [
      "bytecode diff",
      "contract comparison",
      "bytecode differ",
      "smart contract diff",
      "proxy upgrade verification",
      "bytecode similarity",
      "contract verification",
      "ethereum bytecode",
    ],
  },
  sections: [
    {
      title: "What is Bytecode?",
      content:
        "Bytecode is the compiled machine-readable code that runs on the Ethereum Virtual Machine (EVM). When you deploy a smart contract, the Solidity code is compiled into bytecode.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Bytecode comparison analyzes two hex strings byte-by-byte, calculating similarity percentage and highlighting differences. The tool separates runtime code from metadata (CBOR-encoded compiler settings at the end). Identical logic can have different metadata due to compiler versions or settings.
          </p>

          <h4 className="text-base font-semibold mb-2">Why Compare Bytecode?</h4>
          <p className="text-sm mb-4">
            Comparing bytecode helps verify proxy upgrades, check if two contracts are identical, and detect unauthorized modifications. Even small differences can indicate security issues.
          </p>

          <h4 className="text-base font-semibold mb-2">Metadata Hash</h4>
          <p className="text-sm mb-4">
            Solidity appends metadata (CBOR-encoded) at the end of bytecode containing compiler settings and source code hash. This often differs even for identical logic due to compiler settings.
          </p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm">
            Verify proxy implementation upgrades, confirm contract deployments across chains, detect malicious modifications, and audit contract authenticity.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Compare BAYC & MAYC (RPC)",
      content: "Contract 1: 0xBC4CA0EdA7647A8aB7C2061c2E2ad88F2A180A79 (BAYC)\nContract 2: 0x60E4d786d1ad0075Bcb3152CA902be87E17dc708 (MAYC)\nBoth are popular ape-themed NFT collections with similar architectures",
      type: "text",
    },
    {
      title: "Direct Bytecode Comparison",
      content: "Paste compiled contract bytecode (0x608060...) to identify implementation differences, verify proxy upgrades, or detect unauthorized modifications",
      type: "text",
    },
    {
      title: "Proxy Upgrade Verification",
      content: "Compare implementation contracts before and after upgrades to ensure only expected changes were made. BAYC and MAYC implementations should have high similarity despite different parameters",
      type: "text",
    },
  ],
  codeSnippet: `// No external packages needed - pure TypeScript

interface DiffResult {
  similarity: number;
  differences: number;
  matchingBytes: number;
  totalBytes: number;
}

// Compare two bytecode strings
function compareBytecode(bytecode1: string, bytecode2: string): DiffResult {
  // Remove 0x prefix if present
  const clean1 = bytecode1.replace(/^0x/, '');
  const clean2 = bytecode2.replace(/^0x/, '');

  const maxLength = Math.max(clean1.length, clean2.length);
  let matchCount = 0;
  let diffCount = 0;

  // Compare byte by byte (2 hex chars = 1 byte)
  for (let i = 0; i < maxLength; i += 2) {
    const byte1 = clean1.slice(i, i + 2);
    const byte2 = clean2.slice(i, i + 2);

    if (byte1 === byte2 && byte1 !== '') {
      matchCount += 2;
    } else {
      diffCount += 2;
    }
  }

  const similarity = (matchCount / maxLength) * 100;

  return {
    similarity: Math.round(similarity * 100) / 100,
    differences: diffCount / 2,
    matchingBytes: matchCount / 2,
    totalBytes: maxLength / 2
  };
}

// Extract metadata from bytecode (CBOR-encoded)
function extractMetadata(bytecode: string): {
  code: string;
  metadata: string;
} {
  const clean = bytecode.replace(/^0x/, '');

  // Solidity metadata pattern: a264...0033 at the end
  const metadataPattern = /a264.*?0033$/;
  const match = clean.match(metadataPattern);

  if (match) {
    const metadata = match[0];
    const code = clean.slice(0, -metadata.length);
    return { code, metadata };
  }

  return { code: clean, metadata: '' };
}

// Example usage
const bytecode1 = '0x608060405234801561001057600080fd5b50...a264...0033';
const bytecode2 = '0x608060405234801561001057600080fd5b50...a265...0033';

const result = compareBytecode(bytecode1, bytecode2);
console.log('Similarity:', result.similarity + '%');
console.log('Matching bytes:', result.matchingBytes);
console.log('Different bytes:', result.differences);

// Extract metadata
const { code, metadata } = extractMetadata(bytecode1);
console.log('Code length:', code.length / 2, 'bytes');
console.log('Metadata:', metadata);`,
  references: [
    {
      title: "Solidity Metadata",
      url: "https://docs.soliditylang.org/en/latest/metadata.html",
    },
    {
      title: "EVM Bytecode",
      url: "https://ethereum.org/en/developers/docs/evm/",
    },
  ],
};
