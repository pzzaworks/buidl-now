"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface SubnetInfo {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  binarySubnetMask: string;
  binaryIpAddress: string;
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

function ipToBinary(ip: string): string {
  return ip
    .split(".")
    .map((octet) => parseInt(octet).toString(2).padStart(8, "0"))
    .join(".");
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function getIpType(ip: string): string {
  const parts = ip.split(".").map(Number);

  // Check for private ranges
  if (parts[0] === 10) return "Private (10.0.0.0/8)";
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return "Private (172.16.0.0/12)";
  if (parts[0] === 192 && parts[1] === 168) return "Private (192.168.0.0/16)";
  if (parts[0] === 127) return "Loopback";
  if (parts[0] === 169 && parts[1] === 254) return "Link-local";
  if (parts[0] >= 224 && parts[0] <= 239) return "Multicast";
  if (parts[0] >= 240) return "Reserved";

  return "Public";
}

function calculateSubnet(ipAddress: string, cidr: number): SubnetInfo | null {
  // Validate IP
  const ipParts = ipAddress.split(".");
  if (ipParts.length !== 4) return null;

  for (const part of ipParts) {
    const num = parseInt(part);
    if (isNaN(num) || num < 0 || num > 255) return null;
  }

  if (cidr < 0 || cidr > 32) return null;

  const ipNum = ipToNumber(ipAddress);

  // Calculate subnet mask
  const subnetMaskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const wildcardMaskNum = ~subnetMaskNum >>> 0;

  // Calculate network and broadcast addresses
  const networkNum = (ipNum & subnetMaskNum) >>> 0;
  const broadcastNum = (networkNum | wildcardMaskNum) >>> 0;

  // Calculate host range
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

  const firstHostNum = cidr >= 31 ? networkNum : networkNum + 1;
  const lastHostNum = cidr >= 31 ? broadcastNum : broadcastNum - 1;

  return {
    ipAddress,
    cidr,
    subnetMask: numberToIp(subnetMaskNum),
    wildcardMask: numberToIp(wildcardMaskNum),
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    firstHost: numberToIp(firstHostNum),
    lastHost: numberToIp(lastHostNum),
    totalHosts,
    usableHosts,
    ipClass: getIpClass(parseInt(ipParts[0])),
    ipType: getIpType(ipAddress),
    binarySubnetMask: ipToBinary(numberToIp(subnetMaskNum)),
    binaryIpAddress: ipToBinary(ipAddress),
  };
}

export function IpCalculatorTool() {
  const t = useTranslations("toolUI.ip-calculator");
  const [ipInput, setIpInput] = useState("");
  const [cidrInput, setCidrInput] = useState("");
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    setResult(null);

    if (!ipInput) {
      setError(t("errEnterIp"));
      return;
    }

    // Parse CIDR from input or separate field
    let ip = ipInput.trim();
    let cidr = cidrInput ? parseInt(cidrInput) : 24;

    // Check if CIDR is included in IP input
    if (ip.includes("/")) {
      const parts = ip.split("/");
      ip = parts[0];
      cidr = parseInt(parts[1]);
    }

    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      setError(t("errCidrRange"));
      return;
    }

    const calculated = calculateSubnet(ip, cidr);
    if (!calculated) {
      setError(t("errInvalidIp"));
      return;
    }

    setResult(calculated);
  };

  const handleReset = () => {
    setIpInput("");
    setCidrInput("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div>
          <Input
            label={t("ipLabel")}
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="192.168.1.100 or 192.168.1.100/24"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {t("ipHelp")}
          </div>
        </div>

        <div>
          <Input
            label={t("cidrLabel")}
            type="number"
            min="0"
            max="32"
            value={cidrInput}
            onChange={(e) => setCidrInput(e.target.value)}
            placeholder="24"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {t("cidrHelp")}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleCalculate} variant="primary" className="flex-1">
          {t("calculate")}
        </Button>
        <Button onClick={handleReset}>{t("reset")}</Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Main Info */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <h3 className="text-sm font-semibold mb-3">{t("networkInfo")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("ipLabel")}</Label>
                <div className="font-mono">{result.ipAddress}/{result.cidr}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("subnetMask")}</Label>
                <div className="font-mono">{result.subnetMask}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("wildcardMask")}</Label>
                <div className="font-mono">{result.wildcardMask}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("networkAddress")}</Label>
                <div className="font-mono">{result.networkAddress}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("broadcastAddress")}</Label>
                <div className="font-mono">{result.broadcastAddress}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("ipClass")}</Label>
                <div className="font-mono">{t("class")} {result.ipClass}</div>
              </div>
            </div>
          </div>

          {/* Host Range */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <h3 className="text-sm font-semibold mb-3">{t("hostRange")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("firstHost")}</Label>
                <div className="font-mono">{result.firstHost}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("lastHost")}</Label>
                <div className="font-mono">{result.lastHost}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("totalAddresses")}</Label>
                <div className="font-mono">{result.totalHosts.toLocaleString()}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("usableHosts")}</Label>
                <div className="font-mono">{result.usableHosts.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* IP Type */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <h3 className="text-sm font-semibold mb-3">{t("addressType")}</h3>
            <div className="text-sm">
              <span className="px-2 py-1 rounded bg-[var(--color-gray-100)] font-mono">
                {result.ipType}
              </span>
            </div>
          </div>

          {/* Binary Representation */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <h3 className="text-sm font-semibold mb-3">{t("binaryRep")}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t("ipLabel")}</Label>
                <div className="font-mono text-xs break-all">{result.binaryIpAddress}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("subnetMask")}</Label>
                <div className="font-mono text-xs break-all">{result.binarySubnetMask}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ipCalculatorConfig: ToolConfig = {
  id: "ip-calculator",
  name: "IP Address Calculator",
  description: "Calculate subnet information from IP address and CIDR notation",
  category: "utilities",
  component: IpCalculatorTool,
  seo: {
    keywords: [
      "ip calculator",
      "subnet calculator",
      "cidr calculator",
      "ip subnet",
      "network calculator",
      "subnet mask calculator",
      "ip address calculator",
      "ipv4 calculator",
      "network address calculator",
      "broadcast address",
      "host range calculator",
      "wildcard mask",
    ],
  },
  sections: [
    {
      title: "What is IP Subnetting?",
      content:
        "IP subnetting is the practice of dividing a network into smaller, more manageable pieces called subnets. Each subnet has its own network address, broadcast address, and range of usable host addresses. CIDR (Classless Inter-Domain Routing) notation represents subnet masks using a prefix length (e.g., /24).",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Key Concepts</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Network Address:</strong> First address in subnet, identifies the network</li>
            <li><strong>Broadcast Address:</strong> Last address in subnet, used to reach all hosts</li>
            <li><strong>Subnet Mask:</strong> Defines which bits are network vs host bits</li>
            <li><strong>Wildcard Mask:</strong> Inverse of subnet mask, used in ACLs</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common CIDR Prefixes</h4>
          <ul className="list-disc list-inside space-y-1 mb-4 font-mono text-sm">
            <li>/8 = 255.0.0.0 (16,777,214 hosts)</li>
            <li>/16 = 255.255.0.0 (65,534 hosts)</li>
            <li>/24 = 255.255.255.0 (254 hosts)</li>
            <li>/30 = 255.255.255.252 (2 hosts)</li>
            <li>/32 = 255.255.255.255 (1 host)</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Private IP Ranges</h4>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm">
            <li>10.0.0.0/8 (Class A)</li>
            <li>172.16.0.0/12 (Class B)</li>
            <li>192.168.0.0/16 (Class C)</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Home network",
      content: "192.168.1.100/24 → Network: 192.168.1.0, Hosts: 254",
      type: "code",
    },
    {
      title: "Point-to-point link",
      content: "10.0.0.1/30 → Network: 10.0.0.0, Hosts: 2",
      type: "code",
    },
    {
      title: "Large corporate network",
      content: "10.0.0.0/8 → Network: 10.0.0.0, Hosts: 16,777,214",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - pure JavaScript/TypeScript

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
}

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

function calculateSubnet(ip: string, cidr: number): SubnetInfo {
  const ipNum = ipToNumber(ip);
  const subnetMaskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const wildcardMaskNum = ~subnetMaskNum >>> 0;

  const networkNum = (ipNum & subnetMaskNum) >>> 0;
  const broadcastNum = (networkNum | wildcardMaskNum) >>> 0;

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

  return {
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    subnetMask: numberToIp(subnetMaskNum),
    firstHost: numberToIp(cidr >= 31 ? networkNum : networkNum + 1),
    lastHost: numberToIp(cidr >= 31 ? broadcastNum : broadcastNum - 1),
    usableHosts,
  };
}

// Example usage
const result = calculateSubnet('192.168.1.100', 24);
console.log('Network:', result.networkAddress);
console.log('Broadcast:', result.broadcastAddress);
console.log('Subnet Mask:', result.subnetMask);
console.log('Host Range:', result.firstHost, '-', result.lastHost);
console.log('Usable Hosts:', result.usableHosts);

// Output:
// Network: 192.168.1.0
// Broadcast: 192.168.1.255
// Subnet Mask: 255.255.255.0
// Host Range: 192.168.1.1 - 192.168.1.254
// Usable Hosts: 254`,
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
