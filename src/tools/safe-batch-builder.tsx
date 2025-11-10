"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

interface Transaction {
  id: string;
  to: string;
  value: string;
  data: string;
  operation: "0" | "1"; // 0 = Call, 1 = DelegateCall
}

export function SafeBatchBuilderTool() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", to: "", value: "0", data: "0x", operation: "0" },
  ]);
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const addTransaction = () => {
    const newId = (Math.max(...transactions.map((t) => parseInt(t.id))) + 1).toString();
    setTransactions([
      ...transactions,
      { id: newId, to: "", value: "0", data: "0x", operation: "0" },
    ]);
  };

  const removeTransaction = (id: string) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: string) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const generateBatch = () => {
    try {
      // Validate all transactions
      for (const tx of transactions) {
        if (!tx.to) {
          throw new Error("All transactions must have a 'to' address");
        }
        if (!tx.to.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error(`Invalid address: ${tx.to}`);
        }
        if (!tx.data.startsWith("0x")) {
          throw new Error(`Data must start with 0x: ${tx.data}`);
        }
        if (isNaN(Number(tx.value)) || Number(tx.value) < 0) {
          throw new Error(`Invalid value: ${tx.value}`);
        }
      }

      // Generate Safe batch JSON
      const batch = {
        version: "1.0",
        chainId: "1", // User should update this
        createdAt: Date.now(),
        meta: {
          name: "Custom Transaction Batch",
          description: "Generated with BUIDL NOW Safe Batch Builder",
          txBuilderVersion: "1.16.3",
        },
        transactions: transactions.map((tx) => ({
          to: tx.to,
          value: tx.value,
          data: tx.data,
          contractMethod: null,
          contractInputsValues: null,
          operation: parseInt(tx.operation),
        })),
      };

      setJsonOutput(JSON.stringify(batch, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate batch");
      setJsonOutput("");
    }
  };

  const handleCopy = async () => {
    if (jsonOutput) {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setTransactions([{ id: "1", to: "", value: "0", data: "0x", operation: "0" }]);
    setJsonOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Transactions Section */}
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div key={tx.id} className="p-4 rounded border border-border bg-[#0f0f0f] space-y-3">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-semibold">Transaction #{index + 1}</Label>
              {transactions.length > 1 && (
                <Button
                  onClick={() => removeTransaction(tx.id)}
                  variant="secondary"
                  className="text-xs h-7 px-2"
                >
                  Remove
                </Button>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-xs">To Address</Label>
              <Input
                value={tx.to}
                onChange={(e) => updateTransaction(tx.id, "to", e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label className="mb-2 block text-xs">Value (in Wei)</Label>
              <Input
                value={tx.value}
                onChange={(e) => updateTransaction(tx.id, "value", e.target.value)}
                placeholder="0"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label className="mb-2 block text-xs">Operation</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateTransaction(tx.id, "operation", "0")}
                  variant={tx.operation === "0" ? "default" : "secondary"}
                  size="sm"
                  className="flex-1"
                >
                  Call (0)
                </Button>
                <Button
                  onClick={() => updateTransaction(tx.id, "operation", "1")}
                  variant={tx.operation === "1" ? "default" : "secondary"}
                  size="sm"
                  className="flex-1"
                >
                  DelegateCall (1)
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs">Data (Hex)</Label>
              <Textarea
                value={tx.data}
                onChange={(e) => updateTransaction(tx.id, "data", e.target.value)}
                placeholder="0x"
                className="font-mono text-sm min-h-[80px]"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={addTransaction} variant="secondary" className="flex-1">
            + Add Transaction
          </Button>
          <Button onClick={generateBatch} className="flex-1">
            Generate Batch
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
      {jsonOutput && (
        <>
          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Batch JSON Output</Label>
              <Button onClick={handleCopy} variant="secondary" className="text-xs h-7 px-3">
                {copied ? "Copied!" : "Copy JSON"}
              </Button>
            </div>
            <div className="relative">
              <Code language="json">{jsonOutput}</Code>
            </div>
          </div>

          <div className="p-4 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-200">
            <div className="text-sm">
              <strong>Note:</strong> Update the <code className="bg-black/30 px-1 py-0.5 rounded">chainId</code> field to match your target network before importing to Safe UI.
            </div>
          </div>

          <div className="p-4 rounded border border-border bg-[#0f0f0f]">
            <Label className="mb-2 block text-sm">How to use with Safe UI</Label>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Copy the JSON output above</li>
              <li>Go to Safe Transaction Builder in your Safe UI</li>
              <li>Click "Import transactions" or "Load from JSON"</li>
              <li>Paste the JSON and review transactions</li>
              <li>Sign and execute the batch</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

export const safeBatchBuilderConfig: ToolConfig = {
  id: "safe-batch-builder",
  name: "Safe Batch Transaction Builder",
  description: "Build and export batch transactions for Safe (Gnosis Safe) multi-sig wallets",
  category: "web3",
  component: SafeBatchBuilderTool,
  codeSnippet: `// Build Safe batch transaction JSON

interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: 0 | 1; // 0 = Call, 1 = DelegateCall
}

function buildSafeBatch(transactions: SafeTransaction[]) {
  return {
    version: "1.0",
    chainId: "1", // Update to your chain
    createdAt: Date.now(),
    meta: {
      name: "Batch Transaction",
      description: "Multiple operations in one Safe transaction",
      txBuilderVersion: "1.16.3"
    },
    transactions: transactions.map(tx => ({
      to: tx.to,
      value: tx.value,
      data: tx.data,
      contractMethod: null,
      contractInputsValues: null,
      operation: tx.operation
    }))
  };
}

// Example: Approve and swap on Uniswap
const batch = buildSafeBatch([
  {
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    value: "0",
    data: "0x095ea7b3000000000000000000000000E592427A0AEce92De3Edee1F18E0157C05861564", // approve
    operation: 0
  },
  {
    to: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Uniswap Router
    value: "0",
    data: "0x414bf389...", // exactInputSingle
    operation: 0
  }
]);

console.log(JSON.stringify(batch, null, 2));
`,
  seo: {
    keywords: [
      "safe batch builder",
      "gnosis safe batch",
      "multi-sig batch transactions",
      "safe transaction builder",
      "batch transaction json",
      "safe multisig tool",
      "safe batch export",
      "gnosis safe multisig",
      "safe wallet batch",
      "ethereum batch transactions",
    ],
  },
  sections: [
    {
      title: "What is Safe Batch Builder?",
      content:
        "Safe (formerly Gnosis Safe) is a popular multi-signature wallet for Ethereum and other EVM chains. The Batch Builder allows you to combine multiple transactions into a single batch, saving gas and time by requiring only one signature round for all transactions.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">JSON Generation</h4>
          <p className="text-sm mb-4">
            This tool generates a JSON file compatible with Safe's Transaction Builder app. You can:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Add multiple transactions with different recipients and data</li>
            <li>Specify value (ETH/native token) to send with each transaction</li>
            <li>Choose between Call (0) and DelegateCall (1) operations</li>
            <li>Export as JSON to import directly into Safe UI</li>
          </ul>
          <p className="text-sm text-muted-foreground mb-4">
            The generated JSON follows Safe's transaction batch format v1.0, ensuring compatibility with the Safe Transaction Builder.
          </p>

          <h4 className="text-base font-semibold mb-2">Transaction Operations</h4>
          <div className="space-y-2 mb-4">
            <div>
              <strong className="text-sm">Call (0):</strong>
              <p className="text-sm text-muted-foreground">Standard external call to another contract. Most common operation type.</p>
            </div>
            <div>
              <strong className="text-sm">DelegateCall (1):</strong>
              <p className="text-sm text-muted-foreground">Executes code from another contract in the context of the Safe. Use with extreme caution as it can modify Safe storage.</p>
            </div>
          </div>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Multi-token transfer (USDC + DAI)",
      content: `Transfer 1000 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
and 500 DAI to 0x8ba1f109551bd432803012645Ac136ddd64DBA720
via Safe proxy batch`,
      type: "code",
    },
    {
      title: "Uniswap LP approval & swap",
      content: `Approve 100 WETH to Uniswap V3 Router
(0xE592427A0AEce92De3Edee1F18E0157C05861564)
and execute swap in one Safe batch`,
      type: "code",
    },
    {
      title: "Aave governance actions",
      content: `Execute multiple governance proposals through Safe:
- Delegate voting power
- Claim rewards from AAVE staking
  (0x4da27a545c0c5B758a6BA100e3a049001de870f5)
- Rebalance collateral`,
      type: "code",
    },
  ],
  references: [
    {
      title: "Safe Transaction Builder",
      url: "https://help.safe.global/en/articles/40841-transaction-builder",
    },
    {
      title: "Safe Contracts Documentation",
      url: "https://docs.safe.global/safe-smart-account",
    },
    {
      title: "Safe Apps SDK",
      url: "https://github.com/safe-global/safe-apps-sdk",
    },
  ],
};
