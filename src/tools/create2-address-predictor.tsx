"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { keccak256, encodePacked, getAddress } from "viem";
import { ToolConfig } from "@/types/tool";

export function Create2AddressPredictorTool() {
  const [deployerAddress, setDeployerAddress] = useState("");
  const [salt, setSalt] = useState("");
  const [initCode, setInitCode] = useState("");
  const [initCodeHash, setInitCodeHash] = useState("");
  const [useInitCodeHash, setUseInitCodeHash] = useState(false);
  const [predictedAddress, setPredictedAddress] = useState("");
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Vanity mode
  const [vanityMode, setVanityMode] = useState(false);
  const [vanityPrefix, setVanityPrefix] = useState("");
  const [vanitySearching, setVanitySearching] = useState(false);
  const [vanityResult, setVanityResult] = useState<{ salt: string; address: string } | null>(null);

  const calculateAddress = () => {
    try {
      setError("");
      setCalculationSteps([]);
      setPredictedAddress("");

      // Validate deployer address
      const validDeployer = getAddress(deployerAddress);

      // Validate salt (must be 32 bytes)
      let saltBytes: `0x${string}`;
      if (salt.startsWith("0x")) {
        saltBytes = salt as `0x${string}`;
        if (saltBytes.length !== 66) {
          throw new Error("Salt must be 32 bytes (66 characters including 0x)");
        }
      } else {
        // Convert number to bytes32
        const saltBigInt = BigInt(salt);
        saltBytes = ("0x" + saltBigInt.toString(16).padStart(64, "0")) as `0x${string}`;
      }

      // Get init code hash
      let codeHash: `0x${string}`;
      const steps: string[] = [];

      if (useInitCodeHash) {
        if (!initCodeHash.startsWith("0x")) {
          throw new Error("Init code hash must start with 0x");
        }
        codeHash = initCodeHash as `0x${string}`;
        steps.push(`Init Code Hash: ${codeHash}`);
      } else {
        if (!initCode) {
          throw new Error("Init code is required");
        }
        if (!initCode.startsWith("0x")) {
          throw new Error("Init code must start with 0x");
        }
        codeHash = keccak256(initCode as `0x${string}`);
        steps.push(`Init Code: ${initCode.slice(0, 66)}...`);
        steps.push(`Init Code Hash: ${codeHash}`);
      }

      steps.push(`Deployer: ${validDeployer}`);
      steps.push(`Salt: ${saltBytes}`);

      // Calculate CREATE2 address
      // address = keccak256(0xff ++ deployer ++ salt ++ keccak256(initCode))[12:]
      const packed = encodePacked(
        ["bytes1", "address", "bytes32", "bytes32"],
        ["0xff", validDeployer as `0x${string}`, saltBytes, codeHash]
      );

      steps.push(`Packed: 0xff ++ deployer ++ salt ++ initCodeHash`);
      steps.push(`Packed result: ${packed}`);

      const hash = keccak256(packed);
      steps.push(`Keccak256(packed): ${hash}`);

      // Take last 20 bytes (40 hex chars) as address
      const address = "0x" + hash.slice(-40);
      const checksumAddress = getAddress(address);

      steps.push(`Take last 20 bytes: ${checksumAddress}`);

      setPredictedAddress(checksumAddress);
      setCalculationSteps(steps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
      setPredictedAddress("");
      setCalculationSteps([]);
    }
  };

  const searchVanityAddress = async () => {
    if (!deployerAddress || !vanityPrefix) {
      setError("Please provide deployer address and desired prefix");
      return;
    }

    if (!/^[0-9a-fA-F]+$/.test(vanityPrefix)) {
      setError("Prefix must be hexadecimal characters only");
      return;
    }

    try {
      setVanitySearching(true);
      setError("");
      setVanityResult(null);

      const validDeployer = getAddress(deployerAddress);
      const targetPrefix = vanityPrefix.toLowerCase();

      // Get init code hash
      let codeHash: `0x${string}`;
      if (useInitCodeHash) {
        if (!initCodeHash.startsWith("0x")) {
          throw new Error("Init code hash must start with 0x");
        }
        codeHash = initCodeHash as `0x${string}`;
      } else {
        if (!initCode) {
          throw new Error("Init code is required");
        }
        codeHash = keccak256(initCode as `0x${string}`);
      }

      // Search for matching salt (limit to 100k attempts in browser)
      const maxAttempts = 100000;
      let found = false;
      let foundSalt = "";
      let foundAddress = "";

      for (let i = 0; i < maxAttempts; i++) {
        const saltBigInt = BigInt(i);
        const saltBytes = ("0x" + saltBigInt.toString(16).padStart(64, "0")) as `0x${string}`;

        const packed = encodePacked(
          ["bytes1", "address", "bytes32", "bytes32"],
          ["0xff", validDeployer as `0x${string}`, saltBytes, codeHash]
        );

        const hash = keccak256(packed);
        const address = hash.slice(-40).toLowerCase();

        if (address.startsWith(targetPrefix)) {
          found = true;
          foundSalt = saltBytes;
          foundAddress = getAddress("0x" + address);
          break;
        }

        // Update UI every 1000 attempts
        if (i % 1000 === 0 && i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      if (found) {
        setVanityResult({ salt: foundSalt, address: foundAddress });
        setSalt(foundSalt);
        setError("");
      } else {
        setError(`No match found in ${maxAttempts.toLocaleString()} attempts. Try a shorter prefix.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vanity search failed");
    } finally {
      setVanitySearching(false);
    }
  };

  const handleReset = () => {
    setDeployerAddress("");
    setSalt("");
    setInitCode("");
    setInitCodeHash("");
    setPredictedAddress("");
    setCalculationSteps([]);
    setError("");
    setVanityMode(false);
    setVanityPrefix("");
    setVanityResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          onClick={() => setVanityMode(false)}
          variant={!vanityMode ? "default" : "secondary"}
          className="flex-1"
        >
          Calculate Address
        </Button>
        <Button
          onClick={() => setVanityMode(true)}
          variant={vanityMode ? "default" : "secondary"}
          className="flex-1"
        >
          Vanity Mode
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">Deployer Address (Factory Contract)</Label>
        <Input
          value={deployerAddress}
          onChange={(e) => setDeployerAddress(e.target.value)}
          placeholder="0x1F98431c8aD98523631AE4a59f267346ea31F984"
          className="font-mono text-sm mb-2"
        />
        <div className="text-xs text-muted-foreground mb-4">
          The address that will call CREATE2 to deploy the contract
        </div>

        {!vanityMode && (
          <>
            <Label className="mb-2 block text-sm">Salt (32 bytes or number)</Label>
            <Input
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder="0 or 0x0000000000000000000000000000000000000000000000000000000000000001"
              className="font-mono text-sm mb-2"
            />
            <div className="text-xs text-muted-foreground mb-4">
              Enter a number (e.g., 0, 1, 123) or full 32-byte hex value
            </div>
          </>
        )}

        {vanityMode && (
          <>
            <Label className="mb-2 block text-sm">Desired Address Prefix (after 0x)</Label>
            <Input
              value={vanityPrefix}
              onChange={(e) => setVanityPrefix(e.target.value)}
              placeholder="dead"
              className="font-mono text-sm mb-2"
            />
            <div className="text-xs text-muted-foreground mb-4">
              Hexadecimal characters only (0-9, a-f). Short prefixes recommended (3-4 chars)
            </div>
          </>
        )}

        <div className="mb-4">
          <Checkbox
            id="useHash"
            checked={useInitCodeHash}
            onChange={(e) => setUseInitCodeHash(e.target.checked)}
            label="I have the init code hash (faster)"
          />
        </div>

        {useInitCodeHash ? (
          <>
            <Label className="mb-2 block text-sm">Init Code Hash (keccak256 of bytecode)</Label>
            <Input
              value={initCodeHash}
              onChange={(e) => setInitCodeHash(e.target.value)}
              placeholder="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
              className="font-mono text-sm mb-2"
            />
            <div className="text-xs text-muted-foreground mb-2">
              32-byte hash (66 characters including 0x)
            </div>
          </>
        ) : (
          <>
            <Label className="mb-2 block text-sm">Init Code (Contract Bytecode)</Label>
            <Textarea
              value={initCode}
              onChange={(e) => setInitCode(e.target.value)}
              placeholder="0x608060405234801561001057600080fd5b50..."
              className="font-mono text-sm min-h-[100px] mb-2"
            />
            <div className="text-xs text-muted-foreground mb-2">
              Full contract creation bytecode (constructor code + runtime code)
            </div>
          </>
        )}

        <div className="flex gap-2">
          {!vanityMode ? (
            <Button onClick={calculateAddress} className="flex-1">
              Calculate Address
            </Button>
          ) : (
            <Button onClick={searchVanityAddress} className="flex-1" disabled={vanitySearching}>
              {vanitySearching ? "Searching..." : "Find Vanity Salt"}
            </Button>
          )}
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

      {/* Vanity Result */}
      {vanityResult && (
        <div className="p-4 rounded border border-green-500/30 bg-green-500/10">
          <Label className="mb-2 block text-sm font-semibold text-green-400">
            Vanity Address Found!
          </Label>
          <div className="space-y-2">
            <Input
              label="Salt"
              value={vanityResult.salt}
              readOnly
              showCopy
              className="font-mono text-sm bg-black/30"
            />
            <Input
              label="Address"
              value={vanityResult.address}
              readOnly
              showCopy
              className="font-mono text-sm bg-black/30"
            />
          </div>
        </div>
      )}

      {/* Output Section */}
      {predictedAddress && (
        <>
          <Input
            label="Predicted Address"
            value={predictedAddress}
            readOnly
            showCopy
            className="font-mono text-sm bg-[#0f0f0f]"
          />

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-3 block text-sm">Calculation Steps</Label>
            <div className="space-y-2">
              {calculationSteps.map((step, index) => (
                <div key={index} className="text-xs font-mono text-muted-foreground break-all">
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">CREATE2 Formula</Label>
            <Code language="javascript">
{`// The CREATE2 address is calculated as:
address = keccak256(0xff ++ deployer ++ salt ++ keccak256(initCode))[12:]

// Where:
// - 0xff is a constant prefix (1 byte)
// - deployer is the factory contract address (20 bytes)
// - salt is a user-provided value (32 bytes)
// - keccak256(initCode) is the hash of the initialization code (32 bytes)
// - [12:] takes the last 20 bytes as the address`}
            </Code>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">Deploy with CREATE2 (Solidity)</Label>
            <Code language="solidity">
{`contract Factory {
    event Deployed(address addr, bytes32 salt);

    function deploy(bytes32 salt, bytes memory bytecode)
        external
        returns (address)
    {
        address addr;
        assembly {
            addr := create2(
                0,                    // value (ETH to send)
                add(bytecode, 0x20),  // bytecode start
                mload(bytecode),      // bytecode length
                salt                  // salt
            )
        }
        require(addr != address(0), "Deploy failed");

        emit Deployed(addr, salt);
        return addr;
    }

    // Predict address before deployment
    function getAddress(bytes32 salt, bytes memory bytecode)
        external
        view
        returns (address)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }
}`}
            </Code>
          </div>
        </>
      )}
    </div>
  );
}

export const create2AddressPredictorConfig: ToolConfig = {
  id: "create2-address-predictor",
  name: "CREATE2 Address Predictor",
  description: "Calculate deterministic contract addresses using CREATE2 opcode before deployment",
  category: "web3",
  component: Create2AddressPredictorTool,
  seo: {
    keywords: [
      "create2 address",
      "deterministic deployment",
      "create2 calculator",
      "contract address predictor",
      "create2 opcode",
      "vanity contract address",
      "deterministic contract address",
      "ethereum create2",
      "counterfactual deployment",
      "create2 salt finder",
    ],
  },
  sections: [
    {
      title: "What is CREATE2?",
      content:
        "CREATE2 is an Ethereum opcode that allows you to deploy smart contracts to deterministic addresses. Unlike CREATE (which generates addresses based on sender and nonce), CREATE2 generates addresses based on the deployer address, a salt, and the contract bytecode. This enables you to know the contract address before deployment.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            The CREATE2 address is calculated using the formula:
          </p>
          <div className="mb-4">
            <Code language="javascript">
{`address = keccak256(0xff ++ deployer ++ salt ++ keccak256(initCode))[12:]`}
            </Code>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>0xff</strong> - Constant prefix to distinguish from CREATE</li>
            <li><strong>deployer</strong> - Address of the factory contract deploying the new contract</li>
            <li><strong>salt</strong> - 32-byte value chosen by deployer for determinism</li>
            <li><strong>keccak256(initCode)</strong> - Hash of the contract creation bytecode</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Counterfactual deployment - interact with contracts before they exist</li>
            <li>Cross-chain same-address deployment for multi-chain protocols</li>
            <li>Vanity addresses - create memorable contract addresses</li>
            <li>State channels and payment channels that may never be deployed on-chain</li>
            <li>Upgradeability patterns with deterministic proxy addresses</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Vanity Mode</h4>
          <p className="text-sm">
            Vanity mode searches for salt values that produce contract addresses with your desired prefix. Note that longer prefixes require exponentially more computation time. For browser-based searching, prefixes of 3-4 characters are recommended.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Minimal Empty Contract",
      content: `Deployer: 0x1F98431c8aD98523631AE4a59f267346ea31F984
Salt: 0
Init Code Hash: 0xe54142092c5e695c54fbd03feb5e115168fefc02ec03216244eec3498c0debfe
→ Calculates deterministic address for deployment`,
      type: "code",
    },
    {
      title: "Using Full Bytecode",
      content: `Provide full contract bytecode instead of hash:
Init Code: 0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220...
Tool will automatically hash it to calculate address`,
      type: "code",
    },
    {
      title: "Vanity Address Search",
      content: `Use Vanity Mode to find a salt that generates address starting with desired prefix:
Prefix: "cafe" → Searches through salts to find 0xcafe...
Warning: Longer prefixes take exponentially longer to find`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { keccak256, encodePacked, getAddress } from 'viem';

// Calculate CREATE2 address
function getCreate2Address(
  deployerAddress: string,
  salt: string,
  initCodeHash: string
): string {
  // Ensure salt is 32 bytes
  let saltBytes: \`0x\${string}\`;
  if (salt.startsWith('0x') && salt.length === 66) {
    saltBytes = salt as \`0x\${string}\`;
  } else {
    const saltBigInt = BigInt(salt);
    saltBytes = ('0x' + saltBigInt.toString(16).padStart(64, '0')) as \`0x\${string}\`;
  }

  // Pack: 0xff ++ deployer ++ salt ++ initCodeHash
  const packed = encodePacked(
    ['bytes1', 'address', 'bytes32', 'bytes32'],
    ['0xff', deployerAddress as \`0x\${string}\`, saltBytes, initCodeHash as \`0x\${string}\`]
  );

  // Hash and take last 20 bytes as address
  const hash = keccak256(packed);
  const address = '0x' + hash.slice(-40);

  return getAddress(address);
}

// Calculate init code hash from bytecode
function getInitCodeHash(bytecode: string): string {
  return keccak256(bytecode as \`0x\${string}\`);
}

// Example: Predict deployment address
const deployer = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const salt = '0';
const initCode = '0x6080604052348015600f57600080fd5b50...';

const initCodeHash = getInitCodeHash(initCode);
console.log('Init Code Hash:', initCodeHash);

const predictedAddress = getCreate2Address(deployer, salt, initCodeHash);
console.log('Predicted Address:', predictedAddress);

// The contract can be deployed to this exact address using CREATE2`,
  references: [
    {
      title: "EIP-1014: Skinny CREATE2",
      url: "https://eips.ethereum.org/EIPS/eip-1014",
    },
    {
      title: "OpenZeppelin CREATE2 Library",
      url: "https://docs.openzeppelin.com/contracts/4.x/api/utils#Create2",
    },
    {
      title: "EIP-2470: Singleton Factory",
      url: "https://eips.ethereum.org/EIPS/eip-2470",
    },
  ],
};
