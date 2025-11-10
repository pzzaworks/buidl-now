"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function parseColor(input: string): ColorFormats | null {
  input = input.trim();

  // Try HEX
  if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
    const hex = input.startsWith("#") ? input : "#" + input;
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    };
  }

  // Try RGB
  const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);

    if (r > 255 || g > 255 || b > 255) return null;

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);

    return {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    };
  }

  // Try HSL
  const hslMatch = input.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);

    if (h > 360 || s > 100 || l > 100) return null;

    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    };
  }

  return null;
}

export function ColorConverterTool() {
  const [input, setInput] = useState("");
  const [colors, setColors] = useState<ColorFormats | null>(null);
  const [error, setError] = useState("");

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter a color value");
      setColors(null);
      return;
    }

    const result = parseColor(input);
    if (result) {
      setColors(result);
      setError("");
    } else {
      setColors(null);
      setError("Invalid color format. Please use HEX, RGB, or HSL format.");
    }
  };

  const handleReset = () => {
    setInput("");
    setColors(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">Color Input</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., #FF5733, rgb(255, 87, 51), hsl(9, 100%, 60%)"
          className="text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Color Preview and Output */}
      {colors && (
        <div className="space-y-4">
          {/* Color Preview */}
          <div>
            <Label className="mb-2 block text-sm">Color Preview</Label>
            <div
              className="h-32 w-full rounded border border-white/10"
              style={{ backgroundColor: colors.hex }}
            />
          </div>

          {/* HEX */}
          <Input
            label="HEX"
            value={colors.hex}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          {/* RGB */}
          <Input
            label="RGB"
            value={colors.rgb}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          {/* HSL */}
          <Input
            label="HSL"
            value={colors.hsl}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          {/* HSV */}
          <Input
            label="HSV"
            value={colors.hsv}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />
        </div>
      )}
    </div>
  );
}

export const colorConverterConfig: ToolConfig = {
  id: "color-converter",
  name: "Color Converter",
  description: "Convert colors between HEX, RGB, HSL, and HSV formats",
  category: "converters",
  component: ColorConverterTool,
  seo: {
    keywords: [
      "hex to rgb converter",
      "rgb to hsl",
      "color format converter",
      "hsv converter",
      "hex color code",
      "rgb color converter",
      "hsl color picker",
      "color code converter",
      "web color converter",
      "css color converter",
      "color space converter",
      "hexadecimal color",
    ],
  },
  sections: [
    {
      title: "What is Color Conversion?",
      content:
        "Different color formats are used in different contexts. HEX is common in web design, RGB is used in digital displays, HSL provides intuitive hue/saturation/lightness controls, and HSV is popular in graphics applications.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Color conversion uses mathematical formulas to transform between color spaces. RGB values (0-255) can be converted to HEX (00-FF). RGB to HSL/HSV involves calculating hue from color ratios, saturation from color spread, and lightness/value from brightness. Each format represents the same color differently for specific use cases.
          </p>

          <h4 className="text-base font-semibold mb-2">Supported Formats</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>HEX:</strong> Hexadecimal format (e.g., #FF5733)</li>
            <li><strong>RGB:</strong> Red, Green, Blue (e.g., rgb(255, 87, 51))</li>
            <li><strong>HSL:</strong> Hue, Saturation, Lightness (e.g., hsl(9, 100%, 60%))</li>
            <li><strong>HSV:</strong> Hue, Saturation, Value (e.g., hsv(9, 80%, 100%))</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "HEX to all formats",
      content: "#FF5733 → rgb(255, 87, 51) / hsl(9, 100%, 60%) / hsv(9, 80%, 100%)",
      type: "code",
    },
    {
      title: "RGB to all formats",
      content: "rgb(52, 152, 219) → #3498DB / hsl(204, 70%, 53%) / hsv(204, 76%, 86%)",
      type: "code",
    },
    {
      title: "HSL to all formats",
      content: "hsl(120, 100%, 50%) → #00FF00 / rgb(0, 255, 0) / hsv(120, 100%, 100%)",
      type: "code",
    },
  ],
  codeSnippet: `// No npm packages needed - pure Node.js/TypeScript

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('')
    .toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / delta + 2) / 6; break;
      case b: h = ((r - g) / delta + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / delta + 2) / 6; break;
      case b: h = ((r - g) / delta + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// Example usage
const hexColor = '#FF5733';
console.log('Converting HEX:', hexColor);

const rgb = hexToRgb(hexColor);
if (rgb) {
  console.log(\`RGB: rgb(\${rgb.r}, \${rgb.g}, \${rgb.b})\`);

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  console.log(\`HSL: hsl(\${hsl.h}, \${hsl.s}%, \${hsl.l}%)\`);

  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  console.log(\`HSV: hsv(\${hsv.h}, \${hsv.s}%, \${hsv.v}%)\`);

  const hexBack = rgbToHex(rgb.r, rgb.g, rgb.b);
  console.log(\`HEX: \${hexBack}\`);
}

// Output:
// Converting HEX: #FF5733
// RGB: rgb(255, 87, 51)
// HSL: hsl(9, 100%, 60%)
// HSV: hsv(9, 80%, 100%)
// HEX: #FF5733`,
  references: [
    {
      title: "Color Models - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Color_model",
    },
    {
      title: "MDN: CSS Color Values",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value",
    },
  ],
};
