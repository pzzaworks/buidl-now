"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function NumberBaseTool() {
  const [decimal, setDecimal] = useState("");
  const [binary, setBinary] = useState("");
  const [octal, setOctal] = useState("");
  const [hexadecimal, setHexadecimal] = useState("");

  const updateAllFromDecimal = (value: string) => {
    if (!value || value === "0") {
      setDecimal("0");
      setBinary("0");
      setOctal("0");
      setHexadecimal("0");
      return;
    }

    try {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) return;

      setDecimal(num.toString(10));
      setBinary(num.toString(2));
      setOctal(num.toString(8));
      setHexadecimal(num.toString(16).toUpperCase());
    } catch (e) {
      // Invalid input
    }
  };

  const updateAllFromBinary = (value: string) => {
    if (!value || value === "0") {
      setDecimal("0");
      setBinary("0");
      setOctal("0");
      setHexadecimal("0");
      return;
    }

    try {
      const num = parseInt(value, 2);
      if (isNaN(num)) return;

      setDecimal(num.toString(10));
      setBinary(value);
      setOctal(num.toString(8));
      setHexadecimal(num.toString(16).toUpperCase());
    } catch (e) {
      // Invalid input
    }
  };

  const updateAllFromOctal = (value: string) => {
    if (!value || value === "0") {
      setDecimal("0");
      setBinary("0");
      setOctal("0");
      setHexadecimal("0");
      return;
    }

    try {
      const num = parseInt(value, 8);
      if (isNaN(num)) return;

      setDecimal(num.toString(10));
      setBinary(num.toString(2));
      setOctal(value);
      setHexadecimal(num.toString(16).toUpperCase());
    } catch (e) {
      // Invalid input
    }
  };

  const updateAllFromHex = (value: string) => {
    if (!value || value === "0") {
      setDecimal("0");
      setBinary("0");
      setOctal("0");
      setHexadecimal("0");
      return;
    }

    try {
      const num = parseInt(value, 16);
      if (isNaN(num)) return;

      setDecimal(num.toString(10));
      setBinary(num.toString(2));
      setOctal(num.toString(8));
      setHexadecimal(value.toUpperCase());
    } catch (e) {
      // Invalid input
    }
  };

  const handleReset = () => {
    setDecimal("0");
    setBinary("0");
    setOctal("0");
    setHexadecimal("0");
  };

  return (
    <div className="space-y-6">
      {/* Decimal */}
      <div>
        <Input
          label="Decimal (Base 10)"
          value={decimal}
          onChange={(e) => updateAllFromDecimal(e.target.value)}
          placeholder="42"
          showCopy
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Digits: 0-9
        </div>
      </div>

      {/* Binary */}
      <div>
        <Input
          label="Binary (Base 2)"
          value={binary}
          onChange={(e) => updateAllFromBinary(e.target.value)}
          placeholder="101010"
          showCopy
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Digits: 0-1
        </div>
      </div>

      {/* Octal */}
      <div>
        <Input
          label="Octal (Base 8)"
          value={octal}
          onChange={(e) => updateAllFromOctal(e.target.value)}
          placeholder="52"
          showCopy
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Digits: 0-7
        </div>
      </div>

      {/* Hexadecimal */}
      <div>
        <Input
          label="Hexadecimal (Base 16)"
          value={hexadecimal}
          onChange={(e) => updateAllFromHex(e.target.value)}
          placeholder="2A"
          showCopy
          className="font-mono text-sm mb-2"
        />
        <div className="text-xs text-muted-foreground mb-2">
          Digits: 0-9, A-F
        </div>
        <Button onClick={handleReset} variant="secondary" className="w-full">
          Reset
        </Button>
      </div>
    </div>
  );
}

export const numberBaseConfig: ToolConfig = {
  id: "number-base",
  name: "Number Base Converter",
  description: "Convert numbers between different bases (binary, octal, decimal, hexadecimal)",
  category: "converters",
  component: NumberBaseTool,
  seo: {
    keywords: [
      "binary converter",
      "hex to decimal",
      "decimal to binary",
      "hexadecimal converter",
      "octal converter",
      "base converter",
      "number system converter",
      "binary to decimal",
      "decimal to hex",
      "hex converter",
      "binary calculator",
      "base conversion",
    ],
  },
  sections: [
    {
      title: "What are Number Systems?",
      content: (
        <ul className="list-disc list-inside space-y-1">
          <li>Binary (Base 2): Uses digits 0-1, commonly used in computing</li>
          <li>Octal (Base 8): Uses digits 0-7, legacy systems</li>
          <li>Decimal (Base 10): Uses digits 0-9, standard human counting</li>
          <li>Hexadecimal (Base 16): Uses digits 0-9 and A-F, used for colors, memory addresses</li>
        </ul>
      ),
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Conversion Process</h4>
          <p className="text-sm mb-4">Number base conversion works by interpreting digits according to their positional values in different bases. Each digit is multiplied by the base raised to its position power, then summed together. The tool converts between bases by first interpreting the input in its specified base, then expressing the value in the target base.</p>

          <h4 className="text-base font-semibold mb-2">Common Uses</h4>
          <p className="text-sm mb-4">Hexadecimal is widely used in web development for colors (#FF5733), in programming for memory addresses, and in cryptocurrency for addresses and hashes. Binary is fundamental to all computer operations.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "The number 42",
      content: "Decimal: 42, Binary: 101010, Octal: 52, Hex: 2A",
      type: "code",
    },
    {
      title: "The number 255",
      content: "Decimal: 255, Binary: 11111111, Octal: 377, Hex: FF",
      type: "code",
    },
    {
      title: "The number 1000",
      content: "Decimal: 1000, Binary: 1111101000, Octal: 1750, Hex: 3E8",
      type: "code",
    },
  ],
  codeSnippet: `// No npm packages needed - pure Node.js/TypeScript

interface NumberBases {
  decimal: string;
  binary: string;
  octal: string;
  hexadecimal: string;
}

function convertFromDecimal(decimal: number): NumberBases {
  return {
    decimal: decimal.toString(10),
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    hexadecimal: decimal.toString(16).toUpperCase()
  };
}

function convertFromBinary(binary: string): NumberBases {
  const decimal = parseInt(binary, 2);
  return convertFromDecimal(decimal);
}

function convertFromOctal(octal: string): NumberBases {
  const decimal = parseInt(octal, 8);
  return convertFromDecimal(decimal);
}

function convertFromHex(hex: string): NumberBases {
  const decimal = parseInt(hex, 16);
  return convertFromDecimal(decimal);
}

function displayNumber(num: NumberBases, label: string): void {
  console.log(\`\\n=== \${label} ===\`);
  console.log(\`Decimal:      \${num.decimal}\`);
  console.log(\`Binary:       \${num.binary}\`);
  console.log(\`Octal:        \${num.octal}\`);
  console.log(\`Hexadecimal:  \${num.hexadecimal}\`);
}

// Example usage
console.log('Number Base Converter Examples');

// Convert from decimal
const num1 = convertFromDecimal(42);
displayNumber(num1, 'Number 42');

// Convert from binary
const num2 = convertFromBinary('11111111');
displayNumber(num2, 'Binary 11111111');

// Convert from hexadecimal
const num3 = convertFromHex('FF');
displayNumber(num3, 'Hexadecimal FF');

// Convert from octal
const num4 = convertFromOctal('52');
displayNumber(num4, 'Octal 52');

// Common use cases
console.log('\\n=== Common Use Cases ===');

// RGB color value
const rgbRed = convertFromDecimal(255);
console.log(\`RGB Red (255) in Hex: #\${rgbRed.hexadecimal}0000\`);

// File permissions (Unix)
const permissions = convertFromOctal('755');
console.log(\`File permissions 755 in binary: \${permissions.binary}\`);

// Memory address
const memoryAddr = convertFromHex('DEADBEEF');
console.log(\`Memory address 0xDEADBEEF in decimal: \${memoryAddr.decimal}\`);

// Output:
// Number Base Converter Examples
//
// === Number 42 ===
// Decimal:      42
// Binary:       101010
// Octal:        52
// Hexadecimal:  2A
//
// === Binary 11111111 ===
// Decimal:      255
// Binary:       11111111
// Octal:        377
// Hexadecimal:  FF
//
// === Hexadecimal FF ===
// Decimal:      255
// Binary:       11111111
// Octal:        377
// Hexadecimal:  FF
//
// === Octal 52 ===
// Decimal:      42
// Binary:       101010
// Octal:        52
// Hexadecimal:  2A
//
// === Common Use Cases ===
// RGB Red (255) in Hex: #FF0000
// File permissions 755 in binary: 111101101
// Memory address 0xDEADBEEF in decimal: 3735928559`,
  references: [
    {
      title: "Number Systems - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Numeral_system",
    },
    {
      title: "Binary Number System",
      url: "https://en.wikipedia.org/wiki/Binary_number",
    },
  ],
};
