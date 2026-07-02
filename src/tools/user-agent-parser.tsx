"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";

interface ParsedUserAgent {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: string;
    vendor: string;
    model: string;
  };
  engine: {
    name: string;
    version: string;
  };
  raw: string;
}

function parseUserAgent(ua: string): ParsedUserAgent {
  const result: ParsedUserAgent = {
    browser: { name: "Unknown", version: "" },
    os: { name: "Unknown", version: "" },
    device: { type: "Desktop", vendor: "", model: "" },
    engine: { name: "Unknown", version: "" },
    raw: ua,
  };

  if (!ua) return result;

  // Detect Browser
  if (ua.includes("Firefox/")) {
    result.browser.name = "Firefox";
    const match = ua.match(/Firefox\/(\d+\.?\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes("Edg/")) {
    result.browser.name = "Microsoft Edge";
    const match = ua.match(/Edg\/(\d+\.?\d*\.?\d*\.?\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes("Chrome/")) {
    result.browser.name = "Chrome";
    const match = ua.match(/Chrome\/(\d+\.?\d*\.?\d*\.?\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    result.browser.name = "Safari";
    const match = ua.match(/Version\/(\d+\.?\d*\.?\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes("Opera/") || ua.includes("OPR/")) {
    result.browser.name = "Opera";
    const match = ua.match(/(?:Opera|OPR)\/(\d+\.?\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes("MSIE") || ua.includes("Trident/")) {
    result.browser.name = "Internet Explorer";
    const match = ua.match(/(?:MSIE |rv:)(\d+\.?\d*)/);
    if (match) result.browser.version = match[1];
  }

  // Detect OS
  if (ua.includes("Windows NT 10")) {
    result.os.name = "Windows";
    result.os.version = "10/11";
  } else if (ua.includes("Windows NT 6.3")) {
    result.os.name = "Windows";
    result.os.version = "8.1";
  } else if (ua.includes("Windows NT 6.2")) {
    result.os.name = "Windows";
    result.os.version = "8";
  } else if (ua.includes("Windows NT 6.1")) {
    result.os.name = "Windows";
    result.os.version = "7";
  } else if (ua.includes("Windows")) {
    result.os.name = "Windows";
  } else if (ua.includes("Mac OS X")) {
    result.os.name = "macOS";
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (match) result.os.version = match[1].replace(/_/g, ".");
  } else if (ua.includes("Android")) {
    result.os.name = "Android";
    const match = ua.match(/Android (\d+\.?\d*\.?\d*)/);
    if (match) result.os.version = match[1];
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    result.os.name = "iOS";
    const match = ua.match(/OS (\d+[._]\d+[._]?\d*)/);
    if (match) result.os.version = match[1].replace(/_/g, ".");
  } else if (ua.includes("Linux")) {
    result.os.name = "Linux";
    if (ua.includes("Ubuntu")) {
      result.os.name = "Ubuntu";
    } else if (ua.includes("Fedora")) {
      result.os.name = "Fedora";
    } else if (ua.includes("Debian")) {
      result.os.name = "Debian";
    }
  } else if (ua.includes("CrOS")) {
    result.os.name = "Chrome OS";
  }

  // Detect Device Type
  if (ua.includes("Mobile") || ua.includes("Android") && !ua.includes("Tablet")) {
    if (ua.includes("iPhone")) {
      result.device.type = "Mobile";
      result.device.vendor = "Apple";
      result.device.model = "iPhone";
    } else if (ua.includes("Android")) {
      result.device.type = "Mobile";
      const match = ua.match(/;\s*([^;]+)\s*Build/);
      if (match) {
        result.device.model = match[1].trim();
        if (match[1].includes("Samsung") || match[1].includes("SM-")) {
          result.device.vendor = "Samsung";
        } else if (match[1].includes("Pixel")) {
          result.device.vendor = "Google";
        } else if (match[1].includes("Xiaomi") || match[1].includes("Redmi")) {
          result.device.vendor = "Xiaomi";
        }
      }
    } else {
      result.device.type = "Mobile";
    }
  } else if (ua.includes("iPad") || ua.includes("Tablet") || (ua.includes("Android") && !ua.includes("Mobile"))) {
    result.device.type = "Tablet";
    if (ua.includes("iPad")) {
      result.device.vendor = "Apple";
      result.device.model = "iPad";
    }
  } else if (ua.includes("TV") || ua.includes("SmartTV")) {
    result.device.type = "Smart TV";
  } else {
    result.device.type = "Desktop";
  }

  // Detect Engine
  if (ua.includes("Gecko/")) {
    result.engine.name = "Gecko";
    const match = ua.match(/rv:(\d+\.?\d*)/);
    if (match) result.engine.version = match[1];
  } else if (ua.includes("AppleWebKit/")) {
    result.engine.name = "WebKit";
    const match = ua.match(/AppleWebKit\/(\d+\.?\d*)/);
    if (match) result.engine.version = match[1];
  } else if (ua.includes("Trident/")) {
    result.engine.name = "Trident";
    const match = ua.match(/Trident\/(\d+\.?\d*)/);
    if (match) result.engine.version = match[1];
  } else if (ua.includes("Presto/")) {
    result.engine.name = "Presto";
    const match = ua.match(/Presto\/(\d+\.?\d*)/);
    if (match) result.engine.version = match[1];
  }

  return result;
}

export function UserAgentParserTool() {
  const t = useTranslations("toolUI.user-agent-parser");
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedUserAgent | null>(null);
  const [currentUserAgent, setCurrentUserAgent] = useState("");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setCurrentUserAgent(navigator.userAgent);
    }
  }, []);

  const handleParse = () => {
    if (!input.trim()) {
      setParsed(null);
      return;
    }
    setParsed(parseUserAgent(input.trim()));
  };

  const handleUseCurrentUserAgent = () => {
    setInput(currentUserAgent);
    setParsed(parseUserAgent(currentUserAgent));
  };

  const handleReset = () => {
    setInput("");
    setParsed(null);
  };

  return (
    <div className="space-y-6">
      {/* Current Browser Info */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
        <div className="text-sm text-muted-foreground mb-1">{t("currentUaLabel")}</div>
        <div className="font-mono text-xs break-all">{currentUserAgent || t("loading")}</div>
        <Button onClick={handleUseCurrentUserAgent} variant="primary" className="mt-3">
          {t("parseMine")}
        </Button>
      </div>

      {/* Input */}
      <div>
        <Label className="mb-2 block text-sm">{t("uaStringLabel")}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("uaPlaceholder")}
          className="min-h-[100px] font-mono text-xs"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleParse} variant="primary" className="flex-1">
          {t("parse")}
        </Button>
        <Button onClick={handleReset}>{t("reset")}</Button>
      </div>

      {/* Parsed Results */}
      {parsed && (
        <div className="space-y-4">
          {/* Browser */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm font-semibold mb-3">{t("browser")}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("name")}</Label>
                <div className="font-mono">{parsed.browser.name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("version")}</Label>
                <div className="font-mono">{parsed.browser.version || t("na")}</div>
              </div>
            </div>
          </div>

          {/* Operating System */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm font-semibold mb-3">{t("operatingSystem")}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("name")}</Label>
                <div className="font-mono">{parsed.os.name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("version")}</Label>
                <div className="font-mono">{parsed.os.version || t("na")}</div>
              </div>
            </div>
          </div>

          {/* Device */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm font-semibold mb-3">{t("device")}</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("type")}</Label>
                <div className="font-mono">{parsed.device.type}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("vendor")}</Label>
                <div className="font-mono">{parsed.device.vendor || t("na")}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("model")}</Label>
                <div className="font-mono">{parsed.device.model || t("na")}</div>
              </div>
            </div>
          </div>

          {/* Engine */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm font-semibold mb-3">{t("renderingEngine")}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("name")}</Label>
                <div className="font-mono">{parsed.engine.name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("version")}</Label>
                <div className="font-mono">{parsed.engine.version || t("na")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Common User-Agent Examples */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
        <div className="text-sm font-semibold mb-3">{t("exampleUas")}</div>
        <div className="space-y-2 text-xs">
          <button
            onClick={() => {
              const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
              setInput(ua);
              setParsed(parseUserAgent(ua));
            }}
            className="w-full text-left p-2 bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] rounded cursor-pointer transition-colors"
          >
            <div className="font-semibold">Chrome on Windows</div>
            <div className="text-muted-foreground truncate">Chrome 120 / Windows 10/11</div>
          </button>
          <button
            onClick={() => {
              const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
              setInput(ua);
              setParsed(parseUserAgent(ua));
            }}
            className="w-full text-left p-2 bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] rounded cursor-pointer transition-colors"
          >
            <div className="font-semibold">Safari on iPhone</div>
            <div className="text-muted-foreground truncate">Safari 17 / iOS 17</div>
          </button>
          <button
            onClick={() => {
              const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
              setInput(ua);
              setParsed(parseUserAgent(ua));
            }}
            className="w-full text-left p-2 bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] rounded cursor-pointer transition-colors"
          >
            <div className="font-semibold">Chrome on macOS</div>
            <div className="text-muted-foreground truncate">Chrome 120 / macOS 10.15</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export const userAgentParserConfig: ToolConfig = {
  id: "user-agent-parser",
  name: "User Agent Parser",
  description: "Parse User-Agent strings to extract browser, OS, and device information",
  category: "utilities",
  component: UserAgentParserTool,
  seo: {
    keywords: [
      "user agent parser",
      "user agent analyzer",
      "browser detector",
      "os detector",
      "device detector",
      "user agent string",
      "parse user agent",
      "browser detection",
      "mobile detection",
      "user agent lookup",
      "browser version",
      "operating system detection",
    ],
  },
  sections: [
    {
      title: "What is a User-Agent?",
      content:
        "A User-Agent is a string that web browsers and other applications send to web servers to identify themselves. It contains information about the browser, operating system, device type, and rendering engine. Web servers use this information to deliver content optimized for the user's device.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <div className="text-base font-semibold mb-2">User-Agent Components</div>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Browser:</strong> The web browser name and version (Chrome, Firefox, Safari, etc.)</li>
            <li><strong>Operating System:</strong> The OS name and version (Windows, macOS, Android, iOS)</li>
            <li><strong>Device Type:</strong> Whether it&apos;s a desktop, mobile, tablet, or other device</li>
            <li><strong>Rendering Engine:</strong> The engine used to render web pages (WebKit, Gecko, Blink)</li>
          </ul>

          <div className="text-base font-semibold mb-2">Common Use Cases</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Responsive design testing</li>
            <li>Browser compatibility analysis</li>
            <li>Mobile device detection</li>
            <li>Analytics and tracking</li>
            <li>Debugging browser-specific issues</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Chrome on Windows",
      content: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      type: "code",
    },
    {
      title: "Safari on iPhone",
      content: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1",
      type: "code",
    },
    {
      title: "Firefox on Linux",
      content: "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - pure JavaScript/TypeScript

interface ParsedUserAgent {
  browser: { name: string; version: string };
  os: { name: string; version: string };
  device: { type: string };
  engine: { name: string; version: string };
}

function parseUserAgent(ua: string): ParsedUserAgent {
  const result: ParsedUserAgent = {
    browser: { name: 'Unknown', version: '' },
    os: { name: 'Unknown', version: '' },
    device: { type: 'Desktop' },
    engine: { name: 'Unknown', version: '' },
  };

  // Detect Browser
  if (ua.includes('Firefox/')) {
    result.browser.name = 'Firefox';
    const match = ua.match(/Firefox\\/(\\d+\\.?\\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes('Edg/')) {
    result.browser.name = 'Edge';
    const match = ua.match(/Edg\\/(\\d+\\.?\\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes('Chrome/')) {
    result.browser.name = 'Chrome';
    const match = ua.match(/Chrome\\/(\\d+\\.?\\d*)/);
    if (match) result.browser.version = match[1];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    result.browser.name = 'Safari';
    const match = ua.match(/Version\\/(\\d+\\.?\\d*)/);
    if (match) result.browser.version = match[1];
  }

  // Detect OS
  if (ua.includes('Windows')) {
    result.os.name = 'Windows';
  } else if (ua.includes('Mac OS X')) {
    result.os.name = 'macOS';
  } else if (ua.includes('Android')) {
    result.os.name = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    result.os.name = 'iOS';
  } else if (ua.includes('Linux')) {
    result.os.name = 'Linux';
  }

  // Detect Device Type
  if (ua.includes('Mobile') || ua.includes('iPhone')) {
    result.device.type = 'Mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    result.device.type = 'Tablet';
  }

  // Detect Engine
  if (ua.includes('Gecko/')) {
    result.engine.name = 'Gecko';
  } else if (ua.includes('AppleWebKit/')) {
    result.engine.name = 'WebKit';
  }

  return result;
}

// Example usage
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
const parsed = parseUserAgent(ua);

console.log('Browser:', parsed.browser.name, parsed.browser.version);
console.log('OS:', parsed.os.name);
console.log('Device:', parsed.device.type);
console.log('Engine:', parsed.engine.name);

// Output:
// Browser: Chrome 120.0.0.0
// OS: Windows
// Device: Desktop
// Engine: WebKit`,
  references: [
    {
      title: "User-Agent - MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent",
    },
    {
      title: "User Agent String - Wikipedia",
      url: "https://en.wikipedia.org/wiki/User_agent",
    },
  ],
};
