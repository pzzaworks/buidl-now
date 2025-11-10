"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { createPublicClient, http, getAddress } from "viem";
import { ToolConfig } from "@/types/tool";

interface ProxyInfo {
  proxyType: string;
  implementationAddress: string;
  adminAddress?: string;
  storageSlots: {
    implementation: string;
    admin?: string;
    beacon?: string;
  };
}

export function ProxyImplementationCheckerTool() {
  const [proxyAddress, setProxyAddress] = useState("");
  const [rpcUrl, setRpcUrl] = useState("https://eth.llamarpc.com");
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Standard proxy storage slots
  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"; // EIP-1967
  const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"; // EIP-1967
  const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50"; // EIP-1967
  const EIP1822_SLOT = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"; // EIP-1822 UUPS

  const checkProxy = async () => {
    if (!proxyAddress || !rpcUrl) {
      setError("Please provide both proxy address and RPC URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProxyInfo(null);

      // Validate address
      const validAddress = getAddress(proxyAddress);

      // Create client
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      // Check different proxy patterns
      let implementationAddress = "";
      let adminAddress = "";
      let proxyType = "Unknown";
      const storageSlots: ProxyInfo["storageSlots"] = {
        implementation: IMPLEMENTATION_SLOT,
      };

      // 1. Check EIP-1967 (most common)
      const eip1967Impl = await client.getStorageAt({
        address: validAddress as `0x${string}`,
        slot: IMPLEMENTATION_SLOT as `0x${string}`,
      });

      if (eip1967Impl && eip1967Impl !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        implementationAddress = "0x" + eip1967Impl.slice(-40);
        proxyType = "EIP-1967 (Transparent/UUPS)";

        // Check for admin
        const adminSlot = await client.getStorageAt({
          address: validAddress as `0x${string}`,
          slot: ADMIN_SLOT as `0x${string}`,
        });

        if (adminSlot && adminSlot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          adminAddress = "0x" + adminSlot.slice(-40);
          storageSlots.admin = ADMIN_SLOT;
          proxyType = "EIP-1967 Transparent Proxy";
        } else {
          proxyType = "EIP-1967 UUPS Proxy";
        }
      }

      // 2. Check EIP-1822 (UUPS legacy)
      if (!implementationAddress) {
        const eip1822Impl = await client.getStorageAt({
          address: validAddress as `0x${string}`,
          slot: EIP1822_SLOT as `0x${string}`,
        });

        if (eip1822Impl && eip1822Impl !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          implementationAddress = "0x" + eip1822Impl.slice(-40);
          proxyType = "EIP-1822 UUPS Proxy";
          storageSlots.implementation = EIP1822_SLOT;
        }
      }

      // 3. Check EIP-1967 Beacon Proxy
      if (!implementationAddress) {
        const beaconSlot = await client.getStorageAt({
          address: validAddress as `0x${string}`,
          slot: BEACON_SLOT as `0x${string}`,
        });

        if (beaconSlot && beaconSlot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          const beaconAddress = "0x" + beaconSlot.slice(-40);
          storageSlots.beacon = BEACON_SLOT;

          // Read implementation from beacon (implementation() function)
          try {
            const implData = await client.readContract({
              address: beaconAddress as `0x${string}`,
              abi: [
                {
                  name: "implementation",
                  type: "function",
                  stateMutability: "view",
                  inputs: [],
                  outputs: [{ type: "address" }],
                },
              ],
              functionName: "implementation",
            });
            implementationAddress = implData as string;
            proxyType = "EIP-1967 Beacon Proxy";
          } catch (e) {
            console.error("Failed to read beacon implementation:", e);
          }
        }
      }

      // 4. Try calling implementation() function directly
      if (!implementationAddress) {
        try {
          const implData = await client.readContract({
            address: validAddress as `0x${string}`,
            abi: [
              {
                name: "implementation",
                type: "function",
                stateMutability: "view",
                inputs: [],
                outputs: [{ type: "address" }],
              },
            ],
            functionName: "implementation",
          });
          implementationAddress = implData as string;
          proxyType = "Custom Proxy (implementation() function)";
        } catch (e) {
          // Not a proxy with implementation() function
        }
      }

      if (!implementationAddress || implementationAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("No proxy implementation found. This may not be a proxy contract.");
      }

      setProxyInfo({
        proxyType,
        implementationAddress,
        adminAddress: adminAddress || undefined,
        storageSlots,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check proxy");
      setProxyInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProxyAddress("");
    setProxyInfo(null);
    setError("");
  };


  const getEtherscanLink = (address: string) => {
    // Simple heuristic - in production, you'd determine chain from RPC
    return `https://etherscan.io/address/${address}`;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">Proxy Contract Address</Label>
        <Input
          value={proxyAddress}
          onChange={(e) => setProxyAddress(e.target.value)}
          placeholder="0x1234567890abcdef1234567890abcdef12345678"
          className="font-mono text-sm mb-4"
        />

        <Label className="mb-2 block text-sm">RPC URL</Label>
        <Input
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          placeholder="https://eth.llamarpc.com"
          className="font-mono text-sm mb-2"
        />

        <div className="flex gap-2">
          <Button onClick={checkProxy} className="flex-1" disabled={loading}>
            {loading ? "Checking..." : "Check Proxy"}
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* Output Section */}
      {proxyInfo && (
        <>
          <div className="p-4 rounded border border-green-500/30 bg-green-500/10">
            <Label className="mb-2 block text-sm font-semibold text-green-400">
              Proxy Type Detected
            </Label>
            <div className="text-sm font-mono">{proxyInfo.proxyType}</div>
          </div>

          <Input
            label="Implementation Address"
            value={proxyInfo.implementationAddress}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          {proxyInfo.adminAddress && (
            <Input
              label="Admin Address"
              value={proxyInfo.adminAddress}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          )}

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-3 block text-sm">Storage Slots</Label>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">Implementation:</span>{" "}
                <span className="text-blue-400">{proxyInfo.storageSlots.implementation}</span>
              </div>
              {proxyInfo.storageSlots.admin && (
                <div>
                  <span className="text-muted-foreground">Admin:</span>{" "}
                  <span className="text-blue-400">{proxyInfo.storageSlots.admin}</span>
                </div>
              )}
              {proxyInfo.storageSlots.beacon && (
                <div>
                  <span className="text-muted-foreground">Beacon:</span>{" "}
                  <span className="text-blue-400">{proxyInfo.storageSlots.beacon}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-3 block text-sm">Explorer Links</Label>
            <div className="space-y-2">
              <a
                href={getEtherscanLink(proxyAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-400 hover:text-blue-300 underline"
              >
                View Proxy on Etherscan →
              </a>
              <a
                href={getEtherscanLink(proxyInfo.implementationAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-400 hover:text-blue-300 underline"
              >
                View Implementation on Etherscan →
              </a>
              {proxyInfo.adminAddress && (
                <a
                  href={getEtherscanLink(proxyInfo.adminAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  View Admin on Etherscan →
                </a>
              )}
            </div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Read Implementation with viem</Label>
            <Code language="javascript">
{`import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Read implementation address from storage
const implementation = await client.getStorageAt({
  address: '${proxyAddress}',
  slot: '${proxyInfo.storageSlots.implementation}'
});

console.log('Implementation:', '0x' + implementation.slice(-40));`}
            </Code>
          </div>
        </>
      )}
    </div>
  );
}

export const proxyImplementationCheckerConfig: ToolConfig = {
  id: "proxy-implementation-checker",
  name: "Proxy Implementation Checker",
  description: "Detect proxy type and find implementation address for upgradeable smart contracts",
  category: "web3",
  component: ProxyImplementationCheckerTool,
  codeSnippet: `// npm install viem

import { createPublicClient, http, getAddress } from 'viem';
import { mainnet } from 'viem/chains';

// EIP-1967 standard storage slots
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

async function getProxyImplementation(proxyAddress: string) {
  // Read implementation address from storage slot
  const implSlot = await client.getStorageAt({
    address: proxyAddress as \`0x\${string}\`,
    slot: IMPLEMENTATION_SLOT as \`0x\${string}\`
  });

  if (implSlot && implSlot !== "0x" + "0".repeat(64)) {
    const implAddress = "0x" + implSlot.slice(-40);
    console.log("Implementation:", implAddress);
    return implAddress;
  }

  // Try reading admin slot
  const adminSlot = await client.getStorageAt({
    address: proxyAddress as \`0x\${string}\`,
    slot: ADMIN_SLOT as \`0x\${string}\`
  });

  if (adminSlot && adminSlot !== "0x" + "0".repeat(64)) {
    const adminAddress = "0x" + adminSlot.slice(-40);
    console.log("Admin:", adminAddress);
  }
}

// Example: Check Aave V3 Pool proxy
getProxyImplementation("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2");
`,
  seo: {
    keywords: [
      "proxy checker",
      "implementation address",
      "upgradeable contracts",
      "EIP-1967 proxy",
      "UUPS proxy",
      "transparent proxy",
      "beacon proxy",
      "proxy detection",
      "smart contract proxy",
      "proxy implementation finder",
    ],
  },
  sections: [
    {
      title: "What are Proxy Contracts?",
      content:
        "Proxy contracts enable smart contract upgradeability on Ethereum. The proxy contract holds the state and delegates calls to an implementation contract that contains the logic. By changing the implementation address, developers can upgrade contract logic while preserving state and address.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Detection Process</h4>
          <p className="text-sm mb-4">This tool checks proxy contracts by:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
            <li>Reading standard storage slots defined in EIP-1967 and EIP-1822</li>
            <li>Attempting to call implementation() function for custom proxies</li>
            <li>Checking for beacon proxy patterns</li>
            <li>Extracting admin addresses when available</li>
          </ol>

          <h4 className="text-base font-semibold mb-2">Supported Proxy Types</h4>
          <div className="space-y-3 mb-4">
            <div>
              <strong className="text-sm">EIP-1967 Transparent Proxy</strong>
              <p className="text-sm text-muted-foreground">
                Separates admin functions from user functions. Uses standard storage slots for implementation and admin addresses.
              </p>
            </div>
            <div>
              <strong className="text-sm">EIP-1967 UUPS (Universal Upgradeable Proxy Standard)</strong>
              <p className="text-sm text-muted-foreground">
                Upgrade logic is in the implementation contract. More gas efficient than transparent proxies.
              </p>
            </div>
            <div>
              <strong className="text-sm">EIP-1967 Beacon Proxy</strong>
              <p className="text-sm text-muted-foreground">
                Multiple proxies point to a single beacon contract that stores the implementation address. Allows upgrading many proxies at once.
              </p>
            </div>
            <div>
              <strong className="text-sm">EIP-1822 UUPS</strong>
              <p className="text-sm text-muted-foreground">
                Legacy UUPS standard with different storage slot. Predecessor to EIP-1967 UUPS.
              </p>
            </div>
          </div>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Aave V3 Pool",
      content: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2 - EIP-1967 Transparent Proxy",
      type: "code",
    },
  ],
  references: [
    {
      title: "EIP-1967: Standard Proxy Storage Slots",
      url: "https://eips.ethereum.org/EIPS/eip-1967",
    },
    {
      title: "EIP-1822: Universal Upgradeable Proxy Standard",
      url: "https://eips.ethereum.org/EIPS/eip-1822",
    },
    {
      title: "OpenZeppelin Proxy Patterns",
      url: "https://docs.openzeppelin.com/contracts/4.x/api/proxy",
    },
  ],
};
