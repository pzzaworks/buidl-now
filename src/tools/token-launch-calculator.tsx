"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function TokenLaunchCalculatorTool() {
  const [totalSupply, setTotalSupply] = useState("");
  const [liquidityPercent, setLiquidityPercent] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [desiredPrice, setDesiredPrice] = useState("");

  // Calculated outputs
  const [tokenForPool, setTokenForPool] = useState("");
  const [initialMarketCap, setInitialMarketCap] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [lpTokenValue, setLpTokenValue] = useState("");
  const [fullyDilutedValue, setFullyDilutedValue] = useState("");

  const calculateLaunch = () => {
    try {
      const supply = parseFloat(totalSupply);
      const liqPercent = parseFloat(liquidityPercent);
      const eth = parseFloat(ethAmount);
      const price = parseFloat(desiredPrice);

      if (isNaN(supply) || isNaN(liqPercent) || isNaN(eth) || isNaN(price) ||
          supply <= 0 || liqPercent <= 0 || liqPercent > 100 || eth <= 0 || price <= 0) {
        throw new Error("Invalid input");
      }

      // Calculate tokens for liquidity pool
      const tokensForPool = (supply * liqPercent) / 100;
      setTokenForPool(tokensForPool.toLocaleString());

      // Calculate price per token based on ETH and tokens in pool
      const actualPrice = eth / tokensForPool;
      setPricePerToken(actualPrice.toFixed(10));

      // Calculate initial market cap (circulating supply * price)
      const circulatingSupply = tokensForPool; // Initially only pool tokens are circulating
      const marketCap = circulatingSupply * actualPrice;
      setInitialMarketCap(marketCap.toFixed(2));

      // Calculate fully diluted valuation (total supply * price)
      const fdv = supply * actualPrice;
      setFullyDilutedValue(fdv.toFixed(2));

      // Calculate LP token value (both ETH and Token value)
      const lpValue = eth * 2; // LP tokens represent both sides of the pool
      setLpTokenValue(lpValue.toFixed(4));

    } catch (e) {
      setTokenForPool("");
      setInitialMarketCap("");
      setPricePerToken("");
      setLpTokenValue("");
      setFullyDilutedValue("");
    }
  };

  const handleReset = () => {
    setTotalSupply("");
    setLiquidityPercent("");
    setEthAmount("");
    setDesiredPrice("");
    setTokenForPool("");
    setInitialMarketCap("");
    setPricePerToken("");
    setLpTokenValue("");
    setFullyDilutedValue("");
  };

  const calculateLiquidityVisuals = () => {
    if (!liquidityPercent || isNaN(parseFloat(liquidityPercent))) return null;

    const liqPercent = parseFloat(liquidityPercent);
    const remaining = 100 - liqPercent;

    return (
      <div className="bg-[var(--color-gray-0)] rounded-[12px] border border-border p-4 space-y-3">
        <div className="text-xs font-semibold text-blue-400 mb-2">Token Distribution</div>
        <div className="flex h-8 rounded-[12px] overflow-hidden">
          <div
            className="bg-blue-500 flex items-center justify-center text-xs font-semibold"
            style={{ width: `${liqPercent}%` }}
          >
            {liqPercent >= 10 && `${liqPercent}%`}
          </div>
          <div
            className="bg-[var(--color-gray-0)] flex items-center justify-center text-xs font-semibold"
            style={{ width: `${remaining}%` }}
          >
            {remaining >= 10 && `${remaining.toFixed(1)}%`}
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-[12px]"></div>
            <span className="text-muted-foreground">Liquidity Pool: {liqPercent}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--color-gray-0)] border border-border rounded-[12px]"></div>
            <span className="text-muted-foreground">Remaining: {remaining.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Input
            label="Total Token Supply"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            placeholder="1000000000"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Total supply of your token (e.g., 1 billion)
          </div>
        </div>

        <div>
          <Input
            label="Liquidity Pool Allocation (%)"
            value={liquidityPercent}
            onChange={(e) => setLiquidityPercent(e.target.value)}
            placeholder="30"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Percentage of supply for initial liquidity (typically 20-50%)
          </div>
        </div>

        <div>
          <Input
            label="ETH Amount for Liquidity"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="10"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Amount of ETH to pair with tokens
          </div>
        </div>

        <div>
          <Input
            label="Desired Initial Price (ETH per Token)"
            value={desiredPrice}
            onChange={(e) => setDesiredPrice(e.target.value)}
            placeholder="0.00001"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Target price per token at launch (optional reference)
          </div>
        </div>
      </div>

      {/* Liquidity Distribution Visualization */}
      {liquidityPercent && calculateLiquidityVisuals()}

      {/* Calculate Button */}
      <Button onClick={calculateLaunch} variant="primary" className="w-full">
        Calculate Launch Metrics
      </Button>

      {/* Results Section */}
      {tokenForPool && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <Input
              label="Tokens for Liquidity Pool"
              value={tokenForPool}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Amount of tokens to add to the pool
            </div>
          </div>

          <div>
            <Input
              label="Actual Price per Token (ETH)"
              value={pricePerToken}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Calculated price based on ETH amount and token allocation
            </div>
          </div>

          <div>
            <Input
              label="Initial Market Cap (ETH)"
              value={initialMarketCap}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Market cap of circulating supply
            </div>
          </div>

          <div>
            <Input
              label="Fully Diluted Value (ETH)"
              value={fullyDilutedValue}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Total value if all tokens were in circulation
            </div>
          </div>

          <div>
            <Input
              label="LP Token Value (ETH)"
              value={lpTokenValue}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Total value of LP position (ETH + Token value)
            </div>
          </div>

          {/* Formula Display */}
          <div className="bg-[var(--color-gray-0)] rounded-[12px] border border-border p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-blue-400 mb-1">Calculations</div>
              <div className="text-xs font-mono text-muted-foreground space-y-1">
                <div>tokensForPool = totalSupply × (liquidityPercent / 100)</div>
                <div>pricePerToken = ethAmount / tokensForPool</div>
                <div>marketCap = circulatingSupply × pricePerToken</div>
                <div>FDV = totalSupply × pricePerToken</div>
                <div>lpTokenValue = ethAmount × 2</div>
              </div>
            </div>
          </div>

          {/* Launch Checklist */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-[12px] p-4">
            <div className="text-xs font-semibold text-blue-400 mb-2">Launch Checklist</div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Verify token contract is audited and tested</li>
              <li>Ensure sufficient ETH for gas fees</li>
              <li>Consider locking liquidity for trust</li>
              <li>Prepare marketing and community announcement</li>
              <li>Double-check all calculations and token allocations</li>
            </ul>
          </div>

          <Button onClick={handleReset} className="w-full">
            Reset Calculator
          </Button>
        </div>
      )}
    </div>
  );
}

export const tokenLaunchCalculatorConfig: ToolConfig = {
  id: "token-launch-calculator",
  name: "Token Launch Calculator",
  description: "Calculate token economics, liquidity pool allocation, and market cap for token launches",
  category: "web3",
  component: TokenLaunchCalculatorTool,
  codeSnippet: `// Calculate token launch economics

function calculateTokenLaunch(
  totalSupply: number,
  liquidityPercent: number,
  ethAmount: number
) {
  // Calculate tokens for liquidity pool
  const tokensForPool = (totalSupply * liquidityPercent) / 100;

  // Calculate initial price (ETH per token)
  const pricePerToken = ethAmount / tokensForPool;

  // Calculate market cap (circulating supply * price)
  const marketCap = tokensForPool * pricePerToken;

  // Calculate fully diluted value (total supply * price)
  const fdv = totalSupply * pricePerToken;

  // LP token value (both sides of pool)
  const lpTokenValue = ethAmount * 2;

  return {
    tokensForPool,
    pricePerToken,
    marketCap,
    fdv,
    lpTokenValue
  };
}

// Example: Launch with 1B supply, 30% liquidity, 10 ETH
const launch = calculateTokenLaunch(
  1_000_000_000, // 1B total supply
  30,            // 30% for liquidity
  10             // 10 ETH paired
);

console.log("Tokens for pool:", launch.tokensForPool.toLocaleString());
console.log("Price per token:", launch.pricePerToken.toFixed(10), "ETH");
console.log("Market cap:", launch.marketCap.toFixed(2), "ETH");
console.log("FDV:", launch.fdv.toFixed(2), "ETH");
console.log("LP value:", launch.lpTokenValue, "ETH");
`,
  seo: {
    keywords: [
      "token launch calculator",
      "tokenomics calculator",
      "liquidity pool calculator",
      "initial liquidity",
      "market cap calculator",
      "token economics",
      "ico calculator",
      "defi launch",
      "fdv calculator",
    ],
  },
  sections: [
    {
      title: "What is token launch calculation?",
      content:
        "Token launch calculation is the process of determining the tokenomics parameters for a new cryptocurrency or token, including liquidity pool allocation, initial price, market capitalization, and fully diluted valuation. These calculations are critical for planning a successful token launch.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">The calculator uses the Automated Market Maker (AMM) formula to determine token price based on the ratio of ETH to tokens in the liquidity pool. It calculates: tokens for pool = total supply × liquidity %, price = ETH amount / tokens in pool, market cap = circulating supply × price, and FDV = total supply × price.</p>

          <h4 className="text-base font-semibold mb-2">Token Launch Planning</h4>
          <p className="text-sm mb-4">Launching a token requires careful planning of tokenomics. This calculator helps determine how many tokens to allocate to liquidity pools, what the initial price will be, and key metrics like market cap and FDV.</p>

          <h4 className="text-base font-semibold mb-2">Liquidity Allocation</h4>
          <p className="text-sm mb-4">Typical projects allocate 20-50% of total supply to initial liquidity. Higher allocation provides better price stability and lower slippage, but means less tokens for team, community, and development.</p>

          <h4 className="text-base font-semibold mb-2">Market Cap vs FDV</h4>
          <p className="text-sm">Market Cap is the value of circulating tokens, while Fully Diluted Value (FDV) is the value if all tokens were in circulation. Large differences indicate potential future dilution.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Community Token Launch",
      content: `1,000,000 supply, 35% liquidity (350K tokens), 10 ETH
→ Price: 0.0000285 ETH/token
→ FDV: 28,500 ETH (~$95.7M at $3,350/ETH)`,
      type: "code",
    },
    {
      title: "Protocol Governance Token",
      content: `500,000,000 supply, 15% liquidity (75M tokens), 200 ETH
→ Price: 0.00000266 ETH/token
→ FDV: 1,330,000 ETH (~$4.5B at $3,350/ETH)`,
      type: "code",
    },
    {
      title: "Infrastructure DAO Token",
      content: `100,000,000 supply, 40% liquidity (40M tokens), 75 ETH
→ Price: 0.00000187 ETH/token
→ FDV: 187,500 ETH (~$629M at $3,350/ETH)
→ Low concentration risk`,
      type: "code",
    },
  ],
  references: [
    {
      title: "Uniswap Liquidity Provision",
      url: "https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/providing-liquidity",
    },
    {
      title: "Understanding Tokenomics",
      url: "https://ethereum.org/en/developers/docs/standards/tokens/",
    },
    {
      title: "LP Token Mechanics",
      url: "https://docs.uniswap.org/concepts/protocol/pools",
    },
  ],
};
