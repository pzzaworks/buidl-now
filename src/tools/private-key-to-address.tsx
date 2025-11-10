"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { privateKeyToAddress } from "viem/accounts";
import { ToolConfig } from "@/types/tool";

export function PrivateKeyToAddressTool() {
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    if (!privateKey) {
      setError("Please enter a private key");
      setAddress("");
      return;
    }

    try {
      // Ensure 0x prefix
      const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

      // Validate hex format and length (64 characters + 0x prefix)
      if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error("Invalid private key format. Must be 64 hex characters (with or without 0x prefix)");
      }

      const addr = privateKeyToAddress(key as `0x${string}`);
      setAddress(addr);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert private key");
      setAddress("");
    }
  };

  const handleReset = () => {
    setPrivateKey("");
    setAddress("");
    setError("");
  };

  const handleGenerateRandom = () => {
    // Generate a random 32-byte private key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomKey = "0x" + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    setPrivateKey(randomKey);
    setError("");
    setAddress("");
  };

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <div className="p-4 rounded border border-red-500/50 bg-red-500/10">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-lg">⚠️</div>
          <div className="text-sm text-red-400">
            <strong className="block mb-1">Security Warning</strong>
            <ul className="list-disc list-inside space-y-1">
              <li>Never share your private key with anyone</li>
              <li>Never enter your real private key on websites</li>
              <li>This tool runs locally in your browser</li>
              <li>Use only for testing and development purposes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Private Key Input */}
      <div>
        <Input
          label="Private Key (hex)"
          value={privateKey}
          onChange={(e) => {
            setPrivateKey(e.target.value);
            setError("");
            setAddress("");
          }}
          placeholder="0x1234567890abcdef..."
          className="font-mono text-sm mb-2"
          type="password"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert to Address
          </Button>
          <Button onClick={handleGenerateRandom} variant="outline" className="sm:flex-none whitespace-nowrap">
            Generate Random
          </Button>
          <Button onClick={handleReset} variant="secondary" className="sm:flex-none">
            Reset
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">Error: {error}</div>
        </div>
      )}

      {/* Generated Address */}
      {address && (
        <div className="space-y-4">
          <Input
            label="Public Address"
            value={address}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          <div className="p-3 rounded border border-green-500/30 bg-green-500/5">
            <div className="text-sm text-green-400">
              <strong>Success!</strong> Address derived from private key.
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400">
          <strong>How it works:</strong> The Ethereum address is derived from the private key
          using elliptic curve cryptography (secp256k1). The public key is computed from the
          private key, then hashed with Keccak-256, and the last 20 bytes form the address.
        </div>
      </div>
    </div>
  );
}

export const privateKeyToAddressConfig: ToolConfig = {
  id: "private-key-to-address",
  name: "Private Key to Address",
  description: "Convert private key to Ethereum address",
  category: "web3",
  component: PrivateKeyToAddressTool,
  codeSnippet: `// npm install viem

import { privateKeyToAddress, privateKeyToAccount } from 'viem/accounts';

// Convert private key to address
const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const address = privateKeyToAddress(privateKey as \`0x\${string}\`);
console.log("Address:", address);
// Example: 0xb67C268fAC7C2Fba5eD461C8085008D75F5Db8A7

// Create full account object with signing capabilities
const account = privateKeyToAccount(privateKey as \`0x\${string}\`);
console.log("Address:", account.address);
console.log("Public Key:", account.publicKey);

// Generate a random private key (for testing only!)
const randomBytes = new Uint8Array(32);
crypto.getRandomValues(randomBytes);
const randomKey = "0x" + Array.from(randomBytes)
  .map(b => b.toString(16).padStart(2, "0"))
  .join("");
const randomAddress = privateKeyToAddress(randomKey as \`0x\${string}\`);
console.log("Random address:", randomAddress);
`,
  seo: {
    keywords: [
      "ethereum private key",
      "private key to address",
      "eth wallet address",
      "derive ethereum address",
      "private key converter",
      "ethereum address generator",
      "secp256k1",
      "ecdsa ethereum",
      "crypto wallet",
      "web3 wallet",
      "blockchain address",
    ],
  },
  sections: [
    {
      title: "What is a Private Key?",
      content:
        "A private key is a 256-bit (32-byte) random number that gives you control over an Ethereum account. Anyone with access to the private key has full control over the associated address and funds.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Address Derivation</h4>
          <p className="text-sm mb-4">The Ethereum address is derived from the private key in several steps: (1) Generate public key using ECDSA on secp256k1 curve, (2) Hash the public key with Keccak-256, (3) Take the last 20 bytes as the address.</p>

          <h4 className="text-base font-semibold mb-2">Security Best Practices</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Never share your private key</li>
            <li>Store private keys securely (hardware wallet, encrypted storage)</li>
            <li>Never enter real private keys on websites</li>
            <li>Use this tool only for testing/development</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Example conversion",
      content: "Private Key (32 bytes) → Public Address (20 bytes, checksummed)",
      type: "code",
    },
  ],
  references: [
    {
      title: "viem: privateKeyToAddress",
      url: "https://viem.sh/docs/accounts/privateKeyToAddress",
    },
    {
      title: "Ethereum Accounts",
      url: "https://ethereum.org/en/developers/docs/accounts/",
    },
    {
      title: "secp256k1 Elliptic Curve",
      url: "https://en.bitcoin.it/wiki/Secp256k1",
    },
  ],
};
