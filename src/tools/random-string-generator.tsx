"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const HEX_CHARS = "0123456789abcdef";

type CharacterType = "alphanumeric" | "hex" | "numeric" | "custom";

export function RandomStringGeneratorTool() {
  const [randomString, setRandomString] = useState("");
  const [length, setLength] = useState("32");
  const [count, setCount] = useState("1");
  const [randomStrings, setRandomStrings] = useState<string[]>([]);
  const [characterType, setCharacterType] = useState<CharacterType>("alphanumeric");

  // Custom options
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);

  const generateString = (len: number): string => {
    let chars = "";

    switch (characterType) {
      case "hex":
        chars = HEX_CHARS;
        break;
      case "numeric":
        chars = NUMBERS;
        break;
      case "alphanumeric":
        chars = LOWERCASE + UPPERCASE + NUMBERS;
        break;
      case "custom":
        if (includeLowercase) chars += LOWERCASE;
        if (includeUppercase) chars += UPPERCASE;
        if (includeNumbers) chars += NUMBERS;
        if (includeSymbols) chars += SYMBOLS;
        break;
    }

    if (chars.length === 0) {
      return "";
    }

    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);

    let result = "";
    for (let i = 0; i < len; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  };

  const handleGenerate = () => {
    const len = Math.min(Math.max(parseInt(length) || 32, 1), 512);
    const num = Math.min(Math.max(parseInt(count) || 1, 1), 100);

    if (num === 1) {
      const newString = generateString(len);
      setRandomString(newString);
      setRandomStrings([]);
    } else {
      const newStrings = Array.from({ length: num }, () => generateString(len));
      setRandomStrings(newStrings);
      setRandomString("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Character Type Selection */}
      <div>
        <Label className="mb-2 block text-sm">Character Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={characterType === "alphanumeric" ? "default" : "secondary"}
            onClick={() => setCharacterType("alphanumeric")}
            className="w-full"
          >
            Alphanumeric
          </Button>
          <Button
            variant={characterType === "hex" ? "default" : "secondary"}
            onClick={() => setCharacterType("hex")}
            className="w-full"
          >
            Hex
          </Button>
          <Button
            variant={characterType === "numeric" ? "default" : "secondary"}
            onClick={() => setCharacterType("numeric")}
            className="w-full"
          >
            Numeric
          </Button>
          <Button
            variant={characterType === "custom" ? "default" : "secondary"}
            onClick={() => setCharacterType("custom")}
            className="w-full"
          >
            Custom
          </Button>
        </div>
      </div>

      {/* Custom Character Options */}
      {characterType === "custom" && (
        <div className="space-y-2">
          <Label className="block text-sm">Include Characters</Label>
          <Checkbox
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
            label="Lowercase (a-z)"
          />
          <Checkbox
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            label="Uppercase (A-Z)"
          />
          <Checkbox
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            label="Numbers (0-9)"
          />
          <Checkbox
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            label="Symbols (!@#$%...)"
          />
        </div>
      )}

      {/* Length Input */}
      <div>
        <Label className="mb-2 block text-sm">Length (1-512)</Label>
        <Input
          type="number"
          min="1"
          max="512"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="32"
        />
      </div>

      {/* Count Input */}
      <div>
        <Label className="mb-2 block text-sm">Number of Strings (1-100)</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder="1"
        />
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate String{parseInt(count) > 1 ? "s" : ""}
      </Button>

      {/* Single String Output */}
      {randomString && (
        <Input
          label="Generated String"
          value={randomString}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}

      {/* Multiple Strings Output */}
      {randomStrings.length > 0 && (
        <Textarea
          label={`Generated Strings (${randomStrings.length})`}
          value={randomStrings.join("\n")}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
          rows={Math.min(randomStrings.length, 15)}
        />
      )}
    </div>
  );
}

export const randomStringGeneratorConfig: ToolConfig = {
  id: "random-string-generator",
  name: "Random String Generator",
  description: "Generate random strings with various character types",
  category: "generators",
  component: RandomStringGeneratorTool,
  seo: {
    keywords: [
      "random string generator",
      "generate random string",
      "string generator",
      "random text generator",
      "alphanumeric generator",
      "hex string generator",
      "random token generator",
      "api key generator",
      "secure random string",
      "cryptographic string",
    ],
  },
  sections: [
    {
      title: "What is a Random String?",
      content:
        "A random string is a sequence of characters generated using cryptographic random number generation. These strings are useful for creating secure tokens, API keys, session IDs, and other security-sensitive values.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Character Types</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>Alphanumeric:</strong> A-Z, a-z, 0-9 (62 characters)</li>
            <li><strong>Hex:</strong> 0-9, a-f (16 characters)</li>
            <li><strong>Numeric:</strong> 0-9 (10 characters)</li>
            <li><strong>Custom:</strong> Choose your own character set</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Security</h4>
          <p className="text-sm mb-4">This tool uses the Web Crypto API's cryptographically strong random number generator (crypto.getRandomValues), making it suitable for generating secure tokens and keys.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Alphanumeric (32 chars)",
      content: "Kx9mP2nQ8rT4vY6zB3cD5fG7hJ1k",
      type: "text",
    },
    {
      title: "Hex (64 chars)",
      content: "a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890",
      type: "code",
    },
    {
      title: "API Key (40 chars)",
      content: "api_key_Kx9mP2nQ8rT4vY6zB3cD5fG7hJ1k4L",
      type: "text",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in crypto API

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const HEX_CHARS = '0123456789abcdef';

type CharacterSet = 'alphanumeric' | 'hex' | 'numeric' | 'lowercase' | 'uppercase' | 'custom';

interface RandomStringOptions {
  length: number;
  characterSet: CharacterSet;
  customChars?: string;
}

function generateRandomString(options: RandomStringOptions): string {
  let chars = '';

  switch (options.characterSet) {
    case 'alphanumeric':
      chars = LOWERCASE + UPPERCASE + NUMBERS;
      break;
    case 'hex':
      chars = HEX_CHARS;
      break;
    case 'numeric':
      chars = NUMBERS;
      break;
    case 'lowercase':
      chars = LOWERCASE;
      break;
    case 'uppercase':
      chars = UPPERCASE;
      break;
    case 'custom':
      chars = options.customChars || LOWERCASE + UPPERCASE + NUMBERS;
      break;
  }

  if (chars.length === 0) {
    throw new Error('Character set cannot be empty');
  }

  // Use crypto.getRandomValues for cryptographically secure random generation
  const bytes = new Uint8Array(options.length);
  crypto.getRandomValues(bytes);

  let result = '';
  for (let i = 0; i < options.length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

function generateMultipleRandomStrings(
  count: number,
  options: RandomStringOptions
): string[] {
  return Array.from({ length: count }, () => generateRandomString(options));
}

function generateSecureToken(length: number = 32): string {
  return generateRandomString({
    length,
    characterSet: 'alphanumeric'
  });
}

function generateApiKey(prefix: string = 'sk', length: number = 32): string {
  const randomPart = generateRandomString({
    length,
    characterSet: 'alphanumeric'
  });
  return \`\${prefix}_\${randomPart}\`;
}

// Example usage
console.log('Alphanumeric string (32 chars):');
console.log(generateRandomString({ length: 32, characterSet: 'alphanumeric' }));

console.log('\\nHex string (64 chars):');
console.log(generateRandomString({ length: 64, characterSet: 'hex' }));

console.log('\\nNumeric string (10 chars):');
console.log(generateRandomString({ length: 10, characterSet: 'numeric' }));

console.log('\\nCustom string (lowercase + numbers, 20 chars):');
console.log(generateRandomString({
  length: 20,
  characterSet: 'custom',
  customChars: LOWERCASE + NUMBERS
}));

console.log('\\nSecure token:');
console.log(generateSecureToken(40));

console.log('\\nAPI Key:');
console.log(generateApiKey('api_key', 32));

console.log('\\nMultiple strings (5):');
const strings = generateMultipleRandomStrings(5, { length: 16, characterSet: 'alphanumeric' });
strings.forEach((str, index) => {
  console.log(\`  \${index + 1}. \${str}\`);
});

// Output:
// Alphanumeric string (32 chars):
// Kx9mP2nQ8rT4vY6zB3cD5fG7hJ1k4L8m
//
// Hex string (64 chars):
// a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890
//
// Numeric string (10 chars):
// 4728193056
//
// Custom string (lowercase + numbers, 20 chars):
// k3x9m2p8q4t7y5v6w1z3
//
// Secure token:
// Kx9mP2nQ8rT4vY6zB3cD5fG7hJ1k4L8mN9pQ2r
//
// API Key:
// api_key_Kx9mP2nQ8rT4vY6zB3cD5fG7hJ1k
//
// Multiple strings (5):
//   1. Kx9mP2nQ8rT4vY6z
//   2. B3cD5fG7hJ1k4L8m
//   3. N6pQ9rS2tV5wX8y
//   4. Z1aC4dE7gH0jK3l
//   5. M6nP9qR2sT5uW8x`,
  references: [
    {
      title: "Web Crypto API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API",
    },
    {
      title: "Cryptographically Secure Random",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues",
    },
  ],
};
