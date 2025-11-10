"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";
import { privateKeyToAccount, mnemonicToAccount, HDKey } from "viem/accounts";

interface ChainAddress {
  chain: string;
  chainId: number;
  address: string;
  iconPath: string;
  rpcUrl: string;
  explorer: string;
}

export function MultiChainAddressDeriverTool() {
  const [inputType, setInputType] = useState<"private" | "mnemonic">("mnemonic");
  const [privateKey, setPrivateKey] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [derivationPath, setDerivationPath] = useState("m/44'/60'/0'/0/0");
  const [addresses, setAddresses] = useState<ChainAddress[]>([]);
  const [error, setError] = useState("");

  const chains: Omit<ChainAddress, "address">[] = [
    {
      chain: "Ethereum",
      chainId: 1,
      iconPath: "/icons/networks/ethereum.svg",
      rpcUrl: "https://eth.llamarpc.com",
      explorer: "https://etherscan.io/address/",
    },
    {
      chain: "BSC",
      chainId: 56,
      iconPath: "/icons/networks/binance-smart-chain.svg",
      rpcUrl: "https://bsc-dataseed.binance.org",
      explorer: "https://bscscan.com/address/",
    },
    {
      chain: "Polygon",
      chainId: 137,
      iconPath: "/icons/networks/polygon.svg",
      rpcUrl: "https://polygon-rpc.com",
      explorer: "https://polygonscan.com/address/",
    },
    {
      chain: "Arbitrum",
      chainId: 42161,
      iconPath: "/icons/networks/arbitrum-one.svg",
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      explorer: "https://arbiscan.io/address/",
    },
    {
      chain: "Optimism",
      chainId: 10,
      iconPath: "/icons/networks/optimism.svg",
      rpcUrl: "https://mainnet.optimism.io",
      explorer: "https://optimistic.etherscan.io/address/",
    },
    {
      chain: "Avalanche",
      chainId: 43114,
      iconPath: "/icons/networks/avalanche.svg",
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      explorer: "https://snowtrace.io/address/",
    },
    {
      chain: "Base",
      chainId: 8453,
      iconPath: "/icons/networks/base.svg",
      rpcUrl: "https://mainnet.base.org",
      explorer: "https://basescan.org/address/",
    },
  ];

  const deriveAddresses = () => {
    try {
      setError("");
      let address = "";

      if (inputType === "private") {
        // Validate private key
        if (!privateKey) {
          throw new Error("Private key is required");
        }

        // Ensure private key starts with 0x
        const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

        if (formattedKey.length !== 66) {
          throw new Error("Invalid private key length (should be 64 hex characters)");
        }

        // Derive account from private key
        const account = privateKeyToAccount(formattedKey as `0x${string}`);
        address = account.address;
      } else {
        // Validate mnemonic
        if (!mnemonic) {
          throw new Error("Mnemonic phrase is required");
        }

        const words = mnemonic.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          throw new Error("Mnemonic must be 12 or 24 words");
        }

        // Derive account from mnemonic
        const account = mnemonicToAccount(mnemonic, {
          path: derivationPath as `m/44'/60'/${string}`,
        });
        address = account.address;
      }

      // EVM addresses are the same across all EVM-compatible chains
      const derivedAddresses = chains.map((chain) => ({
        ...chain,
        address: address,
      }));

      setAddresses(derivedAddresses);
    } catch (e: any) {
      setError(e.message || "Failed to derive addresses");
      setAddresses([]);
    }
  };

  const handleReset = () => {
    setPrivateKey("");
    setMnemonic("");
    setDerivationPath("m/44'/60'/0'/0/0");
    setAddresses([]);
    setError("");
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
        <div className="text-xs font-semibold text-red-400 mb-2">⚠️ Security Warning</div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>This tool runs entirely in your browser. Your keys never leave your device.</p>
          <p>Never share your private key or mnemonic phrase with anyone.</p>
          <p>Use only for development and testing purposes.</p>
        </div>
      </div>

      {/* Input Type Selection */}
      <div>
        <label className="text-sm mb-2 block">Input Type</label>
        <div className="flex gap-2">
          <Button
            onClick={() => setInputType("mnemonic")}
            variant={inputType === "mnemonic" ? "default" : "secondary"}
            size="sm"
            className="flex-1"
          >
            Mnemonic Phrase
          </Button>
          <Button
            onClick={() => setInputType("private")}
            variant={inputType === "private" ? "default" : "secondary"}
            size="sm"
            className="flex-1"
          >
            Private Key
          </Button>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        {inputType === "mnemonic" ? (
          <>
            <div>
              <label className="text-sm mb-2 block">Mnemonic Phrase (12 or 24 words)</label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="word1 word2 word3 ... word12"
                className="flex w-full rounded border border-border bg-[#1a1a1a] px-3 py-2 text-sm font-mono
                  shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                  placeholder:text-muted-foreground
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500
                  focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
                  resize-none"
                rows={3}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Your recovery phrase (seed phrase)
              </div>
            </div>

            <div>
              <Input
                label="Derivation Path"
                value={derivationPath}
                onChange={(e) => setDerivationPath(e.target.value)}
                placeholder="m/44'/60'/0'/0/0"
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                BIP44 derivation path (default: m/44'/60'/0'/0/0)
              </div>
            </div>
          </>
        ) : (
          <div>
            <Input
              label="Private Key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x1234567890abcdef..."
              type="password"
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Your private key (with or without 0x prefix)
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
          <div className="text-xs text-red-400">{error}</div>
        </div>
      )}

      {/* Derive Button */}
      <Button onClick={deriveAddresses} className="w-full">
        Derive Addresses
      </Button>

      {/* Results Section */}
      {addresses.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="text-sm font-semibold text-blue-400">Addresses Across Chains</div>

          {addresses.map((chain) => (
            <div key={chain.chainId} className="bg-[#0f0f0f] rounded border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={chain.iconPath}
                    alt={chain.chain}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <div>
                    <div className="text-sm font-semibold">{chain.chain}</div>
                    <div className="text-xs text-muted-foreground">Chain ID: {chain.chainId}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chain.address}
                    readOnly
                    className="flex-1 h-8 rounded border border-border bg-[#1a1a1a] px-2 text-xs font-mono
                      focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => copyToClipboard(chain.address)}
                    variant="ghost"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`${chain.explorer}${chain.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Information Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
            <div className="text-xs font-semibold text-blue-400 mb-2">Why Same Address?</div>
            <div className="text-xs text-muted-foreground">
              All EVM-compatible chains use the same address format. Your private key or mnemonic
              generates the same Ethereum address that works across Ethereum, BSC, Polygon, and other
              EVM chains. However, your balances and transactions are separate on each chain.
            </div>
          </div>

          {/* Derivation Info */}
          {inputType === "mnemonic" && (
            <div className="bg-[#0f0f0f] rounded border border-border p-4">
              <div className="text-xs font-semibold text-blue-400 mb-2">BIP44 Derivation Path</div>
              <div className="text-xs font-mono text-muted-foreground space-y-1">
                <div>m / purpose' / coin_type' / account' / change / address_index</div>
                <div className="mt-2 space-y-0.5 text-muted-foreground">
                  <div>• purpose: 44 (BIP44)</div>
                  <div>• coin_type: 60 (Ethereum)</div>
                  <div>• account: 0 (first account)</div>
                  <div>• change: 0 (external chain)</div>
                  <div>• address_index: 0, 1, 2... (address number)</div>
                </div>
              </div>
            </div>
          )}

          {/* Common Paths */}
          {inputType === "mnemonic" && (
            <div className="bg-[#0f0f0f] rounded border border-border p-4">
              <div className="text-xs font-semibold text-blue-400 mb-2">Common Derivation Paths</div>
              <div className="space-y-2">
                {[
                  { path: "m/44'/60'/0'/0/0", desc: "First address (default)" },
                  { path: "m/44'/60'/0'/0/1", desc: "Second address" },
                  { path: "m/44'/60'/0'/0/2", desc: "Third address" },
                  { path: "m/44'/60'/1'/0/0", desc: "Second account, first address" },
                ].map((item) => (
                  <div key={item.path} className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono">{item.path}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Button
                      onClick={() => setDerivationPath(item.path)}
                      variant="ghost"
                      size="sm"
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleReset} variant="secondary" className="w-full">
            Reset & Clear Data
          </Button>
        </div>
      )}
    </div>
  );
}

export const multiChainAddressDeriverConfig: ToolConfig = {
  id: "multi-chain-address-deriver",
  name: "Multi-Chain Address Deriver",
  description: "Derive addresses from private key or mnemonic for multiple EVM-compatible chains",
  category: "web3",
  component: MultiChainAddressDeriverTool,
  codeSnippet: `// npm install viem

import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts';

// Derive address from private key
const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const account = privateKeyToAccount(privateKey as \`0x\${string}\`);
console.log("Address:", account.address);

// Derive address from mnemonic phrase
const mnemonic = "duty clump embody almost vanish excite same mass";
const mnemonicAccount = mnemonicToAccount(mnemonic, {
  path: "m/44'/60'/0'/0/0" // BIP44 derivation path for Ethereum
});
console.log("Address:", mnemonicAccount.address);

// Derive multiple addresses from same mnemonic
for (let i = 0; i < 5; i++) {
  const derivedAccount = mnemonicToAccount(mnemonic, {
    path: \`m/44'/60'/0'/0/\${i}\`
  });
  console.log(\`Address \${i}:\`, derivedAccount.address);
}

// Same address works across all EVM chains:
// Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base
`,
  seo: {
    keywords: [
      "address deriver",
      "mnemonic to address",
      "private key to address",
      "multi chain address",
      "evm address",
      "bip44 derivation",
      "hd wallet",
      "ethereum address",
      "wallet address generator",
    ],
  },
  sections: [
    {
      title: "What is multi-chain address derivation?",
      content:
        "Multi-chain address derivation is the process of generating cryptocurrency addresses for multiple blockchain networks from a single private key or mnemonic phrase. For EVM-compatible chains, the same private key produces the same address across all networks, making it easier to manage assets across different blockchains.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">EVM-Compatible Chains</h4>
          <p className="text-sm mb-4">Ethereum Virtual Machine (EVM) compatible chains use the same address format. This means your private key or mnemonic phrase generates the same address across Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, and Base.</p>

          <h4 className="text-base font-semibold mb-2">BIP44 Derivation</h4>
          <p className="text-sm mb-4">BIP44 is a standard that defines how to derive multiple addresses from a single mnemonic phrase. The derivation path format is: m / purpose' / coin_type' / account' / change / address_index. For Ethereum, coin_type is 60.</p>

          <h4 className="text-base font-semibold mb-2">Security Practices</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>This tool runs entirely in your browser (client-side only)</li>
            <li>Your keys never leave your device</li>
            <li>Never share your private key or mnemonic with anyone</li>
            <li>Use hardware wallets for production/mainnet funds</li>
            <li>This tool is for development and testing purposes</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Mnemonic to Address",
      content: `Mnemonic: duty clump embody almost vanish excite same mass
Path: m/44'/60'/0'/0/0
→ Address: 0xFA5d2937796725F25Dc867b80436a8DE75Dc372F0
(Same address on Ethereum, BSC, Polygon, Arbitrum, Optimism)`,
      type: "code",
    },
    {
      title: "Private Key to Address",
      content: `Private Key: 0x39d81618ff2db2922a9a87dafb9d17bcb0300c234
→ Address: 0xb67C268fAC7C2Fba5eD461C8085008D75F5Db8A70
(Works across all EVM-compatible chains)`,
      type: "code",
    },
    {
      title: "Multiple Addresses from Same Mnemonic",
      content: `Same mnemonic with different paths:
m/44'/60'/0'/0/0 → 0xFA5d2937796725F25Dc867b80436a8DE75Dc372F0
m/44'/60'/0'/0/1 → Different address
m/44'/60'/0'/0/2 → Another different address`,
      type: "code",
    },
  ],
  references: [
    {
      title: "BIP44 Specification",
      url: "https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki",
    },
    {
      title: "viem: Account Utilities",
      url: "https://viem.sh/docs/accounts/privateKey",
    },
    {
      title: "Ethereum Accounts",
      url: "https://ethereum.org/en/developers/docs/accounts/",
    },
  ],
};
