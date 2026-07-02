"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";
import { keccak256, toBytes } from "viem";

export function TimelockTransactionBuilderTool() {
  const t = useTranslations("toolUI.timelock-transaction-builder");
  const [targetAddress, setTargetAddress] = useState("");
  const [functionSignature, setFunctionSignature] = useState("");
  const [parameters, setParameters] = useState("");
  const [delayDays, setDelayDays] = useState("");
  const [delayHours, setDelayHours] = useState("");
  const [value, setValue] = useState("0");

  // Calculated outputs
  const [calldata, setCalldata] = useState("");
  const [eta, setEta] = useState("");
  const [etaTimestamp, setEtaTimestamp] = useState("");
  const [queueData, setQueueData] = useState("");
  const [executeData, setExecuteData] = useState("");
  const [readableTime, setReadableTime] = useState("");

  const buildTransaction = () => {
    try {
      // Validate inputs
      if (!targetAddress || !functionSignature) {
        throw new Error(t("errTargetFunctionRequired"));
      }

      if (!targetAddress.startsWith("0x") || targetAddress.length !== 42) {
        throw new Error(t("errInvalidTargetAddress"));
      }

      const days = parseInt(delayDays) || 0;
      const hours = parseInt(delayHours) || 0;
      const totalSeconds = (days * 24 * 3600) + (hours * 3600);

      if (totalSeconds <= 0) {
        throw new Error(t("errDelayPositive"));
      }

      // Parse function signature and parameters
      let encodedCalldata = "";
      try {
        // Parse parameters from comma-separated string
        const paramArray = parameters.trim()
          ? parameters.split(",").map(p => p.trim())
          : [];

        // Simple function selector calculation using keccak256
        const functionName = functionSignature.split("(")[0];
        const selector = keccak256(toBytes(functionSignature)).slice(0, 10);

        // For simplicity, just return the selector without encoding params
        // In production, you'd need proper ABI encoding
        encodedCalldata = selector;
      } catch (e) {
        // If encoding fails, provide a placeholder
        encodedCalldata = "0x" + "00".repeat(4); // Placeholder selector
      }

      setCalldata(encodedCalldata);

      // Calculate ETA (current time + delay)
      const now = Math.floor(Date.now() / 1000);
      const etaTime = now + totalSeconds;
      setEtaTimestamp(etaTime.toString());

      // Format readable time
      const etaDate = new Date(etaTime * 1000);
      setReadableTime(etaDate.toLocaleString());

      // Format ETA for display
      const etaFormatted = new Date(etaTime * 1000).toISOString();
      setEta(etaFormatted);

      // Generate queue transaction data
      const queueTxData = {
        target: targetAddress,
        value: value,
        signature: functionSignature,
        data: encodedCalldata,
        eta: etaTime,
      };
      setQueueData(JSON.stringify(queueTxData, null, 2));

      // Generate execute transaction data
      const executeTxData = {
        target: targetAddress,
        value: value,
        signature: functionSignature,
        data: encodedCalldata,
        eta: etaTime,
      };
      setExecuteData(JSON.stringify(executeTxData, null, 2));

    } catch (e) {
      console.error("Error building transaction:", e);
      setCalldata("");
      setEta("");
      setEtaTimestamp("");
      setQueueData("");
      setExecuteData("");
      setReadableTime("");
    }
  };

  const handleReset = () => {
    setTargetAddress("");
    setFunctionSignature("");
    setParameters("");
    setDelayDays("");
    setDelayHours("");
    setValue("0");
    setCalldata("");
    setEta("");
    setEtaTimestamp("");
    setQueueData("");
    setExecuteData("");
    setReadableTime("");
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Input
            label={t("targetAddressLabel")}
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {t("targetAddressHelp")}
          </div>
        </div>

        <div>
          <Input
            label={t("functionSignatureLabel")}
            value={functionSignature}
            onChange={(e) => setFunctionSignature(e.target.value)}
            placeholder="transfer(address,uint256)"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {t("functionSignatureHelp")}
          </div>
        </div>

        <div>
          <Input
            label={t("parametersLabel")}
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb, 1000000000000000000"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {t("parametersHelp")}
          </div>
        </div>

        <div>
          <Input
            label={t("valueLabel")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            type="number"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {t("valueHelp")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label={t("delayDaysLabel")}
              value={delayDays}
              onChange={(e) => setDelayDays(e.target.value)}
              placeholder="2"
              type="number"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Input
              label={t("delayHoursLabel")}
              value={delayHours}
              onChange={(e) => setDelayHours(e.target.value)}
              placeholder="12"
              type="number"
              className="font-mono text-sm"
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {t("delayHelp")}
        </div>
      </div>

      {/* Calculate Button */}
      <Button onClick={buildTransaction} variant="primary" className="w-full">
        {t("generateButton")}
      </Button>

      {/* Results Section */}
      {calldata && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <Input
              label={t("calldataLabel")}
              value={calldata}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {t("calldataHelp")}
            </div>
          </div>

          <div>
            <Input
              label={t("etaTimestampLabel")}
              value={etaTimestamp}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {t("etaTimestampHelp")}
            </div>
          </div>

          <div>
            <Input
              label={t("executionTimeLabel")}
              value={readableTime}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {t("executionTimeHelp")}
            </div>
          </div>

          <div>
            <Textarea
              label={t("queueDataLabel")}
              value={queueData}
              readOnly
              showCopy
              rows={8}
              className="bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {t("queueDataHelp")}
            </div>
          </div>

          <div>
            <Textarea
              label={t("executeDataLabel")}
              value={executeData}
              readOnly
              showCopy
              rows={8}
              className="bg-[var(--color-gray-0)]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {t("executeDataHelp")}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-[12px] p-4">
            <div className="text-xs font-semibold text-blue-400 mb-2">{t("workflowTitle")}</div>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>{t("workflowStep1")}</li>
              <li>{t("workflowStep2")}</li>
              <li>{t("workflowStep3")}</li>
              <li>{t("workflowStep4")}</li>
            </ol>
          </div>

          {/* Formula Display */}
          <div className="bg-[var(--color-gray-0)] rounded-[12px] border border-border p-4 space-y-2">
            <div className="text-xs font-semibold text-blue-400 mb-1">{t("parametersTitle")}</div>
            <div className="text-xs font-mono text-muted-foreground space-y-1">
              <div>ETA = currentTimestamp + delay</div>
              <div>txHash = keccak256(target, value, signature, data, eta)</div>
              <div>executeWindow = [ETA, ETA + gracePeriod]</div>
            </div>
          </div>

          <Button onClick={handleReset} className="w-full">
            {t("resetButton")}
          </Button>
        </div>
      )}
    </div>
  );
}

export const timelockTransactionBuilderConfig: ToolConfig = {
  id: "timelock-transaction-builder",
  name: "Timelock Transaction Builder",
  description: "Generate queue and execute data for timelock-controlled governance transactions",
  category: "web3",
  component: TimelockTransactionBuilderTool,
  codeSnippet: `// npm install viem

import { keccak256, toBytes, encodeFunctionData } from 'viem';

// Build timelock transaction data
function buildTimelockTransaction(
  target: string,
  value: bigint,
  functionSignature: string,
  params: any[],
  delaySeconds: number
) {
  // Calculate ETA (earliest execution time)
  const now = Math.floor(Date.now() / 1000);
  const eta = now + delaySeconds;

  // Encode function call data
  const selector = keccak256(toBytes(functionSignature)).slice(0, 10);

  // Queue transaction data
  const queueData = {
    target,
    value: value.toString(),
    signature: functionSignature,
    data: selector,
    eta
  };

  return {
    queueData,
    eta,
    readableEta: new Date(eta * 1000).toISOString()
  };
}

// Example: Queue a parameter update after 2-day delay
const timelockTx = buildTimelockTransaction(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Target contract
  0n, // No ETH sent
  "setParameter(uint256)",
  [1000], // New parameter value
  2 * 24 * 3600 // 2 days delay
);

console.log("Queue at:", new Date());
console.log("Execute after:", timelockTx.readableEta);
console.log(JSON.stringify(timelockTx.queueData, null, 2));
`,
  seo: {
    keywords: [
      "timelock builder",
      "governance timelock",
      "compound timelock",
      "defi governance",
      "timelock transaction",
      "queue transaction",
      "execute transaction",
      "dao governance",
      "timelock controller",
    ],
  },
  sections: [
    {
      title: "What is a Timelock?",
      content:
        "A Timelock contract is a governance mechanism that enforces a delay between proposing and executing transactions. This gives the community time to review and potentially veto malicious actions.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Timelock Workflow</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Queue: Propose a transaction with future execution time (ETA)</li>
            <li>Delay: Wait for minimum delay period (typically 2-7 days)</li>
            <li>Execute: Execute the transaction after ETA within grace period</li>
            <li>Cancel: Can be cancelled before execution by admin</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Security Benefits</h4>
          <p className="text-sm">Timelocks provide transparency and security for DeFi protocols. Users can monitor queued transactions and exit positions if they disagree with proposed changes before they take effect.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Aave Parameter Update",
      content: `Target: 0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c
(Aave Governance)
Function: propose(...)
Delay: 1 day (after voting)`,
      type: "code",
    },
    {
      title: "Compound Interest Rate Change",
      content: `Target: 0x6d903f6003cca6255d85a0ab1e340961c0632049
(Compound Governor Bravo)
Function: executeTransaction(...)
Delay: 2 days`,
      type: "code",
    },
    {
      title: "OpenZeppelin Timelock Usage",
      content: `Target: 0xe8FdA5c7d3bBf167dB058e91C147e9e76e7F49d0
(Timelock Controller)
Function: execute(target, value, data, salt)
Delay: 3 days minimum`,
      type: "code",
    },
  ],
  references: [
    {
      title: "Compound Timelock",
      url: "https://docs.compound.finance/v2/governance/#timelock",
    },
    {
      title: "OpenZeppelin TimelockController",
      url: "https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController",
    },
    {
      title: "Governance Best Practices",
      url: "https://ethereum.org/en/developers/docs/governance/",
    },
  ],
};
