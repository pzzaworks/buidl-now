"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

// Punycode constants
const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const DELIMITER = "-";

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  delta = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2);
  delta += Math.floor(delta / numPoints);
  let k = 0;
  while (delta > ((BASE - TMIN) * TMAX) / 2) {
    delta = Math.floor(delta / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
}

function encodeDigit(d: number): string {
  return String.fromCharCode(d + (d < 26 ? 97 : 22));
}

function decodeDigit(cp: number): number {
  if (cp >= 48 && cp <= 57) return cp - 22;
  if (cp >= 65 && cp <= 90) return cp - 65;
  if (cp >= 97 && cp <= 122) return cp - 97;
  return BASE;
}

function encodePunycode(input: string): string {
  const output: string[] = [];
  const inputArray = Array.from(input);

  // Handle basic code points
  for (const char of inputArray) {
    if (char.charCodeAt(0) < 128) {
      output.push(char);
    }
  }

  const basicLength = output.length;
  let handledCpCount = basicLength;

  if (basicLength > 0) {
    output.push(DELIMITER);
  }

  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;

  while (handledCpCount < inputArray.length) {
    let m = Infinity;
    for (const char of inputArray) {
      const cp = char.codePointAt(0)!;
      if (cp >= n && cp < m) {
        m = cp;
      }
    }

    delta += (m - n) * (handledCpCount + 1);
    n = m;

    for (const char of inputArray) {
      const cp = char.codePointAt(0)!;
      if (cp < n) {
        delta++;
      }
      if (cp === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
          if (q < t) break;
          output.push(encodeDigit(t + ((q - t) % (BASE - t))));
          q = Math.floor((q - t) / (BASE - t));
        }
        output.push(encodeDigit(q));
        bias = adapt(delta, handledCpCount + 1, handledCpCount === basicLength);
        delta = 0;
        handledCpCount++;
      }
    }
    delta++;
    n++;
  }

  return output.join("");
}

function decodePunycode(input: string): string {
  const output: number[] = [];

  let basicEnd = input.lastIndexOf(DELIMITER);
  if (basicEnd < 0) basicEnd = 0;

  for (let i = 0; i < basicEnd; i++) {
    const cp = input.charCodeAt(i);
    if (cp >= 128) {
      throw new Error("Invalid Punycode: non-ASCII character in basic portion");
    }
    output.push(cp);
  }

  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;

  for (let inputIdx = basicEnd > 0 ? basicEnd + 1 : 0; inputIdx < input.length; ) {
    const oldi = i;
    let w = 1;

    for (let k = BASE; ; k += BASE) {
      if (inputIdx >= input.length) {
        throw new Error("Invalid Punycode: unexpected end of input");
      }
      const digit = decodeDigit(input.charCodeAt(inputIdx++));
      if (digit >= BASE) {
        throw new Error("Invalid Punycode: invalid digit");
      }
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
    }

    bias = adapt(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i = i % (output.length + 1);

    output.splice(i, 0, n);
    i++;
  }

  return String.fromCodePoint(...output);
}

function toASCII(domain: string): string {
  return domain
    .split(".")
    .map((label) => {
      if (/^[\x00-\x7F]*$/.test(label)) {
        return label;
      }
      return "xn--" + encodePunycode(label.toLowerCase());
    })
    .join(".");
}

function toUnicode(domain: string): string {
  return domain
    .split(".")
    .map((label) => {
      if (label.toLowerCase().startsWith("xn--")) {
        try {
          return decodePunycode(label.slice(4));
        } catch {
          return label;
        }
      }
      return label;
    })
    .join(".");
}

export function PunycodeTool() {
  const t = useTranslations("toolUI.punycode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    if (!input) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(toASCII(input));
      } else {
        setOutput(toUnicode(input));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("conversionFailed"));
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === "encode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("encode");
            setOutput("");
            setError("");
          }}
          className="flex-1"
        >
          {t("encodeTab")}
        </Button>
        <Button
          variant={mode === "decode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("decode");
            setOutput("");
            setError("");
          }}
          className="flex-1"
        >
          {t("decodeTab")}
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          {mode === "encode" ? t("unicodeDomainLabel") : t("punycodeDomainLabel")}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? t("unicodePlaceholder")
              : t("punycodePlaceholder")
          }
          rows={4}
          className="text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {mode === "encode" ? t("encodeButton") : t("decodeButton")}
          </Button>
          <Button onClick={handleReset}>{t("reset")}</Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <Textarea
          label={mode === "encode" ? t("punycodeDomainLabel") : t("unicodeDomainLabel")}
          value={output}
          readOnly
          showCopy
          className="bg-[var(--color-gray-0)] text-sm"
          rows={4}
        />
      )}
    </div>
  );
}

export const punycodeConfig: ToolConfig = {
  id: "punycode",
  name: "Punycode Encoder/Decoder",
  description:
    "Encode and decode Punycode for internationalized domain names (IDN)",
  category: "encoders-decoders",
  component: PunycodeTool,
  seo: {
    keywords: [
      "punycode encoder",
      "punycode decoder",
      "punycode converter",
      "idn converter",
      "internationalized domain name",
      "unicode to punycode",
      "punycode to unicode",
      "xn-- domain",
      "punycode online",
      "idn encoder",
      "domain name converter",
      "unicode domain converter",
    ],
  },
  sections: [
    {
      title: "What is Punycode?",
      content:
        "Punycode is a way to represent Unicode characters using only the limited ASCII subset (letters, digits, and hyphens) permitted in domain names. It allows internationalized domain names (IDNs) containing non-ASCII characters like Chinese, Arabic, or accented letters to be used in the DNS system.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">The ACE Prefix</h4>
          <p className="text-sm mb-4">
            Punycode-encoded labels are identified by the ASCII Compatible
            Encoding (ACE) prefix &quot;xn--&quot;. For example, the German city
            &quot;Munchen&quot; becomes &quot;xn--mnchen-3ya&quot; in Punycode.
          </p>

          <h4 className="text-base font-semibold mb-2">Encoding Process</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>ASCII characters are kept as-is at the beginning</li>
            <li>
              Non-ASCII characters are encoded using a variable-length encoding
            </li>
            <li>A delimiter (-) separates ASCII from encoded portions</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Registering internationalized domain names</li>
            <li>Converting Unicode URLs for email or DNS</li>
            <li>Debugging IDN-related issues</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "German domain",
      content: "munchen.de -> xn--mnchen-3ya.de",
      type: "code",
    },
    {
      title: "Chinese domain",
      content: "example.com -> example.xn--fiqs8s",
      type: "code",
    },
    {
      title: "Japanese domain",
      content: "nihon.jp -> xn--wgv71a.jp",
      type: "code",
    },
  ],
  codeSnippet: `// Punycode encoding/decoding for internationalized domains

function toASCII(domain: string): string {
  // Convert each label of the domain
  return domain.split('.').map(label => {
    // If already ASCII, return as-is
    if (/^[\\x00-\\x7F]*$/.test(label)) {
      return label;
    }
    // Otherwise encode with xn-- prefix
    return 'xn--' + encodePunycode(label.toLowerCase());
  }).join('.');
}

function toUnicode(domain: string): string {
  return domain.split('.').map(label => {
    if (label.toLowerCase().startsWith('xn--')) {
      return decodePunycode(label.slice(4));
    }
    return label;
  }).join('.');
}

// Example usage
const unicodeDomain = "munchen.de";
const punycode = toASCII(unicodeDomain);
console.log(\`Encoded: \${punycode}\`); // xn--mnchen-3ya.de

const decoded = toUnicode(punycode);
console.log(\`Decoded: \${decoded}\`); // munchen.de

// International examples
console.log(toASCII("example.cn")); // example.xn--fiqs8s
console.log(toASCII("cafe.fr")); // xn--caf-dma.fr`,
  references: [
    {
      title: "RFC 3492 - Punycode",
      url: "https://datatracker.ietf.org/doc/html/rfc3492",
    },
    {
      title: "Wikipedia: Punycode",
      url: "https://en.wikipedia.org/wiki/Punycode",
    },
    {
      title: "ICANN: IDN Guidelines",
      url: "https://www.icann.org/resources/pages/idn-guidelines-2012-02-28-en",
    },
  ],
};
