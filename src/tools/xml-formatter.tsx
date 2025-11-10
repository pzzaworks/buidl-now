"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function XmlFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatXml = (xml: string): string => {
    if (!xml.trim()) return "";

    const PADDING = "  ";
    const reg = /(>)(<)(\/*)/g;
    let formatted = "";
    let pad = 0;

    // Add newlines between tags
    xml = xml.replace(reg, "$1\n$2$3");

    // Split by newlines
    const lines = xml.split("\n");

    lines.forEach((line) => {
      let indent = 0;
      const node = line.trim();

      if (!node) return;

      // Decrease indent for closing tags
      if (node.match(/^<\/\w/)) {
        pad = Math.max(pad - 1, 0);
      }
      // Check for self-closing or single-line tags
      else if (node.match(/^<\w[^>]*[^\/]>.*<\/\w/) && !node.match(/^<\w[^>]*\/>/)) {
        indent = 0;
      }
      // Increase indent after opening tags
      else if (node.match(/^<\w/) && !node.match(/\/>/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      formatted += PADDING.repeat(pad) + node + "\n";
      pad += indent;
    });

    return formatted.trim();
  };

  const validateXml = (xml: string): boolean => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");

      // Check for parser errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        const errorText = parserError.textContent || "Unknown XML parsing error";
        setError(errorText);
        return false;
      }

      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid XML");
      return false;
    }
  };

  const handleFormat = () => {
    setError("");

    if (!input) {
      setOutput("");
      return;
    }

    if (!validateXml(input)) {
      setOutput("");
      return;
    }

    try {
      const formatted = formatXml(input);
      setOutput(formatted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Formatting failed");
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">XML Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter XML to format..."
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleFormat} className="flex-1">
            Format XML
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <Textarea
          label="Formatted XML"
          value={output}
          readOnly
          showCopy
          className="bg-[#0f0f0f] font-mono text-sm"
          rows={10}
        />
      )}
    </div>
  );
}

export const xmlFormatterConfig: ToolConfig = {
  id: "xml-formatter",
  name: "XML Formatter",
  description: "Format and validate XML with proper indentation",
  category: "formatters",
  component: XmlFormatterTool,
  seo: {
    keywords: [
      "xml beautifier",
      "format xml",
      "xml validator",
      "xml pretty print",
      "xml formatter online",
      "beautify xml",
      "xml indent",
      "xml formatting tool",
      "validate xml",
      "xml prettify",
      "format xml online",
      "xml code formatter",
    ],
  },
  sections: [
    {
      title: "What is XML?",
      content:
        "XML (Extensible Markup Language) is a markup language used to store and transport data. It's both human-readable and machine-readable, commonly used for configuration files, data exchange, and document storage.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">Paste your XML content in the input field and click Format XML. The tool will validate the XML structure and format it with proper indentation for better readability.</p>

          <h4 className="text-base font-semibold mb-2">Validation</h4>
          <p className="text-sm">This tool validates XML syntax and reports errors if the XML is malformed. It checks for proper tag matching, valid structure, and well-formed documents.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple XML document",
      content: '<root><item>Value</item></root>',
      type: "text",
    },
    {
      title: "XML with attributes",
      content: '<person id="1" name="John"><age>30</age></person>',
      type: "code",
    },
    {
      title: "Nested structure",
      content: '<library><book><title>Example</title><author>John Doe</author></book></library>',
      type: "text",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in DOMParser and string manipulation

function formatXml(xml: string): string {
  if (!xml.trim()) return '';

  const PADDING = '  ';
  const reg = /(>)(<)(\\/*)/g;
  let formatted = '';
  let pad = 0;

  // Add newlines between tags
  xml = xml.replace(reg, '$1\\n$2$3');

  // Split by newlines
  const lines = xml.split('\\n');

  lines.forEach((line) => {
    let indent = 0;
    const node = line.trim();

    if (!node) return;

    // Decrease indent for closing tags
    if (node.match(/^<\\/\\w/)) {
      pad = Math.max(pad - 1, 0);
    }
    // Check for self-closing or single-line tags
    else if (node.match(/^<\\w[^>]*[^\\/]>.*<\\/\\w/) && !node.match(/^<\\w[^>]*\\/>/)) {
      indent = 0;
    }
    // Increase indent after opening tags
    else if (node.match(/^<\\w/) && !node.match(/\\/>/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    formatted += PADDING.repeat(pad) + node + '\\n';
    pad += indent;
  });

  return formatted.trim();
}

function validateXml(xml: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        valid: false,
        error: parserError.textContent || 'Unknown XML parsing error'
      };
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid XML'
    };
  }
}

// Example usage
const unformattedXml = '<root><person id="1"><name>John Doe</name><age>30</age></person></root>';

const validation = validateXml(unformattedXml);
if (validation.valid) {
  console.log('Formatted XML:');
  console.log(formatXml(unformattedXml));
} else {
  console.log('Error:', validation.error);
}

// Output:
// Formatted XML:
// <root>
//   <person id="1">
//     <name>John Doe</name>
//     <age>30</age>
//   </person>
// </root>`,
  references: [
    {
      title: "W3Schools XML Tutorial",
      url: "https://www.w3schools.com/xml/",
    },
    {
      title: "MDN: XML Introduction",
      url: "https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction",
    },
  ],
};
