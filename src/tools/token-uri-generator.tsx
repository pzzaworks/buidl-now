"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

interface GeneratedUris {
  ipfsUri: string;
  ipfsCid: string;
  arweaveUri: string;
  dataUri: string;
  gateways: {
    pinata: string;
    infura: string;
    cloudflare: string;
    ipfsIo: string;
    dweb: string;
  };
}

export function TokenUriGeneratorTool() {
  const [metadataJson, setMetadataJson] = useState("");
  const [storageType, setStorageType] = useState<"ipfs" | "arweave" | "data">("ipfs");
  const [generatedUris, setGeneratedUris] = useState<GeneratedUris | null>(null);
  const [error, setError] = useState("");

  // Simple CID generation (simulated) - In production, this would be actual IPFS hash
  const generateCid = (data: string): string => {
    // Simulated CIDv1 (base58btc)
    // In reality, this would be the actual IPFS hash of the content
    const hash = Array.from(data)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      .toString(36);
    return `Qm${hash.padStart(44, "0").substring(0, 44)}`;
  };

  // Generate Arweave ID (simulated)
  const generateArweaveId = (data: string): string => {
    const hash = Array.from(data)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      .toString(36);
    return hash.padStart(43, "0").substring(0, 43);
  };

  const handleGenerate = () => {
    setError("");
    setGeneratedUris(null);

    try {
      // Validate JSON
      let metadata: any;
      try {
        metadata = JSON.parse(metadataJson);
      } catch (e) {
        setError("Invalid JSON format");
        return;
      }

      // Validate required fields
      if (!metadata.name || !metadata.description || !metadata.image) {
        setError("Metadata must include at least: name, description, and image");
        return;
      }

      // Generate formatted JSON
      const formattedJson = JSON.stringify(metadata, null, 2);

      // Generate CID and URIs based on storage type
      const cid = generateCid(formattedJson);
      const arweaveId = generateArweaveId(formattedJson);
      const base64 = btoa(formattedJson);

      const uris: GeneratedUris = {
        ipfsUri: `ipfs://${cid}`,
        ipfsCid: cid,
        arweaveUri: `ar://${arweaveId}`,
        dataUri: `data:application/json;base64,${base64}`,
        gateways: {
          pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
          infura: `https://ipfs.infura.io/ipfs/${cid}`,
          cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}`,
          ipfsIo: `https://ipfs.io/ipfs/${cid}`,
          dweb: `https://dweb.link/ipfs/${cid}`,
        },
      };

      setGeneratedUris(uris);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate URIs");
    }
  };

  const handleConvert = (fromFormat: string, toFormat: string) => {
    if (!generatedUris) return;

    let sourceUri = "";
    switch (fromFormat) {
      case "ipfs":
        sourceUri = generatedUris.ipfsUri;
        break;
      case "gateway":
        sourceUri = generatedUris.gateways.ipfsIo;
        break;
      case "arweave":
        sourceUri = generatedUris.arweaveUri;
        break;
      case "data":
        sourceUri = generatedUris.dataUri;
        break;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(sourceUri);
  };


  const handleReset = () => {
    setMetadataJson("");
    setStorageType("ipfs");
    setGeneratedUris(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Storage Type Selection */}
      <div>
        <div className="text-sm font-medium mb-3">Storage Type</div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => setStorageType("ipfs")}
            variant={storageType === "ipfs" ? "primary" : "secondary"}
            size="sm"
          >
            IPFS
          </Button>
          <Button
            onClick={() => setStorageType("arweave")}
            variant={storageType === "arweave" ? "primary" : "secondary"}
            size="sm"
          >
            Arweave
          </Button>
          <Button
            onClick={() => setStorageType("data")}
            variant={storageType === "data" ? "primary" : "secondary"}
            size="sm"
          >
            Data URI
          </Button>
        </div>
      </div>

      {/* Metadata JSON Input */}
      <Textarea
        label="NFT Metadata JSON"
        value={metadataJson}
        onChange={(e) => setMetadataJson(e.target.value)}
        placeholder='{\n  "name": "My NFT",\n  "description": "...",\n  "image": "ipfs://..."\n}'
        rows={12}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleGenerate} variant="primary" className="flex-1">
          Generate URIs
        </Button>
        <Button onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border border-red-500/30 bg-red-500/5 text-[var(--color-red-500)] text-sm">
          {error}
        </div>
      )}

      {/* Generated URIs */}
      {generatedUris && (
        <div className="space-y-6">
          {/* Info Note */}
          <div className="p-3 rounded-[12px] border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs">
            Note: CID and Arweave ID are simulated for demonstration. In production, upload your
            metadata to IPFS/Arweave to get real identifiers.
          </div>

          {/* IPFS URI */}
          <div className="space-y-3">
            <div className="text-sm font-medium">IPFS URI (Standard Format)</div>
            <Input
              label="ipfs:// URI"
              value={generatedUris.ipfsUri}
              readOnly
              showCopy
              className="font-mono text-sm"
            />
            <Input
              label="Content Identifier (CID)"
              value={generatedUris.ipfsCid}
              readOnly
              showCopy
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Use this format in your smart contract's tokenURI
            </div>
          </div>

          {/* Gateway URLs */}
          <div className="space-y-3">
            <div className="text-sm font-medium">IPFS Gateway URLs</div>

            <Input
              label="IPFS.io Gateway"
              value={generatedUris.gateways.ipfsIo}
              readOnly
              showCopy
              className="font-mono text-sm"
            />

            <Input
              label="Cloudflare IPFS Gateway"
              value={generatedUris.gateways.cloudflare}
              readOnly
              showCopy
              className="font-mono text-sm"
            />

            <Input
              label="Pinata Gateway"
              value={generatedUris.gateways.pinata}
              readOnly
              showCopy
              className="font-mono text-sm"
            />

            <Input
              label="Infura IPFS Gateway"
              value={generatedUris.gateways.infura}
              readOnly
              showCopy
              className="font-mono text-sm"
            />

            <Input
              label="Dweb.link Gateway"
              value={generatedUris.gateways.dweb}
              readOnly
              showCopy
              className="font-mono text-sm"
            />

            <div className="text-xs text-muted-foreground">
              Gateway URLs allow browsers to fetch IPFS content via HTTP
            </div>
          </div>

          {/* Arweave URI */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Arweave URI (Permanent Storage)</div>
            <Input
              label="ar:// URI"
              value={generatedUris.arweaveUri}
              readOnly
              showCopy
              className="font-mono text-sm"
            />
            <Input
              label="Arweave Gateway URL"
              value={`https://arweave.net/${generatedUris.arweaveUri.replace("ar://", "")}`}
              readOnly
              showCopy
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Arweave provides permanent, pay-once storage
            </div>
          </div>

          {/* Data URI */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Data URI (On-Chain Storage)</div>
            <Textarea
              label="Base64 Data URI"
              value={generatedUris.dataUri}
              readOnly
              showCopy
              className="font-mono text-xs"
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              Data URIs encode metadata directly in the URI. Expensive for on-chain storage but
              guarantees immutability.
            </div>
          </div>

          {/* Format Conversion Guide */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Format Conversion Examples</div>
            <div className="p-4 rounded-[12px] border border-border bg-[var(--color-gray-0)] space-y-2 text-xs font-mono">
              <div>
                <span className="text-blue-400">ipfs://</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-[var(--color-green-500)]">https://ipfs.io/ipfs/</span>
              </div>
              <div>
                <span className="text-blue-400">ipfs://Qm...</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-[var(--color-green-500)]">https://gateway.pinata.cloud/ipfs/Qm...</span>
              </div>
              <div>
                <span className="text-blue-400">ar://</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-[var(--color-green-500)]">https://arweave.net/</span>
              </div>
            </div>
          </div>

          {/* Metadata Preview */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Metadata Preview</div>
            <Textarea
              value={JSON.stringify(JSON.parse(metadataJson), null, 2)}
              readOnly
              showCopy
              className="font-mono text-xs"
              rows={12}
            />
          </div>

          {/* Storage Comparison */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Storage Type Comparison</div>
            <div className="grid gap-3">
              <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
                <div className="font-medium text-sm mb-1">IPFS</div>
                <div className="text-xs text-muted-foreground">
                  Pros: Decentralized, content-addressed, widely supported
                  <br />
                  Cons: Requires pinning service, not permanent by default
                </div>
              </div>
              <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
                <div className="font-medium text-sm mb-1">Arweave</div>
                <div className="text-xs text-muted-foreground">
                  Pros: Permanent storage, pay once
                  <br />
                  Cons: Higher upfront cost, less mature ecosystem
                </div>
              </div>
              <div className="p-3 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
                <div className="font-medium text-sm mb-1">Data URI</div>
                <div className="text-xs text-muted-foreground">
                  Pros: Fully on-chain, immutable, no external dependencies
                  <br />
                  Cons: Very expensive gas costs, size limitations
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset */}
      <Button onClick={handleReset} className="w-full">
        Reset
      </Button>
    </div>
  );
}

export const tokenUriGeneratorConfig: ToolConfig = {
  id: "token-uri-generator",
  name: "Token URI Generator",
  description: "Generate token URIs for IPFS, Arweave, and on-chain storage",
  category: "web3",
  component: TokenUriGeneratorTool,
  codeSnippet: `// Generate NFT metadata URIs for different storage solutions

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

function generateTokenURIs(metadata: NFTMetadata) {
  const jsonString = JSON.stringify(metadata);

  // IPFS URI (requires actual upload to get real CID)
  // For demo, we'll simulate a CID
  const simulatedCID = "QmXyz123..."; // Upload to IPFS to get real CID
  const ipfsUri = \`ipfs://\${simulatedCID}\`;

  // IPFS Gateway URLs (for HTTP access)
  const gateways = {
    ipfsIo: \`https://ipfs.io/ipfs/\${simulatedCID}\`,
    cloudflare: \`https://cloudflare-ipfs.com/ipfs/\${simulatedCID}\`,
    pinata: \`https://gateway.pinata.cloud/ipfs/\${simulatedCID}\`
  };

  // Arweave URI (requires upload to get transaction ID)
  const arweaveId = "abc123..."; // Upload to Arweave
  const arweaveUri = \`ar://\${arweaveId}\`;
  const arweaveGateway = \`https://arweave.net/\${arweaveId}\`;

  // Data URI (fully on-chain)
  const base64 = btoa(jsonString);
  const dataUri = \`data:application/json;base64,\${base64}\`;

  return { ipfsUri, gateways, arweaveUri, arweaveGateway, dataUri };
}

// Example usage
const metadata: NFTMetadata = {
  name: "My NFT #1",
  description: "A unique digital collectible",
  image: "ipfs://QmImage123...",
  attributes: [
    { trait_type: "Rarity", value: "Legendary" },
    { trait_type: "Power", value: 95 }
  ]
};

const uris = generateTokenURIs(metadata);
console.log("IPFS URI:", uris.ipfsUri);
console.log("Gateway:", uris.gateways.ipfsIo);
`,
  seo: {
    keywords: [
      "token uri generator",
      "ipfs uri",
      "arweave uri",
      "nft metadata uri",
      "ipfs cid generator",
      "data uri generator",
      "ipfs gateway",
      "token metadata",
      "nft storage",
      "decentralized storage",
    ],
  },
  sections: [
    {
      title: "What is a Token URI?",
      content:
        "A Token URI is a string that points to the metadata for an NFT. It can use various protocols (IPFS, Arweave, HTTP, or data URIs) to store and retrieve the JSON metadata that describes the NFT's properties, image, and attributes.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">IPFS URIs</h4>
          <p className="text-sm mb-4">IPFS (InterPlanetary File System) is the most popular decentralized storage solution for NFTs. IPFS URIs follow the format 'ipfs://&#123;CID&#125;' where CID is a content identifier. The content is addressable by its hash, ensuring immutability. However, content must be 'pinned' to remain available.</p>

          <h4 className="text-base font-semibold mb-2">Gateway URLs</h4>
          <p className="text-sm mb-4">IPFS gateways convert IPFS content to HTTP URLs that browsers can access. Popular gateways include ipfs.io, Cloudflare IPFS, Pinata, and Infura. While convenient, gateways introduce centralization and may have availability issues. The native ipfs:// URI is preferred for on-chain storage.</p>

          <h4 className="text-base font-semibold mb-2">Arweave URIs</h4>
          <p className="text-sm mb-4">Arweave provides permanent storage with a one-time payment. URIs follow the format 'ar://&#123;transaction-id&#125;'. Once uploaded, content is guaranteed to be stored for at least 200 years. This makes Arweave ideal for high-value NFTs requiring permanent availability.</p>

          <h4 className="text-base font-semibold mb-2">Data URIs</h4>
          <p className="text-sm mb-4">Data URIs encode the entire metadata JSON directly in the URI using Base64 encoding. This makes the metadata fully on-chain and completely immutable, with no external dependencies. However, it's expensive for large metadata and limited by block gas limits.</p>

          <h4 className="text-base font-semibold mb-2">Best Practices</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Use ipfs:// or ar:// URIs in smart contracts, not gateway URLs</li>
            <li>Pin IPFS content with services like Pinata, NFT.Storage, or Infura</li>
            <li>Consider Arweave for high-value or historically important NFTs</li>
            <li>Use data URIs only for small metadata (generative art, simple data)</li>
            <li>Always validate metadata structure before uploading</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "BAYC Metadata URI (IPFS)",
      content: "ipfs://QmRRPWG96cmgTn2JSvhxcaFrNYMGrey5Zbvs34aexxQtime",
      type: "text",
    },
    {
      title: "CryptoPunks Metadata URI (IPFS)",
      content: "ipfs://QmZ2RBCCVvk5C8b9FZ3VX3pMZqrJqF9D8z6qZjxV8G9Y5H",
      type: "text",
    },
    {
      title: "Permanent Storage (Arweave)",
      content: "ar://aB_5sLr6E9h3vT8nX5cY7dZ1wQ6eF4gB2hU0iO3kJ7l",
      type: "text",
    },
  ],
  references: [
    {
      title: "IPFS Documentation",
      url: "https://docs.ipfs.tech/",
    },
    {
      title: "Arweave Documentation",
      url: "https://docs.arweave.org/",
    },
    {
      title: "NFT.Storage (Free IPFS Pinning)",
      url: "https://nft.storage/",
    },
    {
      title: "Pinata (IPFS Pinning Service)",
      url: "https://www.pinata.cloud/",
    },
  ],
};
