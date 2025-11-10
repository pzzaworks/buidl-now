"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function EnsResolverTool() {
  const [ensName, setEnsName] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customRpc, setCustomRpc] = useState("");

  const handleResolve = async () => {
    if (!ensName) {
      setError("Please enter an ENS name");
      setResolvedAddress("");
      return;
    }

    if (!ensName.endsWith(".eth")) {
      setError("ENS name must end with .eth");
      setResolvedAddress("");
      return;
    }

    setIsResolving(true);
    setError("");

    try {
      // Call our API route to resolve ENS (avoids CORS issues)
      const response = await fetch("/api/ens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ensName,
          rpcUrl: customRpc || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve ENS name");
      }

      if (data.address) {
        setResolvedAddress(data.address);
        setError("");
      } else {
        setError("ENS name not found or not registered");
        setResolvedAddress("");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to resolve ENS name";
      setError(errorMessage);
      setResolvedAddress("");
    } finally {
      setIsResolving(false);
    }
  };

  const handleReset = () => {
    setEnsName("");
    setResolvedAddress("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* ENS Name Input */}
      <div>
        <Input
          label="ENS Name"
          value={ensName}
          onChange={(e) => {
            setEnsName(e.target.value);
            setError("");
            setResolvedAddress("");
          }}
          placeholder="vitalik.eth"
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleResolve}
            className="flex-1"
            disabled={isResolving}
          >
            {isResolving ? "Resolving..." : "Resolve Address"}
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-auto px-0 py-0 text-sm"
        >
          {showAdvanced ? "▼" : "▶"} Advanced Settings
        </Button>
        {showAdvanced && (
          <div className="mt-3">
            <Input
              label="Custom RPC URL (optional)"
              value={customRpc}
              onChange={(e) => setCustomRpc(e.target.value)}
              placeholder="https://eth-mainnet.g.alchemy.com/v2/your-api-key"
              className="text-sm"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Leave empty to use public RPCs (with automatic fallback). For guaranteed uptime, use your own RPC URL.
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">Error: {error}</div>
        </div>
      )}

      {/* Resolved Address */}
      {resolvedAddress && (
        <Input
          label="Resolved Ethereum Address"
          value={resolvedAddress}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}

      {/* Info Box */}
      <div className="p-4 rounded border border-green-500/30 bg-green-500/5">
        <div className="text-sm text-green-400 space-y-2">
          <div>
            <strong>✓ Live Data:</strong> This tool queries ENS Registry and Resolver contracts
            directly on Ethereum mainnet. Uses automatic fallback across 3 public RPCs for reliability.
          </div>
          <div className="text-xs">
            <strong>Tip:</strong> For guaranteed uptime and no rate limits, add your own RPC URL
            in Advanced Settings (Infura, Alchemy, Ankr with your API key).
          </div>
        </div>
      </div>
    </div>
  );
}

export const ensResolverConfig: ToolConfig = {
  id: "ens-resolver",
  name: "ENS Name Resolver",
  description: "Resolve ENS names to Ethereum addresses",
  category: "web3",
  component: EnsResolverTool,
  seo: {
    keywords: [
      "ens resolver",
      "ethereum name service",
      "ens lookup",
      "resolve ens",
      "ens to address",
      "address to ens",
      "ens domain",
      "eth domain",
    ],
  },
  sections: [
    {
      title: "What is ENS?",
      content:
        "Ethereum Name Service (ENS) is a distributed, open naming system based on the Ethereum blockchain. It maps human-readable names like 'alice.eth' to Ethereum addresses, making it easier to send transactions and interact with the blockchain.",
    },
    {
      title: "How does it work?",
      content: (
        <p className="text-sm">
          ENS uses smart contracts to store name-to-address mappings on the Ethereum blockchain. When you resolve an ENS name, the system queries these contracts to retrieve the associated Ethereum address.
        </p>
      ),
    },
  ],
  examples: [
    {
      title: "Resolve vitalik.eth",
      content: "vitalik.eth → 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      type: "code",
    },
    {
      title: "Resolve nick.eth",
      content: "nick.eth → 0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5",
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { createPublicClient, http, normalize } from 'viem';
import { mainnet } from 'viem/chains';

// Create a public client for ENS resolution
const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Resolve ENS name to address
async function resolveENS(ensName: string): Promise<string | null> {
  try {
    // Normalize the ENS name (handles special characters)
    const normalized = normalize(ensName);

    // Resolve the ENS name
    const address = await client.getEnsAddress({
      name: normalized
    });

    return address;
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return null;
  }
}

// Reverse resolve: address to ENS name
async function reverseResolveENS(address: string): Promise<string | null> {
  try {
    const ensName = await client.getEnsName({
      address: address as \`0x\${string}\`
    });

    return ensName;
  } catch (error) {
    console.error('Reverse ENS resolution failed:', error);
    return null;
  }
}

// Example: Resolve vitalik.eth
resolveENS('vitalik.eth').then(address => {
  console.log('vitalik.eth →', address);
  // 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
});

// Example: Reverse resolve
reverseResolveENS('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045').then(name => {
  console.log('Address →', name);
  // vitalik.eth
});

// Get ENS avatar
async function getENSAvatar(ensName: string): Promise<string | null> {
  try {
    const avatar = await client.getEnsAvatar({ name: normalize(ensName) });
    return avatar;
  } catch (error) {
    return null;
  }
}`,
  references: [
    {
      title: "ENS Documentation",
      url: "https://docs.ens.domains/",
    },
    {
      title: "viem: getEnsAddress",
      url: "https://viem.sh/docs/ens/actions/getEnsAddress",
    },
    {
      title: "ENS Official Website",
      url: "https://ens.domains/",
    },
  ],
};
