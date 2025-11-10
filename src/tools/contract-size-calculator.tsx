"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

interface SizeResult {
  bytes: number;
  kilobytes: number;
  percentage: number;
  status: "safe" | "warning" | "danger";
  remainingBytes: number;
}

export function ContractSizeCalculatorTool() {
  const [inputMode, setInputMode] = useState<"bytecode" | "solidity">("bytecode");
  const [bytecode, setBytecode] = useState("");
  const [solidityCode, setSolidityCode] = useState("");
  const [sizeResult, setSizeResult] = useState<SizeResult | null>(null);
  const [error, setError] = useState("");

  const MAX_CONTRACT_SIZE = 24576; // 24 KB in bytes (EIP-170)

  const calculateSize = () => {
    try {
      setError("");
      setSizeResult(null);

      let cleanBytecode = "";

      if (inputMode === "bytecode") {
        if (!bytecode) {
          setError("Please provide contract bytecode");
          return;
        }
        cleanBytecode = bytecode.trim();
      } else {
        // Solidity mode - estimate size from character count
        if (!solidityCode) {
          setError("Please provide Solidity code");
          return;
        }
        // Very rough estimation: 1 line of Solidity ≈ 10-20 bytes of bytecode
        // This is just an approximation
        const lines = solidityCode.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
        const estimatedBytes = lines * 15; // rough average

        setSizeResult({
          bytes: estimatedBytes,
          kilobytes: estimatedBytes / 1024,
          percentage: (estimatedBytes / MAX_CONTRACT_SIZE) * 100,
          status: estimatedBytes < 20480 ? "safe" : estimatedBytes < 23552 ? "warning" : "danger",
          remainingBytes: MAX_CONTRACT_SIZE - estimatedBytes,
        });

        setError("⚠️ This is a rough estimation. Compile your contract to get accurate bytecode size.");
        return;
      }

      // Remove 0x prefix if present
      if (cleanBytecode.startsWith("0x")) {
        cleanBytecode = cleanBytecode.slice(2);
      }

      // Validate hex
      if (!/^[0-9a-fA-F]*$/.test(cleanBytecode)) {
        throw new Error("Bytecode must be valid hexadecimal");
      }

      // Calculate size (each pair of hex chars = 1 byte)
      const bytes = cleanBytecode.length / 2;
      const kilobytes = bytes / 1024;
      const percentage = (bytes / MAX_CONTRACT_SIZE) * 100;
      const remainingBytes = MAX_CONTRACT_SIZE - bytes;

      // Determine status
      let status: "safe" | "warning" | "danger";
      if (bytes < 20480) {
        // < 20 KB
        status = "safe";
      } else if (bytes <= 23552) {
        // 20-23 KB
        status = "warning";
      } else {
        // > 23 KB
        status = "danger";
      }

      setSizeResult({
        bytes,
        kilobytes,
        percentage,
        status,
        remainingBytes,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
      setSizeResult(null);
    }
  };

  const handleReset = () => {
    setBytecode("");
    setSolidityCode("");
    setSizeResult(null);
    setError("");
  };

  const getStatusColor = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return "text-green-400 border-green-500/30 bg-green-500/10";
      case "warning":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "danger":
        return "text-red-400 border-red-500/30 bg-red-500/10";
    }
  };

  const getProgressBarColor = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
    }
  };

  const getStatusMessage = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return "Contract size is within safe limits";
      case "warning":
        return "Contract is approaching the size limit - consider optimization";
      case "danger":
        return "Contract exceeds or is very close to the 24KB limit!";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setInputMode("bytecode")}
          variant={inputMode === "bytecode" ? "default" : "secondary"}
          className="flex-1"
        >
          Bytecode
        </Button>
        <Button
          onClick={() => setInputMode("solidity")}
          variant={inputMode === "solidity" ? "default" : "secondary"}
          className="flex-1"
        >
          Solidity Code
        </Button>
      </div>

      {/* Input Section */}
      <div>
        {inputMode === "bytecode" ? (
          <>
            <Label className="mb-2 block text-sm">Contract Bytecode (Hex)</Label>
            <Textarea
              value={bytecode}
              onChange={(e) => setBytecode(e.target.value)}
              placeholder="0x608060405234801561001057600080fd5b50..."
              className="font-mono text-sm min-h-[120px] mb-2"
            />
          </>
        ) : (
          <>
            <Label className="mb-2 block text-sm">Solidity Source Code (Estimation)</Label>
            <Textarea
              value={solidityCode}
              onChange={(e) => setSolidityCode(e.target.value)}
              placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Your contract code here&#10;}"
              className="font-mono text-sm min-h-[200px] mb-2"
            />
            <p className="text-xs text-muted-foreground mb-2">
              Note: This provides a rough estimation. For accurate size, compile and use bytecode.
            </p>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={calculateSize} className="flex-1">
            Calculate Size
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
      {sizeResult && (
        <>
          <div className={`p-4 rounded border ${getStatusColor(sizeResult.status)}`}>
            <Label className="mb-2 block text-sm font-semibold">
              {getStatusMessage(sizeResult.status)}
            </Label>
            <div className="text-base font-mono font-semibold">
              {sizeResult.bytes.toLocaleString()} bytes ({sizeResult.kilobytes.toFixed(2)} KB)
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Size Limit Progress</Label>
              <span className="font-mono">{sizeResult.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-6 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getProgressBarColor(sizeResult.status)}`}
                style={{ width: `${Math.min(sizeResult.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 bytes</span>
              <span>24,576 bytes (24 KB limit)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded border border-border bg-[#0f0f0f]">
              <Label className="mb-1 block text-xs text-muted-foreground">Current Size</Label>
              <div className="font-mono text-base font-semibold">{sizeResult.bytes} bytes</div>
            </div>
            <div className="p-4 rounded border border-border bg-[#0f0f0f]">
              <Label className="mb-1 block text-xs text-muted-foreground">Remaining</Label>
              <div className="font-mono text-base font-semibold">
                {sizeResult.remainingBytes > 0 ? sizeResult.remainingBytes : 0} bytes
              </div>
            </div>
          </div>

          {sizeResult.status !== "safe" && (
            <div className="p-4 rounded border border-blue-500/30 bg-blue-500/10">
              <Label className="mb-3 block text-sm font-semibold text-blue-400">
                Optimization Tips
              </Label>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Enable optimizer:</strong> Use Solidity compiler with optimizer enabled (recommended runs: 200-1000)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Shorten error messages:</strong> Use custom errors instead of require strings (Solidity 0.8.4+)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Extract libraries:</strong> Move reusable code to external libraries
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Use proxies:</strong> Split logic across multiple contracts with proxy pattern
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Remove unused code:</strong> Delete dead code, unused imports, and redundant functions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Optimize storage:</strong> Pack storage variables efficiently, use smaller types when possible
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Use function modifiers:</strong> Extract repeated checks into modifiers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong>Avoid inheritance bloat:</strong> Only inherit from necessary contracts
                  </span>
                </li>
              </ul>
            </div>
          )}

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Get Contract Bytecode</Label>
            <Code language="javascript">
{`// Using Hardhat
const MyContract = await ethers.getContractFactory("MyContract");
const bytecode = MyContract.bytecode;
console.log("Size:", bytecode.length / 2, "bytes");

// Using Foundry
forge build
// Check out/MyContract.sol/MyContract.json
// Look for "deployedBytecode" field

// Using web3.js
const contract = new web3.eth.Contract(abi, address);
const code = await web3.eth.getCode(address);
console.log("Size:", (code.length - 2) / 2, "bytes");`}
            </Code>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Hardhat Config for Optimization</Label>
            <Code language="javascript">
{`// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // Lower = smaller size, higher = lower gas
      },
      viaIR: true  // Enable IR-based compilation (optional)
    }
  }
};`}
            </Code>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Example: Using Custom Errors (Saves Space)</Label>
            <Code language="solidity">
{`// ❌ Before (uses more bytecode)
require(msg.sender == owner, "Only owner can call this function");

// ✅ After (saves bytecode)
error NotOwner();
if (msg.sender != owner) revert NotOwner();

// Custom errors can also have parameters
error InsufficientBalance(uint256 available, uint256 required);
if (balance < amount) revert InsufficientBalance(balance, amount);`}
            </Code>
          </div>
        </>
      )}
    </div>
  );
}

export const contractSizeCalculatorConfig: ToolConfig = {
  id: "contract-size-calculator",
  name: "Contract Size Calculator",
  description: "Calculate smart contract bytecode size and check against the 24KB EIP-170 limit",
  category: "web3",
  component: ContractSizeCalculatorTool,
  seo: {
    keywords: [
      "contract size calculator",
      "eip-170 limit",
      "24kb contract limit",
      "bytecode size checker",
      "contract optimization",
      "solidity optimizer",
      "contract size limit",
      "ethereum contract size",
      "bytecode calculator",
      "contract too large",
    ],
  },
  sections: [
    {
      title: "What is the 24KB limit?",
      content:
        "EIP-170, implemented in the Spurious Dragon hard fork, limits smart contract bytecode size to 24,576 bytes (24 KB). This limit prevents DoS attacks and ensures network stability. Contracts exceeding this limit will fail to deploy.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Contract size is measured in bytes of deployed bytecode. Each pair of hexadecimal characters represents one byte. The size includes compiled Solidity code, constructor logic, and metadata. The tool divides hex string length by 2 to get byte count, then compares against the 24KB (24,576 bytes) limit.
          </p>

          <h4 className="text-base font-semibold mb-2">Why was this limit introduced?</h4>
          <p className="text-sm mb-2">The 24KB limit was introduced to:</p>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Prevent network spam with extremely large contracts</li>
            <li>Limit memory requirements for nodes</li>
            <li>Reduce blockchain bloat</li>
            <li>Make it harder to create denial-of-service attacks</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">How to check contract size</h4>
          <p className="text-sm mb-2">You can check your contract size in several ways:</p>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Compile with Hardhat/Foundry and check the bytecode length</li>
            <li>Use hardhat-contract-sizer plugin for automated checking</li>
            <li>Query deployed contracts with eth_getCode RPC method</li>
            <li>Use this tool by pasting the compiled bytecode</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Optimization strategies</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Quick wins:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>Enable Solidity optimizer (runs: 200-1000)</li>
              <li>Replace require strings with custom errors</li>
              <li>Remove unused functions and imports</li>
            </ul>
            <p><strong>Architecture changes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Split logic across multiple contracts</li>
              <li>Use proxy patterns for upgradeability</li>
              <li>Extract common code to libraries</li>
              <li>Use minimal proxy (EIP-1167) for clones</li>
            </ul>
          </div>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "OpenZeppelin ERC-20 (USDC-like)",
      content: `Standard ERC-20: 5-6 KB
USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48):
~13 KB with permit, minting, burning features`,
      type: "code",
    },
    {
      title: "Uniswap V2 Pair contract",
      content: `UniswapV2Pair (0xB4e16d0168e52d7dC3BA36907b029DCB3a17c8d1)
USDC/WETH: ~12.5 KB - highly optimized liquidity pair`,
      type: "code",
    },
    {
      title: "Aave LendingPool (Proxy Pattern)",
      content: `Main pool (0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9):
Uses UUPS proxy to exceed 24KB
Implementation splits: Core (~22KB), Interest (~8KB),
Flashloan (~6KB)`,
      type: "code",
    },
  ],
  codeSnippet: `// No external packages needed - pure Node.js/TypeScript

interface SizeResult {
  bytes: number;
  kilobytes: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  remainingBytes: number;
}

const MAX_CONTRACT_SIZE = 24576; // 24 KB (EIP-170 limit)

// Calculate contract bytecode size
function calculateContractSize(bytecode: string): SizeResult {
  // Remove 0x prefix if present
  let cleanBytecode = bytecode.trim();
  if (cleanBytecode.startsWith('0x')) {
    cleanBytecode = cleanBytecode.slice(2);
  }

  // Validate hex string
  if (!/^[0-9a-fA-F]*$/.test(cleanBytecode)) {
    throw new Error('Bytecode must be valid hexadecimal');
  }

  // Each pair of hex characters = 1 byte
  const bytes = cleanBytecode.length / 2;
  const kilobytes = bytes / 1024;
  const percentage = (bytes / MAX_CONTRACT_SIZE) * 100;
  const remainingBytes = MAX_CONTRACT_SIZE - bytes;

  // Determine status
  let status: 'safe' | 'warning' | 'danger';
  if (bytes < 20480) {
    status = 'safe'; // < 20 KB
  } else if (bytes <= 23552) {
    status = 'warning'; // 20-23 KB
  } else {
    status = 'danger'; // > 23 KB
  }

  return { bytes, kilobytes, percentage, status, remainingBytes };
}

// Example: Check contract size
const exampleBytecode = '0x' + '60'.repeat(15000); // ~15 KB contract
const result = calculateContractSize(exampleBytecode);

console.log('Contract size:', result.bytes, 'bytes');
console.log('Size in KB:', result.kilobytes.toFixed(2), 'KB');
console.log('Percentage of limit:', result.percentage.toFixed(1) + '%');
console.log('Status:', result.status);
console.log('Remaining space:', result.remainingBytes, 'bytes');

// Check if deployment will succeed
if (result.status === 'danger') {
  console.log('WARNING: Contract may exceed EIP-170 24KB limit!');
}

// Calculate how many bytes to optimize
const bytesToOptimize = Math.max(0, result.bytes - 20480);
console.log('Bytes to optimize for safety:', bytesToOptimize);`,
  references: [
    {
      title: "EIP-170: Contract Code Size Limit",
      url: "https://eips.ethereum.org/EIPS/eip-170",
    },
    {
      title: "Solidity Optimizer Documentation",
      url: "https://docs.soliditylang.org/en/latest/internals/optimizer.html",
    },
    {
      title: "OpenZeppelin: Contract Size Optimization",
      url: "https://docs.openzeppelin.com/contracts/4.x/api/proxy",
    },
  ],
};
