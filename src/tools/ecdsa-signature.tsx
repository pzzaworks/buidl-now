"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

export function EcdsaSignatureTool() {
  const [signature, setSignature] = useState("");
  const [r, setR] = useState("");
  const [s, setS] = useState("");
  const [v, setV] = useState("");
  const [yParity, setYParity] = useState("");
  const [error, setError] = useState("");

  const parseSignature = (sig: string) => {
    if (!sig) {
      setR("");
      setS("");
      setV("");
      setYParity("");
      setError("");
      return;
    }

    try {
      // Remove 0x prefix if present
      let cleanSig = sig.trim();
      if (cleanSig.startsWith("0x")) {
        cleanSig = cleanSig.slice(2);
      }

      // Check if it's a valid hex string
      if (!/^[0-9a-fA-F]+$/.test(cleanSig)) {
        throw new Error("Invalid hex string");
      }

      // Signature can be 64 bytes (128 hex) or 65 bytes (130 hex)
      if (cleanSig.length !== 128 && cleanSig.length !== 130) {
        throw new Error("Signature must be 64 or 65 bytes (128 or 130 hex characters)");
      }

      // Parse r and s (first 64 bytes)
      const rValue = "0x" + cleanSig.slice(0, 64);
      const sValue = "0x" + cleanSig.slice(64, 128);

      // Parse v if present (last byte)
      let vValue = "";
      let yParityValue = "";

      if (cleanSig.length === 130) {
        const vByte = parseInt(cleanSig.slice(128, 130), 16);
        vValue = `0x${cleanSig.slice(128, 130)} (${vByte})`;

        // Calculate yParity (0 or 1)
        // Common values: 27 or 28 (legacy), or 0 or 1 (EIP-155)
        if (vByte === 27 || vByte === 0) {
          yParityValue = "0 (even)";
        } else if (vByte === 28 || vByte === 1) {
          yParityValue = "1 (odd)";
        } else {
          // EIP-155: v = chainId * 2 + 35 + yParity
          const chainId = Math.floor((vByte - 35) / 2);
          const parity = vByte - (chainId * 2 + 35);
          yParityValue = `${parity} (Chain ID: ${chainId})`;
        }
      } else {
        vValue = "Not present (64-byte signature)";
        yParityValue = "Not present (requires 65-byte signature)";
      }

      setR(rValue);
      setS(sValue);
      setV(vValue);
      setYParity(yParityValue);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parsing failed");
      setR("");
      setS("");
      setV("");
      setYParity("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSignature(value);
    parseSignature(value);
  };

  const handleReset = () => {
    setSignature("");
    setR("");
    setS("");
    setV("");
    setYParity("");
    setError("");
  };


  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="text-sm mb-2 block">Signature (hex string)</Label>
        <Textarea
          value={signature}
          onChange={handleInputChange}
          placeholder="0xabcdef...1b (130 hex chars for 65 bytes, or 128 for 64 bytes)"
          className="font-mono min-h-[100px]"
        />
        <div className="flex gap-2 mt-2">
          <Button onClick={() => parseSignature(signature)} className="flex-1">
            Parse
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
      {r && (
        <div className="space-y-4">
          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Component: r</Label>
            <Input
              value={r}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              First 32 bytes - X coordinate of the signature point
            </p>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Component: s</Label>
            <Input
              value={s}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Second 32 bytes - Signature proof value
            </p>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Component: v</Label>
            <Input
              value={v}
              readOnly
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Recovery ID - Used to recover the public key from the signature
            </p>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Y Parity</Label>
            <Input
              value={yParity}
              readOnly
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Indicates whether the Y coordinate is even (0) or odd (1)
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="p-4 rounded border border-border bg-[#0f0f0f]">
        <Label className="mb-2 block text-sm">About ECDSA Signatures</Label>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>r:</strong> The x-coordinate of a random point on the elliptic curve (32 bytes)
          </p>
          <p>
            <strong>s:</strong> The signature proof value (32 bytes)
          </p>
          <p>
            <strong>v:</strong> Recovery ID that helps recover the public key (1 byte, optional)
          </p>
          <p className="mt-4">
            <strong>Common v values:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>27 or 28: Legacy Ethereum signatures</li>
            <li>0 or 1: Modern EIP-2098 compact signatures</li>
            <li>35+: EIP-155 signatures with chain ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const ecdsaSignatureConfig: ToolConfig = {
  id: "ecdsa-signature",
  name: "ECDSA Signature Parser",
  description: "Parse ECDSA signatures into r, s, v components",
  category: "web3",
  component: EcdsaSignatureTool,
  seo: {
    keywords: [
      "ecdsa signature parser",
      "ethereum signature decoder",
      "parse signature rsv",
      "signature components",
      "recovery id parser",
      "ethereum signature analysis",
      "signature r s v",
      "ecdsa decoder",
      "signature recovery",
      "ethereum signature format",
    ],
  },
  sections: [
    {
      title: "What is an ECDSA signature?",
      content:
        "ECDSA (Elliptic Curve Digital Signature Algorithm) signatures are used in Ethereum to prove ownership of an address. A signature consists of three components: r, s, and optionally v.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            ECDSA uses elliptic curve mathematics to create signatures. The signer generates a random point on the curve (r coordinate), then uses their private key and message hash to compute s. The v value (recovery ID) helps recover the public key from the signature. Ethereum uses the secp256k1 curve for this process.
          </p>

          <h4 className="text-base font-semibold mb-2">Signature formats</h4>
          <p className="text-sm mb-2">
            Ethereum signatures can be in two formats:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm mb-4">
            <li>
              <strong>65 bytes (130 hex):</strong> r (32) + s (32) + v (1) - Standard format with recovery ID
            </li>
            <li>
              <strong>64 bytes (128 hex):</strong> r (32) + s (32) - Compact format without v
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Recovery ID (v)</h4>
          <p className="text-sm mb-2">
            The v value helps recover the public key from the signature:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm mb-2">
            <li><strong>27/28:</strong> Original Ethereum (pre-EIP-155)</li>
            <li><strong>0/1:</strong> EIP-2098 compact signatures</li>
            <li><strong>35+:</strong> EIP-155 with chain ID protection</li>
          </ul>
          <p className="text-sm">
            Formula for EIP-155: <code className="text-xs bg-[#0f0f0f] px-1 py-0.5 rounded">v = chainId * 2 + 35 + yParity</code>
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Standard 65-byte signature",
      content: "0x + 64 hex chars (r) + 64 hex chars (s) + 2 hex chars (v) = 130 total",
      type: "code",
    },
    {
      title: "Compact 64-byte signature",
      content: "0x + 64 hex chars (r) + 64 hex chars (s) = 128 total",
      type: "code",
    },
    {
      title: "Legacy v values",
      content: "v = 27 (0x1b) or v = 28 (0x1c) for pre-EIP-155 signatures",
      type: "code",
    },
  ],
  codeSnippet: `// No external packages needed - pure TypeScript

interface SignatureComponents {
  r: string;
  s: string;
  v: number | null;
  yParity: number | null;
}

// Parse ECDSA signature into r, s, v components
function parseSignature(signature: string): SignatureComponents {
  // Remove 0x prefix if present
  let cleanSig = signature.trim();
  if (cleanSig.startsWith('0x')) {
    cleanSig = cleanSig.slice(2);
  }

  // Validate hex string
  if (!/^[0-9a-fA-F]+$/.test(cleanSig)) {
    throw new Error('Invalid hex string');
  }

  // Signature can be 64 bytes (128 hex) or 65 bytes (130 hex)
  if (cleanSig.length !== 128 && cleanSig.length !== 130) {
    throw new Error('Signature must be 64 or 65 bytes');
  }

  // Parse r and s (first 64 bytes)
  const r = '0x' + cleanSig.slice(0, 64);
  const s = '0x' + cleanSig.slice(64, 128);

  // Parse v if present (last byte)
  let v: number | null = null;
  let yParity: number | null = null;

  if (cleanSig.length === 130) {
    v = parseInt(cleanSig.slice(128, 130), 16);

    // Calculate yParity (0 or 1)
    if (v === 27 || v === 0) {
      yParity = 0; // even
    } else if (v === 28 || v === 1) {
      yParity = 1; // odd
    } else {
      // EIP-155: v = chainId * 2 + 35 + yParity
      const chainId = Math.floor((v - 35) / 2);
      yParity = v - (chainId * 2 + 35);
    }
  }

  return { r, s, v, yParity };
}

// Example: Parse a 65-byte signature
const signature = '0x' + 'a'.repeat(64) + 'b'.repeat(64) + '1b';
const components = parseSignature(signature);

console.log('r:', components.r);
console.log('s:', components.s);
console.log('v:', components.v); // 27
console.log('yParity:', components.yParity); // 0 (even)

// Example: Parse a 64-byte signature (no v)
const compactSig = '0x' + 'c'.repeat(128);
const compactComponents = parseSignature(compactSig);

console.log('r:', compactComponents.r);
console.log('s:', compactComponents.s);
console.log('v:', compactComponents.v); // null
console.log('yParity:', compactComponents.yParity); // null`,
  references: [
    {
      title: "Ethereum Yellow Paper (ECDSA)",
      url: "https://ethereum.github.io/yellowpaper/paper.pdf",
    },
    {
      title: "EIP-155: Replay Attack Protection",
      url: "https://eips.ethereum.org/EIPS/eip-155",
    },
    {
      title: "EIP-2098: Compact Signature Representation",
      url: "https://eips.ethereum.org/EIPS/eip-2098",
    },
    {
      title: "viem: parseSignature",
      url: "https://viem.sh/docs/utilities/parseSignature",
    },
  ],
};
