"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function TokenDecimalsConverterTool() {
  const t = useTranslations("toolUI.token-decimals-converter");
  const [amount, setAmount] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [rawAmount, setRawAmount] = useState("");
  const [humanAmount, setHumanAmount] = useState("");

  const toRaw = () => {
    if (!amount || !decimals) {
      setRawAmount("");
      return;
    }

    try {
      const dec = parseInt(decimals);
      if (isNaN(dec) || dec < 0 || dec > 77) {
        setRawAmount(t("invalidDecimals"));
        return;
      }

      const parts = amount.split(".");
      const wholePart = parts[0] || "0";
      const fractionalPart = parts[1] || "";

      // Pad or truncate fractional part to match decimals
      const paddedFractional = fractionalPart.padEnd(dec, "0").slice(0, dec);
      const raw = wholePart + paddedFractional;

      // Remove leading zeros but keep at least one digit
      const result = raw.replace(/^0+/, "") || "0";
      setRawAmount(result);
    } catch (e) {
      setRawAmount(t("invalidInput"));
    }
  };

  const toHuman = () => {
    if (!rawAmount || !decimals) {
      setHumanAmount("");
      return;
    }

    try {
      const dec = parseInt(decimals);
      if (isNaN(dec) || dec < 0 || dec > 77) {
        setHumanAmount(t("invalidDecimals"));
        return;
      }

      const raw = rawAmount.replace(/^0+/, "") || "0";

      if (dec === 0) {
        setHumanAmount(raw);
        return;
      }

      const paddedRaw = raw.padStart(dec + 1, "0");
      const wholePart = paddedRaw.slice(0, -dec) || "0";
      const fractionalPart = paddedRaw.slice(-dec);

      // Remove trailing zeros from fractional part
      const trimmedFractional = fractionalPart.replace(/0+$/, "");

      if (trimmedFractional) {
        setHumanAmount(`${wholePart}.${trimmedFractional}`);
      } else {
        setHumanAmount(wholePart);
      }
    } catch (e) {
      setHumanAmount(t("invalidInput"));
    }
  };

  const handleReset = () => {
    setAmount("");
    setDecimals("18");
    setRawAmount("");
    setHumanAmount("");
  };

  return (
    <div className="space-y-6">
      {/* Decimals */}
      <div>
        <Input
          label={t("decimalsLabel")}
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="18"
          type="number"
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {t("decimalsHelp")}
        </div>
      </div>

      {/* Human Readable to Raw */}
      <div className="space-y-3">
        <div className="text-sm font-medium">{t("humanToRaw")}</div>
        <Input
          label={t("amountHumanLabel")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.0"
          className="font-mono text-sm"
        />
        <Button onClick={toRaw} variant="primary" className="w-full">
          {t("convertToRaw")}
        </Button>
        <Input
          label={t("rawAmountLabel")}
          value={rawAmount}
          onChange={(e) => setRawAmount(e.target.value)}
          placeholder="1000000000000000000"
          showCopy
          className="font-mono text-sm"
        />
      </div>

      {/* Raw to Human Readable */}
      <div className="space-y-3">
        <div className="text-sm font-medium">{t("rawToHuman")}</div>
        <Button onClick={toHuman} variant="primary" className="w-full">
          {t("convertToHuman")}
        </Button>
        <Input
          label={t("humanAmountLabel")}
          value={humanAmount}
          onChange={(e) => setHumanAmount(e.target.value)}
          placeholder="1.0"
          showCopy
          className="font-mono text-sm"
        />
      </div>

      {/* Reset */}
      <Button onClick={handleReset} className="w-full">
        {t("reset")}
      </Button>
    </div>
  );
}

export const tokenDecimalsConverterConfig: ToolConfig = {
  id: "token-decimals-converter",
  name: "Token Decimals Converter",
  description: "Convert between human-readable amounts and raw token amounts",
  category: "web3",
  component: TokenDecimalsConverterTool,
  codeSnippet: `// npm install viem

import { parseUnits, formatUnits } from 'viem';

// Convert human-readable to raw (wei-like units)
const humanAmount = "1.5";
const decimals = 18;

const rawAmount = parseUnits(humanAmount, decimals);
console.log("Raw amount:", rawAmount);
// 1500000000000000000n

// Convert raw to human-readable
const rawValue = 1500000000000000000n;
const formatted = formatUnits(rawValue, decimals);
console.log("Formatted:", formatted);
// "1.5"

// Common token examples
const ethAmount = parseUnits("2.5", 18); // ETH has 18 decimals
const usdcAmount = parseUnits("100", 6);  // USDC has 6 decimals
const wbtcAmount = parseUnits("0.1", 8);  // WBTC has 8 decimals

console.log("2.5 ETH in wei:", ethAmount);
console.log("100 USDC in raw:", usdcAmount);
console.log("0.1 WBTC in satoshis:", wbtcAmount);

// Convert back
console.log("ETH:", formatUnits(ethAmount, 18));
console.log("USDC:", formatUnits(usdcAmount, 6));
console.log("WBTC:", formatUnits(wbtcAmount, 8));
`,
  seo: {
    keywords: [
      "token decimals converter",
      "wei to eth converter",
      "erc20 decimals calculator",
      "token units converter",
      "raw token amount",
      "human readable token",
      "wei calculator",
      "gwei converter",
      "token precision converter",
      "blockchain decimals",
    ],
  },
  sections: [
    {
      title: "What are Token Decimals?",
      content:
        "Most tokens store amounts as integers without decimal points. The 'decimals' value determines how many digits represent the fractional part. For example, with 18 decimals, 1.5 tokens = 1500000000000000000 raw units.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Common Decimal Values</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>18 decimals: ETH, DAI, WETH, most ERC-20 tokens</li>
            <li>6 decimals: USDC, USDT</li>
            <li>8 decimals: WBTC (like Bitcoin)</li>
            <li>0 decimals: NFTs, whole number tokens</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "1 ETH (18 decimals)",
      content: "1.0 → 1000000000000000000",
      type: "code",
    },
    {
      title: "1 USDC (6 decimals)",
      content: "1.0 → 1000000",
      type: "code",
    },
    {
      title: "0.5 tokens (18 decimals)",
      content: "0.5 → 500000000000000000",
      type: "code",
    },
  ],
  references: [
    {
      title: "ERC-20 Token Standard",
      url: "https://eips.ethereum.org/EIPS/eip-20",
    },
    {
      title: "Token Decimals Explained",
      url: "https://docs.openzeppelin.com/contracts/4.x/erc20#a-note-on-decimals",
    },
  ],
};
