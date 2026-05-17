"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface AsciiChar {
  decimal: number;
  hex: string;
  octal: string;
  binary: string;
  char: string;
  description: string;
}

const controlCharDescriptions: Record<number, string> = {
  0: "NUL (Null)",
  1: "SOH (Start of Heading)",
  2: "STX (Start of Text)",
  3: "ETX (End of Text)",
  4: "EOT (End of Transmission)",
  5: "ENQ (Enquiry)",
  6: "ACK (Acknowledge)",
  7: "BEL (Bell)",
  8: "BS (Backspace)",
  9: "HT (Horizontal Tab)",
  10: "LF (Line Feed)",
  11: "VT (Vertical Tab)",
  12: "FF (Form Feed)",
  13: "CR (Carriage Return)",
  14: "SO (Shift Out)",
  15: "SI (Shift In)",
  16: "DLE (Data Link Escape)",
  17: "DC1 (Device Control 1)",
  18: "DC2 (Device Control 2)",
  19: "DC3 (Device Control 3)",
  20: "DC4 (Device Control 4)",
  21: "NAK (Negative Acknowledge)",
  22: "SYN (Synchronous Idle)",
  23: "ETB (End of Trans. Block)",
  24: "CAN (Cancel)",
  25: "EM (End of Medium)",
  26: "SUB (Substitute)",
  27: "ESC (Escape)",
  28: "FS (File Separator)",
  29: "GS (Group Separator)",
  30: "RS (Record Separator)",
  31: "US (Unit Separator)",
  32: "Space",
  127: "DEL (Delete)",
};

function generateAsciiTable(): AsciiChar[] {
  const table: AsciiChar[] = [];
  for (let i = 0; i <= 127; i++) {
    let char = "";
    let description = "";

    if (i < 32 || i === 127) {
      char = controlCharDescriptions[i]?.split(" ")[0] || "";
      description = controlCharDescriptions[i] || "";
    } else if (i === 32) {
      char = "␣";
      description = "Space";
    } else {
      char = String.fromCharCode(i);
      description = `Character '${char}'`;
    }

    table.push({
      decimal: i,
      hex: i.toString(16).toUpperCase().padStart(2, "0"),
      octal: i.toString(8).padStart(3, "0"),
      binary: i.toString(2).padStart(8, "0"),
      char,
      description,
    });
  }
  return table;
}

export function AsciiTableTool() {
  const [search, setSearch] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("63");
  const [filterType, setFilterType] = useState<"all" | "printable" | "control">("all");

  const asciiTable = useMemo(() => generateAsciiTable(), []);

  const filteredTable = useMemo(() => {
    let filtered = asciiTable;

    // Filter by type
    if (filterType === "printable") {
      filtered = filtered.filter((item) => item.decimal >= 32 && item.decimal < 127);
    } else if (filterType === "control") {
      filtered = filtered.filter((item) => item.decimal < 32 || item.decimal === 127);
    }

    // Filter by range
    if (rangeStart || rangeEnd) {
      const start = rangeStart ? parseInt(rangeStart) : 0;
      const end = rangeEnd ? parseInt(rangeEnd) : 127;
      filtered = filtered.filter((item) => item.decimal >= start && item.decimal <= end);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.decimal.toString().includes(searchLower) ||
          item.hex.toLowerCase().includes(searchLower) ||
          item.char.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [asciiTable, search, rangeStart, rangeEnd, filterType]);

  const handleReset = () => {
    setSearch("");
    setRangeStart("");
    setRangeEnd("");
    setFilterType("all");
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by decimal, hex, character, or description..."
          className="text-sm"
        />
      </div>

      {/* Range Filter */}
      <div>
        <Label className="mb-2 block text-sm">Filter by Range (Decimal)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min="0"
            max="127"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            placeholder="Start (0)"
            className="text-sm"
          />
          <Input
            type="number"
            min="0"
            max="127"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            placeholder="End (127)"
            className="text-sm"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFilterType("all")}
          variant={filterType === "all" ? "primary" : "secondary"}
        >
          All (128)
        </Button>
        <Button
          onClick={() => setFilterType("printable")}
          variant={filterType === "printable" ? "primary" : "secondary"}
        >
          Printable (95)
        </Button>
        <Button
          onClick={() => setFilterType("control")}
          variant={filterType === "control" ? "primary" : "secondary"}
        >
          Control (33)
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTable.length} of 128 characters
      </div>

      {/* ASCII Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--color-gray-50)]">
              <th className="border border-border p-2 text-left font-semibold">Dec</th>
              <th className="border border-border p-2 text-left font-semibold">Hex</th>
              <th className="border border-border p-2 text-left font-semibold">Oct</th>
              <th className="border border-border p-2 text-left font-semibold">Binary</th>
              <th className="border border-border p-2 text-left font-semibold">Char</th>
              <th className="border border-border p-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredTable.map((item) => (
              <tr key={item.decimal} className="hover:bg-[var(--color-gray-0)]">
                <td className="border border-border p-2 font-mono">{item.decimal}</td>
                <td className="border border-border p-2 font-mono">0x{item.hex}</td>
                <td className="border border-border p-2 font-mono">{item.octal}</td>
                <td className="border border-border p-2 font-mono">{item.binary}</td>
                <td className="border border-border p-2 font-mono text-center">{item.char}</td>
                <td className="border border-border p-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTable.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No characters match your search criteria
        </div>
      )}
    </div>
  );
}

export const asciiTableConfig: ToolConfig = {
  id: "ascii-table",
  name: "ASCII Table Reference",
  description: "Searchable ASCII character table with decimal, hex, octal, and binary values",
  category: "utilities",
  component: AsciiTableTool,
  seo: {
    keywords: [
      "ascii table",
      "ascii chart",
      "ascii codes",
      "character codes",
      "ascii reference",
      "ascii decimal hex",
      "ascii binary",
      "control characters",
      "ascii lookup",
      "character encoding",
      "ascii values",
      "ascii converter",
    ],
  },
  sections: [
    {
      title: "What is ASCII?",
      content:
        "ASCII (American Standard Code for Information Interchange) is a character encoding standard for electronic communication. It assigns numerical values to letters, digits, punctuation marks, and control characters. Standard ASCII uses 7 bits to represent 128 characters (0-127).",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h3 className="text-base font-semibold mb-2">Character Categories</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Control Characters (0-31, 127):</strong> Non-printable characters used for text formatting and device control</li>
            <li><strong>Printable Characters (32-126):</strong> Letters, digits, punctuation, and space</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Common Ranges</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>48-57: Digits 0-9</li>
            <li>65-90: Uppercase letters A-Z</li>
            <li>97-122: Lowercase letters a-z</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Number Representations</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Decimal:</strong> Base 10, human-readable</li>
            <li><strong>Hexadecimal:</strong> Base 16, commonly used in programming</li>
            <li><strong>Octal:</strong> Base 8, used in Unix file permissions</li>
            <li><strong>Binary:</strong> Base 2, machine representation</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Letter 'A'",
      content: "Dec: 65, Hex: 0x41, Oct: 101, Bin: 01000001",
      type: "code",
    },
    {
      title: "Digit '0'",
      content: "Dec: 48, Hex: 0x30, Oct: 060, Bin: 00110000",
      type: "code",
    },
    {
      title: "Newline (LF)",
      content: "Dec: 10, Hex: 0x0A, Oct: 012, Bin: 00001010",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - pure JavaScript/TypeScript

interface AsciiChar {
  decimal: number;
  hex: string;
  octal: string;
  binary: string;
  char: string;
}

function charToAscii(char: string): AsciiChar {
  const code = char.charCodeAt(0);
  return {
    decimal: code,
    hex: code.toString(16).toUpperCase().padStart(2, '0'),
    octal: code.toString(8).padStart(3, '0'),
    binary: code.toString(2).padStart(8, '0'),
    char: code >= 32 && code < 127 ? char : 'N/A',
  };
}

function asciiToChar(code: number): string {
  if (code >= 32 && code < 127) {
    return String.fromCharCode(code);
  }
  return 'N/A (Control character)';
}

function generateAsciiTable(): AsciiChar[] {
  const table: AsciiChar[] = [];
  for (let i = 0; i <= 127; i++) {
    table.push({
      decimal: i,
      hex: i.toString(16).toUpperCase().padStart(2, '0'),
      octal: i.toString(8).padStart(3, '0'),
      binary: i.toString(2).padStart(8, '0'),
      char: i >= 32 && i < 127 ? String.fromCharCode(i) : 'N/A',
    });
  }
  return table;
}

// Example usage
console.log('=== Character to ASCII ===');
const charInfo = charToAscii('A');
console.log(\`'A' → Dec: \${charInfo.decimal}, Hex: 0x\${charInfo.hex}, Oct: \${charInfo.octal}, Bin: \${charInfo.binary}\`);

console.log('\\n=== ASCII to Character ===');
console.log(\`65 → '\${asciiToChar(65)}'\`);
console.log(\`97 → '\${asciiToChar(97)}'\`);
console.log(\`48 → '\${asciiToChar(48)}'\`);

console.log('\\n=== Printable ASCII Range ===');
const table = generateAsciiTable();
const printable = table.filter(c => c.decimal >= 32 && c.decimal < 127);
console.log(\`Printable characters: \${printable.length}\`);

// Output:
// === Character to ASCII ===
// 'A' → Dec: 65, Hex: 0x41, Oct: 101, Bin: 01000001
//
// === ASCII to Character ===
// 65 → 'A'
// 97 → 'a'
// 48 → '0'
//
// === Printable ASCII Range ===
// Printable characters: 95`,
  references: [
    {
      title: "ASCII - Wikipedia",
      url: "https://en.wikipedia.org/wiki/ASCII",
    },
    {
      title: "ASCII Table and Description",
      url: "https://www.asciitable.com/",
    },
  ],
};
