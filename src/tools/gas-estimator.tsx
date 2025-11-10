"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

type TransactionType = "transfer" | "erc20" | "swap" | "nft" | "contract";

const GAS_LIMITS: Record<TransactionType, number> = {
  transfer: 21000,
  erc20: 65000,
  swap: 150000,
  nft: 100000,
  contract: 200000,
};

export function GasEstimatorTool() {
  const [txType, setTxType] = useState<TransactionType>("transfer");
  const [gasPrice, setGasPrice] = useState("20"); // Gwei
  const [ethPrice, setEthPrice] = useState("2500"); // USD
  const [customGasLimit, setCustomGasLimit] = useState("");

  const [results, setResults] = useState({
    gasLimit: GAS_LIMITS.transfer,
    gasCostGwei: "0",
    gasCostEth: "0",
    gasCostUsd: "0",
  });

  useEffect(() => {
    calculateGasCost();
  }, [txType, gasPrice, ethPrice, customGasLimit]);

  const calculateGasCost = () => {
    const gasPriceNum = parseFloat(gasPrice) || 0;
    const ethPriceNum = parseFloat(ethPrice) || 0;
    const gasLimit = customGasLimit
      ? parseInt(customGasLimit)
      : GAS_LIMITS[txType];

    if (gasLimit <= 0) return;

    // Calculate costs
    const gasCostGwei = gasLimit * gasPriceNum;
    const gasCostEth = gasCostGwei / 1e9;
    const gasCostUsd = gasCostEth * ethPriceNum;

    setResults({
      gasLimit,
      gasCostGwei: gasCostGwei.toLocaleString(),
      gasCostEth: gasCostEth.toFixed(6),
      gasCostUsd: gasCostUsd.toFixed(2),
    });
  };

  const handleReset = () => {
    setTxType("transfer");
    setGasPrice("20");
    setEthPrice("2500");
    setCustomGasLimit("");
  };

  const presets = [
    { label: "Low", gwei: "10" },
    { label: "Medium", gwei: "20" },
    { label: "High", gwei: "50" },
    { label: "Very High", gwei: "100" },
  ];

  return (
    <div className="space-y-6">
      {/* Transaction Type */}
      <div>
        <Label className="mb-2 block text-sm">Transaction Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setTxType("transfer")}
            variant={txType === "transfer" ? "default" : "secondary"}
            className="text-sm"
          >
            ETH Transfer
          </Button>
          <Button
            onClick={() => setTxType("erc20")}
            variant={txType === "erc20" ? "default" : "secondary"}
            className="text-sm"
          >
            ERC20 Transfer
          </Button>
          <Button
            onClick={() => setTxType("swap")}
            variant={txType === "swap" ? "default" : "secondary"}
            className="text-sm"
          >
            DEX Swap
          </Button>
          <Button
            onClick={() => setTxType("nft")}
            variant={txType === "nft" ? "default" : "secondary"}
            className="text-sm"
          >
            NFT Transfer
          </Button>
          <Button
            onClick={() => setTxType("contract")}
            variant={txType === "contract" ? "default" : "secondary"}
            className="text-sm col-span-2"
          >
            Contract Interaction
          </Button>
        </div>
      </div>

      {/* Gas Price */}
      <div>
        <Input
          label="Gas Price (Gwei)"
          value={gasPrice}
          onChange={(e) => setGasPrice(e.target.value)}
          placeholder="20"
          className="font-mono text-sm mb-2"
          type="number"
        />
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => setGasPrice(preset.gwei)}
              variant="outline"
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ETH Price */}
      <Input
        label="ETH Price (USD)"
        value={ethPrice}
        onChange={(e) => setEthPrice(e.target.value)}
        placeholder="2500"
        className="font-mono text-sm"
        type="number"
      />

      {/* Custom Gas Limit */}
      <Input
        label="Custom Gas Limit (Optional)"
        value={customGasLimit}
        onChange={(e) => setCustomGasLimit(e.target.value)}
        placeholder={`Default: ${GAS_LIMITS[txType].toLocaleString()}`}
        className="font-mono text-sm"
        type="number"
      />

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-blue-400 border-b border-blue-500/30 pb-2">
          Gas Cost Estimation
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <div className="text-xs text-muted-foreground mb-1">Gas Limit</div>
            <div className="text-base font-mono">{results.gasLimit.toLocaleString()}</div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <div className="text-xs text-muted-foreground mb-1">Total Gwei</div>
            <div className="text-base font-mono">{results.gasCostGwei}</div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <div className="text-xs text-muted-foreground mb-1">Total ETH</div>
            <div className="text-base font-mono text-blue-400">{results.gasCostEth}</div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <div className="text-xs text-muted-foreground mb-1">Total USD</div>
            <div className="text-base font-mono text-green-400">${results.gasCostUsd}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={calculateGasCost} className="flex-1">
            Recalculate
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="p-4 rounded border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400">
          <strong>Formula:</strong>
          <div className="font-mono text-xs mt-2 space-y-1">
            <div>Gas Cost (Gwei) = Gas Limit × Gas Price</div>
            <div>Gas Cost (ETH) = Gas Cost (Gwei) ÷ 10⁹</div>
            <div>Gas Cost (USD) = Gas Cost (ETH) × ETH Price</div>
          </div>
        </div>
      </div>

      {/* Gas Limit Reference */}
      <div className="p-4 rounded border border-border bg-[#0f0f0f]">
        <div className="text-sm font-medium mb-2">Typical Gas Limits</div>
        <div className="text-xs space-y-1 font-mono text-muted-foreground">
          <div>ETH Transfer: 21,000 gas</div>
          <div>ERC20 Transfer: ~65,000 gas</div>
          <div>DEX Swap: ~150,000 gas</div>
          <div>NFT Transfer: ~100,000 gas</div>
          <div>Contract Interaction: ~200,000+ gas</div>
        </div>
      </div>
    </div>
  );
}

export const gasEstimatorConfig: ToolConfig = {
  id: "gas-estimator",
  name: "Gas Price Estimator",
  description: "Estimate Ethereum transaction costs in ETH and USD",
  category: "web3",
  component: GasEstimatorTool,
  seo: {
    keywords: [
      "ethereum gas calculator",
      "gas price estimator",
      "gwei calculator",
      "eth transaction cost",
      "gas limit calculator",
      "ethereum fee calculator",
      "transaction cost estimator",
      "gas price converter",
      "eth gas tracker",
      "calculate gas fee",
    ],
  },
  sections: [
    {
      title: "What is Gas?",
      content:
        "Gas is the unit of measurement for the computational work required to execute operations on Ethereum. Gas prices are denominated in Gwei (1 Gwei = 10⁻⁹ ETH). The total transaction cost equals gas used multiplied by gas price.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Gas Limit vs Gas Used</h4>
          <p className="text-sm mb-4">
            Gas limit is the maximum amount of gas you're willing to spend on a transaction. Gas used is the actual amount consumed. If the limit is too low, the transaction fails. Unused gas is refunded.
          </p>

          <h4 className="text-base font-semibold mb-2">Gas Price Tiers</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Low (10-20 Gwei): Slower confirmation, lower cost</li>
            <li>Medium (20-50 Gwei): Normal confirmation time</li>
            <li>High (50-100 Gwei): Fast confirmation, higher cost</li>
            <li>Very High (100+ Gwei): Priority during network congestion</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple ETH transfer at 20 Gwei",
      content: "21,000 gas × 20 Gwei = 420,000 Gwei = 0.00042 ETH",
      type: "code",
    },
    {
      title: "ERC20 transfer at 50 Gwei (ETH = $2500)",
      content: "65,000 gas × 50 Gwei = 3,250,000 Gwei = 0.00325 ETH = $8.13",
      type: "code",
    },
    {
      title: "DEX swap at 100 Gwei (ETH = $2500)",
      content: "150,000 gas × 100 Gwei = 15,000,000 Gwei = 0.015 ETH = $37.50",
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { parseGwei, formatEther, formatGwei } from 'viem';

interface GasEstimate {
  gasLimit: number;
  gasPriceGwei: number;
  totalGwei: bigint;
  totalEth: string;
  totalUsd: string;
}

// Estimate gas cost
function estimateGasCost(
  gasLimit: number,
  gasPriceGwei: number,
  ethPriceUsd: number
): GasEstimate {
  // Convert gas price to wei
  const gasPriceWei = parseGwei(gasPriceGwei.toString());

  // Calculate total gas cost in wei
  const totalWei = BigInt(gasLimit) * gasPriceWei;

  // Convert to Gwei and ETH
  const totalGwei = totalWei / BigInt(1e9);
  const totalEth = formatEther(totalWei);

  // Calculate USD cost
  const totalUsd = (parseFloat(totalEth) * ethPriceUsd).toFixed(2);

  return {
    gasLimit,
    gasPriceGwei,
    totalGwei,
    totalEth,
    totalUsd
  };
}

// Common gas limits
const GAS_LIMITS = {
  ETH_TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  ERC20_APPROVE: 45000,
  UNISWAP_SWAP: 150000,
  NFT_MINT: 100000,
  NFT_TRANSFER: 85000
};

// Examples
const ethTransfer = estimateGasCost(GAS_LIMITS.ETH_TRANSFER, 20, 2500);
console.log('ETH Transfer:');
console.log('  Gas:', ethTransfer.gasLimit);
console.log('  Price:', ethTransfer.gasPriceGwei, 'Gwei');
console.log('  Cost:', ethTransfer.totalEth, 'ETH');
console.log('  USD:', '$' + ethTransfer.totalUsd);

const erc20Transfer = estimateGasCost(GAS_LIMITS.ERC20_TRANSFER, 50, 2500);
console.log('\\nERC20 Transfer:');
console.log('  Cost:', erc20Transfer.totalEth, 'ETH');
console.log('  USD:', '$' + erc20Transfer.totalUsd);

const uniswapSwap = estimateGasCost(GAS_LIMITS.UNISWAP_SWAP, 100, 2500);
console.log('\\nUniswap Swap:');
console.log('  Cost:', uniswapSwap.totalEth, 'ETH');
console.log('  USD:', '$' + uniswapSwap.totalUsd);

// Get current gas price from network
// import { createPublicClient, http } from 'viem';
// import { mainnet } from 'viem/chains';
//
// const client = createPublicClient({
//   chain: mainnet,
//   transport: http()
// });
//
// const gasPrice = await client.getGasPrice();
// const gasPriceGwei = formatGwei(gasPrice);
// console.log('Current gas price:', gasPriceGwei, 'Gwei');`,
  references: [
    {
      title: "Ethereum Gas Explained",
      url: "https://ethereum.org/en/developers/docs/gas/",
    },
    {
      title: "Gas Price Tracker",
      url: "https://etherscan.io/gastracker",
    },
    {
      title: "viem: Estimating Gas",
      url: "https://viem.sh/docs/actions/public/estimateGas",
    },
  ],
};
