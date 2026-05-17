"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

export function FaviconGeneratorTool() {
  const [text, setText] = useState("B");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(64);
  const [borderRadius, setBorderRadius] = useState(20);
  const [fontFamily, setFontFamily] = useState("system-ui");
  const [dataUrl, setDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fontFamilies = [
    { value: "system-ui", label: "System UI" },
    { value: "Arial", label: "Arial" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Verdana", label: "Verdana" },
    { value: "Impact", label: "Impact" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
  ];

  const generateFavicon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw rounded rectangle background
    const radius = (borderRadius / 100) * (size / 2);
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Draw text/emoji
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2 + 4);

    // Generate data URL
    const url = canvas.toDataURL("image/png");
    setDataUrl(url);
  };

  useEffect(() => {
    generateFavicon();
  }, [text, bgColor, textColor, fontSize, borderRadius, fontFamily]);

  const handleDownload = (size: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = (borderRadius / 100) * (size / 2);

    // Draw rounded rectangle background
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Scale font size proportionally
    const scaledFontSize = (fontSize / 128) * size;
    ctx.fillStyle = textColor;
    ctx.font = `${scaledFontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2 + (size * 0.03));

    // Download
    const link = document.createElement("a");
    link.download = `favicon-${size}x${size}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const presets = [
    { emoji: "B", label: "B" },
    { emoji: "A", label: "A" },
    { emoji: "X", label: "X" },
    { emoji: "N", label: "N" },
    { emoji: "S", label: "S" },
    { emoji: "D", label: "D" },
  ];

  const emojiPresets = [
    { emoji: "🚀", label: "Rocket" },
    { emoji: "⚡", label: "Lightning" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "💎", label: "Diamond" },
    { emoji: "🎯", label: "Target" },
    { emoji: "🛠️", label: "Tools" },
    { emoji: "📦", label: "Package" },
    { emoji: "🌟", label: "Star" },
    { emoji: "🔮", label: "Crystal" },
    { emoji: "🎨", label: "Art" },
    { emoji: "💡", label: "Idea" },
    { emoji: "🔐", label: "Lock" },
  ];

  const colorPresets = [
    { bg: "#3b82f6", text: "#ffffff", label: "Blue" },
    { bg: "#10b981", text: "#ffffff", label: "Green" },
    { bg: "#f59e0b", text: "#ffffff", label: "Amber" },
    { bg: "#ef4444", text: "#ffffff", label: "Red" },
    { bg: "#8b5cf6", text: "#ffffff", label: "Purple" },
    { bg: "#ec4899", text: "#ffffff", label: "Pink" },
    { bg: "#000000", text: "#ffffff", label: "Black" },
    { bg: "#ffffff", text: "#000000", label: "White" },
    { bg: "#1f2937", text: "#f3f4f6", label: "Slate" },
    { bg: "#6366f1", text: "#ffffff", label: "Indigo" },
    { bg: "#14b8a6", text: "#ffffff", label: "Teal" },
    { bg: "#f97316", text: "#ffffff", label: "Orange" },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Text/Emoji Input */}
      <div>
        <Label className="mb-2 block text-sm">Text or Emoji</Label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="B or 🚀"
          className="text-2xl text-center"
          maxLength={2}
        />
      </div>

      {/* Letter Presets */}
      <div>
        <Label className="mb-2 block text-sm">Letter Presets</Label>
        <div className="grid grid-cols-6 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.emoji}
              onClick={() => setText(preset.emoji)}
              size="sm"
              variant={text === preset.emoji ? "primary" : "secondary"}
              className="text-lg"
            >
              {preset.emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* Emoji Presets */}
      <div>
        <Label className="mb-2 block text-sm">Emoji Presets</Label>
        <div className="grid grid-cols-6 gap-2">
          {emojiPresets.map((preset) => (
            <Button
              key={preset.emoji}
              onClick={() => setText(preset.emoji)}
              size="sm"
              variant={text === preset.emoji ? "primary" : "secondary"}
              className="text-lg"
              title={preset.label}
            >
              {preset.emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <Label className="mb-2 block text-sm">Color Presets</Label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setBgColor(preset.bg);
                setTextColor(preset.text);
              }}
              className="w-full h-10 rounded-[8px] border border-[var(--color-gray-200)] transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: preset.bg }}
              title={preset.label}
            />
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-sm">Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded-[8px] cursor-pointer border border-[var(--color-gray-200)]"
            />
            <Input
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="font-mono text-sm flex-1"
            />
          </div>
        </div>
        <div>
          <Label className="mb-2 block text-sm">Text Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-10 rounded-[8px] cursor-pointer border border-[var(--color-gray-200)]"
            />
            <Input
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="font-mono text-sm flex-1"
            />
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <Label className="mb-2 block text-sm">Font Family</Label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full h-11 rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <Label className="mb-2 block text-sm">Font Size: {fontSize}px</Label>
        <input
          type="range"
          min="24"
          max="96"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
        />
      </div>

      {/* Border Radius */}
      <div>
        <Label className="mb-2 block text-sm">Border Radius: {borderRadius}%</Label>
        <input
          type="range"
          min="0"
          max="100"
          value={borderRadius}
          onChange={(e) => setBorderRadius(parseInt(e.target.value))}
          className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
        />
      </div>

      {/* Preview */}
      <div>
        <Label className="mb-2 block text-sm">Preview</Label>
        <div className="flex items-center gap-4 p-4 bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] rounded-[12px]">
          {dataUrl && (
            <>
              <div className="flex flex-col items-center gap-1">
                <img src={dataUrl} alt="Favicon Preview" width={64} height={64} className="w-16 h-16" />
                <span className="text-xs text-[var(--color-gray-500)]">64x64</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <img src={dataUrl} alt="Favicon Preview" width={32} height={32} className="w-8 h-8" />
                <span className="text-xs text-[var(--color-gray-500)]">32x32</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <img src={dataUrl} alt="Favicon Preview" width={16} height={16} className="w-4 h-4" />
                <span className="text-xs text-[var(--color-gray-500)]">16x16</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-[var(--color-gray-500)]">Browser tab:</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-t-[8px] border border-b-0 border-[var(--color-gray-200)]">
                  <img src={dataUrl} alt="Tab" width={16} height={16} className="w-4 h-4" />
                  <span className="text-xs text-[var(--color-gray-600)]">My Site</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Download Buttons */}
      <div>
        <Label className="mb-2 block text-sm">Download</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[16, 32, 48, 64, 128, 180, 192, 512].map((size) => (
            <Button
              key={size}
              onClick={() => handleDownload(size)}
              size="sm"
            >
              {size}x{size}
            </Button>
          ))}
        </div>
      </div>

      {/* Data URL Output */}
      <Textarea
        label="Base64 Data URL"
        value={dataUrl}
        readOnly
        showCopy
        className="font-mono text-xs bg-[var(--color-gray-0)] min-h-[100px]"
      />

      {/* HTML Code */}
      <Input
        label="HTML Link Tag"
        value={`<link rel="icon" href="${dataUrl.substring(0, 50)}..." type="image/png">`}
        readOnly
        showCopy
        className="font-mono text-sm bg-[var(--color-gray-0)]"
      />
    </div>
  );
}

export const faviconGeneratorConfig: ToolConfig = {
  id: "favicon-generator",
  name: "Favicon Generator",
  description: "Create simple text and emoji favicons with customizable colors",
  category: "generators",
  component: FaviconGeneratorTool,
  seo: {
    keywords: [
      "favicon generator",
      "favicon maker",
      "create favicon",
      "favicon creator",
      "emoji favicon",
      "text favicon",
      "favicon online",
      "favicon builder",
      "generate favicon",
      "favicon tool",
      "website icon generator",
      "browser icon maker",
    ],
  },
  sections: [
    {
      title: "What is a Favicon?",
      content:
        "A favicon (favorite icon) is a small icon associated with a website, displayed in browser tabs, bookmarks, and history. It helps users identify your site quickly and adds a professional touch to your web presence.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            This tool generates favicons using the HTML5 Canvas API. You can create simple but effective favicons using text characters or emojis with customizable colors and styles. The generated favicon can be downloaded in various sizes or used directly as a base64 data URL.
          </p>

          <h4 className="text-base font-semibold mb-2">Common Favicon Sizes</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>16x16:</strong> Standard browser tab favicon</li>
            <li><strong>32x32:</strong> High-DPI browser tabs, Windows shortcut</li>
            <li><strong>180x180:</strong> Apple Touch icon (iOS)</li>
            <li><strong>192x192:</strong> Android Chrome icon</li>
            <li><strong>512x512:</strong> PWA splash screen icon</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Letter favicon",
      content: "Single letter like 'B' on a colored background",
      type: "text",
    },
    {
      title: "Emoji favicon",
      content: "Emoji like rocket or lightning bolt",
      type: "text",
    },
    {
      title: "HTML usage",
      content: '<link rel="icon" href="data:image/png;base64,..." type="image/png">',
      type: "code",
    },
  ],
  codeSnippet: `// Generate a simple text favicon using Canvas API

function generateFavicon(
  text: string,
  bgColor: string = '#3b82f6',
  textColor: string = '#ffffff',
  size: number = 64
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Draw background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();

  // Draw text
  ctx.fillStyle = textColor;
  ctx.font = \`\${size * 0.6}px system-ui\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2 + size * 0.03);

  return canvas.toDataURL('image/png');
}

function setFavicon(dataUrl: string): void {
  // Remove existing favicon
  const existingLink = document.querySelector("link[rel*='icon']");
  if (existingLink) {
    existingLink.remove();
  }

  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = dataUrl;
  document.head.appendChild(link);
}

function downloadFavicon(dataUrl: string, filename: string = 'favicon.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

// Example usage
const faviconUrl = generateFavicon('B', '#3b82f6', '#ffffff', 64);

// Set as page favicon
setFavicon(faviconUrl);

// Or download it
downloadFavicon(faviconUrl, 'favicon-64x64.png');

console.log('Favicon data URL:', faviconUrl.substring(0, 50) + '...');

// Generate multiple sizes for complete favicon set
const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
sizes.forEach(size => {
  const url = generateFavicon('B', '#3b82f6', '#ffffff', size);
  console.log(\`Generated \${size}x\${size} favicon\`);
});`,
  references: [
    {
      title: "MDN: Link types - icon",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#icon",
    },
    {
      title: "Favicon Cheat Sheet",
      url: "https://github.com/nickmilo/favicon-cheat-sheet",
    },
  ],
};
