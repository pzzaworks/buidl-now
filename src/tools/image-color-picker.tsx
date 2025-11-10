"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";
import { MdContentCopy, MdCheck } from "react-icons/md";

interface PickedColor {
  hex: string;
  rgb: string;
  hsl: string;
}

export function ImageColorPickerTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pickedColor, setPickedColor] = useState<PickedColor | null>(null);
  const [dominantColors, setDominantColors] = useState<PickedColor[]>([]);
  const [error, setError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
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

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const createColorObject = (r: number, g: number, b: number): PickedColor => {
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b),
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setSelectedFile(file);
    setPickedColor(null);
    setDominantColors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;

    const actualX = Math.floor(x * scaleX);
    const actualY = Math.floor(y * scaleY);

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    ctx.drawImage(imageRef.current, 0, 0);

    const imageData = ctx.getImageData(actualX, actualY, 1, 1);
    const [r, g, b] = imageData.data;

    setPickedColor(createColorObject(r, g, b));
  };

  const copyColor = async (hex: string, index: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const extractDominantColors = () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsExtracting(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    ctx.drawImage(imageRef.current, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Sample pixels (every 10th pixel for performance)
    const colorMap = new Map<string, number>();
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const key = `${r},${g},${b}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Get top 5 colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => {
        const [r, g, b] = color.split(",").map(Number);
        return createColorObject(r, g, b);
      });

    setDominantColors(sortedColors);
    setIsExtracting(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImageUrl("");
    setPickedColor(null);
    setDominantColors([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div>
        <Label className="mb-2 block text-sm">Select Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
        />
        <p className="mt-2 text-xs text-white/40">
          Maximum file size: 5MB. Click on the image to pick a color.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {imageUrl && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">
              Click on the image to pick a color
            </Label>
            <div className="border border-white/10 rounded p-4 bg-[#0f0f0f] flex items-center justify-center">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Color picker"
                onClick={handleImageClick}
                className="max-w-full max-h-96 object-contain cursor-crosshair"
              />
            </div>
          </div>

          {/* Extract Dominant Colors Button */}
          <Button
            onClick={extractDominantColors}
            variant="secondary"
            className="w-full"
            disabled={isExtracting}
          >
            {isExtracting ? "Extracting..." : "Extract Dominant Colors"}
          </Button>

          {/* Picked Color Display */}
          {pickedColor && (
            <div className="space-y-3">
              <Label className="text-sm">Picked Color</Label>
              <div className="border border-white/10 rounded overflow-hidden">
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: pickedColor.hex }}
                />
                <div className="p-3 bg-[#0f0f0f] space-y-2">
                  <Input
                    label="HEX"
                    value={pickedColor.hex}
                    readOnly
                    showCopy
                    className="font-mono text-sm bg-black/40"
                  />
                  <Input
                    label="RGB"
                    value={pickedColor.rgb}
                    readOnly
                    showCopy
                    className="font-mono text-sm bg-black/40"
                  />
                  <Input
                    label="HSL"
                    value={pickedColor.hsl}
                    readOnly
                    showCopy
                    className="font-mono text-sm bg-black/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dominant Colors Display */}
          {dominantColors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm">Dominant Colors</Label>
              <div className="grid gap-3">
                {dominantColors.map((color, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded overflow-hidden"
                  >
                    <div
                      className="h-16 w-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-2 bg-[#0f0f0f] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <code className="text-xs font-mono block">{color.hex}</code>
                        <code className="text-xs font-mono text-white/60 block">{color.rgb}</code>
                      </div>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <Button onClick={handleReset} variant="secondary" className="w-full">
            Reset
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export const imageColorPickerConfig: ToolConfig = {
  id: "image-color-picker",
  name: "Image Color Picker",
  description: "Pick colors from images and extract dominant color palettes",
  category: "graphic",
  component: ImageColorPickerTool,
  seo: {
    keywords: [
      "image color picker",
      "color picker from image",
      "extract colors from image",
      "dominant color extractor",
      "color palette generator",
      "eyedropper tool",
      "photo color picker",
      "hex from image",
      "rgb from image",
      "image color analyzer",
      "pick color from picture",
    ],
  },
  sections: [
    {
      title: "What is an Image Color Picker?",
      content:
        "An image color picker tool allows you to extract exact color values from any point in an image. It's useful for web design, graphic design, and creating color palettes from existing images or photographs.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Features</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Point-and-click:</strong> Click anywhere on the image to pick that exact color</li>
            <li><strong>Multiple formats:</strong> Get color values in HEX, RGB, and HSL formats</li>
            <li><strong>Dominant colors:</strong> Extract the most common colors from the entire image</li>
            <li><strong>Copy values:</strong> Easily copy color values for use in your designs</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">How to use this tool?</h4>
          <p className="text-sm">
            Upload an image (max 5MB). Click anywhere on the image to pick the color at that specific point. The tool will display the color values in multiple formats. Use the 'Extract Dominant Colors' button to find the most prevalent colors in the image.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Web Design",
      content: "Extract brand colors from a company logo to use in website design",
      type: "text",
    },
    {
      title: "Color Matching",
      content: "Pick colors from a photo to create matching design elements",
      type: "text",
    },
    {
      title: "Palette Creation",
      content: "Extract dominant colors to build a cohesive color scheme",
      type: "text",
    },
  ],
  codeSnippet: `// npm install canvas
// npm install @types/node --save-dev

import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

async function pickColorFromImage(imagePath: string, x: number, y: number): Promise<RGB> {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(x, y, 1, 1);
  const [r, g, b] = imageData.data;

  return { r, g, b };
}

async function extractDominantColors(imagePath: string, count: number = 5): Promise<RGB[]> {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Sample pixels (every 10th pixel for performance)
  const colorMap = new Map<string, number>();
  for (let i = 0; i < pixels.length; i += 40) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const key = \`\${r},\${g},\${b}\`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Get top N colors
  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return { r, g, b };
    });
}

// Example usage
async function main() {
  const imagePath = './sample-image.jpg'; // Replace with your image path

  // Pick color at specific coordinates
  const color = await pickColorFromImage(imagePath, 100, 50);
  console.log('Color at (100, 50):', rgbToHex(color.r, color.g, color.b));
  console.log(\`RGB: rgb(\${color.r}, \${color.g}, \${color.b})\`);

  // Extract 5 dominant colors
  console.log('\\nExtracting dominant colors...');
  const dominantColors = await extractDominantColors(imagePath, 5);
  dominantColors.forEach((c, i) => {
    console.log(\`Color \${i + 1}: \${rgbToHex(c.r, c.g, c.b)} - rgb(\${c.r}, \${c.g}, \${c.b})\`);
  });
}

main().catch(console.error);

// Output:
// Color at (100, 50): #FF5733
// RGB: rgb(255, 87, 51)
//
// Extracting dominant colors...
// Color 1: #3498DB - rgb(52, 152, 219)
// Color 2: #E74C3C - rgb(231, 76, 60)
// Color 3: #2ECC71 - rgb(46, 204, 113)
// Color 4: #F39C12 - rgb(243, 156, 18)
// Color 5: #9B59B6 - rgb(155, 89, 182)`,
  references: [
    {
      title: "Color Theory Basics",
      url: "https://www.canva.com/colors/color-wheel/",
    },
    {
      title: "HTML Canvas API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
    },
  ],
};
