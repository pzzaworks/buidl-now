"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recoverMessageAddress, isAddress } from "viem";
import { ToolConfig } from "@/types/tool";

export function SignatureVerifierTool() {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [expectedAddress, setExpectedAddress] = useState("");
  const [recoveredAddress, setRecoveredAddress] = useState("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const handleVerify = async () => {
    if (!message || !signature) {
      return;
    }

    try {
      const recovered = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });

      setRecoveredAddress(recovered);

      if (expectedAddress && isAddress(expectedAddress)) {
        const match =
          recovered.toLowerCase() === expectedAddress.toLowerCase();
        setIsMatch(match);
      } else {
        setIsMatch(null);
      }
    } catch (e) {
      setRecoveredAddress("");
      setIsMatch(null);
    }
  };

  const handleReset = () => {
    setMessage("");
    setSignature("");
    setExpectedAddress("");
    setRecoveredAddress("");
    setIsMatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      <div>
        <Label className="mb-2 block text-sm">Original Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hello, Ethereum!"
          className="min-h-[100px]"
        />
      </div>

      {/* Signature */}
      <div>
        <Label className="mb-2 block text-sm">Signature (65 bytes hex)</Label>
        <Textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="0x..."
          className="font-mono min-h-[100px]"
        />
      </div>

      {/* Expected Address (Optional) */}
      <div>
        <Label className="mb-2 block text-sm">
          Expected Signer Address (Optional)
        </Label>
        <Input
          value={expectedAddress}
          onChange={(e) => setExpectedAddress(e.target.value)}
          placeholder="0x..."
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleVerify} className="flex-1">
            Verify Signature
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Recovered Address */}
      {recoveredAddress && (
        <Input
          label="Recovered Signer Address"
          value={recoveredAddress}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}

      {/* Verification Result */}
      {isMatch !== null && (
        <div
          className={`p-3 rounded border ${
            isMatch
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="text-sm font-medium">
            {isMatch
              ? "✓ Signature matches expected address"
              : "✗ Signature does not match expected address"}
          </div>
        </div>
      )}
    </div>
  );
}

export const signatureVerifierConfig: ToolConfig = {
  id: "signature-verifier",
  name: "Signature Verifier",
  description: "Verify Ethereum signatures (ECDSA) and recover signer addresses",
  category: "web3",
  component: SignatureVerifierTool,
  codeSnippet: `// npm install viem

import { recoverMessageAddress, verifyMessage } from 'viem';

// Message and signature from signing
const message = "Hello, Ethereum!";
const signature = "0x1234567890abcdef..."; // 65-byte signature

// Recover signer address from signature
const recoveredAddress = await recoverMessageAddress({
  message,
  signature: signature as \`0x\${string}\`
});
console.log("Signer:", recoveredAddress);

// Verify signature matches expected address
const expectedAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const isValid = await verifyMessage({
  address: expectedAddress as \`0x\${string}\`,
  message,
  signature: signature as \`0x\${string}\`
});
console.log("Valid signature:", isValid);

// Sign a message with private key account
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount("0x1234..." as \`0x\${string}\`);
const newSignature = await account.signMessage({
  message: "Sign this message"
});
console.log("New signature:", newSignature);
`,
  seo: {
    keywords: [
      "ethereum signature",
      "ecdsa verify",
      "verify signature",
      "eth signature verifier",
      "message signature",
      "ecrecover",
      "signature validation",
      "crypto signature",
    ],
  },
  sections: [
    {
      title: "What is ECDSA?",
      content:
        "ECDSA (Elliptic Curve Digital Signature Algorithm) is the signature scheme used in Ethereum. It allows you to prove that a message was signed by the holder of a specific private key without revealing the key itself.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Message Signing</h4>
          <p className="text-sm mb-4">When you sign a message in Ethereum, you're creating a cryptographic proof that you control a particular address. The signature can be verified by anyone to recover the signer's address.</p>

          <h4 className="text-base font-semibold mb-2">Signature Format</h4>
          <p className="text-sm mb-4">Ethereum signatures are 65 bytes: 32 bytes for r, 32 bytes for s, and 1 byte for v (recovery id). They are typically represented as a hex string starting with 0x.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Example message",
      content: "Hello, Ethereum!",
      type: "text",
    },
    {
      title: "Example signature",
      content: "0x... (65 bytes hex string)",
      type: "code",
    },
  ],
  references: [
    {
      title: "viem: recoverMessageAddress",
      url: "https://viem.sh/docs/utilities/recoverMessageAddress",
    },
    {
      title: "ECDSA Signatures",
      url: "https://ethereum.org/en/developers/docs/transactions/#digital-signatures",
    },
  ],
};
