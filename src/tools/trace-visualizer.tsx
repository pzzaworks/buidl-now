"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";
import {
  MdExpandMore,
  MdChevronRight,
  MdContentCopy,
  MdCheck,
} from "react-icons/md";

interface TraceCall {
  type: string;
  from: string;
  to: string;
  value?: string;
  gas: string;
  gasUsed: string;
  input: string;
  output?: string;
  error?: string;
  calls?: TraceCall[];
}

interface ParsedCall {
  type: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  input: string;
  output: string;
  error?: string;
  depth: number;
  children: ParsedCall[];
  functionSelector?: string;
  success: boolean;
}

const callTypeColors: Record<string, string> = {
  CALL: "text-blue-400 border-blue-500/30 bg-blue-500/5",
  DELEGATECALL: "text-purple-400 border-purple-500/30 bg-purple-500/5",
  STATICCALL: "text-[var(--color-green-500)] border-green-500/30 bg-green-500/5",
  CREATE: "text-orange-400 border-orange-500/30 bg-orange-500/5",
  CREATE2: "text-orange-400 border-orange-500/30 bg-orange-500/5",
  CALLCODE: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
};

function TraceNode({
  call,
  isExpanded,
  onToggle,
}: {
  call: ParsedCall;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const hasChildren = call.children.length > 0;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const colorClass = call.success
    ? callTypeColors[call.type] || "text-gray-400 border-gray-500/30 bg-gray-500/5"
    : "text-[var(--color-red-500)] border-red-500/30 bg-red-500/5";

  const truncate = (str: string, length: number = 10) => {
    if (str.length <= length) return str;
    return `${str.slice(0, length)}...${str.slice(-6)}`;
  };

  return (
    <div className="space-y-2">
      {/* Call Node */}
      <div
        className={`p-3 rounded-[12px] border ${colorClass} ${
          hasChildren ? "cursor-pointer" : ""
        }`}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex items-start gap-2">
          {/* Expand/Collapse Icon */}
          <div className="shrink-0 w-5 h-5 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <MdExpandMore className="w-5 h-5" />
              ) : (
                <MdChevronRight className="w-5 h-5" />
              )
            ) : (
              <div className="w-1 h-1 rounded-full bg-current opacity-50" />
            )}
          </div>

          {/* Call Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded-[12px] bg-[var(--color-gray-0)] font-semibold">
                {call.type}
              </span>
              {call.functionSelector && (
                <span className="font-mono text-xs text-muted-foreground">
                  {call.functionSelector}
                </span>
              )}
              {!call.success && (
                <span className="text-xs px-2 py-0.5 rounded-[12px] bg-red-500/20 text-red-300 font-semibold">
                  FAILED
                </span>
              )}
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">From:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{truncate(call.from, 8)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(call.from, `from-${call.from}`);
                  }}
                  className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer opacity-0 hover:opacity-100"
                  title={copied === `from-${call.from}` ? "Copied!" : "Copy to clipboard"}
                >
                  {copied === `from-${call.from}` ? (
                    <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                  ) : (
                    <MdContentCopy style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>

              <span className="text-muted-foreground">To:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{truncate(call.to, 8)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(call.to, `to-${call.to}`);
                  }}
                  className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer opacity-0 hover:opacity-100"
                  title={copied === `to-${call.to}` ? "Copied!" : "Copy to clipboard"}
                >
                  {copied === `to-${call.to}` ? (
                    <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                  ) : (
                    <MdContentCopy style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>

              {call.value !== "0x0" && call.value !== "0" && (
                <>
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-mono">{call.value}</span>
                </>
              )}

              <span className="text-muted-foreground">Gas:</span>
              <span className="font-mono">
                {parseInt(call.gasUsed, 16) || call.gasUsed} / {parseInt(call.gas, 16) || call.gas}
              </span>
            </div>

            {/* Error */}
            {call.error && (
              <div className="text-xs bg-[var(--color-red-50)] rounded-[12px] px-2 py-1 font-mono">
                Error: {call.error}
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-2 pt-2 border-t border-current/20 space-y-2">
                {call.input && call.input !== "0x" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Input:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(call.input, `input-${call.input}`);
                        }}
                        className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
                        title={copied === `input-${call.input}` ? "Copied!" : "Copy to clipboard"}
                      >
                        {copied === `input-${call.input}` ? (
                          <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                        ) : (
                          <MdContentCopy style={{ width: 16, height: 16 }} />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-[var(--color-gray-0)] rounded-[12px] px-2 py-1 break-all">
                      {truncate(call.input, 64)}
                    </div>
                  </div>
                )}

                {call.output && call.output !== "0x" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Output:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(call.output, `output-${call.output}`);
                        }}
                        className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
                        title={copied === `output-${call.output}` ? "Copied!" : "Copy to clipboard"}
                      >
                        {copied === `output-${call.output}` ? (
                          <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                        ) : (
                          <MdContentCopy style={{ width: 16, height: 16 }} />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-[var(--color-gray-0)] rounded-[12px] px-2 py-1 break-all">
                      {truncate(call.output, 64)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-8 space-y-2 border-l-2 border-current/20 pl-4">
          {call.children.map((child, index) => (
            <TraceNodeContainer key={index} call={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function TraceNodeContainer({ call }: { call: ParsedCall }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <TraceNode
      call={call}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
}

export function TraceVisualizerTool() {
  const [inputMode, setInputMode] = useState<"json" | "tx">("json");
  const [traceJson, setTraceJson] = useState("");
  const [txHash, setTxHash] = useState("");
  const [rpcUrl, setRpcUrl] = useState("");
  const [parsedTrace, setParsedTrace] = useState<ParsedCall | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parseTraceData = (trace: TraceCall, depth: number = 0): ParsedCall => {
    const parsed: ParsedCall = {
      type: trace.type,
      from: trace.from,
      to: trace.to || "0x0",
      value: trace.value || "0x0",
      gas: trace.gas,
      gasUsed: trace.gasUsed,
      input: trace.input,
      output: trace.output || "0x",
      error: trace.error,
      depth,
      children: [],
      success: !trace.error,
    };

    // Extract function selector from input
    if (parsed.input && parsed.input.length >= 10) {
      parsed.functionSelector = parsed.input.slice(0, 10);
    }

    // Parse children
    if (trace.calls && trace.calls.length > 0) {
      parsed.children = trace.calls.map((child) =>
        parseTraceData(child, depth + 1)
      );
    }

    return parsed;
  };

  const handleParseJson = () => {
    setError("");
    setParsedTrace(null);

    if (!traceJson) {
      setError("Please enter trace JSON");
      return;
    }

    try {
      const trace = JSON.parse(traceJson);
      const parsed = parseTraceData(trace);
      setParsedTrace(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse trace JSON");
    }
  };

  const handleFetchTrace = async () => {
    setError("");
    setParsedTrace(null);

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
      // Call debug_traceTransaction
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "debug_traceTransaction",
          params: [txHash, { tracer: "callTracer" }],
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(`RPC Error: ${data.error.message}`);
        setLoading(false);
        return;
      }

      const trace = data.result;

      if (!trace) {
        setError("No trace data returned");
        setLoading(false);
        return;
      }

      const parsed = parseTraceData(trace);
      setParsedTrace(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch trace data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTraceJson("");
    setTxHash("");
    setRpcUrl("");
    setParsedTrace(null);
    setError("");
  };

  const countCalls = (call: ParsedCall): number => {
    let count = 1;
    call.children.forEach((child) => {
      count += countCalls(child);
    });
    return count;
  };

  const calculateTotalGas = (call: ParsedCall): number => {
    let total = parseInt(call.gasUsed, 16) || parseInt(call.gasUsed) || 0;
    call.children.forEach((child) => {
      total += calculateTotalGas(child);
    });
    return total;
  };

  const collapseAll = () => {
    setParsedTrace(null);
    setTimeout(() => {
      if (traceJson) {
        handleParseJson();
      }
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Input Mode Selection */}
      <div>
        <div className="text-sm font-medium mb-2">Input Method</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              setInputMode("json");
              handleReset();
            }}
            variant={inputMode === "json" ? "primary" : "secondary"}
            className="h-auto p-3 flex flex-col items-start justify-start"
          >
            <div className="text-sm font-medium">Trace JSON</div>
            <div className="text-xs mt-1">Paste trace data directly</div>
          </Button>
          <Button
            onClick={() => {
              setInputMode("tx");
              handleReset();
            }}
            variant={inputMode === "tx" ? "primary" : "secondary"}
            className="h-auto p-3 flex flex-col items-start justify-start"
          >
            <div className="text-sm font-medium">Transaction Hash</div>
            <div className="text-xs mt-1">Fetch using RPC</div>
          </Button>
        </div>
      </div>

      {/* Input Fields */}
      {inputMode === "json" ? (
        <div>
          <Textarea
            label="Trace JSON (from debug_traceTransaction)"
            value={traceJson}
            onChange={(e) => {
              setTraceJson(e.target.value);
              setError("");
              setParsedTrace(null);
            }}
            placeholder='{"type":"CALL","from":"0x...","to":"0x...","value":"0x0","gas":"0x...","gasUsed":"0x...","input":"0x...","output":"0x...","calls":[...]}'
            className="font-mono text-sm min-h-[200px]"
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleParseJson} variant="primary" className="flex-1">
              Parse & Visualize
            </Button>
            <Button onClick={handleReset}>
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
              setParsedTrace(null);
            }}
            placeholder="0x..."
            className="font-mono text-sm"
          />
          <Input
            label="RPC URL (must support debug_traceTransaction)"
            value={rpcUrl}
            onChange={(e) => {
              setRpcUrl(e.target.value);
              setError("");
              setParsedTrace(null);
            }}
            placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
            className="font-mono text-sm"
          />
          <div className="text-xs text-yellow-400 bg-yellow-500/5 border border-yellow-500/30 rounded-[12px] p-2">
            Note: debug_traceTransaction requires archive node access. Not all RPC providers support this.
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFetchTrace}
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch & Visualize"}
            </Button>
            <Button onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">Error: {error}</div>
        </div>
      )}

      {/* Trace Visualization */}
      {parsedTrace && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
              <div className="text-xs text-muted-foreground mb-1">Total Calls</div>
              <div className="text-base font-mono">{countCalls(parsedTrace)}</div>
            </div>
            <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
              <div className="text-xs text-muted-foreground mb-1">Max Depth</div>
              <div className="text-base font-mono">
                {Math.max(
                  ...JSON.stringify(parsedTrace)
                    .match(/"depth":\d+/g)
                    ?.map((m) => parseInt(m.split(":")[1])) || [0]
                )}
              </div>
            </div>
            <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
              <div className="text-xs text-muted-foreground mb-1">Total Gas</div>
              <div className="text-base font-mono">
                {calculateTotalGas(parsedTrace).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-[var(--color-green-500)]">
              Call Trace Tree
            </div>
            <Button onClick={collapseAll} size="sm">
              Refresh
            </Button>
          </div>

          {/* Tree Visualization */}
          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2">
            <TraceNodeContainer call={parsedTrace} />
          </div>

          {/* Legend */}
          <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
            <div className="text-xs font-medium mb-2">Call Type Legend</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
                <span>CALL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500" />
                <span>DELEGATECALL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500" />
                <span>STATICCALL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500" />
                <span>CREATE/CREATE2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500" />
                <span>FAILED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-[12px] border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400 space-y-2">
          <div>
            <strong>Transaction Traces:</strong> Visualize the complete call graph of a
            transaction, including all internal calls, gas usage, and return values.
          </div>
          <div className="text-xs">
            Use <code className="px-1 py-0.5 rounded-[6px] bg-[var(--color-gray-0)]">debug_traceTransaction</code>{" "}
            with the <code className="px-1 py-0.5 rounded-[6px] bg-[var(--color-gray-0)]">callTracer</code>{" "}
            to get trace data. Click nodes to expand/collapse and see detailed call information.
          </div>
        </div>
      </div>
    </div>
  );
}

export const traceVisualizerConfig: ToolConfig = {
  id: "trace-visualizer",
  name: "Transaction Trace Visualizer",
  description: "Visualize transaction call traces with interactive tree view",
  category: "web3",
  component: TraceVisualizerTool,
  codeSnippet: `// npm install viem

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY")
});

// Fetch transaction trace using debug_traceTransaction
async function getTransactionTrace(txHash: string) {
  const trace = await client.request({
    method: 'debug_traceTransaction',
    params: [txHash, { tracer: 'callTracer' }]
  });

  return trace;
}

// Parse and analyze trace data
function analyzeTrace(trace: any) {
  let totalCalls = 0;
  let maxDepth = 0;

  function traverse(call: any, depth: number = 0) {
    totalCalls++;
    maxDepth = Math.max(maxDepth, depth);

    console.log(\`\${" ".repeat(depth * 2)}\${call.type}: \${call.from} → \${call.to}\`);
    console.log(\`\${" ".repeat(depth * 2)}Gas: \${call.gasUsed}\`);

    if (call.calls) {
      call.calls.forEach((subCall: any) => traverse(subCall, depth + 1));
    }
  }

  traverse(trace);

  return { totalCalls, maxDepth };
}

// Example: Trace a Uniswap swap
const txHash = "0x123abc...";
const trace = await getTransactionTrace(txHash);
const analysis = analyzeTrace(trace);

console.log("Total calls:", analysis.totalCalls);
console.log("Max depth:", analysis.maxDepth);
`,
  seo: {
    keywords: [
      "transaction trace",
      "call trace visualizer",
      "debug_traceTransaction",
      "ethereum trace",
      "internal calls",
      "call graph",
      "transaction debugging",
      "trace viewer",
    ],
  },
  sections: [
    {
      title: "What is Transaction Tracing?",
      content:
        "Transaction tracing captures the complete execution path of a transaction, including all internal calls between contracts. This is essential for debugging complex transactions and understanding contract interactions.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">Transaction tracing uses debug_traceTransaction RPC method with the callTracer to record every internal call, gas usage, input/output data, and state changes. The trace is returned as a hierarchical tree structure showing the complete call graph from the initial transaction through all sub-calls.</p>

          <h4 className="text-base font-semibold mb-2">Call Types</h4>
          <p className="text-sm">CALL: Standard external call. DELEGATECALL: Execute code in caller's context. STATICCALL: Read-only call. CREATE/CREATE2: Contract deployment. Each type has different implications for state changes and context.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "ERC-20 Transfer - Simple CALL",
      content: `TX: 0xabcd1234...
Single CALL from EOA (0x1234...) to USDC contract (0xA0b8...)
21000 gas base + contract execution`,
      type: "code",
    },
    {
      title: "Uniswap V3 Swap - Complex Multi-call Chain",
      content: `TX: 0xdeadbeef...
Router (0x7a25...) → SwapRouter (0xE592...) → Pool (0x8ad6...)
→ TokenA transfer → TokenB transfer, ~150-250K total gas`,
      type: "code",
    },
    {
      title: "Aave Flash Loan - CALL + DELEGATECALL Pattern",
      content: `TX with executeOperation()
Flash loan request (0x7d2d...) → flashLoan CALL
→ Receiver DELEGATECALL → TokenTransfer CALL
Demonstrates delegatecall context switching`,
      type: "code",
    },
    {
      title: "Failed Transaction - Revert at Specific Depth",
      content: `TX: 0xfailed...
Trace shows successful CALLs → failed CALL with revert reason
Allows pinpointing failure point in call stack`,
      type: "code",
    },
  ],
  references: [
    {
      title: "debug_traceTransaction",
      url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-debug",
    },
    {
      title: "Understanding DELEGATECALL",
      url: "https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#delegatecall-callcode-and-libraries",
    },
  ],
};
