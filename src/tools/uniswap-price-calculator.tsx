"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function UniswapPriceCalculatorTool() {
  const [reserve0, setReserve0] = useState("");
  const [reserve1, setReserve1] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [poolFee, setPoolFee] = useState("0.3");

  // Calculated outputs
  const [price, setPrice] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [priceImpact, setPriceImpact] = useState("");
  const [impermanentLoss, setImpermanentLoss] = useState("");

  const calculateUniswapV2 = () => {
    try {
      const r0 = parseFloat(reserve0);
      const r1 = parseFloat(reserve1);
      const aIn = parseFloat(amountIn);
      const fee = parseFloat(poolFee);

      if (isNaN(r0) || isNaN(r1) || isNaN(aIn) || isNaN(fee) || r0 <= 0 || r1 <= 0 || aIn <= 0) {
        throw new Error("Invalid input");
      }

      // Initial price (Token1 per Token0)
      const initialPrice = r1 / r0;
      setPrice(initialPrice.toFixed(6));

      // Uniswap V2 formula: amountOut = (amountIn * (1 - fee) * reserve1) / (reserve0 + amountIn * (1 - fee))
      const feeMultiplier = 1 - (fee / 100);
      const amountInWithFee = aIn * feeMultiplier;
      const numerator = amountInWithFee * r1;
      const denominator = r0 + amountInWithFee;
      const aOut = numerator / denominator;
      setAmountOut(aOut.toFixed(6));

      // Price impact calculation
      const executionPrice = aOut / aIn;
      const impact = ((initialPrice - executionPrice) / initialPrice) * 100;
      setPriceImpact(Math.abs(impact).toFixed(4));

      // Impermanent Loss calculation
      // IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
      const newPrice = (r1 - aOut) / (r0 + aIn);
      const priceRatio = newPrice / initialPrice;
      const il = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
      setImpermanentLoss(Math.abs(il).toFixed(4));

    } catch (e) {
      setPrice("");
      setAmountOut("");
      setPriceImpact("");
      setImpermanentLoss("");
    }
  };

  const handleReset = () => {
    setReserve0("");
    setReserve1("");
    setAmountIn("");
    setPoolFee("0.3");
    setPrice("");
    setAmountOut("");
    setPriceImpact("");
    setImpermanentLoss("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Input
            label="Reserve Token0"
            value={reserve0}
            onChange={(e) => setReserve0(e.target.value)}
            placeholder="10000"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Amount of Token0 in the pool
          </div>
        </div>

        <div>
          <Input
            label="Reserve Token1"
            value={reserve1}
            onChange={(e) => setReserve1(e.target.value)}
            placeholder="20000"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Amount of Token1 in the pool
          </div>
        </div>

        <div>
          <Input
            label="Amount In (Token0)"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="100"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Amount of Token0 to swap
          </div>
        </div>

        <div>
          <label className="text-sm mb-2 block">Pool Fee</label>
          <div className="flex gap-2">
            {["0.05", "0.3", "1.0"].map((fee) => (
              <Button
                key={fee}
                onClick={() => setPoolFee(fee)}
                variant={poolFee === fee ? "default" : "secondary"}
                size="sm"
                className="flex-1"
              >
                {fee}%
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            V3: 0.05% (stable), 0.3% (standard), 1% (volatile)
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <Button onClick={calculateUniswapV2} className="w-full">
        Calculate Price & Output
      </Button>

      {/* Results Section */}
      {price && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <Input
              label="Price (Token1 per Token0)"
              value={price}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Current exchange rate
            </div>
          </div>

          <div>
            <Input
              label="Amount Out (Token1)"
              value={amountOut}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Expected output after swap
            </div>
          </div>

          <div>
            <Input
              label="Price Impact (%)"
              value={priceImpact}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              How much the price moves due to your trade
            </div>
          </div>

          <div>
            <Input
              label="Impermanent Loss (%)"
              value={impermanentLoss}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Estimated IL from price change
            </div>
          </div>

          {/* Formula Display */}
          <div className="bg-[#0f0f0f] rounded border border-border p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-blue-400 mb-1">Uniswap V2 Formula (x * y = k)</div>
              <div className="text-xs font-mono text-muted-foreground">
                amountOut = (amountIn × (1 - fee) × reserve1) / (reserve0 + amountIn × (1 - fee))
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-400 mb-1">Price Impact</div>
              <div className="text-xs font-mono text-muted-foreground">
                priceImpact = |((initialPrice - executionPrice) / initialPrice)| × 100
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-400 mb-1">Impermanent Loss</div>
              <div className="text-xs font-mono text-muted-foreground">
                IL = 2 × √(priceRatio) / (1 + priceRatio) - 1
              </div>
            </div>
          </div>

          <Button onClick={handleReset} variant="secondary" className="w-full">
            Reset Calculator
          </Button>
        </div>
      )}
    </div>
  );
}

export const uniswapPriceCalculatorConfig: ToolConfig = {
  id: "uniswap-price-calculator",
  name: "Uniswap AMM Calculator",
  description: "Calculate swap prices, slippage, and impermanent loss for Uniswap V2/V3/V4 pools",
  category: "web3",
  component: UniswapPriceCalculatorTool,
  codeSnippet: `// Calculate Uniswap V2 swap output using constant product formula

function calculateUniswapV2Swap(
  reserve0: number,
  reserve1: number,
  amountIn: number,
  feePercent: number = 0.3
) {
  // Initial price (Token1 per Token0)
  const initialPrice = reserve1 / reserve0;

  // Apply fee (0.3% default)
  const feeMultiplier = 1 - (feePercent / 100);
  const amountInWithFee = amountIn * feeMultiplier;

  // Uniswap V2 formula: x * y = k
  // amountOut = (amountIn * reserve1) / (reserve0 + amountIn)
  const numerator = amountInWithFee * reserve1;
  const denominator = reserve0 + amountInWithFee;
  const amountOut = numerator / denominator;

  // Calculate price impact
  const executionPrice = amountOut / amountIn;
  const priceImpact = Math.abs((initialPrice - executionPrice) / initialPrice) * 100;

  // Calculate new reserves after swap
  const newReserve0 = reserve0 + amountIn;
  const newReserve1 = reserve1 - amountOut;
  const newPrice = newReserve1 / newReserve0;

  return {
    amountOut,
    priceImpact,
    initialPrice,
    executionPrice,
    newPrice
  };
}

// Example: Swap in ETH/USDC pool
const result = calculateUniswapV2Swap(
  10000,  // 10,000 ETH reserve
  20000000, // 20M USDC reserve
  100     // Swap 100 ETH
);

console.log("Amount out:", result.amountOut.toFixed(2), "USDC");
console.log("Price impact:", result.priceImpact.toFixed(4), "%");
console.log("Initial price:", result.initialPrice.toFixed(2), "USDC/ETH");
console.log("Execution price:", result.executionPrice.toFixed(2), "USDC/ETH");
`,
  seo: {
    keywords: [
      "uniswap calculator",
      "amm calculator",
      "uniswap v2 v3 v4",
      "price impact calculator",
      "impermanent loss calculator",
      "swap calculator",
      "liquidity pool calculator",
      "defi calculator",
      "automated market maker",
      "concentrated liquidity",
    ],
  },
  sections: [
    {
      title: "What is Uniswap AMM?",
      content:
        "Uniswap is an Automated Market Maker (AMM) that enables decentralized token swaps using liquidity pools instead of order books. Users trade against pools of tokens, and prices are determined algorithmically based on the ratio of tokens in the pool.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="mb-4">
            Uniswap V2 uses the constant product formula (x * y = k), where x and y are the reserve amounts of two tokens. When you swap, the product remains constant, automatically adjusting prices based on supply and demand. V3 introduced concentrated liquidity for better capital efficiency, and V4 added customizable hooks.
          </p>
          <div className="mb-4">
            <h4 className="text-base font-semibold mb-2">Understanding Price Impact</h4>
            <p className="text-sm">
              Price impact is the difference between the market price and the estimated execution price due to trade size. Larger trades relative to pool size result in higher price impact.
            </p>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-2">Impermanent Loss</h4>
            <p className="text-sm">
              Impermanent Loss occurs when the price ratio of tokens in a liquidity pool changes. The loss is 'impermanent' because it only becomes permanent when you withdraw liquidity.
            </p>
          </div>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "V2: USDC/ETH Pool",
      content: `Reserve0: 45000000 USDC, Reserve1: 15000 ETH
Swap 100000 USDC with 0.3% fee
(typical V2 pool state)`,
      type: "code",
    },
    {
      title: "V2/V3: DAI/USDC Stable Pair",
      content: `Reserve0: 25000000 DAI, Reserve1: 25000000 USDC
Swap 50000 DAI with minimal slippage
(0.01% fee on V3, 0.3% on V2)`,
      type: "code",
    },
    {
      title: "V3: WETH/USDT Concentrated Liquidity",
      content: `Reserve0: 8000 WETH, Reserve1: 28000000 USDT
Swap 50 WETH (~0.6% of pool)
V3 allows liquidity concentration for better capital efficiency`,
      type: "code",
    },
  ],
  references: [
    {
      title: "Uniswap V2 Whitepaper",
      url: "https://uniswap.org/whitepaper.pdf",
    },
    {
      title: "Uniswap V3 Documentation",
      url: "https://docs.uniswap.org/contracts/v3/overview",
    },
    {
      title: "Uniswap V4 Whitepaper",
      url: "https://uniswap.org/whitepaper-v4.pdf",
    },
    {
      title: "Understanding AMMs",
      url: "https://ethereum.org/en/developers/docs/dapps/#automated-market-makers",
    },
  ],
};
