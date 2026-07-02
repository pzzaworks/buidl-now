"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdWarning, MdCheck, MdClose } from "react-icons/md";

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
  const t = useTranslations("toolUI.mnemonic-generator");
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
        message: t("errorEmpty"),
      });
      return;
    }

    const words = mnemonic.trim().toLowerCase().split(/\s+/);

    // Check word count
    if (words.length !== 12 && words.length !== 24) {
      setValidationResult({
        isValid: false,
        message: t("invalidWordCount", { count: words.length }),
      });
      return;
    }

    // Check if all words are in the word list
    const invalidWords = words.filter(word => !WORD_LIST.includes(word));
    if (invalidWords.length > 0) {
      setValidationResult({
        isValid: false,
        message: t("invalidWords", { words: invalidWords.join(", ") }),
      });
      return;
    }

    // In production, you would also validate the checksum
    setValidationResult({
      isValid: true,
      message: t("validMnemonic"),
    });
  };

  const handleReset = () => {
    setMnemonic("");
    setValidationResult(null);
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
              <li>{t("warnStoreOffline")}</li>
              <li>{t("warnAccessFunds")}</li>
              <li>{t("warnDemoWordList")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <Label className="mb-2 block text-sm">{t("mode")}</Label>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setMode("generate");
              setValidationResult(null);
            }}
            variant={mode === "generate" ? "primary" : "secondary"}
            className="flex-1"
          >
            {t("generate")}
          </Button>
          <Button
            onClick={() => {
              setMode("validate");
              setValidationResult(null);
            }}
            variant={mode === "validate" ? "primary" : "secondary"}
            className="flex-1"
          >
            {t("validate")}
          </Button>
        </div>
      </div>

      {/* Generate Mode */}
      {mode === "generate" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">{t("wordCount")}</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setWordCount(12)}
                variant={wordCount === 12 ? "primary" : "secondary"}
                className="flex-1"
              >
                {t("words12")}
              </Button>
              <Button
                onClick={() => setWordCount(24)}
                variant={wordCount === 24 ? "primary" : "secondary"}
                className="flex-1"
              >
                {t("words24")}
              </Button>
            </div>
          </div>

          <Button onClick={handleGenerate} variant="primary" className="w-full">
            {t("generateMnemonic")}
          </Button>

          {mnemonic && (
            <Textarea
              label={t("generatedPhrase")}
              value={mnemonic}
              readOnly
              showCopy
              className="font-mono text-sm min-h-[100px] bg-[var(--color-gray-0)]"
            />
          )}
        </div>
      )}

      {/* Validate Mode */}
      {mode === "validate" && (
        <div className="space-y-4">
          <Textarea
            label={t("phraseToValidate")}
            value={mnemonic}
            onChange={(e) => {
              setMnemonic(e.target.value);
              setValidationResult(null);
            }}
            placeholder="word1 word2 word3 word4 ..."
            className="font-mono text-sm min-h-[100px]"
          />

          <div className="flex gap-2">
            <Button onClick={handleValidate} variant="primary" className="flex-1">
              {t("validateMnemonic")}
            </Button>
            <Button onClick={handleReset}>
              {t("reset")}
            </Button>
          </div>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`p-3 rounded-[12px] border ${
            validationResult.isValid
              ? "bg-[var(--color-green-50)] border-green-500/30 text-[var(--color-green-500)]"
              : "bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]"
          }`}
        >
          <div className="text-sm font-medium flex items-center gap-2">
            {validationResult.isValid ? <MdCheck className="w-5 h-5" /> : <MdClose className="w-5 h-5" />} {validationResult.message}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-[12px] border border-blue-500/30 bg-blue-500/5">
        <div className="text-sm text-blue-400">
          <strong>{t("aboutTitle")}</strong> {t("aboutBody")}
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
