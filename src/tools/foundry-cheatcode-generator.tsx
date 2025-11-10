"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { MdContentCopy, MdCheck, MdSearch } from "react-icons/md";

interface CheatcodeParam {
  name: string;
  type: string;
  description: string;
  placeholder?: string;
}

interface Cheatcode {
  name: string;
  syntax: string;
  description: string;
  params: CheatcodeParam[];
  example: string;
  category: string;
}

const cheatcodes: Cheatcode[] = [
  // Pranking
  {
    name: "vm.prank",
    syntax: "vm.prank(address)",
    description: "Sets msg.sender for the next call only",
    category: "Pranking",
    params: [
      { name: "sender", type: "address", description: "Address to impersonate", placeholder: "0x..." }
    ],
    example: "vm.prank(alice);\ntoken.transfer(bob, 100);"
  },
  {
    name: "vm.startPrank",
    syntax: "vm.startPrank(address)",
    description: "Sets msg.sender for all subsequent calls until stopPrank",
    category: "Pranking",
    params: [
      { name: "sender", type: "address", description: "Address to impersonate", placeholder: "0x..." }
    ],
    example: "vm.startPrank(alice);\ntoken.transfer(bob, 100);\ntoken.approve(spender, 200);\nvm.stopPrank();"
  },
  {
    name: "vm.stopPrank",
    syntax: "vm.stopPrank()",
    description: "Stops the current prank",
    category: "Pranking",
    params: [],
    example: "vm.startPrank(alice);\n// calls as alice\nvm.stopPrank();"
  },
  {
    name: "vm.pranks with origin",
    syntax: "vm.prank(address sender, address origin)",
    description: "Sets both msg.sender and tx.origin for the next call",
    category: "Pranking",
    params: [
      { name: "sender", type: "address", description: "msg.sender address", placeholder: "0x..." },
      { name: "origin", type: "address", description: "tx.origin address", placeholder: "0x..." }
    ],
    example: "vm.prank(alice, bob);\ncontract.requireAuth();"
  },

  // Balance
  {
    name: "vm.deal",
    syntax: "vm.deal(address, uint256)",
    description: "Sets the ETH balance of an address",
    category: "Balance",
    params: [
      { name: "account", type: "address", description: "Address to set balance for", placeholder: "0x..." },
      { name: "amount", type: "uint256", description: "Balance in wei", placeholder: "1000000000000000000" }
    ],
    example: "vm.deal(alice, 100 ether);\nassertEq(alice.balance, 100 ether);"
  },
  {
    name: "vm.hoax",
    syntax: "vm.hoax(address, uint256)",
    description: "Combines prank and deal - sets msg.sender and gives ETH",
    category: "Balance",
    params: [
      { name: "account", type: "address", description: "Address to impersonate and fund", placeholder: "0x..." },
      { name: "amount", type: "uint256", description: "Balance in wei", placeholder: "1000000000000000000" }
    ],
    example: "vm.hoax(alice, 10 ether);\npayable(bob).transfer(5 ether);"
  },

  // Time
  {
    name: "vm.warp",
    syntax: "vm.warp(uint256)",
    description: "Sets block.timestamp",
    category: "Time",
    params: [
      { name: "timestamp", type: "uint256", description: "New timestamp", placeholder: "1640000000" }
    ],
    example: "vm.warp(1640000000);\nassertEq(block.timestamp, 1640000000);"
  },
  {
    name: "vm.skip",
    syntax: "skip(uint256)",
    description: "Increases block.timestamp by the specified number of seconds",
    category: "Time",
    params: [
      { name: "seconds", type: "uint256", description: "Seconds to skip", placeholder: "86400" }
    ],
    example: "skip(1 days);\n// block.timestamp is now 1 day later"
  },
  {
    name: "vm.rewind",
    syntax: "rewind(uint256)",
    description: "Decreases block.timestamp by the specified number of seconds",
    category: "Time",
    params: [
      { name: "seconds", type: "uint256", description: "Seconds to rewind", placeholder: "3600" }
    ],
    example: "rewind(1 hours);\n// block.timestamp is now 1 hour earlier"
  },

  // Block
  {
    name: "vm.roll",
    syntax: "vm.roll(uint256)",
    description: "Sets block.number",
    category: "Block",
    params: [
      { name: "blockNumber", type: "uint256", description: "New block number", placeholder: "15000000" }
    ],
    example: "vm.roll(15000000);\nassertEq(block.number, 15000000);"
  },
  {
    name: "vm.fee",
    syntax: "vm.fee(uint256)",
    description: "Sets block.basefee",
    category: "Block",
    params: [
      { name: "baseFee", type: "uint256", description: "Base fee in wei", placeholder: "20000000000" }
    ],
    example: "vm.fee(20 gwei);\nassertEq(block.basefee, 20 gwei);"
  },
  {
    name: "vm.chainId",
    syntax: "vm.chainId(uint256)",
    description: "Sets block.chainid",
    category: "Block",
    params: [
      { name: "chainId", type: "uint256", description: "Chain ID", placeholder: "1" }
    ],
    example: "vm.chainId(137);\nassertEq(block.chainid, 137);"
  },
  {
    name: "vm.coinbase",
    syntax: "vm.coinbase(address)",
    description: "Sets block.coinbase",
    category: "Block",
    params: [
      { name: "coinbase", type: "address", description: "Coinbase address", placeholder: "0x..." }
    ],
    example: "vm.coinbase(alice);\nassertEq(block.coinbase, alice);"
  },

  // Mock
  {
    name: "vm.mockCall",
    syntax: "vm.mockCall(address, bytes, bytes)",
    description: "Mocks a call to an address, returns the specified data",
    category: "Mock",
    params: [
      { name: "target", type: "address", description: "Contract to mock", placeholder: "0x..." },
      { name: "callData", type: "bytes", description: "Call data to match", placeholder: "0x..." },
      { name: "returnData", type: "bytes", description: "Data to return", placeholder: "0x..." }
    ],
    example: "vm.mockCall(\n  address(token),\n  abi.encodeWithSelector(token.balanceOf.selector, alice),\n  abi.encode(1000)\n);"
  },
  {
    name: "vm.mockCall with value",
    syntax: "vm.mockCall(address, uint256, bytes, bytes)",
    description: "Mocks a call with ETH value",
    category: "Mock",
    params: [
      { name: "target", type: "address", description: "Contract to mock", placeholder: "0x..." },
      { name: "value", type: "uint256", description: "ETH value", placeholder: "1000000000000000000" },
      { name: "callData", type: "bytes", description: "Call data to match", placeholder: "0x..." },
      { name: "returnData", type: "bytes", description: "Data to return", placeholder: "0x..." }
    ],
    example: "vm.mockCall(\n  address(vault),\n  1 ether,\n  abi.encodeWithSelector(vault.deposit.selector),\n  abi.encode(true)\n);"
  },
  {
    name: "vm.clearMockedCalls",
    syntax: "vm.clearMockedCalls()",
    description: "Clears all mocked calls",
    category: "Mock",
    params: [],
    example: "vm.clearMockedCalls();\n// All mocks are now cleared"
  },
  {
    name: "vm.expectCall",
    syntax: "vm.expectCall(address, bytes)",
    description: "Expects a call to be made to an address with specific data",
    category: "Mock",
    params: [
      { name: "target", type: "address", description: "Expected call target", placeholder: "0x..." },
      { name: "callData", type: "bytes", description: "Expected call data", placeholder: "0x..." }
    ],
    example: "vm.expectCall(\n  address(token),\n  abi.encodeWithSelector(token.transfer.selector, bob, 100)\n);\ncontract.transferTokens();"
  },
];

const categories = ["All", "Pranking", "Balance", "Time", "Block", "Mock"];

export function FoundryCheatcodeGeneratorTool() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCheatcode, setSelectedCheatcode] = useState<Cheatcode | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredCheatcodes = cheatcodes.filter(cheat => {
    const matchesCategory = selectedCategory === "All" || cheat.category === selectedCategory;
    const matchesSearch = cheat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cheat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheatcodeSelect = (cheatcode: Cheatcode) => {
    setSelectedCheatcode(cheatcode);
    setParamValues({});
    setGeneratedCode("");
  };

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues(prev => ({ ...prev, [paramName]: value }));
  };

  const generateCode = () => {
    if (!selectedCheatcode) return;

    let code = selectedCheatcode.name + "(";

    if (selectedCheatcode.params.length > 0) {
      const paramStrings = selectedCheatcode.params.map(param => {
        const value = paramValues[param.name] || param.placeholder || `<${param.name}>`;
        return value;
      });
      code += paramStrings.join(", ");
    }

    code += ");";
    setGeneratedCode(code);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedCheatcode(null);
    setParamValues({});
    setGeneratedCode("");
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cheatcodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "secondary"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Cheatcode List */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Available Cheatcodes ({filteredCheatcodes.length})
        </div>
        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
          {filteredCheatcodes.map((cheatcode) => (
            <Button
              key={cheatcode.name}
              onClick={() => handleCheatcodeSelect(cheatcode)}
              variant={selectedCheatcode?.name === cheatcode.name ? "default" : "secondary"}
              className="p-3 h-auto flex flex-col items-start justify-start text-left"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-blue-400 truncate">
                    {cheatcode.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {cheatcode.description}
                  </div>
                </div>
                <div className="text-xs px-2 py-0.5 rounded bg-[#0f0f0f] text-muted-foreground shrink-0">
                  {cheatcode.category}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Cheatcode Details */}
      {selectedCheatcode && (
        <div className="space-y-4 p-4 rounded border border-blue-500/30 bg-blue-500/5">
          <div>
            <div className="text-sm font-medium text-blue-400 mb-2">Syntax</div>
            <div className="p-3 rounded bg-[#0f0f0f] border border-border font-mono text-sm">
              {selectedCheatcode.syntax}
            </div>
          </div>

          {/* Parameters */}
          {selectedCheatcode.params.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-blue-400">Parameters</div>
              {selectedCheatcode.params.map((param) => (
                <div key={param.name}>
                  <Input
                    label={`${param.name} (${param.type})`}
                    value={paramValues[param.name] || ""}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    placeholder={param.placeholder}
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1 ml-1">
                    {param.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generate Button */}
          <Button onClick={generateCode} className="w-full">
            Generate Code
          </Button>

          {/* Generated Code */}
          {generatedCode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-green-400">Generated Code</div>
                <Button
                  onClick={() => handleCopy(generatedCode)}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 gap-1"
                >
                  {copied ? (
                    <>
                      <MdCheck className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <MdContentCopy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="p-3 rounded bg-[#0f0f0f] border border-green-500/30 font-mono text-sm text-green-400">
                {generatedCode}
              </div>
            </div>
          )}

          {/* Example Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-400">Example Usage</div>
              <Button
                onClick={() => handleCopy(selectedCheatcode.example)}
                variant="ghost"
                size="sm"
                className="h-auto p-1 gap-1"
              >
                <MdContentCopy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </Button>
            </div>
            <div className="p-3 rounded bg-[#0f0f0f] border border-border">
              <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {selectedCheatcode.example}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {(selectedCheatcode || searchQuery || selectedCategory !== "All") && (
        <Button onClick={handleReset} variant="secondary" className="w-full">
          Reset All
        </Button>
      )}

      {/* Info Box */}
      <div className="p-4 rounded border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400">
          <strong>Foundry Cheatcodes:</strong> Special testing functions that manipulate the EVM state.
          Use these in your Foundry tests to control time, impersonate accounts, mock calls, and more.
          All cheatcodes are prefixed with <code className="px-1 py-0.5 rounded bg-[#0f0f0f]">vm.</code>
        </div>
      </div>
    </div>
  );
}

export const foundryCheatcodeGeneratorConfig: ToolConfig = {
  id: "foundry-cheatcode-generator",
  name: "Foundry Cheatcode Generator",
  description: "Generate and explore Foundry testing cheatcodes with examples",
  category: "web3",
  component: FoundryCheatcodeGeneratorTool,
  seo: {
    keywords: [
      "foundry cheatcodes",
      "foundry testing",
      "vm.prank",
      "vm.deal",
      "vm.warp",
      "foundry test helpers",
      "ethereum testing",
      "solidity testing",
      "forge test",
      "foundry vm",
    ],
  },
  sections: [
    {
      title: "What are Foundry Cheatcodes?",
      content:
        "Cheatcodes are special functions in Foundry that allow you to manipulate the EVM state during tests. They enable time travel, account impersonation, balance manipulation, and more.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Common Use Cases</h4>
          <p className="text-sm">
            Pranking: Impersonate any address with vm.prank() or vm.startPrank(). Balance: Set ETH balances with vm.deal(). Time: Control block.timestamp with vm.warp(). Mocking: Mock external calls with vm.mockCall().
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Impersonate USDC Transfer (Mainnet)",
      content: `address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
// Binance wallet
vm.prank(0xF977814e90dA44bFA03b6295A0616a897441aceC);
IERC20(usdc).transfer(recipient, 1000e6);`,
      type: "code",
    },
    {
      title: "Uniswap Liquidity Testing",
      content: `// Simulate 30 days passing
vm.warp(block.timestamp + 30 days);
// Give ETH to alice
vm.deal(alice, 100 ether);
router.swapExactETHForTokens{value: 1 ether}(
  0,
  path,
  address(this),
  block.timestamp
);`,
      type: "code",
    },
    {
      title: "Aave Flashloan Mock Test",
      content: `address aave = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
vm.mockCall(
  aave,
  abi.encodeWithSelector(ILendingPool.flashLoan.selector),
  abi.encode(true)
);
vm.expectCall(
  aave,
  abi.encodeWithSelector(ILendingPool.flashLoan.selector)
);
lendingPool.flashLoan(token, amount, data);`,
      type: "code",
    },
  ],
  codeSnippet: `// No external packages needed - Foundry built-in cheatcodes
// Use in Foundry tests (.t.sol files)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

contract CheatcodeExamples is Test {
    // Pranking: Impersonate addresses
    function testPrank() public {
        address alice = address(0x1);
        vm.prank(alice);
        // Next call will be from alice
        someContract.doSomething();
    }

    function testStartPrank() public {
        address alice = address(0x1);
        vm.startPrank(alice);
        // All calls are from alice until stopPrank
        someContract.call1();
        someContract.call2();
        vm.stopPrank();
    }

    // Balance: Set ETH balance
    function testDeal() public {
        address alice = address(0x1);
        vm.deal(alice, 100 ether);
        assertEq(alice.balance, 100 ether);
    }

    // Time: Manipulate block.timestamp
    function testWarp() public {
        uint256 futureTime = block.timestamp + 30 days;
        vm.warp(futureTime);
        assertEq(block.timestamp, futureTime);
    }

    // Block: Manipulate block.number
    function testRoll() public {
        vm.roll(1000000);
        assertEq(block.number, 1000000);
    }

    // Mock: Mock external calls
    function testMockCall() public {
        address token = address(0x123);
        vm.mockCall(
            token,
            abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)),
            abi.encode(1000e18)
        );

        uint256 balance = IERC20(token).balanceOf(address(this));
        assertEq(balance, 1000e18);
    }

    // Expect: Verify calls are made
    function testExpectCall() public {
        vm.expectCall(
            address(token),
            abi.encodeWithSelector(IERC20.transfer.selector, recipient, 100)
        );
        token.transfer(recipient, 100);
    }

    // Combined: Hoax (prank + deal)
    function testHoax() public {
        address alice = address(0x1);
        vm.hoax(alice, 10 ether);
        // Next call is from alice with 10 ETH balance
        payable(bob).transfer(5 ether);
    }
}`,
  references: [
    {
      title: "Foundry Cheatcodes Reference",
      url: "https://book.getfoundry.sh/cheatcodes/",
    },
    {
      title: "Foundry Testing Guide",
      url: "https://book.getfoundry.sh/forge/writing-tests",
    },
  ],
};
