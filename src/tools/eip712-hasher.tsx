"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Code } from "@/components/ui/code";
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";
import { ToolConfig } from "@/types/tool";

export function Eip712HasherTool() {
  const [domainJson, setDomainJson] = useState("");
  const [typesJson, setTypesJson] = useState("");
  const [messageJson, setMessageJson] = useState("");
  const [primaryType, setPrimaryType] = useState("");

  const [domainSeparator, setDomainSeparator] = useState("");
  const [messageHash, setMessageHash] = useState("");
  const [finalHash, setFinalHash] = useState("");
  const [error, setError] = useState("");

  const handleCalculate = () => {
    if (!domainJson || !typesJson || !messageJson || !primaryType) {
      setError("All fields are required");
      return;
    }

    try {
      const domain = JSON.parse(domainJson);
      const types = JSON.parse(typesJson);
      const message = JSON.parse(messageJson);

      // Calculate domain separator
      const domainTypeHash = keccak256(
        Buffer.from("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
      );

      const domainEncoded = encodeAbiParameters(
        parseAbiParameters("bytes32,bytes32,bytes32,uint256,address"),
        [
          domainTypeHash,
          keccak256(Buffer.from(domain.name)),
          keccak256(Buffer.from(domain.version)),
          BigInt(domain.chainId),
          domain.verifyingContract,
        ]
      );

      const calculatedDomainSeparator = keccak256(domainEncoded);

      // Calculate message hash
      const primaryTypeFields = types[primaryType];
      if (!primaryTypeFields) {
        throw new Error(`Primary type "${primaryType}" not found in types`);
      }

      // Build type string
      const typeString = `${primaryType}(${primaryTypeFields
        .map((f: any) => `${f.type} ${f.name}`)
        .join(",")})`;

      const typeHash = keccak256(Buffer.from(typeString));

      // Encode message values
      const messageTypes = primaryTypeFields.map((f: any) => f.type).join(",");
      const messageValues = primaryTypeFields.map((f: any) => {
        const value = message[f.name];
        // Handle string types by hashing them
        if (f.type === "string") {
          return keccak256(Buffer.from(value));
        }
        return value;
      });

      const messageEncoded = encodeAbiParameters(
        parseAbiParameters(`bytes32,${messageTypes}`),
        [typeHash, ...messageValues]
      );

      const calculatedMessageHash = keccak256(messageEncoded);

      // Calculate final hash: keccak256("\x19\x01" + domainSeparator + messageHash)
      const finalEncoded = `0x1901${calculatedDomainSeparator.slice(2)}${calculatedMessageHash.slice(2)}` as `0x${string}`;
      const calculatedFinalHash = keccak256(Buffer.from(finalEncoded.slice(2), "hex"));

      setDomainSeparator(calculatedDomainSeparator);
      setMessageHash(calculatedMessageHash);
      setFinalHash(calculatedFinalHash);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
      setDomainSeparator("");
      setMessageHash("");
      setFinalHash("");
    }
  };

  const handleReset = () => {
    setDomainJson("");
    setTypesJson("");
    setMessageJson("");
    setPrimaryType("");
    setDomainSeparator("");
    setMessageHash("");
    setFinalHash("");
    setError("");
  };


  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Domain (JSON)</Label>
          <Textarea
            value={domainJson}
            onChange={(e) => setDomainJson(e.target.value)}
            placeholder='{"name":"MyDApp","version":"1","chainId":1,"verifyingContract":"0x..."}'
            className="font-mono min-h-[100px]"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Types (JSON)</Label>
          <Textarea
            value={typesJson}
            onChange={(e) => setTypesJson(e.target.value)}
            placeholder='{"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}]}'
            className="font-mono min-h-[100px]"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Message (JSON)</Label>
          <Textarea
            value={messageJson}
            onChange={(e) => setMessageJson(e.target.value)}
            placeholder='{"name":"Alice","wallet":"0x..."}'
            className="font-mono min-h-[80px]"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Primary Type</Label>
          <Input
            value={primaryType}
            onChange={(e) => setPrimaryType(e.target.value)}
            placeholder="Person"
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCalculate} className="flex-1">
            Calculate Hash
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/30 text-red-400">
          <div className="text-sm font-medium">✗ {error}</div>
        </div>
      )}

      {/* Output Section */}
      {finalHash && (
        <div className="space-y-4">
          <div className="p-4 rounded border border-green-500/30 bg-green-500/10">
            <Label className="mb-2 block text-sm text-green-400">Step 1: Domain Separator</Label>
            <Input
              value={domainSeparator}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          </div>

          <div className="p-4 rounded border border-blue-500/30 bg-blue-500/10">
            <Label className="mb-2 block text-sm text-blue-400">Step 2: Message Hash</Label>
            <Input
              value={messageHash}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
          </div>

          <div className="p-4 rounded border border-purple-500/30 bg-purple-500/10">
            <Label className="mb-2 block text-sm text-purple-400">Step 3: Final EIP-712 Hash</Label>
            <Input
              value={finalHash}
              readOnly
              showCopy
              className="font-mono text-sm bg-[#0f0f0f]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This is the hash that should be signed by the user's wallet
            </p>
          </div>
        </div>
      )}

      {/* Usage Example */}
      {finalHash && (
        <div className="p-4 rounded border border-border bg-[#0f0f0f]">
          <Label className="mb-2 block text-sm">Usage Example (viem)</Label>
          <Code language="javascript">
{`import { signTypedData } from 'viem/accounts';

const signature = await signTypedData({
  domain: ${domainJson},
  types: ${typesJson},
  primaryType: '${primaryType}',
  message: ${messageJson}
});

// The hash that gets signed is: ${finalHash}`}
          </Code>
        </div>
      )}
    </div>
  );
}

export const eip712HasherConfig: ToolConfig = {
  id: "eip712-hasher",
  name: "EIP-712 Message Hasher",
  description: "Calculate EIP-712 hashes for typed structured data signing",
  category: "web3",
  component: Eip712HasherTool,
  seo: {
    keywords: [
      "eip712 hasher",
      "typed data signing",
      "eip712 calculator",
      "ethereum permit signature",
      "eip712 domain separator",
      "structured data hash",
      "metamask sign typed data",
      "eip712 message hash",
      "ethereum signature hash",
      "typed message signing",
    ],
  },
  sections: [
    {
      title: "What is EIP-712?",
      content:
        "EIP-712 is a standard for hashing and signing typed structured data. It provides a way to sign data that is human-readable and secure, commonly used for permit signatures, meta-transactions, and DAO voting.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            EIP-712 hashing involves three steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
            <li>Calculate the domain separator hash</li>
            <li>Calculate the message struct hash</li>
            <li>Combine them: keccak256("\x19\x01" + domainSeparator + messageHash)</li>
          </ol>
          <p className="text-sm">
            The domain separator includes information about the dApp, version, chain ID, and verifying contract to prevent signature replay across different contexts.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "ERC-20 Permit",
      content: `Primary Type: "Permit"
Domain: {"name":"USDC","version":"1","chainId":1,"verifyingContract":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}
Types: {"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]}
Message: {"owner":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","spender":"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D","value":"1000000","nonce":"0","deadline":"1735689600"}`,
      type: "code",
    },
    {
      title: "Meta-transaction",
      content: `Primary Type: "ForwardRequest"
Domain: {"name":"MinimalForwarder","version":"1","chainId":137}
Types: {"ForwardRequest":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"},{"name":"gas","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"data","type":"bytes"}]}
Message: {"from":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","to":"0x1234567890123456789012345678901234567890","value":"0","gas":"100000","nonce":"0","data":"0x"}`,
      type: "code",
    },
    {
      title: "NFT Order (OpenSea-style)",
      content: `Primary Type: "Order"
Domain: {"name":"Seaport","version":"1.0","chainId":1}
Types: {"Order":[{"name":"maker","type":"address"},{"name":"taker","type":"address"},{"name":"price","type":"uint256"},{"name":"tokenId","type":"uint256"}]}
Message: {"maker":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","taker":"0x0000000000000000000000000000000000000000","price":"1000000000000000000","tokenId":"42"}`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { keccak256, encodeAbiParameters, parseAbiParameters } from 'viem';

interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

interface TypedData {
  domain: Domain;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, any>;
}

// Calculate EIP-712 hash
function hashTypedData(data: TypedData): string {
  // Step 1: Calculate domain separator
  const domainTypeHash = keccak256(
    Buffer.from('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
  );

  const domainEncoded = encodeAbiParameters(
    parseAbiParameters('bytes32,bytes32,bytes32,uint256,address'),
    [
      domainTypeHash,
      keccak256(Buffer.from(data.domain.name)),
      keccak256(Buffer.from(data.domain.version)),
      BigInt(data.domain.chainId),
      data.domain.verifyingContract
    ]
  );

  const domainSeparator = keccak256(domainEncoded);

  // Step 2: Calculate message hash
  const primaryTypeFields = data.types[data.primaryType];
  const typeString = \`\${data.primaryType}(\${primaryTypeFields
    .map(f => \`\${f.type} \${f.name}\`)
    .join(',')})\`;

  const typeHash = keccak256(Buffer.from(typeString));

  const messageTypes = primaryTypeFields.map(f => f.type).join(',');
  const messageValues = primaryTypeFields.map(f => {
    const value = data.message[f.name];
    return f.type === 'string' ? keccak256(Buffer.from(value)) : value;
  });

  const messageEncoded = encodeAbiParameters(
    parseAbiParameters(\`bytes32,\${messageTypes}\`),
    [typeHash, ...messageValues]
  );

  const messageHash = keccak256(messageEncoded);

  // Step 3: Calculate final hash
  const finalEncoded = \`0x1901\${domainSeparator.slice(2)}\${messageHash.slice(2)}\` as \`0x\${string}\`;
  return keccak256(Buffer.from(finalEncoded.slice(2), 'hex'));
}

// Example: ERC-20 Permit
const permitData: TypedData = {
  domain: {
    name: 'USDC',
    version: '1',
    chainId: 1,
    verifyingContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  types: {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  },
  primaryType: 'Permit',
  message: {
    owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    spender: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    value: '1000000',
    nonce: '0',
    deadline: '1735689600'
  }
};

const hash = hashTypedData(permitData);
console.log('EIP-712 Hash:', hash);`,
  references: [
    {
      title: "EIP-712 Specification",
      url: "https://eips.ethereum.org/EIPS/eip-712",
    },
    {
      title: "viem: signTypedData",
      url: "https://viem.sh/docs/actions/wallet/signTypedData",
    },
    {
      title: "MetaMask EIP-712 Guide",
      url: "https://docs.metamask.io/wallet/how-to/sign-data/#sign-typed-data-v4",
    },
  ],
};
