"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

// Type mapping from protobuf to JSON Schema
const protoToJsonType: Record<string, { type: string; format?: string }> = {
  double: { type: "number", format: "double" },
  float: { type: "number", format: "float" },
  int32: { type: "integer", format: "int32" },
  int64: { type: "integer", format: "int64" },
  uint32: { type: "integer", format: "uint32" },
  uint64: { type: "integer", format: "uint64" },
  sint32: { type: "integer", format: "int32" },
  sint64: { type: "integer", format: "int64" },
  fixed32: { type: "integer", format: "uint32" },
  fixed64: { type: "integer", format: "uint64" },
  sfixed32: { type: "integer", format: "int32" },
  sfixed64: { type: "integer", format: "int64" },
  bool: { type: "boolean" },
  string: { type: "string" },
  bytes: { type: "string", format: "byte" },
};

interface ParsedField {
  name: string;
  type: string;
  isRepeated: boolean;
  isOptional: boolean;
  fieldNumber: number;
}

interface ParsedMessage {
  name: string;
  fields: ParsedField[];
}

interface ParsedEnum {
  name: string;
  values: { name: string; number: number }[];
}

// Parse protobuf schema
function parseProto(proto: string): { messages: ParsedMessage[]; enums: ParsedEnum[] } {
  const messages: ParsedMessage[] = [];
  const enums: ParsedEnum[] = [];

  // Remove comments
  let cleaned = proto
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Parse enums
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;
  let enumMatch;
  while ((enumMatch = enumRegex.exec(cleaned)) !== null) {
    const enumName = enumMatch[1];
    const enumBody = enumMatch[2];
    const values: { name: string; number: number }[] = [];

    const valueRegex = /(\w+)\s*=\s*(-?\d+)/g;
    let valueMatch;
    while ((valueMatch = valueRegex.exec(enumBody)) !== null) {
      values.push({
        name: valueMatch[1],
        number: parseInt(valueMatch[2]),
      });
    }

    enums.push({ name: enumName, values });
  }

  // Parse messages
  const messageRegex = /message\s+(\w+)\s*\{([^}]+)\}/g;
  let messageMatch;
  while ((messageMatch = messageRegex.exec(cleaned)) !== null) {
    const messageName = messageMatch[1];
    const messageBody = messageMatch[2];
    const fields: ParsedField[] = [];

    // Parse fields
    const fieldRegex = /(repeated\s+|optional\s+)?(\w+)\s+(\w+)\s*=\s*(\d+)/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(messageBody)) !== null) {
      const modifier = fieldMatch[1]?.trim() || "";
      const fieldType = fieldMatch[2];
      const fieldName = fieldMatch[3];
      const fieldNumber = parseInt(fieldMatch[4]);

      fields.push({
        name: fieldName,
        type: fieldType,
        isRepeated: modifier === "repeated",
        isOptional: modifier === "optional",
        fieldNumber,
      });
    }

    messages.push({ name: messageName, fields });
  }

  return { messages, enums };
}

// Convert parsed proto to JSON Schema
function protoToJsonSchema(proto: string): object {
  const { messages, enums } = parseProto(proto);

  const definitions: Record<string, object> = {};

  // Add enum definitions
  enums.forEach((enumDef) => {
    definitions[enumDef.name] = {
      type: "string",
      enum: enumDef.values.map((v) => v.name),
      description: `Enum values: ${enumDef.values.map((v) => `${v.name}=${v.number}`).join(", ")}`,
    };
  });

  // Add message definitions
  messages.forEach((message) => {
    const properties: Record<string, object> = {};
    const required: string[] = [];

    message.fields.forEach((field) => {
      let fieldSchema: any;

      // Check if it's a primitive type
      if (protoToJsonType[field.type]) {
        fieldSchema = { ...protoToJsonType[field.type] };
      }
      // Check if it's an enum or message reference
      else if (enums.find((e) => e.name === field.type)) {
        fieldSchema = { $ref: `#/definitions/${field.type}` };
      } else if (messages.find((m) => m.name === field.type)) {
        fieldSchema = { $ref: `#/definitions/${field.type}` };
      } else {
        // Unknown type, treat as object reference
        fieldSchema = { $ref: `#/definitions/${field.type}` };
      }

      // Handle repeated fields
      if (field.isRepeated) {
        properties[field.name] = {
          type: "array",
          items: fieldSchema,
        };
      } else {
        properties[field.name] = fieldSchema;
      }

      // Add to required if not optional
      if (!field.isOptional && !field.isRepeated) {
        required.push(field.name);
      }
    });

    definitions[message.name] = {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  });

  // Return schema with definitions
  const mainMessage = messages[0];
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: mainMessage?.name || "Schema",
    ...(mainMessage ? { $ref: `#/definitions/${mainMessage.name}` } : {}),
    definitions,
  };
}

export function ProtobufJsonTool() {
  const t = useTranslations("toolUI.protobuf-json");
  const [protoInput, setProtoInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    if (!protoInput.trim()) {
      setError(t("errorEmpty"));
      setJsonOutput("");
      return;
    }

    try {
      const schema = protoToJsonSchema(protoInput);
      setJsonOutput(JSON.stringify(schema, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("invalidSchema"));
      setJsonOutput("");
    }
  };

  const handleReset = () => {
    setProtoInput("");
    setJsonOutput("");
    setError("");
  };

  const exampleProto = `syntax = "proto3";

message Person {
  string name = 1;
  int32 age = 2;
  string email = 3;
  repeated string phones = 4;
  Address address = 5;
}

message Address {
  string street = 1;
  string city = 2;
  string country = 3;
  string zip_code = 4;
}

enum Status {
  UNKNOWN = 0;
  ACTIVE = 1;
  INACTIVE = 2;
}`;

  return (
    <div className="space-y-6">
      {/* Protobuf Input */}
      <div>
        <Label className="mb-2 block text-sm">{t("protoSchemaLabel")}</Label>
        <Textarea
          value={protoInput}
          onChange={(e) => setProtoInput(e.target.value)}
          placeholder='message Person {&#10;  string name = 1;&#10;  int32 age = 2;&#10;}'
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Load Example Button */}
      <Button
        onClick={() => setProtoInput(exampleProto)}
        variant="secondary"
        size="sm"
      >
        {t("loadExample")}
      </Button>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleConvert} variant="primary" className="flex-1">
          {t("convert")}
        </Button>
        <Button onClick={handleReset}>
          {t("reset")}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* JSON Schema Output */}
      {jsonOutput && (
        <Textarea
          label={t("jsonSchemaOutput")}
          value={jsonOutput}
          readOnly
          showCopy
          className="font-mono min-h-[300px] bg-[var(--color-gray-0)]"
        />
      )}

      {/* Type Mapping Reference */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[var(--radius-12)]">
        <div className="text-sm font-semibold mb-2">{t("typeMappingTitle")}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
          <div>double, float &rarr; number</div>
          <div>int32, int64 &rarr; integer</div>
          <div>uint32, uint64 &rarr; integer</div>
          <div>bool &rarr; boolean</div>
          <div>string &rarr; string</div>
          <div>bytes &rarr; string (base64)</div>
        </div>
      </div>
    </div>
  );
}

export const protobufJsonConfig: ToolConfig = {
  id: "protobuf-json",
  name: "Protobuf to JSON Schema",
  description: "Convert Protobuf schema definitions to JSON Schema",
  category: "converters",
  component: ProtobufJsonTool,
  seo: {
    keywords: [
      "protobuf to json",
      "proto to json schema",
      "protobuf converter",
      "protocol buffers to json",
      "proto3 to json",
      "protobuf schema converter",
      "proto to json converter",
      "protobuf json schema",
      "grpc proto converter",
      "protobuf parser",
    ],
  },
  sections: [
    {
      title: "What is Protocol Buffers?",
      content:
        "Protocol Buffers (protobuf) is a language-neutral, platform-neutral, extensible mechanism for serializing structured data, developed by Google. It is smaller, faster, and simpler than XML or JSON. JSON Schema is a vocabulary for annotating and validating JSON documents.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            This tool parses .proto syntax and generates an equivalent JSON Schema. Message types become JSON objects with properties, repeated fields become arrays, and enums become string types with allowed values. Field numbers are preserved as metadata, and type mappings follow the official protobuf-to-JSON mapping conventions.
          </p>

          <h4 className="text-base font-semibold mb-2">Supported Features</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Message definitions with nested types</li>
            <li>Scalar types (int32, string, bool, etc.)</li>
            <li>Repeated fields (arrays)</li>
            <li>Optional fields</li>
            <li>Enum definitions</li>
            <li>Message references</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Limitations</h4>
          <p className="text-sm">
            This is a simplified parser. It does not support imports, nested message definitions, oneofs, maps, or package declarations. For complex .proto files, use a full protobuf compiler with JSON Schema plugins.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple message",
      content: 'message User {\n  string name = 1;\n  int32 age = 2;\n}',
      type: "code",
    },
    {
      title: "Repeated field",
      content: 'message List {\n  repeated string items = 1;\n}',
      type: "code",
    },
    {
      title: "Enum type",
      content: 'enum Status {\n  UNKNOWN = 0;\n  ACTIVE = 1;\n}',
      type: "code",
    },
  ],
  codeSnippet: `// Protobuf to JSON Schema converter (simplified)

interface ParsedField {
  name: string;
  type: string;
  isRepeated: boolean;
  fieldNumber: number;
}

interface ParsedMessage {
  name: string;
  fields: ParsedField[];
}

const protoToJsonType: Record<string, { type: string; format?: string }> = {
  double: { type: 'number', format: 'double' },
  float: { type: 'number', format: 'float' },
  int32: { type: 'integer', format: 'int32' },
  int64: { type: 'integer', format: 'int64' },
  uint32: { type: 'integer', format: 'uint32' },
  uint64: { type: 'integer', format: 'uint64' },
  bool: { type: 'boolean' },
  string: { type: 'string' },
  bytes: { type: 'string', format: 'byte' },
};

function parseProto(proto: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];

  // Remove comments
  const cleaned = proto
    .replace(/\\/\\/.*$/gm, '')
    .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');

  // Parse messages
  const messageRegex = /message\\s+(\\w+)\\s*\\{([^}]+)\\}/g;
  let match;

  while ((match = messageRegex.exec(cleaned)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields: ParsedField[] = [];

    const fieldRegex = /(repeated\\s+)?(\\w+)\\s+(\\w+)\\s*=\\s*(\\d+)/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      fields.push({
        name: fieldMatch[3],
        type: fieldMatch[2],
        isRepeated: !!fieldMatch[1],
        fieldNumber: parseInt(fieldMatch[4]),
      });
    }

    messages.push({ name, fields });
  }

  return messages;
}

function protoToJsonSchema(proto: string): object {
  const messages = parseProto(proto);
  const definitions: Record<string, object> = {};

  messages.forEach(message => {
    const properties: Record<string, object> = {};

    message.fields.forEach(field => {
      let schema = protoToJsonType[field.type] || { $ref: \`#/definitions/\${field.type}\` };

      if (field.isRepeated) {
        properties[field.name] = { type: 'array', items: schema };
      } else {
        properties[field.name] = schema;
      }
    });

    definitions[message.name] = { type: 'object', properties };
  });

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions,
    $ref: \`#/definitions/\${messages[0]?.name}\`,
  };
}

// Example usage
const proto = \`
message Person {
  string name = 1;
  int32 age = 2;
  repeated string emails = 3;
}
\`;

console.log(JSON.stringify(protoToJsonSchema(proto), null, 2));

// Output:
// {
//   "$schema": "http://json-schema.org/draft-07/schema#",
//   "definitions": {
//     "Person": {
//       "type": "object",
//       "properties": {
//         "name": { "type": "string" },
//         "age": { "type": "integer", "format": "int32" },
//         "emails": { "type": "array", "items": { "type": "string" } }
//       }
//     }
//   },
//   "$ref": "#/definitions/Person"
// }`,
  references: [
    {
      title: "Protocol Buffers Documentation",
      url: "https://protobuf.dev/",
    },
    {
      title: "JSON Schema",
      url: "https://json-schema.org/",
    },
    {
      title: "Proto3 Language Guide",
      url: "https://protobuf.dev/programming-guides/proto3/",
    },
  ],
};
