"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import figlet from "figlet";
// @ts-expect-error - figlet fonts don't have types
import standard from "figlet/importable-fonts/Standard";
// @ts-expect-error - figlet fonts don't have types
import banner from "figlet/importable-fonts/Banner";
// @ts-expect-error - figlet fonts don't have types
import doom from "figlet/importable-fonts/Doom";
// @ts-expect-error - figlet fonts don't have types
import big from "figlet/importable-fonts/Big";
// @ts-expect-error - figlet fonts don't have types
import slant from "figlet/importable-fonts/Slant";
// @ts-expect-error - figlet fonts don't have types
import small from "figlet/importable-fonts/Small";
// @ts-expect-error - figlet fonts don't have types
import script from "figlet/importable-fonts/Script";
// @ts-expect-error - figlet fonts don't have types
import mini from "figlet/importable-fonts/Mini";
// @ts-expect-error - figlet fonts don't have types
import block from "figlet/importable-fonts/Block";
// @ts-expect-error - figlet fonts don't have types
import lean from "figlet/importable-fonts/Lean";

// Font configuration
const FONTS = [
  { name: "Standard", value: "Standard", font: standard },
  { name: "Banner", value: "Banner", font: banner },
  { name: "Doom", value: "Doom", font: doom },
  { name: "Big", value: "Big", font: big },
  { name: "Slant", value: "Slant", font: slant },
  { name: "Small", value: "Small", font: small },
  { name: "Script", value: "Script", font: script },
  { name: "Mini", value: "Mini", font: mini },
  { name: "Block", value: "Block", font: block },
  { name: "Lean", value: "Lean", font: lean },
] as const;

type FontName = typeof FONTS[number]["value"];

// Initialize fonts
let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded) return;
  FONTS.forEach(({ value, font }) => {
    figlet.parseFont(value, font);
  });
  fontsLoaded = true;
};

export function AsciiArtTool() {
  const t = useTranslations("toolUI.ascii-art");
  const [input, setInput] = useState("");
  const [selectedFont, setSelectedFont] = useState<FontName>("Standard");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const result = figlet.textSync(input, {
        font: selectedFont,
        horizontalLayout: "default",
        verticalLayout: "default",
      });
      setOutput(result);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("generateError"));
      setOutput("");
    }
  }, [input, selectedFont]);

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError("");
    setSelectedFont("Standard");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Input
        label={t("textInputLabel")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("textInputPlaceholder")}
      />

      {/* Font Selection */}
      <div>
        <Label className="mb-2 block text-sm">{t("fontStyleLabel")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {FONTS.map(({ name, value }) => (
            <Button
              key={value}
              variant={selectedFont === value ? "primary" : "secondary"}
              onClick={() => setSelectedFont(value)}
              size="sm"
            >
              {name}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} className="w-full sm:w-auto">
        {t("reset")}
      </Button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Output */}
      {output && (
        <Textarea
          label={t("outputLabel")}
          value={output}
          readOnly
          showCopy
          className="font-mono text-xs min-h-[200px] whitespace-pre overflow-x-auto"
        />
      )}

      {/* Preview with background */}
      {output && (
        <div>
          <Label className="mb-2 block text-sm">{t("preview")}</Label>
          <div className="p-4 bg-[#1a1a2e] text-green-400 rounded-[12px] overflow-x-auto">
            <pre className="font-mono text-xs whitespace-pre">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export const asciiArtConfig: ToolConfig = {
  id: "ascii-art",
  name: "Text to ASCII Art",
  description: "Convert text to ASCII art with multiple font styles",
  category: "text",
  component: AsciiArtTool,
  seo: {
    keywords: [
      "ascii art generator",
      "text to ascii",
      "ascii text",
      "figlet generator",
      "text art",
      "ascii banner",
      "ascii font",
      "text to art",
      "ascii text converter",
      "banner text generator",
      "ascii logo maker",
      "terminal art",
    ],
  },
  sections: [
    {
      title: "What is ASCII Art?",
      content:
        "ASCII art is a graphic design technique that uses printable characters from the ASCII standard to create images and text designs. It originated from early computer systems that could only display text characters, and remains popular for terminal banners, code comments, and retro aesthetics.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">FIGlet Fonts</h4>
          <p className="text-sm mb-4">
            This tool uses FIGlet (Frank, Ian & Glenn&apos;s letters) to render text in various ASCII art fonts. Each font defines how letters should be drawn using ASCII characters.
          </p>

          <h4 className="text-base font-semibold mb-2">Available Fonts</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Standard - Classic FIGlet font</li>
            <li>Banner - Large block letters</li>
            <li>Doom - Bold, impactful style</li>
            <li>Big - Large decorative letters</li>
            <li>Slant - Italic-style letters</li>
            <li>Small - Compact version</li>
            <li>Script - Cursive style</li>
            <li>Mini - Very compact</li>
            <li>Block - Solid block letters</li>
            <li>Lean - Thin, elegant style</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Terminal welcome banners</li>
            <li>Code file headers and comments</li>
            <li>README decorations</li>
            <li>CLI application branding</li>
            <li>Retro-style graphics</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Standard font example",
      content: `  _   _      _ _
 | | | | ___| | | ___
 | |_| |/ _ \\ | |/ _ \\
 |  _  |  __/ | | (_) |
 |_| |_|\\___|_|_|\\___/`,
      type: "code",
    },
    {
      title: "Doom font example",
      content: `_   _ _____ _     _     ___
| | | | ____| |   | |   / _ \\
| |_| |  _| | |   | |  | | | |
|  _  | |___| |___| |__| |_| |
|_| |_|_____|_____|_____\\___/`,
      type: "code",
    },
  ],
  codeSnippet: `import figlet from 'figlet';

// Using figlet in Node.js
function generateAsciiArt(
  text: string,
  font: string = 'Standard'
): Promise<string> {
  return new Promise((resolve, reject) => {
    figlet.text(text, {
      font: font,
      horizontalLayout: 'default',
      verticalLayout: 'default',
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result || '');
    });
  });
}

// Synchronous version
function generateAsciiArtSync(
  text: string,
  font: string = 'Standard'
): string {
  return figlet.textSync(text, {
    font: font,
    horizontalLayout: 'default',
    verticalLayout: 'default',
  });
}

// Example usage
async function main() {
  try {
    const art = await generateAsciiArt('Hello', 'Standard');
    console.log(art);

    // Synchronous
    const artSync = generateAsciiArtSync('World', 'Doom');
    console.log(artSync);
  } catch (error) {
    console.error('Error generating ASCII art:', error);
  }
}

main();

// Output (Standard font):
//   _   _      _ _
//  | | | | ___| | | ___
//  | |_| |/ _ \\ | |/ _ \\
//  |  _  |  __/ | | (_) |
//  |_| |_|\\___|_|_|\\___/`,
  references: [
    {
      title: "FIGlet - Official Site",
      url: "http://www.figlet.org/",
    },
    {
      title: "ASCII Art - Wikipedia",
      url: "https://en.wikipedia.org/wiki/ASCII_art",
    },
    {
      title: "figlet npm package",
      url: "https://www.npmjs.com/package/figlet",
    },
  ],
};
