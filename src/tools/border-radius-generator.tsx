"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

export function BorderRadiusGeneratorTool() {
  const t = useTranslations("toolUI.border-radius-generator");
  const [topLeft, setTopLeft] = useState(12);
  const [topRight, setTopRight] = useState(12);
  const [bottomRight, setBottomRight] = useState(12);
  const [bottomLeft, setBottomLeft] = useState(12);
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%" | "rem">("px");
  const [previewBg, setPreviewBg] = useState("#3b82f6");
  const [previewSize, setPreviewSize] = useState(150);

  const updateRadius = (corner: string, value: number) => {
    if (linked) {
      setTopLeft(value);
      setTopRight(value);
      setBottomRight(value);
      setBottomLeft(value);
    } else {
      switch (corner) {
        case "topLeft":
          setTopLeft(value);
          break;
        case "topRight":
          setTopRight(value);
          break;
        case "bottomRight":
          setBottomRight(value);
          break;
        case "bottomLeft":
          setBottomLeft(value);
          break;
      }
    }
  };

  const generateCSS = (): string => {
    const tl = `${topLeft}${unit}`;
    const tr = `${topRight}${unit}`;
    const br = `${bottomRight}${unit}`;
    const bl = `${bottomLeft}${unit}`;

    if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
      return `${topLeft}${unit}`;
    }

    if (topLeft === bottomRight && topRight === bottomLeft) {
      return `${tl} ${tr}`;
    }

    if (topRight === bottomLeft) {
      return `${tl} ${tr} ${br}`;
    }

    return `${tl} ${tr} ${br} ${bl}`;
  };

  const applyPreset = (preset: string) => {
    setLinked(false);
    switch (preset) {
      case "none":
        setTopLeft(0);
        setTopRight(0);
        setBottomRight(0);
        setBottomLeft(0);
        break;
      case "sm":
        setTopLeft(4);
        setTopRight(4);
        setBottomRight(4);
        setBottomLeft(4);
        break;
      case "md":
        setTopLeft(8);
        setTopRight(8);
        setBottomRight(8);
        setBottomLeft(8);
        break;
      case "lg":
        setTopLeft(12);
        setTopRight(12);
        setBottomRight(12);
        setBottomLeft(12);
        break;
      case "xl":
        setTopLeft(16);
        setTopRight(16);
        setBottomRight(16);
        setBottomLeft(16);
        break;
      case "2xl":
        setTopLeft(24);
        setTopRight(24);
        setBottomRight(24);
        setBottomLeft(24);
        break;
      case "full":
        setTopLeft(9999);
        setTopRight(9999);
        setBottomRight(9999);
        setBottomLeft(9999);
        break;
      case "pill":
        setTopLeft(50);
        setTopRight(50);
        setBottomRight(50);
        setBottomLeft(50);
        setUnit("%");
        break;
      case "blob-1":
        setTopLeft(30);
        setTopRight(70);
        setBottomRight(30);
        setBottomLeft(70);
        break;
      case "blob-2":
        setTopLeft(60);
        setTopRight(40);
        setBottomRight(60);
        setBottomLeft(40);
        break;
      case "ticket":
        setTopLeft(8);
        setTopRight(8);
        setBottomRight(0);
        setBottomLeft(0);
        break;
      case "leaf":
        setTopLeft(0);
        setTopRight(50);
        setBottomRight(0);
        setBottomLeft(50);
        break;
    }
    setLinked(true);
  };

  const maxValue = unit === "%" ? 50 : unit === "rem" ? 10 : 100;
  const cssValue = generateCSS();

  return (
    <div className="space-y-6">
      {/* Unit Selector */}
      <div>
        <Label className="mb-2 block text-sm">{t("unit")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["px", "%", "rem"] as const).map((u) => (
            <Button
              key={u}
              variant={unit === u ? "primary" : "secondary"}
              onClick={() => setUnit(u)}
              className="w-full"
            >
              {u}
            </Button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <Label className="mb-2 block text-sm">{t("presets")}</Label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {["none", "sm", "md", "lg", "xl", "2xl", "full", "pill", "blob-1", "blob-2", "ticket", "leaf"].map((preset) => (
            <Button
              key={preset}
              onClick={() => applyPreset(preset)}
              size="sm"
              className="capitalize text-xs"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Linked Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-blue-500)]"
          />
          {t("linkAllCorners")}
        </label>
      </div>

      {/* Corner Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Left */}
        <div>
          <Label className="mb-1 block text-xs">{t("topLeft")}: {topLeft}{unit}</Label>
          <input
            type="range"
            min="0"
            max={maxValue}
            value={topLeft}
            onChange={(e) => updateRadius("topLeft", parseInt(e.target.value))}
            className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
          />
        </div>

        {/* Top Right */}
        <div>
          <Label className="mb-1 block text-xs">{t("topRight")}: {topRight}{unit}</Label>
          <input
            type="range"
            min="0"
            max={maxValue}
            value={topRight}
            onChange={(e) => updateRadius("topRight", parseInt(e.target.value))}
            className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
          />
        </div>

        {/* Bottom Left */}
        <div>
          <Label className="mb-1 block text-xs">{t("bottomLeft")}: {bottomLeft}{unit}</Label>
          <input
            type="range"
            min="0"
            max={maxValue}
            value={bottomLeft}
            onChange={(e) => updateRadius("bottomLeft", parseInt(e.target.value))}
            className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
          />
        </div>

        {/* Bottom Right */}
        <div>
          <Label className="mb-1 block text-xs">{t("bottomRight")}: {bottomRight}{unit}</Label>
          <input
            type="range"
            min="0"
            max={maxValue}
            value={bottomRight}
            onChange={(e) => updateRadius("bottomRight", parseInt(e.target.value))}
            className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
          />
        </div>
      </div>

      {/* Preview Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-sm">{t("previewColor")}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={previewBg}
              onChange={(e) => setPreviewBg(e.target.value)}
              className="w-10 h-10 rounded-[8px] cursor-pointer border border-[var(--color-gray-200)]"
            />
            <Input
              value={previewBg}
              onChange={(e) => setPreviewBg(e.target.value)}
              className="font-mono text-sm flex-1"
            />
          </div>
        </div>
        <div>
          <Label className="mb-2 block text-sm">{t("previewSize")}: {previewSize}px</Label>
          <input
            type="range"
            min="50"
            max="250"
            value={previewSize}
            onChange={(e) => setPreviewSize(parseInt(e.target.value))}
            className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)] mt-3"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <Label className="mb-2 block text-sm">{t("preview")}</Label>
        <div className="h-64 w-full rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] flex items-center justify-center">
          <div
            style={{
              width: previewSize,
              height: previewSize,
              backgroundColor: previewBg,
              borderRadius: `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`,
              transition: "border-radius 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* CSS Output */}
      <Input
        label={t("cssCode")}
        value={`border-radius: ${cssValue};`}
        readOnly
        showCopy
        className="font-mono text-sm bg-[var(--color-gray-0)]"
      />

      {/* Individual Properties */}
      <div>
        <Label className="mb-2 block text-sm">{t("individualProperties")}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            value={`border-top-left-radius: ${topLeft}${unit};`}
            readOnly
            showCopy
            className="font-mono text-sm bg-[var(--color-gray-0)]"
          />
          <Input
            value={`border-top-right-radius: ${topRight}${unit};`}
            readOnly
            showCopy
            className="font-mono text-sm bg-[var(--color-gray-0)]"
          />
          <Input
            value={`border-bottom-left-radius: ${bottomLeft}${unit};`}
            readOnly
            showCopy
            className="font-mono text-sm bg-[var(--color-gray-0)]"
          />
          <Input
            value={`border-bottom-right-radius: ${bottomRight}${unit};`}
            readOnly
            showCopy
            className="font-mono text-sm bg-[var(--color-gray-0)]"
          />
        </div>
      </div>

      {/* Tailwind Class */}
      <Input
        label={t("tailwindClass")}
        value={topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft
          ? `rounded-[${topLeft}${unit}]`
          : `rounded-tl-[${topLeft}${unit}] rounded-tr-[${topRight}${unit}] rounded-br-[${bottomRight}${unit}] rounded-bl-[${bottomLeft}${unit}]`
        }
        readOnly
        showCopy
        className="font-mono text-sm bg-[var(--color-gray-0)]"
      />
    </div>
  );
}

export const borderRadiusGeneratorConfig: ToolConfig = {
  id: "border-radius-generator",
  name: "Border Radius Generator",
  description: "Create CSS border-radius with visual controls for each corner",
  category: "generators",
  component: BorderRadiusGeneratorTool,
  seo: {
    keywords: [
      "border radius generator",
      "css border radius",
      "rounded corners css",
      "border radius tool",
      "css rounded corners",
      "border radius maker",
      "corner radius generator",
      "css border radius generator",
      "rounded box css",
      "border radius online",
      "css corner radius",
      "rounded corners generator",
    ],
  },
  sections: [
    {
      title: "What is CSS Border Radius?",
      content:
        "The CSS border-radius property rounds the corners of an element's outer border edge. You can set all four corners to the same value, or specify different values for each corner to create unique shapes.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Border radius can be specified with 1 to 4 values. With 1 value, all corners are the same. With 2 values, the first applies to top-left/bottom-right and the second to top-right/bottom-left. With 3 values: top-left, top-right/bottom-left, bottom-right. With 4 values: top-left, top-right, bottom-right, bottom-left (clockwise).
          </p>

          <h4 className="text-base font-semibold mb-2">Units</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>px:</strong> Fixed pixel values (most common)</li>
            <li><strong>%:</strong> Percentage of element dimensions</li>
            <li><strong>rem:</strong> Relative to root font size</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "All corners equal",
      content: "border-radius: 12px;",
      type: "code",
    },
    {
      title: "Pill shape",
      content: "border-radius: 9999px;",
      type: "code",
    },
    {
      title: "Different corners",
      content: "border-radius: 10px 20px 30px 40px;",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - generates CSS border-radius strings

interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  unit: 'px' | '%' | 'rem';
}

function generateBorderRadius(radius: BorderRadius): string {
  const { topLeft, topRight, bottomRight, bottomLeft, unit } = radius;

  // All corners equal
  if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
    return \`\${topLeft}\${unit}\`;
  }

  // Opposite corners equal (2-value shorthand)
  if (topLeft === bottomRight && topRight === bottomLeft) {
    return \`\${topLeft}\${unit} \${topRight}\${unit}\`;
  }

  // Top-right and bottom-left equal (3-value shorthand)
  if (topRight === bottomLeft) {
    return \`\${topLeft}\${unit} \${topRight}\${unit} \${bottomRight}\${unit}\`;
  }

  // All different (4-value)
  return \`\${topLeft}\${unit} \${topRight}\${unit} \${bottomRight}\${unit} \${bottomLeft}\${unit}\`;
}

function getIndividualProperties(radius: BorderRadius): string[] {
  const { topLeft, topRight, bottomRight, bottomLeft, unit } = radius;
  return [
    \`border-top-left-radius: \${topLeft}\${unit};\`,
    \`border-top-right-radius: \${topRight}\${unit};\`,
    \`border-bottom-right-radius: \${bottomRight}\${unit};\`,
    \`border-bottom-left-radius: \${bottomLeft}\${unit};\`,
  ];
}

// Preset shapes
const presets = {
  none: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px' as const },
  small: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4, unit: 'px' as const },
  medium: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px' as const },
  large: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16, unit: 'px' as const },
  pill: { topLeft: 9999, topRight: 9999, bottomRight: 9999, bottomLeft: 9999, unit: 'px' as const },
  circle: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50, unit: '%' as const },
};

// Example usage
console.log('Medium rounded:');
console.log(\`border-radius: \${generateBorderRadius(presets.medium)};\`);

console.log('\\nPill shape:');
console.log(\`border-radius: \${generateBorderRadius(presets.pill)};\`);

console.log('\\nCircle (50%):');
console.log(\`border-radius: \${generateBorderRadius(presets.circle)};\`);

console.log('\\nCustom shape:');
const custom = { topLeft: 10, topRight: 20, bottomRight: 30, bottomLeft: 40, unit: 'px' as const };
console.log(\`border-radius: \${generateBorderRadius(custom)};\`);

console.log('\\nIndividual properties:');
getIndividualProperties(custom).forEach(prop => console.log(prop));

// Output:
// Medium rounded:
// border-radius: 8px;
//
// Pill shape:
// border-radius: 9999px;
//
// Circle (50%):
// border-radius: 50%;
//
// Custom shape:
// border-radius: 10px 20px 30px 40px;
//
// Individual properties:
// border-top-left-radius: 10px;
// border-top-right-radius: 20px;
// border-bottom-right-radius: 30px;
// border-bottom-left-radius: 40px;`,
  references: [
    {
      title: "MDN: border-radius",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius",
    },
    {
      title: "CSS-Tricks: border-radius",
      url: "https://css-tricks.com/almanac/properties/b/border-radius/",
    },
  ],
};
