"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

// Simple XML to JSON converter
function xmlToJson(xml: string): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid XML: " + parserError.textContent);
  }

  function parseNode(node: Element): any {
    const obj: any = {};

    // Handle attributes
    if (node.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        obj["@attributes"][attr.name] = attr.value;
      }
    }

    // Handle child nodes
    const children = Array.from(node.children);
    if (children.length === 0) {
      // Leaf node with text content
      const text = node.textContent?.trim() || "";
      if (Object.keys(obj).length === 0) {
        return text;
      }
      if (text) {
        obj["#text"] = text;
      }
      return obj;
    }

    // Group children by tag name
    const childGroups: Record<string, any[]> = {};
    children.forEach((child) => {
      const tagName = child.tagName;
      if (!childGroups[tagName]) {
        childGroups[tagName] = [];
      }
      childGroups[tagName].push(parseNode(child as Element));
    });

    // Convert groups to object or array
    Object.entries(childGroups).forEach(([tagName, items]) => {
      obj[tagName] = items.length === 1 ? items[0] : items;
    });

    return obj;
  }

  const result = parseNode(xmlDoc.documentElement);
  const rootName = xmlDoc.documentElement.tagName;

  return JSON.stringify({ [rootName]: result }, null, 2);
}

// Simple JSON to XML converter
function jsonToXml(json: string, indent = 0): string {
  const obj = JSON.parse(json);
  let xml = "";
  const spaces = "  ".repeat(indent);

  function objectToXml(obj: any, key: string, level: number): string {
    let result = "";
    const currentSpaces = "  ".repeat(level);

    if (obj === null || obj === undefined) {
      return `${currentSpaces}<${key} />\n`;
    }

    if (typeof obj !== "object") {
      return `${currentSpaces}<${key}>${obj}</${key}>\n`;
    }

    // Handle attributes
    let attributes = "";
    if (obj["@attributes"]) {
      attributes = Object.entries(obj["@attributes"])
        .map(([k, v]) => ` ${k}="${v}"`)
        .join("");
    }

    // Handle text content
    if (obj["#text"] !== undefined) {
      return `${currentSpaces}<${key}${attributes}>${obj["#text"]}</${key}>\n`;
    }

    // Handle empty or attribute-only elements
    const contentKeys = Object.keys(obj).filter(
      (k) => k !== "@attributes" && k !== "#text"
    );
    if (contentKeys.length === 0) {
      return `${currentSpaces}<${key}${attributes} />\n`;
    }

    result += `${currentSpaces}<${key}${attributes}>\n`;

    contentKeys.forEach((childKey) => {
      const value = obj[childKey];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          result += objectToXml(item, childKey, level + 1);
        });
      } else {
        result += objectToXml(value, childKey, level + 1);
      }
    });

    result += `${currentSpaces}</${key}>\n`;
    return result;
  }

  // Process root element
  const rootKey = Object.keys(obj)[0];
  xml = objectToXml(obj[rootKey], rootKey, 0);

  return xml.trim();
}

export function XmlJsonTool() {
  const [xmlInput, setXmlInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const handleXmlToJson = () => {
    if (!xmlInput) {
      setJsonInput("");
      setError("");
      return;
    }

    try {
      const json = xmlToJson(xmlInput);
      setJsonInput(json);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid XML");
      setJsonInput("");
    }
  };

  const handleJsonToXml = () => {
    if (!jsonInput) {
      setXmlInput("");
      setError("");
      return;
    }

    try {
      const xml = jsonToXml(jsonInput);
      setXmlInput(xml);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setXmlInput("");
    }
  };

  const handleReset = () => {
    setXmlInput("");
    setJsonInput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* XML Input */}
      <div>
        <Label className="mb-2 block text-sm">XML</Label>
        <Textarea
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          placeholder='<person><name>John</name><age>30</age></person>'
          className="font-mono min-h-[200px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleXmlToJson} className="flex-1">
          <span className="hidden sm:inline">XML → JSON</span>
          <span className="sm:hidden">To JSON</span>
        </Button>
        <Button onClick={handleJsonToXml} className="flex-1 sm:flex-none">
          <span className="hidden sm:inline">JSON → XML</span>
          <span className="sm:hidden">To XML</span>
        </Button>
        <Button onClick={handleReset} variant="secondary" className="sm:flex-none">
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* JSON Input */}
      <div>
        <Label className="mb-2 block text-sm">JSON</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"person":{"name":"John","age":"30"}}'
          className="font-mono min-h-[200px]"
        />
      </div>
    </div>
  );
}

export const xmlJsonConfig: ToolConfig = {
  id: "xml-json",
  name: "XML ⇔ JSON Converter",
  description: "Convert between XML and JSON formats",
  category: "converters",
  component: XmlJsonTool,
  seo: {
    keywords: [
      "xml to json converter",
      "json to xml",
      "xml json converter",
      "convert xml to json",
      "xml parser",
      "json to xml online",
      "xml to json online",
      "parse xml to json",
      "json xml transformer",
      "xml converter",
    ],
  },
  sections: [
    {
      title: "What is XML/JSON conversion?",
      content:
        "XML/JSON conversion is the process of transforming data between two popular structured data formats. XML (eXtensible Markup Language) uses tag-based markup, while JSON (JavaScript Object Notation) uses key-value pairs. Converting between them enables interoperability across different systems and APIs.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">The converter parses XML using a DOM parser, traversing the document tree to extract elements, attributes, and text content. It maps XML elements to JSON objects, attributes to '@attributes' properties, and repeated elements to arrays. The reverse process builds XML tags from JSON keys and handles special properties like '@attributes' and '#text'.</p>

          <h4 className="text-base font-semibold mb-2">XML vs JSON</h4>
          <p className="text-sm mb-4">XML (eXtensible Markup Language) uses tags and attributes to structure data, while JSON (JavaScript Object Notation) uses key-value pairs with braces and brackets. Both are popular for data exchange, with XML being more verbose but supporting attributes and namespaces.</p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <p className="text-sm mb-4">XML is commonly used in legacy systems, configuration files, and SOAP APIs. JSON is preferred for modern REST APIs and web applications due to its lighter weight and native JavaScript support.</p>

          <h4 className="text-base font-semibold mb-2">Conversion Notes</h4>
          <p className="text-sm">When converting from XML to JSON, attributes are stored under '@attributes' and text content under '#text'. Arrays are created for repeated elements. Some XML features like namespaces and processing instructions may not be fully preserved.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple element",
      content: `<name>John</name>
⇔ {"name":"John"}`,
      type: "code",
    },
    {
      title: "Element with attributes",
      content: `<person id="1">John</person>
⇔ {"person":{"@attributes":{"id":"1"},"#text":"John"}}`,
      type: "code",
    },
    {
      title: "Nested structure",
      content: `<user><name>John</name><age>30</age></user>
⇔ {"user":{"name":"John","age":"30"}}`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install xml-js
// npm install @types/node --save-dev

import * as convert from 'xml-js';

function xmlToJson(xml: string, pretty: boolean = true): string {
  const result = convert.xml2js(xml, {
    compact: true,
    spaces: pretty ? 2 : 0
  });
  return JSON.stringify(result, null, pretty ? 2 : 0);
}

function jsonToXml(json: string, pretty: boolean = true): string {
  const obj = JSON.parse(json);
  const xml = convert.js2xml(obj, {
    compact: true,
    spaces: pretty ? 2 : 0
  });
  return xml;
}

function readFile(path: string): string {
  const fs = require('fs');
  return fs.readFileSync(path, 'utf8');
}

function writeFile(path: string, content: string): void {
  const fs = require('fs');
  fs.writeFileSync(path, content, 'utf8');
  console.log(\`File saved to \${path}\`);
}

// Example usage
console.log('=== XML to JSON ===');
const xmlInput = \`<?xml version="1.0" encoding="UTF-8"?>
<person id="1">
  <name>John</name>
  <age>30</age>
  <skills>
    <skill>JavaScript</skill>
    <skill>TypeScript</skill>
  </skills>
</person>\`;

const jsonOutput = xmlToJson(xmlInput);
console.log(jsonOutput);

console.log('\\n=== JSON to XML ===');
const jsonInput = JSON.stringify({
  user: {
    _attributes: { id: '2' },
    name: { _text: 'Jane' },
    age: { _text: '25' },
    city: { _text: 'London' }
  }
});

const xmlOutput = jsonToXml(jsonInput);
console.log(xmlOutput);

console.log('\\n=== Complex Example ===');
const complexXml = \`<?xml version="1.0"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price>44.95</price>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <price>5.95</price>
  </book>
</catalog>\`;

const complexJson = xmlToJson(complexXml);
console.log(complexJson);

// Uncomment to save files:
// writeFile('output.json', jsonOutput);
// writeFile('output.xml', xmlOutput);

// Output:
// === XML to JSON ===
// {
//   "_declaration": { "_attributes": { "version": "1.0", "encoding": "UTF-8" } },
//   "person": {
//     "_attributes": { "id": "1" },
//     "name": { "_text": "John" },
//     "age": { "_text": "30" },
//     "skills": {
//       "skill": [
//         { "_text": "JavaScript" },
//         { "_text": "TypeScript" }
//       ]
//     }
//   }
// }
//
// === JSON to XML ===
// <user id="2">
//   <name>Jane</name>
//   <age>25</age>
//   <city>London</city>
// </user>`,
  references: [
    {
      title: "XML Tutorial - MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction",
    },
    {
      title: "JSON.org",
      url: "https://www.json.org/",
    },
    {
      title: "XML vs JSON",
      url: "https://www.w3schools.com/js/js_json_xml.asp",
    },
  ],
};
