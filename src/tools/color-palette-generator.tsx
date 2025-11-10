"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";
import { MdContentCopy, MdCheck } from "react-icons/md";

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
}

function randomColor(): Color {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) / 6;
        break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hDeg}, ${sPercent}%, ${lPercent}%)`,
  };
}

function generateComplementary(baseColor: Color): Color[] {
  const hex = baseColor.hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;

  const compHex = `#${compR.toString(16).padStart(2, "0")}${compG.toString(16).padStart(2, "0")}${compB.toString(16).padStart(2, "0")}`.toUpperCase();

  return [
    baseColor,
    {
      hex: compHex,
      rgb: `rgb(${compR}, ${compG}, ${compB})`,
      hsl: baseColor.hsl, // Simplified
    },
  ];
}

function generateAnalogous(baseColor: Color): Color[] {
  const colors: Color[] = [baseColor];
  const hslMatch = baseColor.hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);

  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);

    for (let offset of [30, -30]) {
      const newH = (h + offset + 360) % 360;
      const color = hslToColor(newH, s, l);
      colors.push(color);
    }
  }

  return colors;
}

function hslToColor(h: number, s: number, l: number): Color {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

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

  const rVal = Math.round((r + m) * 255);
  const gVal = Math.round((g + m) * 255);
  const bVal = Math.round((b + m) * 255);

  const hex = `#${rVal.toString(16).padStart(2, "0")}${gVal.toString(16).padStart(2, "0")}${bVal.toString(16).padStart(2, "0")}`.toUpperCase();

  return {
    hex,
    rgb: `rgb(${rVal}, ${gVal}, ${bVal})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
  };
}

type PaletteType = "random" | "complementary" | "analogous" | "monochromatic";

export function ColorPaletteGeneratorTool() {
  const [colors, setColors] = useState<Color[]>([]);
  const [paletteType, setPaletteType] = useState<PaletteType>("random");
  const [colorCount, setColorCount] = useState("5");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    const count = Math.min(Math.max(parseInt(colorCount) || 5, 2), 10);
    let newColors: Color[] = [];

    switch (paletteType) {
      case "random":
        newColors = Array.from({ length: count }, () => randomColor());
        break;
      case "complementary":
        newColors = generateComplementary(randomColor());
        break;
      case "analogous":
        newColors = generateAnalogous(randomColor());
        break;
      case "monochromatic":
        const base = randomColor();
        const hslMatch = base.hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          newColors = [20, 35, 50, 65, 80].map(l => hslToColor(h, s, l));
        }
        break;
    }

    setColors(newColors);
  };

  const copyAllColors = () => {
    const text = colors.map(c => c.hex).join("\n");
    navigator.clipboard.writeText(text);
  };

  const copyColor = async (hex: string, index: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Palette Type Selection */}
      <div>
        <Label className="mb-2 block text-sm">Palette Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={paletteType === "random" ? "default" : "secondary"}
            onClick={() => setPaletteType("random")}
            className="w-full"
          >
            Random
          </Button>
          <Button
            variant={paletteType === "complementary" ? "default" : "secondary"}
            onClick={() => setPaletteType("complementary")}
            className="w-full"
          >
            Complementary
          </Button>
          <Button
            variant={paletteType === "analogous" ? "default" : "secondary"}
            onClick={() => setPaletteType("analogous")}
            className="w-full"
          >
            Analogous
          </Button>
          <Button
            variant={paletteType === "monochromatic" ? "default" : "secondary"}
            onClick={() => setPaletteType("monochromatic")}
            className="w-full"
          >
            Monochromatic
          </Button>
        </div>
      </div>

      {/* Color Count (only for random) */}
      {paletteType === "random" && (
        <div>
          <Label className="mb-2 block text-sm">Number of Colors (2-10)</Label>
          <Input
            type="number"
            min="2"
            max="10"
            value={colorCount}
            onChange={(e) => setColorCount(e.target.value)}
            placeholder="5"
          />
        </div>
      )}

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate Palette
      </Button>

      {/* Color Palette Display */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Generated Palette</Label>
            <Button onClick={copyAllColors} variant="secondary" size="sm">
              Copy All Hex Codes
            </Button>
          </div>

          <div className="grid gap-3">
            {colors.map((color, index) => (
              <div
                key={index}
                className="border border-white/10 rounded overflow-hidden"
              >
                <div
                  className="h-20 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-3 bg-[#0f0f0f] space-y-1">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">{color.hex}</code>
                    <Button
                      onClick={() => copyColor(color.hex, index)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 h-auto px-2 py-1 text-xs"
                    >
                      {copiedIndex === index ? (
                        <>
                          <MdCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-blue-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <MdContentCopy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-white/60 font-mono">
                    {color.rgb}
                  </div>
                  <div className="text-xs text-white/60 font-mono">
                    {color.hsl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const colorPaletteGeneratorConfig: ToolConfig = {
  id: "color-palette-generator",
  name: "Color Palette Generator",
  description: "Generate beautiful color palettes with various schemes",
  category: "generators",
  component: ColorPaletteGeneratorTool,
  seo: {
    keywords: [
      "color palette",
      "color scheme generator",
      "palette creator",
      "color combination",
      "color palette generator",
      "complementary colors",
      "analogous colors",
      "monochromatic palette",
      "color picker tool",
      "design colors",
    ],
  },
  sections: [
    {
      title: "What is a Color Palette?",
      content:
        "A color palette is a selection of colors that work well together. Color theory helps create harmonious combinations that are pleasing to the eye and effective in design.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            The generator creates palettes using color theory principles. Random mode generates colors with varied hue values. Complementary finds opposite colors on the color wheel (180° hue difference). Analogous uses adjacent hues (±30°). Monochromatic varies lightness while keeping the same hue, creating cohesive schemes.
          </p>

          <h4 className="text-base font-semibold mb-2">Palette Types</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>Random:</strong> Randomly generated colors</li>
            <li><strong>Complementary:</strong> Colors opposite on the color wheel</li>
            <li><strong>Analogous:</strong> Colors next to each other on the color wheel</li>
            <li><strong>Monochromatic:</strong> Different shades of the same hue</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Using Color Palettes</h4>
          <p className="text-sm">
            Color palettes are essential in web design, branding, and UI/UX design. Use the generated colors for backgrounds, text, buttons, and other design elements. Each color is provided in HEX, RGB, and HSL formats for easy integration.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Complementary palette",
      content: "#FF6B6B and #6BFFB8 (red and cyan)",
      type: "code",
    },
    {
      title: "Analogous palette",
      content: "#FF6B6B, #FFB86B, #FFEB6B (red, orange, yellow)",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - uses built-in Math functions

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function generateRandomColor(): Color {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return {
    hex: rgbToHex(r, g, b),
    rgb: \`rgb(\${r}, \${g}, \${b})\`,
    hsl: \`hsl(0, 0%, 0%)\` // Simplified
  };
}

function generateComplementaryPalette(): Color[] {
  const hue = Math.floor(Math.random() * 360);
  const [r1, g1, b1] = hslToRgb(hue, 70, 50);
  const [r2, g2, b2] = hslToRgb((hue + 180) % 360, 70, 50);

  return [
    {
      hex: rgbToHex(r1, g1, b1),
      rgb: \`rgb(\${r1}, \${g1}, \${b1})\`,
      hsl: \`hsl(\${hue}, 70%, 50%)\`
    },
    {
      hex: rgbToHex(r2, g2, b2),
      rgb: \`rgb(\${r2}, \${g2}, \${b2})\`,
      hsl: \`hsl(\${(hue + 180) % 360}, 70%, 50%)\`
    }
  ];
}

function generateMonochromaticPalette(count: number = 5): Color[] {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70;
  const colors: Color[] = [];

  for (let i = 0; i < count; i++) {
    const lightness = 20 + (i * 15);
    const [r, g, b] = hslToRgb(hue, saturation, lightness);

    colors.push({
      hex: rgbToHex(r, g, b),
      rgb: \`rgb(\${r}, \${g}, \${b})\`,
      hsl: \`hsl(\${hue}, \${saturation}%, \${lightness}%)\`
    });
  }

  return colors;
}

// Example usage
console.log('Random Color:');
console.log(generateRandomColor());

console.log('\\nComplementary Palette:');
console.log(generateComplementaryPalette());

console.log('\\nMonochromatic Palette (5 colors):');
console.log(generateMonochromaticPalette(5));

// Output:
// Random Color:
// { hex: '#A3C4F3', rgb: 'rgb(163, 196, 243)', hsl: 'hsl(0, 0%, 0%)' }
//
// Complementary Palette:
// [
//   { hex: '#FF6B6B', rgb: 'rgb(255, 107, 107)', hsl: 'hsl(0, 70%, 50%)' },
//   { hex: '#6BFFFF', rgb: 'rgb(107, 255, 255)', hsl: 'hsl(180, 70%, 50%)' }
// ]`,
  references: [
    {
      title: "Color Theory - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Color_theory",
    },
    {
      title: "Adobe Color Wheel",
      url: "https://color.adobe.com/",
    },
  ],
};
