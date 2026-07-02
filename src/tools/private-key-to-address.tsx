"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { privateKeyToAddress } from "viem/accounts";
import { ToolConfig } from "@/types/tool";
import { MdWarning } from "react-icons/md";

export function PrivateKeyToAddressTool() {
  const t = useTranslations("toolUI.private-key-to-address");
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    if (!privateKey) {
      setError(t("errorEmpty"));
      setAddress("");
      return;
    }

    try {
      // Ensure 0x prefix
      const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

      // Validate hex format and length (64 characters + 0x prefix)
      if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error(t("errorFormat"));
      }

      const addr = privateKeyToAddress(key as `0x${string}`);
      setAddress(addr);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("convertFailed"));
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
      <div className="p-4 rounded-[12px] border border-red-500/50 bg-[var(--color-red-50)]">
        <div className="flex items-start gap-3">
          <MdWarning className="w-5 h-5 text-[var(--color-red-500)] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--color-red-500)]">
            <strong className="block mb-1">{t("securityWarning")}</strong>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("warnNeverShare")}</li>
              <li>{t("warnNeverEnter")}</li>
              <li>{t("warnRunsLocally")}</li>
              <li>{t("warnTestingOnly")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Private Key Input */}
      <div>
        <Input
          label={t("privateKeyLabel")}
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
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {t("convertToAddress")}
          </Button>
          <Button onClick={handleGenerateRandom} className="sm:flex-none whitespace-nowrap">
            {t("generateRandom")}
          </Button>
          <Button onClick={handleReset} className="sm:flex-none">
            {t("reset")}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{t("errorLabel")}: {error}</div>
        </div>
      )}

      {/* Generated Address */}
      {address && (
        <div className="space-y-4">
          <Input
            label={t("publicAddress")}
            value={address}
            readOnly
            showCopy
            className="font-mono text-sm bg-[var(--color-gray-0)]"
          />

          <div className="p-3 rounded-[12px] border border-green-500/30 bg-green-500/5">
            <div className="text-sm text-[var(--color-green-500)]">
              <strong>{t("successTitle")}</strong> {t("successBody")}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-[12px] border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400">
          <strong>{t("howItWorksTitle")}</strong> {t("howItWorksBody")}
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
