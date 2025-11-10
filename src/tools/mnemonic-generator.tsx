"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

// BIP39 word list (first 100 words for demo - in production use full 2048 word list)
const WORD_LIST = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
  "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
  "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
  "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
  "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
  "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album",
  "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone",
  "alpha", "already", "also", "alter", "always", "amateur", "amazing", "among",
  "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry",
  "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
  "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april",
  "arch", "arctic", "area", "arena", "argue", "arm", "armed", "armor",
  "army", "around", "arrange", "arrest", "arrive", "arrow", "art", "artefact",
];

export function MnemonicGeneratorTool() {
  const [mode, setMode] = useState<"generate" | "validate">("generate");
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [mnemonic, setMnemonic] = useState("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleGenerate = () => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
      words.push(WORD_LIST[randomIndex]);
    }
    setMnemonic(words.join(" "));
    setValidationResult(null);
  };

  const handleValidate = () => {
    if (!mnemonic.trim()) {
      setValidationResult({
        isValid: false,
        message: "Please enter a mnemonic phrase",
      });
      return;
    }

    const words = mnemonic.trim().toLowerCase().split(/\s+/);

    // Check word count
    if (words.length !== 12 && words.length !== 24) {
      setValidationResult({
        isValid: false,
        message: `Invalid word count: ${words.length}. Must be 12 or 24 words.`,
      });
      return;
    }

    // Check if all words are in the word list
    const invalidWords = words.filter(word => !WORD_LIST.includes(word));
    if (invalidWords.length > 0) {
      setValidationResult({
        isValid: false,
        message: `Invalid words found: ${invalidWords.join(", ")}. (Note: This is a demo using limited word list)`,
      });
      return;
    }

    // In production, you would also validate the checksum
    setValidationResult({
      isValid: true,
      message: "Mnemonic appears valid! (Demo validation - use proper BIP39 library in production)",
    });
  };

  const handleReset = () => {
    setMnemonic("");
    setValidationResult(null);
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
              <li>Never share your mnemonic phrase with anyone</li>
              <li>Store it securely offline (paper wallet, hardware wallet)</li>
              <li>Anyone with your mnemonic can access all your funds</li>
              <li>This demo uses a limited word list - use proper BIP39 library in production</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <Label className="mb-2 block text-sm">Mode</Label>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setMode("generate");
              setValidationResult(null);
            }}
            variant={mode === "generate" ? "default" : "secondary"}
            className="flex-1"
          >
            Generate
          </Button>
          <Button
            onClick={() => {
              setMode("validate");
              setValidationResult(null);
            }}
            variant={mode === "validate" ? "default" : "secondary"}
            className="flex-1"
          >
            Validate
          </Button>
        </div>
      </div>

      {/* Generate Mode */}
      {mode === "generate" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Word Count</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setWordCount(12)}
                variant={wordCount === 12 ? "default" : "secondary"}
                className="flex-1"
              >
                12 Words
              </Button>
              <Button
                onClick={() => setWordCount(24)}
                variant={wordCount === 24 ? "default" : "secondary"}
                className="flex-1"
              >
                24 Words
              </Button>
            </div>
          </div>

          <Button onClick={handleGenerate} className="w-full">
            Generate Mnemonic
          </Button>

          {mnemonic && (
            <Textarea
              label="Generated Mnemonic Phrase"
              value={mnemonic}
              readOnly
              showCopy
              className="font-mono text-sm min-h-[100px] bg-[#0f0f0f]"
            />
          )}
        </div>
      )}

      {/* Validate Mode */}
      {mode === "validate" && (
        <div className="space-y-4">
          <Textarea
            label="Mnemonic Phrase to Validate"
            value={mnemonic}
            onChange={(e) => {
              setMnemonic(e.target.value);
              setValidationResult(null);
            }}
            placeholder="word1 word2 word3 word4 ..."
            className="font-mono text-sm min-h-[100px]"
            showClear
            onClearClick={handleReset}
          />

          <div className="flex gap-2">
            <Button onClick={handleValidate} className="flex-1">
              Validate Mnemonic
            </Button>
            <Button onClick={handleReset} variant="secondary">
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`p-3 rounded border ${
            validationResult.isValid
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="text-sm font-medium">
            {validationResult.isValid ? "✓" : "✗"} {validationResult.message}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400">
          <strong>About BIP39:</strong> BIP39 is a standard for generating mnemonic phrases
          (seed phrases) that can be used to derive HD wallets. A 12-word phrase provides
          128 bits of entropy, while 24 words provide 256 bits. This demo uses a limited
          word list for demonstration purposes.
        </div>
      </div>
    </div>
  );
}

export const mnemonicGeneratorConfig: ToolConfig = {
  id: "mnemonic-generator",
  name: "Mnemonic Generator/Validator",
  description: "Generate and validate BIP39 mnemonic phrases",
  category: "web3",
  component: MnemonicGeneratorTool,
  codeSnippet: `// npm install viem

import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';

// Generate a 12-word mnemonic (128 bits entropy)
const mnemonic12 = generateMnemonic(english);
console.log("12-word mnemonic:", mnemonic12);

// Generate a 24-word mnemonic (256 bits entropy)
const mnemonic24 = generateMnemonic(english, { strength: 256 });
console.log("24-word mnemonic:", mnemonic24);

// Validate and derive account from mnemonic
try {
  const account = mnemonicToAccount(mnemonic12);
  console.log("Valid mnemonic! Address:", account.address);
} catch (error) {
  console.log("Invalid mnemonic");
}

// Derive account with custom path
const customPathAccount = mnemonicToAccount(mnemonic12, {
  path: "m/44'/60'/0'/0/1" // Second address
});
console.log("Second address:", customPathAccount.address);
`,
  seo: {
    keywords: [
      "bip39 mnemonic generator",
      "seed phrase generator",
      "12 word seed phrase",
      "24 word mnemonic",
      "crypto wallet seed",
      "hd wallet mnemonic",
      "bip39 validator",
      "recovery phrase generator",
      "mnemonic phrase tool",
      "ethereum seed phrase",
    ],
  },
  sections: [
    {
      title: "What is BIP39?",
      content:
        "BIP39 (Bitcoin Improvement Proposal 39) is a standard for generating deterministic wallets using mnemonic phrases. These human-readable words (12 or 24) can be used to derive private keys and addresses.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Generation Process</h4>
          <p className="text-sm mb-4">A random entropy is generated, a checksum is calculated, and the result is mapped to words from a 2048-word list. The mnemonic can then be used with a key derivation function (PBKDF2) to generate a seed for HD wallets.</p>

          <h4 className="text-base font-semibold mb-2">Security</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>12 words = 128 bits of entropy (secure)</li>
            <li>24 words = 256 bits of entropy (very secure)</li>
            <li>Store mnemonics offline and securely</li>
            <li>Never share or enter on untrusted websites</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "12-word mnemonic",
      content: "witch collapse practice feed shame open despair creek road again ice least",
      type: "code",
    },
    {
      title: "24-word mnemonic",
      content: "Used for maximum security, provides 256 bits of entropy",
      type: "text",
    },
  ],
  references: [
    {
      title: "BIP39 Specification",
      url: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
    },
    {
      title: "viem: English Word List",
      url: "https://viem.sh/docs/glossary/terms#bip-39",
    },
    {
      title: "HD Wallets Explained",
      url: "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
    },
  ],
};
