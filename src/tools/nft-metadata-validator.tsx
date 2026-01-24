"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  metadata?: any;
}

interface MetadataAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export function NftMetadataValidatorTool() {
  const [metadataInput, setMetadataInput] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [inputType, setInputType] = useState<"json" | "uri">("json");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validateMetadata = (metadata: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Required fields (ERC-721/ERC-1155)
    if (!metadata) {
      errors.push("Metadata is empty or invalid JSON");
      return { valid: false, score: 0, errors, warnings };
    }

    // Name (required)
    if (metadata.name) {
      score += 20;
      if (typeof metadata.name !== "string") {
        errors.push("'name' must be a string");
      } else if (metadata.name.length > 50) {
        warnings.push("'name' is longer than 50 characters (may be truncated on some platforms)");
      }
    } else {
      errors.push("Missing required field: 'name'");
    }

    // Description (required)
    if (metadata.description) {
      score += 20;
      if (typeof metadata.description !== "string") {
        errors.push("'description' must be a string");
      } else if (metadata.description.length > 1000) {
        warnings.push("'description' is longer than 1000 characters (may be truncated)");
      }
    } else {
      errors.push("Missing required field: 'description'");
    }

    // Image (required)
    if (metadata.image) {
      score += 20;
      if (typeof metadata.image !== "string") {
        errors.push("'image' must be a string (URI)");
      } else {
        const validProtocols = ["ipfs://", "https://", "http://", "ar://", "data:"];
        const hasValidProtocol = validProtocols.some((p) => metadata.image.startsWith(p));
        if (!hasValidProtocol) {
          errors.push("'image' should use ipfs://, https://, ar://, or data: URI");
        }
        if (metadata.image.startsWith("http://")) {
          warnings.push("Using http:// for image (https:// is recommended for security)");
        }
      }
    } else {
      errors.push("Missing required field: 'image'");
    }

    // Attributes (optional but recommended)
    if (metadata.attributes) {
      if (Array.isArray(metadata.attributes)) {
        score += 15;
        metadata.attributes.forEach((attr: any, idx: number) => {
          if (!attr.trait_type) {
            warnings.push(`Attribute ${idx} missing 'trait_type'`);
          }
          if (attr.value === undefined) {
            warnings.push(`Attribute ${idx} missing 'value'`);
          }
          if (attr.display_type && !["number", "boost_percentage", "boost_number", "date"].includes(attr.display_type)) {
            warnings.push(`Attribute ${idx} has invalid 'display_type': ${attr.display_type}`);
          }
        });
      } else {
        errors.push("'attributes' must be an array");
      }
    } else {
      warnings.push("No 'attributes' field (recommended for trait-based NFTs)");
    }

    // External URL (optional)
    if (metadata.external_url) {
      score += 10;
      if (typeof metadata.external_url !== "string") {
        errors.push("'external_url' must be a string (URI)");
      } else if (!metadata.external_url.startsWith("http")) {
        warnings.push("'external_url' should be a valid HTTP(S) URL");
      }
    }

    // Animation URL (optional)
    if (metadata.animation_url) {
      score += 10;
      if (typeof metadata.animation_url !== "string") {
        errors.push("'animation_url' must be a string (URI)");
      } else {
        const ext = metadata.animation_url.split(".").pop()?.toLowerCase();
        const validExts = ["mp4", "webm", "mp3", "wav", "ogg", "gltf", "glb", "html"];
        if (ext && !validExts.includes(ext)) {
          warnings.push(`'animation_url' has uncommon extension: .${ext}`);
        }
      }
    }

    // Background color (optional)
    if (metadata.background_color) {
      score += 5;
      if (typeof metadata.background_color !== "string") {
        errors.push("'background_color' must be a string");
      } else if (!/^[0-9A-Fa-f]{6}$/.test(metadata.background_color)) {
        warnings.push("'background_color' should be a 6-character hex color (without #)");
      }
    }

    // Properties (alternative to attributes for some platforms)
    if (metadata.properties) {
      warnings.push("'properties' field found (some platforms prefer 'attributes')");
    }

    // Unknown fields
    const knownFields = [
      "name",
      "description",
      "image",
      "attributes",
      "external_url",
      "animation_url",
      "background_color",
      "properties",
      "youtube_url",
    ];
    Object.keys(metadata).forEach((key) => {
      if (!knownFields.includes(key)) {
        warnings.push(`Unknown field: '${key}' (may not be displayed on all platforms)`);
      }
    });

    return {
      valid: errors.length === 0,
      score: Math.min(score, 100),
      errors,
      warnings,
      metadata,
    };
  };

  const handleValidate = async () => {
    setValidationResult(null);
    setLoading(true);

    try {
      let metadata: any;

      if (inputType === "json") {
        // Parse JSON input
        try {
          metadata = JSON.parse(metadataInput);
        } catch (e) {
          setValidationResult({
            valid: false,
            score: 0,
            errors: ["Invalid JSON format"],
            warnings: [],
          });
          setLoading(false);
          return;
        }
      } else {
        // Fetch from URI
        if (!metadataUri) {
          setValidationResult({
            valid: false,
            score: 0,
            errors: ["Please enter a URI"],
            warnings: [],
          });
          setLoading(false);
          return;
        }

        try {
          let fetchUrl = metadataUri;

          // Convert IPFS URIs to HTTP gateway
          if (metadataUri.startsWith("ipfs://")) {
            const cid = metadataUri.replace("ipfs://", "");
            fetchUrl = `https://ipfs.io/ipfs/${cid}`;
          }

          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          metadata = await response.json();
        } catch (e) {
          setValidationResult({
            valid: false,
            score: 0,
            errors: [e instanceof Error ? e.message : "Failed to fetch metadata"],
            warnings: [],
          });
          setLoading(false);
          return;
        }
      }

      const result = validateMetadata(metadata);
      setValidationResult(result);
    } catch (e) {
      setValidationResult({
        valid: false,
        score: 0,
        errors: [e instanceof Error ? e.message : "Validation failed"],
        warnings: [],
      });
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
    setMetadataInput("");
    setMetadataUri("");
    setInputType("json");
    setValidationResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--color-green-500)]";
    if (score >= 60) return "text-yellow-400";
    return "text-[var(--color-red-500)]";
  };

  return (
    <div className="space-y-6">
      {/* Input Type Selection */}
      <div className="flex gap-2">
        <Button
          onClick={() => setInputType("json")}
          variant={inputType === "json" ? "primary" : "secondary"}
          className="flex-1"
        >
          JSON Input
        </Button>
        <Button
          onClick={() => setInputType("uri")}
          variant={inputType === "uri" ? "primary" : "secondary"}
          className="flex-1"
        >
          URI Input
        </Button>
      </div>

      {/* JSON Input */}
      {inputType === "json" && (
        <Textarea
          label="NFT Metadata JSON"
          value={metadataInput}
          onChange={(e) => setMetadataInput(e.target.value)}
          placeholder='{\n  "name": "My NFT",\n  "description": "...",\n  "image": "ipfs://..."\n}'
          rows={12}
        />
      )}

      {/* URI Input */}
      {inputType === "uri" && (
        <Input
          label="Metadata URI (IPFS/HTTP)"
          value={metadataUri}
          onChange={(e) => setMetadataUri(e.target.value)}
          placeholder="ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1"
          className="font-mono text-sm"
        />
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleValidate} variant="primary" className="flex-1" disabled={loading}>
          {loading ? "Validating..." : "Validate Metadata"}
        </Button>
        <Button onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Score */}
          <div className="p-4 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compliance Score</span>
              <span className={`text-lg font-bold ${getScoreColor(validationResult.score)}`}>
                {validationResult.score}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-[var(--color-gray-100)] rounded-[12px] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  validationResult.score >= 80
                    ? "bg-green-400"
                    : validationResult.score >= 60
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${validationResult.score}%` }}
              />
            </div>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-[var(--color-red-500)]">
                Errors ({validationResult.errors.length})
              </div>
              <div className="space-y-1">
                {validationResult.errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[12px] border border-red-500/30 bg-red-500/5 text-[var(--color-red-500)] text-sm"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-yellow-400">
                Warnings ({validationResult.warnings.length})
              </div>
              <div className="space-y-1">
                {validationResult.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[12px] border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-sm"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success */}
          {validationResult.valid && validationResult.errors.length === 0 && (
            <div className="p-3 rounded-[12px] border border-green-500/30 bg-green-500/5 text-[var(--color-green-500)] text-sm">
              Metadata is valid and follows OpenSea/ERC-721/ERC-1155 standards!
            </div>
          )}

          {/* Preview */}
          {validationResult.metadata && (
            <div className="space-y-3">
              <div className="text-sm font-medium">OpenSea Preview</div>
              <div className="p-4 rounded-[12px] border border-border bg-[var(--color-gray-0)]">
                {/* Image */}
                {validationResult.metadata.image && (
                  <div className="mb-3 p-3 bg-[var(--color-gray-100)] rounded-[12px] text-center">
                    <div className="text-xs text-muted-foreground">
                      Image: {validationResult.metadata.image.substring(0, 50)}...
                    </div>
                  </div>
                )}

                {/* Name */}
                <div className="text-lg font-bold mb-2">
                  {validationResult.metadata.name || "Unnamed NFT"}
                </div>

                {/* Description */}
                <div className="text-sm text-muted-foreground mb-3">
                  {validationResult.metadata.description || "No description"}
                </div>

                {/* Attributes */}
                {validationResult.metadata.attributes &&
                  Array.isArray(validationResult.metadata.attributes) &&
                  validationResult.metadata.attributes.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">PROPERTIES</div>
                      <div className="grid grid-cols-2 gap-2">
                        {validationResult.metadata.attributes.map(
                          (attr: MetadataAttribute, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 rounded-[12px] bg-[var(--color-gray-100)] border border-border"
                            >
                              <div className="text-xs text-blue-400">
                                {attr.trait_type || "Unnamed"}
                              </div>
                              <div className="text-sm font-medium">{String(attr.value)}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset */}
      <Button onClick={handleReset} className="w-full">
        Reset
      </Button>
    </div>
  );
}

export const nftMetadataValidatorConfig: ToolConfig = {
  id: "nft-metadata-validator",
  name: "NFT Metadata Validator",
  description: "Validate NFT metadata against OpenSea, ERC-721, and ERC-1155 standards",
  category: "web3",
  component: NftMetadataValidatorTool,
  codeSnippet: `// Validate NFT metadata against ERC-721/OpenSea standards

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
}

function validateNFTMetadata(metadata: NFTMetadata): boolean {
  // Required fields
  if (!metadata.name || !metadata.description || !metadata.image) {
    console.error("Missing required fields");
    return false;
  }

  // Validate image URI
  const validProtocols = ["ipfs://", "https://", "ar://", "data:"];
  if (!validProtocols.some(p => metadata.image.startsWith(p))) {
    console.error("Invalid image URI protocol");
    return false;
  }

  // Validate attributes
  if (metadata.attributes) {
    for (const attr of metadata.attributes) {
      if (!attr.trait_type || attr.value === undefined) {
        console.error("Invalid attribute structure");
        return false;
      }
    }
  }

  return true;
}

// Example valid metadata
const metadata: NFTMetadata = {
  name: "My NFT #1",
  description: "A unique collectible",
  image: "ipfs://QmXyz...",
  attributes: [
    { trait_type: "Background", value: "Blue" },
    { trait_type: "Rarity", value: 95, display_type: "number" }
  ]
};

console.log("Valid:", validateNFTMetadata(metadata));
`,
  seo: {
    keywords: [
      "nft metadata validator",
      "opensea metadata",
      "erc-721 metadata",
      "erc-1155 metadata",
      "nft json validator",
      "nft attributes checker",
      "nft metadata standard",
      "ipfs metadata",
      "nft compliance checker",
      "opensea standards",
    ],
  },
  sections: [
    {
      title: "What are NFT Metadata Standards?",
      content:
        "NFT metadata standards are specifications that define how non-fungible token information should be structured and stored. These standards, defined by ERC-721 and enhanced by OpenSea, ensure that NFT marketplaces and wallets can properly display and interpret NFT properties, images, and attributes.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Validation Process</h4>
          <p className="text-sm mb-4">The validator checks your NFT metadata against ERC-721 and OpenSea standards. It verifies required fields (name, description, image), validates optional fields (attributes, animation_url, external_url), checks URI formats, and assigns a compliance score (0-100%) based on completeness and adherence to best practices.</p>

          <h4 className="text-base font-semibold mb-2">Required Fields</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>
              <strong>name:</strong> The name of the NFT
            </li>
            <li>
              <strong>description:</strong> A description of the NFT
            </li>
            <li>
              <strong>image:</strong> URI pointing to the NFT's image (IPFS, HTTP, or data URI)
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Optional Fields</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>
              <strong>attributes:</strong> Array of traits with trait_type and value
            </li>
            <li>
              <strong>animation_url:</strong> URI for video/audio/3D content
            </li>
            <li>
              <strong>external_url:</strong> Link to external website
            </li>
            <li>
              <strong>background_color:</strong> 6-character hex color (no #)
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Validation Scoring</h4>
          <p className="text-sm mb-4">The validator assigns a compliance score (0-100%) based on required fields (60 points), recommended fields (30 points), and best practices (10 points). A score of 80%+ indicates excellent compliance with standards.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "BAYC #8650 Metadata",
      content: JSON.stringify({
        image: "ipfs://QmRRPWG96cmgTn2JSvhxcaFrNYMGrey5Zbvs34aexxQtime",
        name: "Bored Ape Yacht Club #8650",
        description: "The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs living on the Ethereum blockchain.",
        external_url: "https://boredapeyachtclub.com/",
        attributes: [
          { trait_type: "Background", value: "Blue Gradient" },
          { trait_type: "Fur", value: "Black" },
          { trait_type: "Eyes", value: "Blue Beams" },
          { trait_type: "Mouth", value: "Discomfort" },
          { trait_type: "Clothes", value: "Sailor Shirt" },
          { trait_type: "Hat", value: "Captain's Hat" },
        ],
      }, null, 2),
      type: "code",
    },
    {
      title: "CryptoPunks #5217 Metadata",
      content: JSON.stringify({
        image: "ipfs://QmZ2RBCCVvk5C8b9FZ3VX3pMZqrJqF9D8z6qZjxV8G9Y5H",
        name: "CryptoPunk #5217",
        description: "10,000 unique collectible characters with proof of ownership stored on the Ethereum blockchain.",
        external_url: "https://cryptopunks.app/cryptopunks/details/5217",
        attributes: [
          { trait_type: "Type", value: "Alien" },
          { trait_type: "Skin", value: "Green" },
          { trait_type: "Accessories", value: "Small Shades, Pipe" },
          { trait_type: "Rarity", value: "Alien" },
        ],
      }, null, 2),
      type: "code",
    },
    {
      title: "Full Metadata with Animation",
      content: JSON.stringify({
        name: "Animated Genesis NFT",
        description: "An example NFT with animation URL showcasing full metadata compliance.",
        image: "ipfs://QmYwAPJzwewNHrwmh2XKANcDmNaRKV8wB8nqMMEHeQF6V6",
        animation_url: "ipfs://QmVVvqKH7MBUmhK8hQv2J6G2FLkJRhDXpMhF4fKF6hQ8Jc",
        external_url: "https://example.com/nft/1",
        background_color: "000000",
        attributes: [
          { trait_type: "Rarity", value: "Legendary", display_type: "string" },
          { trait_type: "Power Level", value: 9000, display_type: "number" },
          { trait_type: "Created", value: 1672531200, display_type: "date" },
        ],
      }, null, 2),
      type: "code",
    },
  ],
  references: [
    {
      title: "OpenSea Metadata Standards",
      url: "https://docs.opensea.io/docs/metadata-standards",
    },
    {
      title: "ERC-721 Non-Fungible Token Standard",
      url: "https://eips.ethereum.org/EIPS/eip-721",
    },
    {
      title: "ERC-1155 Multi Token Standard",
      url: "https://eips.ethereum.org/EIPS/eip-1155",
    },
  ],
};
