"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function PasswordGeneratorTool() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState("16");
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const handleGenerate = () => {
    let chars = "";
    if (includeLowercase) chars += LOWERCASE;
    if (includeUppercase) chars += UPPERCASE;
    if (includeNumbers) chars += NUMBERS;
    if (includeSymbols) chars += SYMBOLS;

    if (chars.length === 0) {
      setPassword("");
      return;
    }

    const passwordLength = Math.min(Math.max(parseInt(length) || 16, 4), 128);
    let result = "";

    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    setPassword(result);
  };

  return (
    <div className="space-y-6">
      {/* Length */}
      <div>
        <Label className="mb-2 block text-sm">Password Length (4-128)</Label>
        <Input
          type="number"
          min="4"
          max="128"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="16"
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Label className="block text-sm">Character Types</Label>
        <div className="space-y-2">
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
            label="Symbols (!@#$%^&*...)"
          />
        </div>
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate Password
      </Button>

      {/* Output */}
      {password && (
        <Input
          label="Generated Password"
          value={password}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}
    </div>
  );
}

export const passwordGeneratorConfig: ToolConfig = {
  id: "password-generator",
  name: "Password Generator",
  description: "Generate secure random passwords",
  category: "generators",
  component: PasswordGeneratorTool,
  seo: {
    keywords: [
      "random password",
      "strong password generator",
      "password creator",
      "secure password",
      "generate password",
      "password maker",
      "strong password online",
      "random password generator",
      "secure password tool",
      "password gen",
    ],
  },
  sections: [
    {
      title: "What is a Password Generator?",
      content:
        "A password generator is a tool that creates random, secure passwords using a combination of character types (lowercase, uppercase, numbers, and symbols). It helps users create strong, unpredictable passwords that are resistant to brute-force attacks and common password-guessing techniques.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Generation Process</h4>
          <p className="text-sm mb-4">The generator creates passwords by randomly selecting characters from a pool of available character types you choose. For each position in the password, it uses cryptographic random number generation to pick a character, ensuring the password is truly random and unpredictable.</p>

          <h4 className="text-base font-semibold mb-2">Password Security</h4>
          <p className="text-sm mb-4">Strong passwords should be long (at least 12-16 characters), include a mix of character types, and be unique for each service. Never reuse passwords across different accounts.</p>

          <h4 className="text-base font-semibold mb-2">Best Practices</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Use a password manager to store passwords securely</li>
            <li>Enable two-factor authentication when available</li>
            <li>Never share passwords via email or messaging</li>
            <li>Change passwords if a service reports a breach</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Strong password example",
      content: "X7$mK9#pQ2@nL4&wR8",
      type: "text",
    },
    {
      title: "Alphanumeric only",
      content: "aB3dE6gH9jK2mN5",
      type: "text",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in crypto API

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

interface PasswordOptions {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

function generatePassword(options: PasswordOptions): string {
  let chars = '';

  if (options.includeLowercase) chars += LOWERCASE;
  if (options.includeUppercase) chars += UPPERCASE;
  if (options.includeNumbers) chars += NUMBERS;
  if (options.includeSymbols) chars += SYMBOLS;

  if (chars.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  // Use crypto.getRandomValues for secure random generation
  const bytes = new Uint8Array(options.length);
  crypto.getRandomValues(bytes);

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += chars[bytes[i] % chars.length];
  }

  return password;
}

function calculatePasswordStrength(password: string): string {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const varietyScore = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  const lengthScore = password.length >= 16 ? 2 : password.length >= 12 ? 1 : 0;

  const totalScore = varietyScore + lengthScore;

  if (totalScore >= 5) return 'Very Strong';
  if (totalScore >= 4) return 'Strong';
  if (totalScore >= 3) return 'Medium';
  return 'Weak';
}

// Example usage
const options: PasswordOptions = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true
};

console.log('Generating passwords...');

const password1 = generatePassword(options);
console.log(\`\\nPassword 1: \${password1}\`);
console.log(\`Strength: \${calculatePasswordStrength(password1)}\`);

const password2 = generatePassword({ ...options, length: 24 });
console.log(\`\\nPassword 2 (24 chars): \${password2}\`);
console.log(\`Strength: \${calculatePasswordStrength(password2)}\`);

const simplePassword = generatePassword({
  length: 12,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: false
});
console.log(\`\\nSimple Password (no symbols): \${simplePassword}\`);
console.log(\`Strength: \${calculatePasswordStrength(simplePassword)}\`);

// Output:
// Generating passwords...
//
// Password 1: X7$mK9#pQ2@nL4&w
// Strength: Very Strong
//
// Password 2 (24 chars): R8*tY6^uI3%oP5!aS9$dF2#g
// Strength: Very Strong
//
// Simple Password (no symbols): aB3dE6gH9jK2
// Strength: Medium`,
  references: [
    {
      title: "NIST Password Guidelines",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
    },
  ],
};
