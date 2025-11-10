"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGeneratorTool() {
  const [uuid, setUuid] = useState("");
  const [count, setCount] = useState("1");
  const [uuids, setUuids] = useState<string[]>([]);

  const handleGenerate = () => {
    const num = parseInt(count) || 1;
    const limited = Math.min(Math.max(num, 1), 100);

    if (limited === 1) {
      const newUuid = generateUUIDv4();
      setUuid(newUuid);
      setUuids([]);
    } else {
      const newUuids = Array.from({ length: limited }, () => generateUUIDv4());
      setUuids(newUuids);
      setUuid("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Count Input */}
      <div>
        <Label className="mb-2 block text-sm">Number of UUIDs (1-100)</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder="1"
          className="mb-2"
        />
        <Button onClick={handleGenerate} className="w-full">
          Generate UUID{parseInt(count) > 1 ? "s" : ""}
        </Button>
      </div>

      {/* Single UUID Output */}
      {uuid && (
        <Input
          label="Generated UUID (v4)"
          value={uuid}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
        />
      )}

      {/* Multiple UUIDs Output */}
      {uuids.length > 0 && (
        <Textarea
          label={`Generated UUIDs (${uuids.length})`}
          value={uuids.join("\n")}
          readOnly
          showCopy
          className="font-mono text-sm bg-[#0f0f0f]"
          rows={Math.min(uuids.length, 15)}
        />
      )}
    </div>
  );
}

export const uuidGeneratorConfig: ToolConfig = {
  id: "uuid-generator",
  name: "UUID Generator",
  description: "Generate UUIDs (Universally Unique Identifiers)",
  category: "generators",
  component: UuidGeneratorTool,
  seo: {
    keywords: [
      "uuid generator",
      "generate uuid",
      "uuid v4",
      "unique id generator",
      "guid generator",
      "universally unique identifier",
      "random uuid",
      "uuid online",
      "bulk uuid generator",
      "uuid tool",
    ],
  },
  sections: [
    {
      title: "What is a UUID?",
      content:
        "A UUID (Universally Unique Identifier) is a 128-bit number used to uniquely identify information. They are commonly used in distributed systems and databases.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">UUID v4 (Random)</h4>
          <p className="text-sm mb-4">Version 4 UUIDs are randomly generated. The probability of generating duplicate UUIDs is extremely low - approximately 1 in 5.3×10³⁶ (5.3 undecillion).</p>

          <h4 className="text-base font-semibold mb-2">Format</h4>
          <p className="text-sm">UUIDs are typically displayed as 32 hexadecimal digits, displayed in 5 groups separated by hyphens: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Example UUID v4",
      content: "550e8400-e29b-41d4-a716-446655440000",
      type: "code",
    },
    {
      title: "Another example",
      content: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      type: "code",
    },
  ],
  codeSnippet: `// npm install uuid
// npm install @types/uuid --save-dev

import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5, validate, version } from 'uuid';

// Generate UUID v4 (random)
function generateUUIDv4(): string {
  return uuidv4();
}

// Generate UUID v1 (timestamp-based)
function generateUUIDv1(): string {
  return uuidv1();
}

// Generate UUID v5 (namespace + name-based with SHA-1)
function generateUUIDv5(name: string, namespace: string): string {
  return uuidv5(name, namespace);
}

// Generate multiple UUIDs
function generateMultipleUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => uuidv4());
}

// Validate UUID
function isValidUUID(uuid: string): boolean {
  return validate(uuid);
}

// Get UUID version
function getUUIDVersion(uuid: string): number | null {
  if (!validate(uuid)) return null;
  return version(uuid);
}

// Common UUID v5 namespaces
const NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
};

// Example usage
console.log('UUID v4 (random):');
const uuid4 = generateUUIDv4();
console.log(uuid4);
console.log('Valid:', isValidUUID(uuid4));
console.log('Version:', getUUIDVersion(uuid4));

console.log('\\nUUID v1 (timestamp-based):');
const uuid1 = generateUUIDv1();
console.log(uuid1);
console.log('Version:', getUUIDVersion(uuid1));

console.log('\\nUUID v5 (namespace-based):');
const uuid5 = generateUUIDv5('example.com', NAMESPACES.DNS);
console.log(uuid5);
console.log('Version:', getUUIDVersion(uuid5));

// Same name + namespace = same UUID
const uuid5Again = generateUUIDv5('example.com', NAMESPACES.DNS);
console.log('Same name generates same UUID:', uuid5 === uuid5Again);

console.log('\\nMultiple UUIDs v4 (5):');
const uuids = generateMultipleUUIDs(5);
uuids.forEach((uuid, index) => {
  console.log(\`  \${index + 1}. \${uuid}\`);
});

console.log('\\nValidation examples:');
console.log('Valid UUID:', isValidUUID('550e8400-e29b-41d4-a716-446655440000'));
console.log('Invalid UUID:', isValidUUID('not-a-uuid'));
console.log('Invalid format:', isValidUUID('550e8400-e29b-41d4-a716'));

// Output:
// UUID v4 (random):
// 550e8400-e29b-41d4-a716-446655440000
// Valid: true
// Version: 4
//
// UUID v1 (timestamp-based):
// 6ba7b810-9dad-11d1-80b4-00c04fd430c8
// Version: 1
//
// UUID v5 (namespace-based):
// cfbff0d1-9375-5685-968c-48ce8b15ae17
// Version: 5
// Same name generates same UUID: true
//
// Multiple UUIDs v4 (5):
//   1. 550e8400-e29b-41d4-a716-446655440001
//   2. 550e8400-e29b-41d4-a716-446655440002
//   3. 550e8400-e29b-41d4-a716-446655440003
//   4. 550e8400-e29b-41d4-a716-446655440004
//   5. 550e8400-e29b-41d4-a716-446655440005
//
// Validation examples:
// Valid UUID: true
// Invalid UUID: false
// Invalid format: false`,
  references: [
    {
      title: "RFC 4122: UUID Specification",
      url: "https://tools.ietf.org/html/rfc4122",
    },
    {
      title: "UUID - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Universally_unique_identifier",
    },
  ],
};
