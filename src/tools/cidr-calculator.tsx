"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

interface CidrInfo {
  cidr: string;
  startIp: string;
  endIp: string;
  subnetMask: string;
  totalAddresses: number;
  usableHosts: number;
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  for (const part of parts) {
    const num = parseInt(part);
    if (isNaN(num) || num < 0 || num > 255) return false;
  }
  return true;
}

function cidrToRange(cidr: string): { start: string; end: string; mask: string; total: number } | null {
  const parts = cidr.split("/");
  if (parts.length !== 2) return null;

  const ip = parts[0].trim();
  const prefix = parseInt(parts[1]);

  if (!isValidIp(ip) || isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const ipNum = ipToNumber(ip);
  const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;

  return {
    start: numberToIp(networkNum),
    end: numberToIp(broadcastNum),
    mask: numberToIp(maskNum),
    total: Math.pow(2, 32 - prefix),
  };
}

function rangeToCidr(startIp: string, endIp: string): CidrInfo[] {
  if (!isValidIp(startIp) || !isValidIp(endIp)) return [];

  const start = ipToNumber(startIp);
  const end = ipToNumber(endIp);

  if (start > end) return [];

  const cidrs: CidrInfo[] = [];
  let current = start;

  while (current <= end) {
    let maxSize = 32;

    // Find the largest block that fits
    while (maxSize > 0) {
      const mask = (~0 << (32 - (maxSize - 1))) >>> 0;
      const network = (current & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;

      if (network === current && broadcast <= end) {
        maxSize--;
      } else {
        break;
      }
    }

    const mask = maxSize === 32 ? 0xffffffff : (~0 << (32 - maxSize)) >>> 0;
    const broadcast = (current | (~mask >>> 0)) >>> 0;
    const total = Math.pow(2, 32 - maxSize);

    cidrs.push({
      cidr: `${numberToIp(current)}/${maxSize}`,
      startIp: numberToIp(current),
      endIp: numberToIp(broadcast),
      subnetMask: numberToIp(mask),
      totalAddresses: total,
      usableHosts: maxSize >= 31 ? total : total - 2,
    });

    current = broadcast + 1;
    if (current === 0) break; // Overflow check
  }

  return cidrs;
}

function splitCidr(cidr: string, newPrefix: number): CidrInfo[] {
  const parts = cidr.split("/");
  if (parts.length !== 2) return [];

  const ip = parts[0].trim();
  const prefix = parseInt(parts[1]);

  if (!isValidIp(ip) || isNaN(prefix) || prefix < 0 || prefix > 32) return [];
  if (newPrefix <= prefix || newPrefix > 32) return [];

  const result: CidrInfo[] = [];
  const numSubnets = Math.pow(2, newPrefix - prefix);
  const subnetSize = Math.pow(2, 32 - newPrefix);

  const baseNum = ipToNumber(ip);
  const baseMask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const baseNetwork = (baseNum & baseMask) >>> 0;

  for (let i = 0; i < numSubnets; i++) {
    const networkNum = baseNetwork + i * subnetSize;
    const broadcastNum = networkNum + subnetSize - 1;
    const mask = newPrefix === 0 ? 0 : (~0 << (32 - newPrefix)) >>> 0;

    result.push({
      cidr: `${numberToIp(networkNum)}/${newPrefix}`,
      startIp: numberToIp(networkNum),
      endIp: numberToIp(broadcastNum),
      subnetMask: numberToIp(mask),
      totalAddresses: subnetSize,
      usableHosts: newPrefix >= 31 ? subnetSize : subnetSize - 2,
    });
  }

  return result;
}

export function CidrCalculatorTool() {
  const t = useTranslations("toolUI.cidr-calculator");
  // CIDR to Range
  const [cidrInput, setCidrInput] = useState("");
  const [cidrResult, setCidrResult] = useState<{ start: string; end: string; mask: string; total: number } | null>(null);

  // Range to CIDR
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeResult, setRangeResult] = useState<CidrInfo[]>([]);

  // Split CIDR
  const [splitInput, setSplitInput] = useState("");
  const [splitPrefix, setSplitPrefix] = useState("");
  const [splitResult, setSplitResult] = useState<CidrInfo[]>([]);

  const [error, setError] = useState("");

  const handleCidrToRange = () => {
    setError("");
    setCidrResult(null);

    const result = cidrToRange(cidrInput);
    if (!result) {
      setError(t("errInvalidCidr"));
      return;
    }

    setCidrResult(result);
  };

  const handleRangeToCidr = () => {
    setError("");
    setRangeResult([]);

    if (!rangeStart || !rangeEnd) {
      setError(t("errEnterRange"));
      return;
    }

    const result = rangeToCidr(rangeStart, rangeEnd);
    if (result.length === 0) {
      setError(t("errInvalidRange"));
      return;
    }

    setRangeResult(result);
  };

  const handleSplitCidr = () => {
    setError("");
    setSplitResult([]);

    const prefix = parseInt(splitPrefix);
    if (isNaN(prefix)) {
      setError(t("errInvalidPrefix"));
      return;
    }

    const result = splitCidr(splitInput, prefix);
    if (result.length === 0) {
      setError(t("errInvalidSplit"));
      return;
    }

    setSplitResult(result);
  };

  const handleReset = () => {
    setCidrInput("");
    setCidrResult(null);
    setRangeStart("");
    setRangeEnd("");
    setRangeResult([]);
    setSplitInput("");
    setSplitPrefix("");
    setSplitResult([]);
    setError("");
  };

  return (
    <div className="space-y-8">
      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* CIDR to Range */}
      <div>
        <div className="text-base font-semibold mb-4">{t("cidrToRangeTitle")}</div>
        <div className="space-y-4">
          <Input
            label={t("cidrNotationLabel")}
            value={cidrInput}
            onChange={(e) => setCidrInput(e.target.value)}
            placeholder="192.168.1.0/24"
            className="font-mono text-sm"
          />
          <Button onClick={handleCidrToRange} variant="primary" className="w-full">
            {t("convertToRange")}
          </Button>

          {cidrResult && (
            <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">{t("startIp")}</Label>
                  <div className="font-mono">{cidrResult.start}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t("endIp")}</Label>
                  <div className="font-mono">{cidrResult.end}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t("subnetMask")}</Label>
                  <div className="font-mono">{cidrResult.mask}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t("totalAddresses")}</Label>
                  <div className="font-mono">{cidrResult.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Range to CIDR */}
      <div>
        <div className="text-base font-semibold mb-4">{t("rangeToCidrTitle")}</div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label={t("startIp")}
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              placeholder="192.168.1.0"
              className="font-mono text-sm"
            />
            <Input
              label={t("endIp")}
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              placeholder="192.168.1.255"
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleRangeToCidr} variant="primary" className="w-full">
            {t("convertToCidr")}
          </Button>

          {rangeResult.length > 0 && (
            <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
              <Label className="text-xs text-muted-foreground mb-2 block">
                {t("cidrBlocks")} ({rangeResult.length})
              </Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {rangeResult.map((cidr, index) => (
                  <div key={index} className="font-mono text-sm p-2 bg-[var(--color-gray-50)] rounded">
                    {cidr.cidr} ({cidr.totalAddresses.toLocaleString()} {t("addresses")})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Split CIDR */}
      <div>
        <div className="text-base font-semibold mb-4">{t("splitTitle")}</div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label={t("cidrToSplitLabel")}
              value={splitInput}
              onChange={(e) => setSplitInput(e.target.value)}
              placeholder="10.0.0.0/16"
              className="font-mono text-sm"
            />
            <Input
              label={t("newPrefixLabel")}
              type="number"
              min="0"
              max="32"
              value={splitPrefix}
              onChange={(e) => setSplitPrefix(e.target.value)}
              placeholder="24"
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleSplitCidr} variant="primary" className="w-full">
            {t("splitSubnet")}
          </Button>

          {splitResult.length > 0 && (
            <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
              <Label className="text-xs text-muted-foreground mb-2 block">
                {t("resultingSubnets")} ({splitResult.length})
              </Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {splitResult.map((cidr, index) => (
                  <div key={index} className="font-mono text-xs p-2 bg-[var(--color-gray-50)] rounded">
                    <div className="font-semibold">{cidr.cidr}</div>
                    <div className="text-muted-foreground">
                      {cidr.startIp} - {cidr.endIp} ({cidr.usableHosts.toLocaleString()} {t("usable")})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} className="w-full">
        {t("resetAll")}
      </Button>

      {/* Quick Reference */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
        <div className="text-sm font-semibold mb-3">{t("quickReference")}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div>/8 = 16.7M hosts</div>
          <div>/16 = 65,534 hosts</div>
          <div>/24 = 254 hosts</div>
          <div>/28 = 14 hosts</div>
          <div>/29 = 6 hosts</div>
          <div>/30 = 2 hosts</div>
          <div>/31 = 2 hosts*</div>
          <div>/32 = 1 host</div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {t("note31")}
        </div>
      </div>
    </div>
  );
}

export const cidrCalculatorConfig: ToolConfig = {
  id: "cidr-calculator",
  name: "CIDR Calculator",
  description: "Convert between CIDR notation and IP ranges, calculate hosts, split subnets",
  category: "utilities",
  component: CidrCalculatorTool,
  seo: {
    keywords: [
      "cidr calculator",
      "cidr to ip range",
      "ip range to cidr",
      "subnet calculator",
      "cidr notation",
      "subnet aggregation",
      "subnet splitting",
      "network calculator",
      "cidr converter",
      "ip range calculator",
      "supernet calculator",
      "cidr block calculator",
    ],
  },
  sections: [
    {
      title: "What is CIDR?",
      content:
        "CIDR (Classless Inter-Domain Routing) is a method for allocating IP addresses and routing. It replaces the old classful network design and allows for more efficient use of IP address space. CIDR notation uses a suffix indicating the number of bits in the network portion (e.g., /24).",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <div className="text-base font-semibold mb-2">CIDR to Range</div>
          <p className="text-sm mb-4">
            Converts CIDR notation to the actual IP range. The prefix length determines how many addresses are in the block. A /24 has 256 addresses (2^8), while a /16 has 65,536 addresses (2^16).
          </p>

          <div className="text-base font-semibold mb-2">Range to CIDR</div>
          <p className="text-sm mb-4">
            Converts an arbitrary IP range into the minimum number of CIDR blocks needed to cover it. Some ranges may require multiple CIDR blocks if they don&apos;t align to power-of-2 boundaries.
          </p>

          <div className="text-base font-semibold mb-2">Subnet Splitting</div>
          <p className="text-sm">
            Divides a larger CIDR block into smaller subnets. For example, splitting a /16 into /24s creates 256 smaller networks. This is useful for network planning and organization.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "CIDR to Range",
      content: "10.0.0.0/8 → 10.0.0.0 - 10.255.255.255 (16,777,216 addresses)",
      type: "code",
    },
    {
      title: "Range to CIDR",
      content: "192.168.0.0 - 192.168.3.255 → 192.168.0.0/22",
      type: "code",
    },
    {
      title: "Split /24 into /26",
      content: "192.168.1.0/24 → 4 x /26 subnets (64 addresses each)",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - pure JavaScript/TypeScript

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

function cidrToRange(cidr: string): { start: string; end: string; total: number } {
  const [ip, prefix] = cidr.split('/');
  const prefixNum = parseInt(prefix);

  const ipNum = ipToNumber(ip);
  const maskNum = prefixNum === 0 ? 0 : (~0 << (32 - prefixNum)) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;

  return {
    start: numberToIp(networkNum),
    end: numberToIp(broadcastNum),
    total: Math.pow(2, 32 - prefixNum),
  };
}

function splitCidr(cidr: string, newPrefix: number): string[] {
  const [ip, prefix] = cidr.split('/');
  const prefixNum = parseInt(prefix);

  if (newPrefix <= prefixNum) return [cidr];

  const result: string[] = [];
  const numSubnets = Math.pow(2, newPrefix - prefixNum);
  const subnetSize = Math.pow(2, 32 - newPrefix);

  const baseNum = ipToNumber(ip);
  const baseMask = prefixNum === 0 ? 0 : (~0 << (32 - prefixNum)) >>> 0;
  const baseNetwork = (baseNum & baseMask) >>> 0;

  for (let i = 0; i < numSubnets; i++) {
    const networkNum = baseNetwork + i * subnetSize;
    result.push(\`\${numberToIp(networkNum)}/\${newPrefix}\`);
  }

  return result;
}

// Example usage
console.log('=== CIDR to Range ===');
const range = cidrToRange('192.168.1.0/24');
console.log(\`192.168.1.0/24 → \${range.start} - \${range.end} (\${range.total} addresses)\`);

console.log('\\n=== Split /24 into /26 ===');
const subnets = splitCidr('192.168.1.0/24', 26);
subnets.forEach(subnet => console.log(subnet));

// Output:
// === CIDR to Range ===
// 192.168.1.0/24 → 192.168.1.0 - 192.168.1.255 (256 addresses)
//
// === Split /24 into /26 ===
// 192.168.1.0/26
// 192.168.1.64/26
// 192.168.1.128/26
// 192.168.1.192/26`,
  references: [
    {
      title: "CIDR - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing",
    },
    {
      title: "RFC 4632 - CIDR",
      url: "https://tools.ietf.org/html/rfc4632",
    },
  ],
};
