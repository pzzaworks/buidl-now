"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdContentCopy, MdCheck } from "react-icons/md";

export function SvgViewerTool() {
  const [svgCode, setSvgCode] = useState("");
  const [width, setWidth] = useState("300");
  const [height, setHeight] = useState("300");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const validateSvg = (code: string): boolean => {
    if (!code.trim()) {
      setError("Please enter SVG code");
      return false;
    }

    // Basic SVG validation
    if (!code.trim().includes("<svg")) {
      setError("Invalid SVG: Must contain <svg> tag");
      return false;
    }

    setError("");
    return true;
  };

  const handleReset = () => {
    setSvgCode("");
    setWidth("300");
    setHeight("300");
    setError("");
  };

  const loadSampleSvg = () => {
    const sample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="80" fill="#4F46E5" />
  <circle cx="80" cy="80" r="10" fill="#fff" />
  <circle cx="120" cy="80" r="10" fill="#fff" />
  <path d="M 70 120 Q 100 140 130 120" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;
    setSvgCode(sample);
    setError("");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* SVG Code Input */}
      <Textarea
        label="SVG Code"
        value={svgCode}
        onChange={(e) => setSvgCode(e.target.value)}
        placeholder="Paste your SVG markup here..."
        rows={8}
        className="font-mono text-sm"
      />

      {/* Preview Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-sm">Preview Width (px)</Label>
          <Input
            type="number"
            min="100"
            max="800"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="300"
          />
        </div>
        <div>
          <Label className="mb-2 block text-sm">Preview Height (px)</Label>
          <Input
            type="number"
            min="100"
            max="800"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="300"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={loadSampleSvg} variant="secondary" className="flex-1">
          Load Sample SVG
        </Button>
        <Button onClick={handleReset} variant="secondary" className="flex-1">
          Reset
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* SVG Preview */}
      {svgCode && validateSvg(svgCode) && (
        <div className="space-y-4">
          {/* Rendered Preview */}
          <div>
            <Label className="mb-2 block text-sm">SVG Preview</Label>
            <div
              className="border border-white/10 rounded p-6 bg-white/5 flex items-center justify-center"
              style={{
                minHeight: `${parseInt(height) || 300}px`,
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: svgCode }}
                style={{
                  maxWidth: `${parseInt(width) || 300}px`,
                  maxHeight: `${parseInt(height) || 300}px`,
                }}
              />
            </div>
          </div>

          {/* Code View with Syntax Highlighting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">SVG Code</Label>
              <Button
                onClick={handleCopy}
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <MdCheck className="w-4 h-4 text-blue-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <MdContentCopy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </Button>
            </div>
            <div className="border border-white/10 rounded overflow-hidden">
              <SyntaxHighlighter
                language="xml"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "0.875rem",
                  background: "#0f0f0f",
                }}
                showLineNumbers
              >
                {svgCode}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* SVG Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#0f0f0f] border border-white/10 rounded">
              <Label className="text-xs text-white/60 mb-1 block">Code Length</Label>
              <p className="text-sm font-mono">{svgCode.length} characters</p>
            </div>
            <div className="p-3 bg-[#0f0f0f] border border-white/10 rounded">
              <Label className="text-xs text-white/60 mb-1 block">File Size</Label>
              <p className="text-sm font-mono">
                {(new Blob([svgCode]).size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const svgViewerConfig: ToolConfig = {
  id: "svg-viewer",
  name: "SVG Viewer",
  description: "View and preview SVG code with syntax highlighting",
  category: "graphic",
  component: SvgViewerTool,
  seo: {
    keywords: [
      "svg viewer",
      "view svg online",
      "svg preview",
      "svg display tool",
      "svg code viewer",
      "preview svg",
      "svg renderer",
      "svg visualizer",
      "svg inspector",
      "svg syntax highlighter",
      "view svg code",
    ],
  },
  sections: [
    {
      title: "What is SVG?",
      content:
        "SVG (Scalable Vector Graphics) is an XML-based vector image format for two-dimensional graphics. Unlike raster images, SVGs can be scaled to any size without losing quality, making them ideal for logos, icons, and illustrations.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">Paste your SVG code into the textarea. The tool will render a live preview and display the code with syntax highlighting. Adjust the preview dimensions to see how the SVG scales. Use the Copy button to copy the SVG code for use in your projects.</p>

          <h4 className="text-base font-semibold mb-2">SVG Advantages</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Scalability:</strong> Looks sharp at any size or resolution</li>
            <li><strong>Small file size:</strong> Typically smaller than equivalent raster images</li>
            <li><strong>Editable:</strong> Can be styled and animated with CSS/JavaScript</li>
            <li><strong>Accessibility:</strong> Searchable and indexable by search engines</li>
            <li><strong>Performance:</strong> No pixelation on high-DPI displays</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple circle",
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>`,
      type: "code",
    },
    {
      title: "Path element",
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M10 10 L90 90" stroke="red" stroke-width="2"/>
</svg>`,
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - SVG is native to browsers

// Create an SVG programmatically
function createSvg(width: number, height: number): string {
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${width} \${height}" width="\${width}" height="\${height}">
  <!-- Add your SVG elements here -->
</svg>\`;
}

// Example: Create a circle SVG
function createCircleSvg(radius: number, color: string): string {
  const size = radius * 2 + 20;
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${size} \${size}" width="\${size}" height="\${size}">
  <circle cx="\${size / 2}" cy="\${size / 2}" r="\${radius}" fill="\${color}" />
</svg>\`;
}

// Example: Create a smiley face SVG
function createSmileyFaceSvg(): string {
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Face -->
  <circle cx="100" cy="100" r="80" fill="#FFD700" stroke="#FFA500" stroke-width="3"/>

  <!-- Left eye -->
  <circle cx="75" cy="85" r="8" fill="#000"/>

  <!-- Right eye -->
  <circle cx="125" cy="85" r="8" fill="#000"/>

  <!-- Smile -->
  <path d="M 70 120 Q 100 140 130 120" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>\`;
}

// Validate SVG
function validateSvg(svgCode: string): boolean {
  return svgCode.includes('<svg') && svgCode.includes('</svg>');
}

// Example usage
const circleSvg = createCircleSvg(50, '#4F46E5');
console.log('Circle SVG:');
console.log(circleSvg);

const smileyFace = createSmileyFaceSvg();
console.log('\\nSmiley Face SVG:');
console.log(smileyFace);

console.log('\\nIs valid SVG:', validateSvg(smileyFace));

// Output:
// Circle SVG:
// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
//   <circle cx="60" cy="60" r="50" fill="#4F46E5" />
// </svg>
//
// Smiley Face SVG:
// (Full SVG markup with face, eyes, and smile)
//
// Is valid SVG: true`,
  references: [
    {
      title: "SVG Tutorial - MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial",
    },
    {
      title: "SVG Specification",
      url: "https://www.w3.org/Graphics/SVG/",
    },
  ],
};
