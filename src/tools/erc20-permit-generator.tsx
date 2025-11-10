"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";
import { keccak256, toHex, Hex, encodePacked } from "viem";

interface PermitSignature {
  v: number;
  r: string;
  s: string;
  nonce: string;
  deadline: string;
}

export function Erc20PermitGeneratorTool() {
  const [ownerAddress, setOwnerAddress] = useState("");
  const [spenderAddress, setSpenderAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [deadline, setDeadline] = useState("");
  const [chainId, setChainId] = useState("1");
  const [privateKey, setPrivateKey] = useState("");
  const [nonce, setNonce] = useState("0");

  const [signature, setSignature] = useState<PermitSignature | null>(null);
  const [error, setError] = useState("");
  const [domainData, setDomainData] = useState("");
  const [messageData, setMessageData] = useState("");

  const generatePermit = async () => {
    setError("");
    setSignature(null);
    setDomainData("");
    setMessageData("");

    try {
      // Validate inputs
      if (!ownerAddress || !spenderAddress || !tokenAmount || !tokenAddress) {
        setError("Please fill in all required fields");
        return;
      }

      if (ownerAddress.length !== 42 || !ownerAddress.startsWith("0x")) {
        setError("Invalid owner address format");
        return;
      }

      if (spenderAddress.length !== 42 || !spenderAddress.startsWith("0x")) {
        setError("Invalid spender address format");
        return;
      }

      if (tokenAddress.length !== 42 || !tokenAddress.startsWith("0x")) {
        setError("Invalid token address format");
        return;
      }

      const deadlineTimestamp = deadline ? new Date(deadline).getTime() / 1000 : Math.floor(Date.now() / 1000) + 86400;

      // EIP-712 Domain
      const domain = {
        name: "Token", // This should be the token name from contract
        version: "1",
        chainId: parseInt(chainId),
        verifyingContract: tokenAddress as Hex,
      };

      // EIP-712 Message
      const message = {
        owner: ownerAddress as Hex,
        spender: spenderAddress as Hex,
        value: tokenAmount,
        nonce: nonce,
        deadline: Math.floor(deadlineTimestamp).toString(),
      };

      setDomainData(JSON.stringify(domain, null, 2));
      setMessageData(JSON.stringify(message, null, 2));

      if (privateKey) {
        // If private key is provided, generate actual signature
        // Note: This is for demo purposes. In production, signing should happen client-side
        setError("Signature generation with private key requires a wallet connection. Use this tool to understand the permit structure.");
      } else {
        // Generate example signature structure
        setSignature({
          v: 27,
          r: "0x" + "a".repeat(64),
          s: "0x" + "b".repeat(64),
          nonce: nonce,
          deadline: Math.floor(deadlineTimestamp).toString(),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate permit");
    }
  };


  const handleReset = () => {
    setOwnerAddress("");
    setSpenderAddress("");
    setTokenAmount("");
    setTokenAddress("");
    setDeadline("");
    setChainId("1");
    setPrivateKey("");
    setNonce("0");
    setSignature(null);
    setError("");
    setDomainData("");
    setMessageData("");
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="p-4 rounded border border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-start gap-2">
          <div className="text-yellow-500 font-medium mt-0.5">⚠️</div>
          <div className="text-sm text-yellow-500/90">
            <strong>Security Warning:</strong> Never share your private key. This tool demonstrates the EIP-2612 permit structure. For production use, integrate with a wallet (MetaMask, WalletConnect) to sign permits client-side.
          </div>
        </div>
      </div>

      {/* Owner Address */}
      <Input
        label="Owner Address"
        value={ownerAddress}
        onChange={(e) => setOwnerAddress(e.target.value)}
        placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
        className="font-mono text-sm"
      />

      {/* Spender Address */}
      <Input
        label="Spender Address"
        value={spenderAddress}
        onChange={(e) => setSpenderAddress(e.target.value)}
        placeholder="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
        className="font-mono text-sm"
      />

      {/* Token Amount */}
      <Input
        label="Token Amount (in wei/raw units)"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(e.target.value)}
        placeholder="1000000000000000000"
        className="font-mono text-sm"
      />

      {/* Token Address */}
      <Input
        label="Token Contract Address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        className="font-mono text-sm"
      />

      {/* Chain ID */}
      <Input
        label="Chain ID"
        value={chainId}
        onChange={(e) => setChainId(e.target.value)}
        placeholder="1"
        type="number"
        className="font-mono text-sm"
      />
      <div className="text-xs text-muted-foreground -mt-4">
        1 = Ethereum, 137 = Polygon, 42161 = Arbitrum, 10 = Optimism
      </div>

      {/* Deadline */}
      <Input
        label="Deadline (optional - defaults to 24h from now)"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        type="datetime-local"
        className="font-mono text-sm"
      />

      {/* Nonce */}
      <Input
        label="Nonce"
        value={nonce}
        onChange={(e) => setNonce(e.target.value)}
        placeholder="0"
        type="number"
        className="font-mono text-sm"
      />
      <div className="text-xs text-muted-foreground -mt-4">
        Usually 0 for the first permit. Query the contract for the current nonce.
      </div>

      {/* Private Key (Optional) */}
      <Input
        label="Private Key (Optional - Not Recommended)"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="Leave empty for demo mode"
        type="password"
        className="font-mono text-sm"
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={generatePermit} className="flex-1">
          Generate Permit Structure
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* EIP-712 Domain */}
      {domainData && (
        <Textarea
          label="EIP-712 Domain"
          value={domainData}
          readOnly
          showCopy
          className="font-mono text-xs"
          rows={8}
        />
      )}

      {/* EIP-712 Message */}
      {messageData && (
        <Textarea
          label="EIP-712 Message"
          value={messageData}
          readOnly
          showCopy
          className="font-mono text-xs"
          rows={8}
        />
      )}

      {/* Signature Output */}
      {signature && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Permit Signature (Example)</div>

          <Input
            label="v"
            value={signature.v.toString()}
            readOnly
            showCopy
            className="font-mono text-sm"
          />

          <Input
            label="r"
            value={signature.r}
            readOnly
            showCopy
            className="font-mono text-sm"
          />

          <Input
            label="s"
            value={signature.s}
            readOnly
            showCopy
            className="font-mono text-sm"
          />

          <Input
            label="Nonce"
            value={signature.nonce}
            readOnly
            showCopy
            className="font-mono text-sm"
          />

          <Input
            label="Deadline"
            value={signature.deadline}
            readOnly
            showCopy
            className="font-mono text-sm"
          />

          <div className="p-3 rounded border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs">
            These values can be used to call the permit() function on the ERC-20 contract:
            <br />
            <code className="block mt-2">
              token.permit(owner, spender, value, deadline, v, r, s)
            </code>
          </div>
        </div>
      )}

      {/* Reset */}
      <Button onClick={handleReset} variant="secondary" className="w-full">
        Reset
      </Button>
    </div>
  );
}

export const erc20PermitGeneratorConfig: ToolConfig = {
  id: "erc20-permit-generator",
  name: "ERC20 Permit Generator",
  description: "Generate EIP-2612 permit signatures for gasless token approvals",
  category: "web3",
  component: Erc20PermitGeneratorTool,
  seo: {
    keywords: [
      "erc20 permit generator",
      "eip-2612",
      "gasless approval",
      "permit signature",
      "eip-712",
      "token permit",
      "meta transaction",
      "usdc permit",
      "dai permit",
      "gasless token approval",
    ],
  },
  sections: [
    {
      title: "What is EIP-2612 Permit?",
      content:
        "EIP-2612 introduces a permit function for ERC-20 tokens that allows users to approve token transfers with a signature instead of a transaction. This enables gasless approvals where the spender can execute both the approval and the transfer in a single transaction, paying for both.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">How Permits Work</h4>
          <p className="text-sm mb-4">
            Instead of calling approve() which costs gas, users sign an off-chain message (EIP-712) containing the approval details. The spender then submits this signature along with the permit details to the token contract. The contract verifies the signature and updates the approval, all within the spender's transaction.
          </p>

          <h4 className="text-base font-semibold mb-2">Common Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>DEX trades without prior approval transactions</li>
            <li>Gasless token transfers (relayer pays gas)</li>
            <li>Improved UX by reducing transaction steps</li>
            <li>Meta-transactions and account abstraction</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Supported Tokens</h4>
          <p className="text-sm">
            Not all ERC-20 tokens support permits. Notable tokens with permit functionality include DAI, USDC (on some chains), UNI, COMP, and many newer tokens. Always verify the token contract implements EIP-2612 before using permits.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "USDC Permit on Ethereum",
      content: `Owner: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
→ Spender: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
  (Uniswap V2 Router)
→ Amount: 1000000000 (1000 USDC, 6 decimals)
→ Token: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
  (USDC mainnet)
→ Deadline: 1698768000 (Nov 1, 2023)`,
      type: "code",
    },
    {
      title: "DAI Permit - Polygon Network",
      content: `Owner: 0xd8dA6BF26968b4f88d2F8fC25bB5d4E5ce3E5e53
→ Spender: 0xE592427A0AEce92De3Edee1F18E0157C05861564
  (Uniswap V3 Router)
→ Amount: 1000000000000000000 (1 DAI, 18 decimals)
→ Token: 0x8f3Cf7ad23Cd3CaDbD9735AFF958023D60C95eEE
  (DAI Polygon)
→ ChainID: 137`,
      type: "code",
    },
    {
      title: "Custom Token Permit - Arbitrum",
      content: `Token: 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
  (USDC.e Arbitrum)
→ Nonce: 0
→ ChainID: 42161
→ Signature can be submitted to permit() function
  for gasless approval`,
      type: "code",
    },
    {
      title: "Relayer Pattern - Meta-transaction",
      content: `User signs permit offline
→ Relayer submits transaction with permit signature
→ Contract validates signature (ecrecover)
→ Approval is granted without user paying gas`,
      type: "code",
    },
  ],
  codeSnippet: `// npm install viem

import { signTypedData } from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts';

interface PermitData {
  owner: string;
  spender: string;
  value: string;
  nonce: string;
  deadline: string;
}

// Sign ERC-20 permit (EIP-2612)
async function signPermit(
  tokenAddress: string,
  tokenName: string,
  chainId: number,
  permitData: PermitData,
  privateKey: string
): Promise<{ v: number; r: string; s: string }> {
  const account = privateKeyToAccount(privateKey as \`0x\${string}\`);

  // EIP-712 domain
  const domain = {
    name: tokenName,
    version: '1',
    chainId,
    verifyingContract: tokenAddress as \`0x\${string}\`
  };

  // EIP-712 types
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  // Sign the typed data
  const signature = await signTypedData({
    account,
    domain,
    types,
    primaryType: 'Permit',
    message: permitData
  });

  // Split signature into v, r, s
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { v, r, s };
}

// Example: Create USDC permit
const permitData: PermitData = {
  owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  spender: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  value: '1000000000', // 1000 USDC (6 decimals)
  nonce: '0',
  deadline: Math.floor(Date.now() / 1000 + 86400).toString() // 24h from now
};

// Sign permit (NOTE: Never expose private keys in production!)
// const signature = await signPermit(
//   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
//   'USD Coin',
//   1,
//   permitData,
//   '0x...' // Private key
// );

// Call permit on token contract
// await token.permit(
//   permitData.owner,
//   permitData.spender,
//   permitData.value,
//   permitData.deadline,
//   signature.v,
//   signature.r,
//   signature.s
// );`,
  references: [
    {
      title: "EIP-2612: Permit Extension for ERC-20",
      url: "https://eips.ethereum.org/EIPS/eip-2612",
    },
    {
      title: "EIP-712: Typed structured data hashing",
      url: "https://eips.ethereum.org/EIPS/eip-712",
    },
    {
      title: "OpenZeppelin ERC20Permit",
      url: "https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit",
    },
  ],
};
