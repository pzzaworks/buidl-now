"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MdClose } from "react-icons/md";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { encodeAbiParameters, decodeAbiParameters, parseAbiParameters } from "viem";
import { ToolConfig } from "@/types/tool";

export function AbiEncoderTool() {
  const t = useTranslations("toolUI.abi-encoder");
  const [types, setTypes] = useState("");
  const [values, setValues] = useState("");
  const [encoded, setEncoded] = useState("");
  const [error, setError] = useState("");

  const [decodeTypes, setDecodeTypes] = useState("");
  const [decodeData, setDecodeData] = useState("");
  const [decoded, setDecoded] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const handleEncode = () => {
    if (!types || !values) {
      setEncoded("");
      setError("");
      return;
    }

    try {
      const parsedValues = JSON.parse(`[${values}]`);
      const abiParams = parseAbiParameters(types);
      const result = encodeAbiParameters(abiParams, parsedValues);
      setEncoded(result);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("encodingFailed"));
      setEncoded("");
    }
  };

  const handleDecode = () => {
    if (!decodeTypes || !decodeData) {
      setDecoded("");
      setDecodeError("");
      return;
    }

    try {
      const abiParams = parseAbiParameters(decodeTypes);
      const result = decodeAbiParameters(abiParams, decodeData as `0x${string}`);
      setDecoded(JSON.stringify(result, null, 2));
      setDecodeError("");
    } catch (e) {
      setDecodeError(e instanceof Error ? e.message : t("decodingFailed"));
      setDecoded("");
    }
  };

  const handleResetEncode = () => {
    setTypes("");
    setValues("");
    setEncoded("");
    setError("");
  };

  const handleResetDecode = () => {
    setDecodeTypes("");
    setDecodeData("");
    setDecoded("");
    setDecodeError("");
  };

  return (
    <div className="space-y-8">
      {/* Encode Section */}
      <div>
        <div className="text-sm font-semibold mb-4">{t("encodeHeading")}</div>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">{t("typesLabel")}</Label>
            <Textarea
              value={types}
              onChange={(e) => setTypes(e.target.value)}
              placeholder="address,uint256,string"
              className="font-mono min-h-[80px]"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm">{t("valuesLabel")}</Label>
            <Textarea
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder='"0x...", 123, "Hello"'
              className="font-mono min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEncode} variant="primary" className="flex-1">
              {t("encode")}
            </Button>
            <Button onClick={handleResetEncode}>
              {t("reset")}
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
              <div className="text-sm font-medium flex items-center gap-1"><MdClose className="inline" /> {error}</div>
            </div>
          )}

          {encoded && (
            <Textarea
              label={t("encodedDataLabel")}
              value={encoded}
              readOnly
              showCopy
              className="font-mono min-h-[100px] bg-[var(--color-gray-0)]"
            />
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Decode Section */}
      <div>
        <div className="text-sm font-semibold mb-4">{t("decodeHeading")}</div>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">{t("typesLabel")}</Label>
            <Textarea
              value={decodeTypes}
              onChange={(e) => setDecodeTypes(e.target.value)}
              placeholder="address,uint256,string"
              className="font-mono min-h-[80px]"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm">{t("encodedDataInputLabel")}</Label>
            <Textarea
              value={decodeData}
              onChange={(e) => setDecodeData(e.target.value)}
              placeholder="0x..."
              className="font-mono min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDecode} variant="primary" className="flex-1">
              {t("decode")}
            </Button>
            <Button onClick={handleResetDecode}>
              {t("reset")}
            </Button>
          </div>

          {decodeError && (
            <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
              <div className="text-sm font-medium flex items-center gap-1"><MdClose className="inline" /> {decodeError}</div>
            </div>
          )}

          {decoded && (
            <Textarea
              label={t("decodedValuesLabel")}
              value={decoded}
              readOnly
              showCopy
              className="font-mono min-h-[100px] bg-[var(--color-gray-0)]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const abiEncoderConfig: ToolConfig = {
  id: "abi-encoder",
  name: "ABI Encoder/Decoder",
  description: "Encode and decode Ethereum ABI data",
  category: "web3",
  component: AbiEncoderTool,
  seo: {
    keywords: [
      "abi encoder",
      "abi decoder",
      "ethereum abi",
      "solidity abi",
      "encode abi",
      "decode abi",
      "smart contract abi",
      "abi encoding",
      "contract data encoding",
    ],
  },
  sections: [
    {
      title: "What is ABI Encoding?",
      content:
        "ABI (Application Binary Interface) encoding is how Ethereum encodes data for smart contract interactions. It converts function parameters into hexadecimal data that can be included in transactions.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            ABI encoding follows strict rules to pack typed data into bytes. Each parameter type has specific encoding rules: fixed-size types like uint256 occupy 32 bytes, dynamic types like strings include length prefixes, and arrays are encoded with their length followed by elements. The encoding ensures deterministic and efficient data representation.
          </p>

          <div className="text-base font-semibold mb-2">Common Types</div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>address: Ethereum address (20 bytes)</li>
            <li>uint256: Unsigned 256-bit integer</li>
            <li>string: UTF-8 string</li>
            <li>bytes: Dynamic byte array</li>
            <li>bool: Boolean (true/false)</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Encode transfer parameters",
      content: `Types: address,uint256
Values: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  1000000000000000000
→ Encodes recipient address and amount (1 ETH in wei)`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { encodeAbiParameters, decodeAbiParameters, parseAbiParameters } from 'viem';

// Encode ABI parameters
function encodeParameters(types: string, values: any[]): string {
  const abiParams = parseAbiParameters(types);
  const encoded = encodeAbiParameters(abiParams, values);
  return encoded;
}

// Decode ABI parameters
function decodeParameters(types: string, data: string): any[] {
  const abiParams = parseAbiParameters(types);
  const decoded = decodeAbiParameters(abiParams, data as \`0x\${string}\`);
  return decoded as any[];
}

// Example: Encode transfer parameters
const types = 'address,uint256';
const values = [
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  1000000000000000000n // 1 ETH in wei (BigInt)
];

const encoded = encodeParameters(types, values);
console.log('Encoded:', encoded);
// 0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000de0b6b3a7640000

// Decode it back
const decoded = decodeParameters(types, encoded);
console.log('Decoded:', decoded);
// ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 1000000000000000000n]`,
  references: [
    {
      title: "viem: encodeAbiParameters",
      url: "https://viem.sh/docs/abi/encodeAbiParameters",
    },
    {
      title: "Solidity ABI Specification",
      url: "https://docs.soliditylang.org/en/latest/abi-spec.html",
    },
  ],
};
