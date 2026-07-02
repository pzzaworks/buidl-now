"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

interface Shadow {
  id: string;
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgba(0, 0, 0, ${opacity})`;
}

export function BoxShadowGeneratorTool() {
  const t = useTranslations("toolUI.box-shadow-generator");
  const [shadows, setShadows] = useState<Shadow[]>([
    {
      id: "1",
      horizontal: 0,
      vertical: 4,
      blur: 6,
      spread: -1,
      color: "#000000",
      opacity: 0.1,
      inset: false,
    },
    {
      id: "2",
      horizontal: 0,
      vertical: 2,
      blur: 4,
      spread: -2,
      color: "#000000",
      opacity: 0.1,
      inset: false,
    },
  ]);
  const [previewBg, setPreviewBg] = useState("#f5f5f5");

  const generateShadowCSS = (): string => {
    return shadows
      .map((shadow) => {
        const insetStr = shadow.inset ? "inset " : "";
        const colorWithOpacity = hexToRgba(shadow.color, shadow.opacity);
        return `${insetStr}${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.spread}px ${colorWithOpacity}`;
      })
      .join(", ");
  };

  const addShadow = () => {
    if (shadows.length >= 5) return;

    const newShadow: Shadow = {
      id: Date.now().toString(),
      horizontal: 0,
      vertical: 4,
      blur: 8,
      spread: 0,
      color: "#000000",
      opacity: 0.15,
      inset: false,
    };
    setShadows([...shadows, newShadow]);
  };

  const removeShadow = (id: string) => {
    if (shadows.length <= 1) return;
    setShadows(shadows.filter((s) => s.id !== id));
  };

  const updateShadow = (id: string, field: keyof Shadow, value: number | string | boolean) => {
    setShadows(
      shadows.map((shadow) =>
        shadow.id === id ? { ...shadow, [field]: value } : shadow
      )
    );
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "subtle":
        setShadows([
          { id: "1", horizontal: 0, vertical: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.1, inset: false },
          { id: "2", horizontal: 0, vertical: 1, blur: 2, spread: -1, color: "#000000", opacity: 0.1, inset: false },
        ]);
        break;
      case "medium":
        setShadows([
          { id: "1", horizontal: 0, vertical: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1, inset: false },
          { id: "2", horizontal: 0, vertical: 2, blur: 4, spread: -2, color: "#000000", opacity: 0.1, inset: false },
        ]);
        break;
      case "large":
        setShadows([
          { id: "1", horizontal: 0, vertical: 10, blur: 15, spread: -3, color: "#000000", opacity: 0.1, inset: false },
          { id: "2", horizontal: 0, vertical: 4, blur: 6, spread: -4, color: "#000000", opacity: 0.1, inset: false },
        ]);
        break;
      case "xl":
        setShadows([
          { id: "1", horizontal: 0, vertical: 20, blur: 25, spread: -5, color: "#000000", opacity: 0.1, inset: false },
          { id: "2", horizontal: 0, vertical: 8, blur: 10, spread: -6, color: "#000000", opacity: 0.1, inset: false },
        ]);
        break;
      case "inset":
        setShadows([
          { id: "1", horizontal: 0, vertical: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.06, inset: true },
        ]);
        break;
      case "outline":
        setShadows([
          { id: "1", horizontal: 0, vertical: 0, blur: 0, spread: 3, color: "#3b82f6", opacity: 0.5, inset: false },
        ]);
        break;
    }
  };

  const cssCode = generateShadowCSS();

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label className="mb-2 block text-sm">{t("presets")}</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {["subtle", "medium", "large", "xl", "inset", "outline"].map((preset) => (
            <Button
              key={preset}
              onClick={() => applyPreset(preset)}
              size="sm"
              className="capitalize"
            >
              {t(`preset_${preset}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Shadow Controls */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">{t("shadowsCount", { count: shadows.length })}</Label>
          {shadows.length < 5 && (
            <Button onClick={addShadow} size="sm">
              {t("addShadow")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {shadows.map((shadow, index) => (
            <div
              key={shadow.id}
              className="p-4 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[12px] space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("shadowN", { number: index + 1 })}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shadow.inset}
                      onChange={(e) => updateShadow(shadow.id, "inset", e.target.checked)}
                      className="w-4 h-4 accent-[var(--color-blue-500)]"
                    />
                    {t("inset")}
                  </label>
                  {shadows.length > 1 && (
                    <Button onClick={() => removeShadow(shadow.id)} size="sm">
                      {t("remove")}
                    </Button>
                  )}
                </div>
              </div>

              {/* Horizontal Offset */}
              <div>
                <Label className="mb-1 block text-xs">{t("horizontal", { value: shadow.horizontal })}</Label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadow.horizontal}
                  onChange={(e) => updateShadow(shadow.id, "horizontal", parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
                />
              </div>

              {/* Vertical Offset */}
              <div>
                <Label className="mb-1 block text-xs">{t("vertical", { value: shadow.vertical })}</Label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadow.vertical}
                  onChange={(e) => updateShadow(shadow.id, "vertical", parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
                />
              </div>

              {/* Blur */}
              <div>
                <Label className="mb-1 block text-xs">{t("blur", { value: shadow.blur })}</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadow.blur}
                  onChange={(e) => updateShadow(shadow.id, "blur", parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
                />
              </div>

              {/* Spread */}
              <div>
                <Label className="mb-1 block text-xs">{t("spread", { value: shadow.spread })}</Label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadow.spread}
                  onChange={(e) => updateShadow(shadow.id, "spread", parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)]"
                />
              </div>

              {/* Color and Opacity */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="mb-1 block text-xs">{t("color")}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shadow.color}
                      onChange={(e) => updateShadow(shadow.id, "color", e.target.value)}
                      className="w-10 h-10 rounded-[8px] cursor-pointer border border-[var(--color-gray-200)]"
                    />
                    <Input
                      value={shadow.color}
                      onChange={(e) => updateShadow(shadow.id, "color", e.target.value)}
                      className="font-mono text-sm flex-1"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="mb-1 block text-xs">{t("opacity", { value: Math.round(shadow.opacity * 100) })}</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadow.opacity * 100}
                    onChange={(e) => updateShadow(shadow.id, "opacity", parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-[var(--color-gray-100)] rounded-[12px] appearance-none cursor-pointer accent-[var(--color-blue-500)] mt-3"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Background */}
      <div>
        <Label className="mb-2 block text-sm">{t("previewBackground")}</Label>
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

      {/* Preview */}
      <div>
        <Label className="mb-2 block text-sm">{t("preview")}</Label>
        <div
          className="h-48 w-full rounded-[12px] border border-[var(--color-gray-200)] flex items-center justify-center"
          style={{ backgroundColor: previewBg }}
        >
          <div
            className="w-32 h-32 bg-white rounded-[12px]"
            style={{ boxShadow: cssCode }}
          />
        </div>
      </div>

      {/* CSS Output */}
      <Input
        label={t("cssCode")}
        value={`box-shadow: ${cssCode};`}
        readOnly
        showCopy
        className="font-mono text-sm bg-[var(--color-gray-0)]"
      />

      {/* Tailwind Output */}
      <Input
        label={t("tailwindArbitraryValue")}
        value={`shadow-[${cssCode.replace(/\s+/g, "_")}]`}
        readOnly
        showCopy
        className="font-mono text-sm bg-[var(--color-gray-0)]"
      />
    </div>
  );
}

export const boxShadowGeneratorConfig: ToolConfig = {
  id: "box-shadow-generator",
  name: "Box Shadow Generator",
  description: "Create CSS box-shadow with visual controls and multiple shadows",
  category: "generators",
  component: BoxShadowGeneratorTool,
  seo: {
    keywords: [
      "box shadow generator",
      "css box shadow",
      "shadow generator",
      "css shadow tool",
      "box shadow maker",
      "css shadow generator",
      "drop shadow css",
      "shadow css code",
      "box shadow online",
      "css shadow creator",
      "multiple box shadows",
      "inset shadow generator",
    ],
  },
  sections: [
    {
      title: "What is CSS Box Shadow?",
      content:
        "The CSS box-shadow property adds shadow effects around an element's frame. You can set multiple shadows separated by commas. Each shadow is described by horizontal and vertical offsets, blur and spread radius, color, and whether it's inset.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Box shadows are defined by several values: horizontal offset (positive moves right), vertical offset (positive moves down), blur radius (larger means more blur), spread radius (positive expands, negative shrinks), and color with opacity.
          </p>

          <h4 className="text-base font-semibold mb-2">Shadow Properties</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Horizontal:</strong> X-axis offset (positive = right)</li>
            <li><strong>Vertical:</strong> Y-axis offset (positive = down)</li>
            <li><strong>Blur:</strong> How much the shadow is blurred</li>
            <li><strong>Spread:</strong> How much the shadow expands/shrinks</li>
            <li><strong>Inset:</strong> Creates inner shadow instead of outer</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Subtle shadow",
      content: "box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);",
      type: "code",
    },
    {
      title: "Medium elevation",
      content: "box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);",
      type: "code",
    },
    {
      title: "Inset shadow",
      content: "box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06);",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - generates CSS box-shadow strings

interface Shadow {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return \`rgba(\${r}, \${g}, \${b}, \${opacity})\`;
  }
  return \`rgba(0, 0, 0, \${opacity})\`;
}

function generateBoxShadow(shadows: Shadow[]): string {
  return shadows
    .map((shadow) => {
      const insetStr = shadow.inset ? 'inset ' : '';
      const color = hexToRgba(shadow.color, shadow.opacity);
      return \`\${insetStr}\${shadow.horizontal}px \${shadow.vertical}px \${shadow.blur}px \${shadow.spread}px \${color}\`;
    })
    .join(', ');
}

// Preset shadows
const presets = {
  subtle: [
    { horizontal: 0, vertical: 1, blur: 3, spread: 0, color: '#000000', opacity: 0.1, inset: false },
    { horizontal: 0, vertical: 1, blur: 2, spread: -1, color: '#000000', opacity: 0.1, inset: false },
  ],
  medium: [
    { horizontal: 0, vertical: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false },
    { horizontal: 0, vertical: 2, blur: 4, spread: -2, color: '#000000', opacity: 0.1, inset: false },
  ],
  large: [
    { horizontal: 0, vertical: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false },
    { horizontal: 0, vertical: 4, blur: 6, spread: -4, color: '#000000', opacity: 0.1, inset: false },
  ],
};

// Example usage
console.log('Subtle shadow:');
console.log(\`box-shadow: \${generateBoxShadow(presets.subtle)};\`);

console.log('\\nMedium shadow:');
console.log(\`box-shadow: \${generateBoxShadow(presets.medium)};\`);

console.log('\\nLarge shadow:');
console.log(\`box-shadow: \${generateBoxShadow(presets.large)};\`);

// Output:
// Subtle shadow:
// box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1);
//
// Medium shadow:
// box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1);
//
// Large shadow:
// box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1);`,
  references: [
    {
      title: "MDN: box-shadow",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow",
    },
    {
      title: "CSS-Tricks: box-shadow",
      url: "https://css-tricks.com/almanac/properties/b/box-shadow/",
    },
  ],
};
