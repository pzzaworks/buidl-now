"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import QRCode from "qrcode";

export function QrCodeGeneratorTool() {
  const [input, setInput] = useState("");
  const [size, setSize] = useState("256");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter text or URL");
      setQrDataUrl("");
      return;
    }

    try {
      const qrSize = Math.min(Math.max(parseInt(size) || 256, 128), 1024);
      const dataUrl = await QRCode.toDataURL(input, {
        width: qrSize,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
      setError("");
    } catch (e) {
      setError("Failed to generate QR code");
      setQrDataUrl("");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Textarea
        label="Text or URL"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text, URL, or any data to encode..."
        rows={4}
        className="text-sm"
      />

      {/* Size Input */}
      <div>
        <Label className="mb-2 block text-sm">QR Code Size (128-1024)</Label>
        <Input
          type="number"
          min="128"
          max="1024"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="256"
        />
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate QR Code
      </Button>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* QR Code Display */}
      {qrDataUrl && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded">
            <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
          </div>
          <Button onClick={handleDownload} variant="secondary" className="w-full">
            Download QR Code
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export const qrCodeGeneratorConfig: ToolConfig = {
  id: "qr-code-generator",
  name: "QR Code Generator",
  description: "Generate QR codes from text or URLs",
  category: "generators",
  component: QrCodeGeneratorTool,
  seo: {
    keywords: [
      "qr code generator",
      "create qr code",
      "qr code maker",
      "generate qr code online",
      "qr code creator",
      "free qr code generator",
      "qr code tool",
      "make qr code",
      "qr generator",
      "quick response code",
      "barcode generator",
      "qr code download",
    ],
  },
  sections: [
    {
      title: "What is a QR Code?",
      content:
        "A QR (Quick Response) code is a two-dimensional barcode that can store various types of data including URLs, text, contact information, and more. QR codes can be scanned by smartphones and other devices with cameras.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Using This Tool</h4>
          <p className="text-sm mb-4">Enter any text, URL, or data you want to encode into a QR code. Adjust the size if needed (default is 256px), then click Generate. You can download the generated QR code as a PNG image.</p>

          <h4 className="text-base font-semibold mb-2">Size Guidelines</h4>
          <p className="text-sm mb-4">The recommended minimum size for a QR code is 2x2 cm (0.8x0.8 inches) for reliable scanning. Larger codes are easier to scan from a distance. The tool supports sizes from 128px to 1024px.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "URL",
      content: "https://example.com",
      type: "code",
    },
    {
      title: "Contact Info",
      content: "MECARD:N:Doe,John;TEL:+1234567890;EMAIL:john@example.com;;",
      type: "code",
    },
    {
      title: "WiFi Network",
      content: "WIFI:T:WPA;S:NetworkName;P:password;;",
      type: "code",
    },
  ],
  codeSnippet: `// npm install qrcode
// npm install @types/qrcode --save-dev

import QRCode from 'qrcode';
import * as fs from 'fs';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

// Generate QR code as Data URL (for browser/base64)
async function generateQRCodeDataURL(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: 256,
    margin: 2,
    errorCorrectionLevel: 'M' as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const dataUrl = await QRCode.toDataURL(text, finalOptions);
    return dataUrl;
  } catch (error) {
    throw new Error(\`Failed to generate QR code: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}

// Generate QR code and save to file
async function generateQRCodeToFile(
  text: string,
  filePath: string,
  options: QRCodeOptions = {}
): Promise<void> {
  const defaultOptions = {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M' as const
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    await QRCode.toFile(filePath, text, finalOptions);
    console.log(\`QR code saved to \${filePath}\`);
  } catch (error) {
    throw new Error(\`Failed to save QR code: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}

// Generate QR code as terminal output (UTF-8)
async function generateQRCodeTerminal(text: string): Promise<void> {
  try {
    const qrCodeString = await QRCode.toString(text, { type: 'terminal' });
    console.log(qrCodeString);
  } catch (error) {
    throw new Error(\`Failed to generate terminal QR code: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}

// Example usage
async function main() {
  const url = 'https://example.com';

  // Generate Data URL
  console.log('Generating QR code as Data URL...');
  const dataUrl = await generateQRCodeDataURL(url, { width: 300 });
  console.log('Data URL generated (length):', dataUrl.length);

  // Generate and save to file
  console.log('\\nSaving QR code to file...');
  await generateQRCodeToFile(url, './qrcode.png', {
    width: 512,
    errorCorrectionLevel: 'H'
  });

  // Generate terminal QR code
  console.log('\\nQR Code in terminal:');
  await generateQRCodeTerminal(url);

  // Generate QR code for WiFi
  const wifiString = 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;';
  console.log('\\nGenerating WiFi QR code...');
  await generateQRCodeToFile(wifiString, './wifi-qr.png');

  // Generate QR code for contact (vCard)
  const vcard = \`BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD\`;
  console.log('Generating contact QR code...');
  await generateQRCodeToFile(vcard, './contact-qr.png');
}

main().catch(console.error);

// Output:
// Generating QR code as Data URL...
// Data URL generated (length): 1234
//
// Saving QR code to file...
// QR code saved to ./qrcode.png
//
// QR Code in terminal:
// (Terminal ASCII QR code display)
//
// Generating WiFi QR code...
// QR code saved to ./wifi-qr.png
// Generating contact QR code...
// QR code saved to ./contact-qr.png`,
  references: [
    {
      title: "QR Code - Wikipedia",
      url: "https://en.wikipedia.org/wiki/QR_code",
    },
    {
      title: "QR Code Specification",
      url: "https://www.qrcode.com/en/about/",
    },
  ],
};
