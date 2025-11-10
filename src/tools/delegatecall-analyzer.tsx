"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { keccak256, toHex } from "viem";

interface StorageSlot {
  name: string;
  type: string;
  slot: number;
  offset: number;
  size: number;
}

interface AnalysisResult {
  proxySlots: StorageSlot[];
  implementationSlots: StorageSlot[];
  conflicts: Conflict[];
  safetyScore: "Safe" | "Warning" | "Dangerous";
  recommendations: string[];
  hasGap: boolean;
  gapSize?: number;
}

interface Conflict {
  slot: number;
  proxyVar: string;
  implVar: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export function DelegatecallAnalyzerTool() {
  const [proxySource, setProxySource] = useState("");
  const [implementationSource, setImplementationSource] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const TYPE_SIZES: Record<string, number> = {
    bool: 1,
    uint8: 1,
    int8: 1,
    uint16: 2,
    int16: 2,
    uint24: 3,
    uint32: 4,
    int32: 4,
    uint64: 8,
    int64: 8,
    uint128: 16,
    int128: 16,
    uint256: 32,
    int256: 32,
    address: 20,
    bytes32: 32,
    bytes: 32, // dynamic
    string: 32, // dynamic
  };

  const getTypeSize = (type: string): number => {
    // Handle arrays and mappings
    if (type.includes("[]") || type.includes("mapping")) {
      return 32; // Uses one slot for length/pointer
    }

    // Handle bytes1-bytes32
    const bytesMatch = type.match(/^bytes(\d+)$/);
    if (bytesMatch) {
      return parseInt(bytesMatch[1]);
    }

    // Handle uintX/intX
    const intMatch = type.match(/^u?int(\d+)$/);
    if (intMatch) {
      return parseInt(intMatch[1]) / 8;
    }

    return TYPE_SIZES[type] || 32;
  };

  const parseStorageLayout = (source: string): StorageSlot[] => {
    const slots: StorageSlot[] = [];
    let currentSlot = 0;
    let currentOffset = 0;

    // Parse variable declarations (simplified Solidity parsing)
    const lines = source.split("\n");
    const variablePattern = /^\s*(uint\d+|int\d+|bool|address|bytes\d*|string)\s+(?:public|private|internal)?\s+(\w+)/;

    for (const line of lines) {
      const match = line.match(variablePattern);
      if (match) {
        const [, type, name] = match;
        const size = getTypeSize(type);

        // Check if we need to move to next slot
        if (currentOffset > 0 && currentOffset + size > 32) {
          currentSlot++;
          currentOffset = 0;
        }

        slots.push({
          name,
          type,
          slot: currentSlot,
          offset: currentOffset,
          size,
        });

        currentOffset += size;
        if (currentOffset >= 32) {
          currentSlot++;
          currentOffset = 0;
        }
      }

      // Detect __gap
      const gapMatch = line.match(/uint256\[\s*(\d+)\s*\]\s+(?:private\s+)?__gap/);
      if (gapMatch) {
        const gapSize = parseInt(gapMatch[1]);
        slots.push({
          name: "__gap",
          type: `uint256[${gapSize}]`,
          slot: currentSlot,
          offset: 0,
          size: gapSize * 32,
        });
        currentSlot += gapSize;
        currentOffset = 0;
      }
    }

    return slots;
  };

  const detectConflicts = (
    proxySlots: StorageSlot[],
    implSlots: StorageSlot[]
  ): Conflict[] => {
    const conflicts: Conflict[] = [];

    // Check for slot collisions
    proxySlots.forEach((proxySlot) => {
      implSlots.forEach((implSlot) => {
        if (proxySlot.slot === implSlot.slot) {
          // Check if there's actual overlap
          const proxyEnd = proxySlot.offset + proxySlot.size;
          const implEnd = implSlot.offset + implSlot.size;

          const hasOverlap =
            (proxySlot.offset >= implSlot.offset && proxySlot.offset < implEnd) ||
            (implSlot.offset >= proxySlot.offset && implSlot.offset < proxyEnd);

          if (hasOverlap) {
            conflicts.push({
              slot: proxySlot.slot,
              proxyVar: proxySlot.name,
              implVar: implSlot.name,
              severity: "high",
              description: `Storage collision at slot ${proxySlot.slot}: ${proxySlot.name} (proxy) conflicts with ${implSlot.name} (implementation)`,
            });
          }
        }
      });
    });

    // Check for ordering issues
    const implVarsBySlot = new Map<number, StorageSlot[]>();
    implSlots.forEach((slot) => {
      if (!implVarsBySlot.has(slot.slot)) {
        implVarsBySlot.set(slot.slot, []);
      }
      implVarsBySlot.get(slot.slot)!.push(slot);
    });

    // Check for type mismatches in same position
    proxySlots.forEach((proxySlot, idx) => {
      if (idx < implSlots.length) {
        const implSlot = implSlots[idx];
        if (proxySlot.type !== implSlot.type && proxySlot.slot === implSlot.slot) {
          conflicts.push({
            slot: proxySlot.slot,
            proxyVar: proxySlot.name,
            implVar: implSlot.name,
            severity: "medium",
            description: `Type mismatch at slot ${proxySlot.slot}: ${proxySlot.name} (${proxySlot.type}) vs ${implSlot.name} (${implSlot.type})`,
          });
        }
      }
    });

    return conflicts;
  };

  const calculateSafetyScore = (
    conflicts: Conflict[],
    hasGap: boolean
  ): "Safe" | "Warning" | "Dangerous" => {
    const highSeverity = conflicts.filter((c) => c.severity === "high").length;
    const mediumSeverity = conflicts.filter((c) => c.severity === "medium").length;

    if (highSeverity > 0) {
      return "Dangerous";
    }

    if (mediumSeverity > 0 || !hasGap) {
      return "Warning";
    }

    return "Safe";
  };

  const generateRecommendations = (
    conflicts: Conflict[],
    hasGap: boolean,
    proxySlots: StorageSlot[],
    implSlots: StorageSlot[]
  ): string[] => {
    const recommendations: string[] = [];

    if (conflicts.length > 0) {
      recommendations.push(
        "Resolve storage conflicts by ensuring proxy and implementation use different slots"
      );
    }

    if (!hasGap) {
      recommendations.push(
        "Add a storage gap (e.g., uint256[50] private __gap) to allow for future storage variables"
      );
    }

    const highConflicts = conflicts.filter((c) => c.severity === "high");
    if (highConflicts.length > 0) {
      recommendations.push(
        "Critical: Storage collisions detected. Do not deploy this configuration."
      );
    }

    if (implSlots.length > 0 && proxySlots.length > 0) {
      const lastProxySlot = Math.max(...proxySlots.map((s) => s.slot));
      const firstImplSlot = Math.min(...implSlots.map((s) => s.slot));

      if (firstImplSlot <= lastProxySlot) {
        recommendations.push(
          "Implementation storage should start after proxy storage. Consider using storage gaps or different slot ranges."
        );
      }
    }

    if (proxySlots.some((s) => s.name === "_owner" || s.name === "owner")) {
      recommendations.push(
        "Proxy contains ownership variable. Ensure implementation doesn't override it."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Storage layout appears safe for upgradeable proxy pattern");
    }

    return recommendations;
  };

  const handleAnalyze = () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      if (!proxySource || !implementationSource) {
        throw new Error("Please provide both proxy and implementation contract sources");
      }

      const proxySlots = parseStorageLayout(proxySource);
      const implementationSlots = parseStorageLayout(implementationSource);
      const conflicts = detectConflicts(proxySlots, implementationSlots);

      const hasGap = implementationSlots.some((slot) => slot.name === "__gap");
      const gapSlot = implementationSlots.find((slot) => slot.name === "__gap");
      const gapSize = gapSlot ? gapSlot.size / 32 : undefined;

      const safetyScore = calculateSafetyScore(conflicts, hasGap);
      const recommendations = generateRecommendations(
        conflicts,
        hasGap,
        proxySlots,
        implementationSlots
      );

      setResult({
        proxySlots,
        implementationSlots: implementationSlots,
        conflicts,
        safetyScore,
        recommendations,
        hasGap,
        gapSize,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProxySource("");
    setImplementationSource("");
    setResult(null);
    setError("");
  };

  const getSafetyColor = (score: string) => {
    switch (score) {
      case "Safe":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "Warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "Dangerous":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      case "low":
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Proxy Contract */}
      <div>
        <Label className="mb-2 block text-sm">Proxy Contract Source (or ABI)</Label>
        <Textarea
          value={proxySource}
          onChange={(e) => setProxySource(e.target.value)}
          placeholder={`contract Proxy {
    address private _implementation;
    address private _owner;
    // ... storage variables
}`}
          className="font-mono text-xs min-h-[150px]"
        />
      </div>

      {/* Implementation Contract */}
      <div>
        <Label className="mb-2 block text-sm">Implementation Contract Source (or ABI)</Label>
        <Textarea
          value={implementationSource}
          onChange={(e) => setImplementationSource(e.target.value)}
          placeholder={`contract Implementation {
    uint256 private _value;
    address private _admin;
    uint256[48] private __gap;
    // ... storage variables
}`}
          className="font-mono text-xs min-h-[150px]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleAnalyze} className="flex-1" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Storage Layout"}
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Safety Score */}
          <div className={`p-4 rounded border ${getSafetyColor(result.safetyScore)}`}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Safety Score</Label>
              <span className="text-lg font-bold">{result.safetyScore}</span>
            </div>
            {result.hasGap && (
              <div className="text-xs mt-2">
                Storage gap detected: {result.gapSize} slots reserved for future variables
              </div>
            )}
          </div>

          {/* Conflicts */}
          {result.conflicts.length > 0 && (
            <div className="p-4 rounded border bg-[#0f0f0f] border-[#2a2a2a]">
              <Label className="text-sm mb-3 block text-red-400 font-semibold">
                Storage Conflicts ({result.conflicts.length})
              </Label>
              <div className="space-y-2">
                {result.conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border ${getSeverityColor(conflict.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="font-mono text-sm font-semibold">
                        Slot {conflict.slot}
                      </div>
                      <span className="text-xs uppercase font-semibold whitespace-nowrap">
                        {conflict.severity}
                      </span>
                    </div>
                    <div className="text-sm break-words">{conflict.description}</div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="bg-[#0f0f0f] px-2 py-1 rounded break-all">
                        Proxy: {conflict.proxyVar}
                      </span>
                      <span className="bg-[#0f0f0f] px-2 py-1 rounded break-all">
                        Impl: {conflict.implVar}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Layout Comparison */}
          <div className="p-4 rounded border bg-[#0f0f0f] border-[#2a2a2a]">
            <Label className="text-sm mb-3 block">Storage Layout Comparison</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Proxy Storage */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold">
                  Proxy Contract
                </div>
                <div className="space-y-1">
                  {result.proxySlots.length > 0 ? (
                    result.proxySlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs"
                      >
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="font-mono font-semibold text-blue-400 break-all">
                            {slot.name}
                          </span>
                          <span className="text-gray-500 whitespace-nowrap">Slot {slot.slot}</span>
                        </div>
                        <div className="text-gray-400 break-all">
                          Type: {slot.type} | Offset: {slot.offset} | Size: {slot.size}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">No storage variables</div>
                  )}
                </div>
              </div>

              {/* Implementation Storage */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold">
                  Implementation Contract
                </div>
                <div className="space-y-1">
                  {result.implementationSlots.length > 0 ? (
                    result.implementationSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-xs ${
                          slot.name === "__gap"
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-[#1a1a1a] border-[#2a2a2a]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span
                            className={`font-mono font-semibold break-all ${
                              slot.name === "__gap" ? "text-green-400" : "text-blue-400"
                            }`}
                          >
                            {slot.name}
                          </span>
                          <span className="text-gray-500 whitespace-nowrap">Slot {slot.slot}</span>
                        </div>
                        <div className="text-gray-400 break-all">
                          Type: {slot.type} | Offset: {slot.offset} | Size: {slot.size}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">No storage variables</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 rounded border bg-[#0f0f0f] border-[#2a2a2a]">
            <Label className="text-sm mb-3 block">Recommendations</Label>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export const delegatecallAnalyzerConfig: ToolConfig = {
  id: "delegatecall-analyzer",
  name: "Delegate Call Analyzer",
  description: "Analyze storage layout compatibility for upgradeable proxy contracts",
  category: "web3",
  component: DelegatecallAnalyzerTool,
  seo: {
    keywords: [
      "delegatecall",
      "proxy storage",
      "storage collision",
      "upgradeable contracts",
      "storage layout",
      "proxy pattern",
      "storage gap",
      "contract upgrade safety",
    ],
  },
  sections: [
    {
      title: "What is Delegatecall?",
      content:
        "Delegatecall executes code from another contract in the context of the calling contract. This means it uses the caller's storage, making it essential for upgradeable proxy patterns.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Delegatecall preserves msg.sender and msg.value while executing another contract's code in the caller's storage context. Storage slots are accessed by position (0, 1, 2...), not by variable names. This enables proxies to run implementation logic while maintaining proxy state, but requires careful storage layout alignment.
          </p>

          <h4 className="text-base font-semibold mb-2">Storage Layout Compatibility</h4>
          <p className="text-sm mb-4">
            When upgrading a proxy, the new implementation must maintain storage compatibility with the old one. Variables must be in the same order, and new variables should only be appended at the end.
          </p>

          <h4 className="text-base font-semibold mb-2">Storage Collisions</h4>
          <p className="text-sm mb-4">
            Storage collisions occur when proxy and implementation contracts use the same storage slots. This can lead to data corruption and security vulnerabilities. Always ensure proxy uses different slots.
          </p>

          <h4 className="text-base font-semibold mb-2">Storage Gaps</h4>
          <p className="text-sm">
            A storage gap (e.g., uint256[50] private __gap) reserves storage slots for future variables in upgradeable contracts, allowing you to add new state variables without affecting existing storage layout.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Aave V3 Pool (0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2)",
      content: "EIP-1967 Transparent Proxy with complex storage. Implementation extends base contracts with __gap[50] to allow safe future upgrades.",
      type: "code",
    },
    {
      title: "Compound III (0xc3d67e4b63a3c385042d8d6b13e3e0ff485e0994)",
      content: "EIP-1967 UUPS Proxy. Verify storage layout matches when upgrading - reOrdering state vars or changing types will corrupt user balances.",
      type: "text",
    },
    {
      title: "Safe Storage Gap Pattern",
      content: "Add uint256[50] private __gap; at end of implementation. This reserves slots for future vars without breaking existing storage layout.",
      type: "code",
    },
  ],
  codeSnippet: `// No external packages needed - pure TypeScript

interface StorageSlot {
  name: string;
  type: string;
  slot: number;
  offset: number;
  size: number;
}

// Simplified storage layout parser
function parseStorageLayout(source: string): StorageSlot[] {
  const slots: StorageSlot[] = [];
  let currentSlot = 0;
  let currentOffset = 0;

  const TYPE_SIZES: Record<string, number> = {
    uint256: 32,
    address: 20,
    bool: 1,
    bytes32: 32
  };

  // Simple regex to match variable declarations
  const lines = source.split('\\n');
  const varPattern = /^\s*(uint256|address|bool|bytes32)\s+(?:public|private|internal)?\s+(\w+)/;

  for (const line of lines) {
    const match = line.match(varPattern);
    if (match) {
      const [, type, name] = match;
      const size = TYPE_SIZES[type] || 32;

      // Check if we need to move to next slot
      if (currentOffset > 0 && currentOffset + size > 32) {
        currentSlot++;
        currentOffset = 0;
      }

      slots.push({ name, type, slot: currentSlot, offset: currentOffset, size });

      currentOffset += size;
      if (currentOffset >= 32) {
        currentSlot++;
        currentOffset = 0;
      }
    }

    // Detect storage gap
    if (line.includes('__gap')) {
      const gapMatch = line.match(/uint256\[(\d+)\]/);
      if (gapMatch) {
        const gapSize = parseInt(gapMatch[1]);
        slots.push({
          name: '__gap',
          type: \`uint256[\${gapSize}]\`,
          slot: currentSlot,
          offset: 0,
          size: gapSize * 32
        });
        currentSlot += gapSize;
        currentOffset = 0;
      }
    }
  }

  return slots;
}

// Detect storage conflicts between proxy and implementation
function detectConflicts(proxySlots: StorageSlot[], implSlots: StorageSlot[]): string[] {
  const conflicts: string[] = [];

  proxySlots.forEach(proxySlot => {
    implSlots.forEach(implSlot => {
      if (proxySlot.slot === implSlot.slot) {
        conflicts.push(
          \`Conflict at slot \${proxySlot.slot}: \${proxySlot.name} (proxy) vs \${implSlot.name} (impl)\`
        );
      }
    });
  });

  return conflicts;
}

// Example
const proxySource = \`
  address private _implementation;
  address private _owner;
\`;

const implSource = \`
  uint256 private _value;
  address private _admin;
  uint256[48] private __gap;
\`;

const proxySlots = parseStorageLayout(proxySource);
const implSlots = parseStorageLayout(implSource);
const conflicts = detectConflicts(proxySlots, implSlots);

console.log('Proxy slots:', proxySlots);
console.log('Implementation slots:', implSlots);
console.log('Conflicts:', conflicts);`,
  references: [
    {
      title: "OpenZeppelin Proxy Upgrade Pattern",
      url: "https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies",
    },
    {
      title: "Writing Upgradeable Contracts",
      url: "https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable",
    },
  ],
};
