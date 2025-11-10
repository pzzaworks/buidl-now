"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getAddress, isAddress } from "viem";
import { ToolConfig } from "@/types/tool";

export function AddressChecksumTool() {
  const [inputAddress, setInputAddress] = useState("");
  const [checksumAddress, setChecksumAddress] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [hasCorrectChecksum, setHasCorrectChecksum] = useState<boolean | null>(null);

  const handleConvert = () => {
    if (!inputAddress) {
      setChecksumAddress("");
      setIsValid(null);
      setHasCorrectChecksum(null);
      return;
    }

    try {
      // Try to convert to checksum - this validates the format
      const checksum = getAddress(inputAddress);
      setChecksumAddress(checksum);
      setIsValid(true);

      // Check if the input already had correct checksum
      const alreadyChecksummed = inputAddress === checksum;
      setHasCorrectChecksum(alreadyChecksummed);
    } catch (e) {
      // If getAddress fails, the format is invalid
      setIsValid(false);
      setChecksumAddress("");
      setHasCorrectChecksum(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputAddress(value);
    setIsValid(null);
    setChecksumAddress("");
    setHasCorrectChecksum(null);
  };

  const handleReset = () => {
    setInputAddress("");
    setChecksumAddress("");
    setIsValid(null);
    setHasCorrectChecksum(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Address */}
      <div>
        <Label className="mb-2 block text-sm">Ethereum Address</Label>
        <Input
          value={inputAddress}
          onChange={handleInputChange}
          placeholder="0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert to Checksum
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {isValid !== null && (
        <div
          className={`p-3 rounded border ${
            isValid
              ? hasCorrectChecksum
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="text-sm font-medium">
            {isValid ? (
              hasCorrectChecksum ? (
                "✓ Already in correct checksum format (EIP-55)"
              ) : (
                "✓ Converted to checksum format (EIP-55)"
              )
            ) : (
              "✗ Invalid Ethereum Address"
            )}
          </div>
        </div>
      )}

      {/* Checksum Address */}
      {checksumAddress && (
        <Input
          label="Checksum Address (EIP-55)"
          value={checksumAddress}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const addressChecksumConfig: ToolConfig = {
  id: "address-checksum",
  name: "Address Checksum",
  description: "Convert Ethereum addresses to checksum format (EIP-55)",
  category: "web3",
  component: AddressChecksumTool,
  seo: {
    keywords: [
      "ethereum address checksum",
      "eip-55",
      "checksum address",
      "eth address validator",
      "ethereum address format",
      "validate eth address",
      "checksummed address",
    ],
  },
  sections: [
    {
      title: "What is EIP-55?",
      content:
        "EIP-55 introduces a checksum for Ethereum addresses by capitalizing certain letters. This helps detect typos and prevents sending funds to incorrect addresses.",
    },
    {
      title: "How does it work?",
      content: (
        <p className="text-sm">
          The checksum is created by taking the Keccak-256 hash of the lowercase address. Each character in the address is then compared to the corresponding character in the hash - if the hash character is {'>'}= 8, the address character is capitalized.
        </p>
      ),
    },
  ],
  examples: [
    {
      title: "Lowercase to checksum",
      content: `0xd8da6bf26964af9d7eed9e03e53415d37aa96045
→ 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`,
      type: "code",
    },
    {
      title: "Wrong checksum correction",
      content: `0xD8DA6bf26964af9d7eed9E03e53415d37aa96045
→ 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`,
      type: "code",
    },
    {
      title: "Already checksummed",
      content: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
→ 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { getAddress, isAddress } from 'viem';

// Convert address to EIP-55 checksum format
function toChecksumAddress(address: string): string {
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }

  // getAddress automatically converts to checksum format
  return getAddress(address);
}

// Validate if address is already in correct checksum format
function hasCorrectChecksum(address: string): boolean {
  try {
    const checksummed = getAddress(address);
    return address === checksummed;
  } catch {
    return false;
  }
}

// Example usage
const lowercaseAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
const checksumAddress = toChecksumAddress(lowercaseAddress);
console.log('Checksum:', checksumAddress);
// 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

// Check if already checksummed
const isCorrect = hasCorrectChecksum(checksumAddress);
console.log('Has correct checksum:', isCorrect); // true

// Wrong checksum
const wrongChecksum = '0xD8DA6bf26964af9d7eed9E03e53415d37aa96045';
const isWrong = hasCorrectChecksum(wrongChecksum);
console.log('Wrong checksum:', isWrong); // false

// Validate address format
const valid = isAddress(lowercaseAddress);
console.log('Is valid address:', valid); // true`,
  references: [
    {
      title: "EIP-55: Mixed-case checksum address encoding",
      url: "https://eips.ethereum.org/EIPS/eip-55",
    },
    {
      title: "viem: getAddress",
      url: "https://viem.sh/docs/utilities/getAddress",
    },
  ],
};
