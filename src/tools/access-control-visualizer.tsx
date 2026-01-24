"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

interface Role {
  name: string;
  identifier: string;
  adminRole?: string;
  functions: string[];
}

interface AccessControlResult {
  type: "AccessControl" | "Ownable" | "Roles" | "Unknown";
  roles: Role[];
  hierarchy: RoleHierarchy[];
  securityWarnings: string[];
  publicAdminFunctions: string[];
}

interface RoleHierarchy {
  role: string;
  admin: string;
  level: number;
}

export function AccessControlVisualizerTool() {
  const [mode, setMode] = useState<"abi" | "address">("abi");
  const [abiInput, setAbiInput] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [rpcUrl, setRpcUrl] = useState("");
  const [result, setResult] = useState<AccessControlResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const KNOWN_ROLES = {
    DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
    MINTER_ROLE: "MINTER_ROLE",
    PAUSER_ROLE: "PAUSER_ROLE",
    BURNER_ROLE: "BURNER_ROLE",
    UPGRADER_ROLE: "UPGRADER_ROLE",
  };

  const detectAccessControlType = (abi: any[]): string => {
    const functionNames = abi.filter(item => item.type === "function").map(item => item.name);

    if (functionNames.includes("hasRole") && functionNames.includes("getRoleAdmin")) {
      return "AccessControl";
    }
    if (functionNames.includes("owner") && functionNames.includes("transferOwnership")) {
      return "Ownable";
    }
    if (functionNames.includes("hasRole")) {
      return "Roles";
    }
    return "Unknown";
  };

  const extractRolesFromABI = (abi: any[]): Role[] => {
    const roles: Map<string, Role> = new Map();

    // Find role-based modifiers and functions
    abi.forEach((item) => {
      if (item.type === "function") {
        const funcName = item.name;

        // Check for onlyRole or similar modifiers in function name patterns
        if (funcName.includes("only") || funcName.includes("Role")) {
          // Extract role from function name
          const roleMatch = funcName.match(/only([A-Z][a-zA-Z]*)/);
          if (roleMatch) {
            const roleName = roleMatch[1].toUpperCase() + "_ROLE";
            if (!roles.has(roleName)) {
              roles.set(roleName, {
                name: roleName,
                identifier: roleName,
                functions: [],
              });
            }
          }
        }

        // Check for role-based parameters
        item.inputs?.forEach((input: any) => {
          if (input.name.toLowerCase().includes("role")) {
            const roleName = "ROLE_BASED_ACCESS";
            if (!roles.has(roleName)) {
              roles.set(roleName, {
                name: roleName,
                identifier: "bytes32",
                functions: [],
              });
            }
            roles.get(roleName)?.functions.push(funcName);
          }
        });
      }
    });

    // Add DEFAULT_ADMIN_ROLE if AccessControl detected
    const hasAccessControl = abi.some(
      item => item.type === "function" && (item.name === "hasRole" || item.name === "getRoleAdmin")
    );

    if (hasAccessControl) {
      roles.set("DEFAULT_ADMIN_ROLE", {
        name: "DEFAULT_ADMIN_ROLE",
        identifier: KNOWN_ROLES.DEFAULT_ADMIN_ROLE,
        functions: ["grantRole", "revokeRole", "renounceRole"],
      });
    }

    // Add owner role if Ownable detected
    const hasOwnable = abi.some(
      item => item.type === "function" && item.name === "owner"
    );

    if (hasOwnable) {
      roles.set("OWNER", {
        name: "OWNER",
        identifier: "address",
        functions: ["transferOwnership", "renounceOwnership"],
      });
    }

    // Detect common role functions
    abi.forEach((item) => {
      if (item.type === "function") {
        const funcName = item.name;

        // Minter role
        if (funcName.includes("mint") && !funcName.includes("Minter")) {
          if (!roles.has("MINTER_ROLE")) {
            roles.set("MINTER_ROLE", {
              name: "MINTER_ROLE",
              identifier: KNOWN_ROLES.MINTER_ROLE,
              adminRole: "DEFAULT_ADMIN_ROLE",
              functions: [],
            });
          }
          roles.get("MINTER_ROLE")?.functions.push(funcName);
        }

        // Pauser role
        if (funcName.includes("pause")) {
          if (!roles.has("PAUSER_ROLE")) {
            roles.set("PAUSER_ROLE", {
              name: "PAUSER_ROLE",
              identifier: KNOWN_ROLES.PAUSER_ROLE,
              adminRole: "DEFAULT_ADMIN_ROLE",
              functions: [],
            });
          }
          roles.get("PAUSER_ROLE")?.functions.push(funcName);
        }

        // Burner role
        if (funcName.includes("burn")) {
          if (!roles.has("BURNER_ROLE")) {
            roles.set("BURNER_ROLE", {
              name: "BURNER_ROLE",
              identifier: KNOWN_ROLES.BURNER_ROLE,
              adminRole: "DEFAULT_ADMIN_ROLE",
              functions: [],
            });
          }
          roles.get("BURNER_ROLE")?.functions.push(funcName);
        }

        // Upgrader role
        if (funcName.includes("upgrade")) {
          if (!roles.has("UPGRADER_ROLE")) {
            roles.set("UPGRADER_ROLE", {
              name: "UPGRADER_ROLE",
              identifier: KNOWN_ROLES.UPGRADER_ROLE,
              adminRole: "DEFAULT_ADMIN_ROLE",
              functions: [],
            });
          }
          roles.get("UPGRADER_ROLE")?.functions.push(funcName);
        }
      }
    });

    return Array.from(roles.values());
  };

  const buildHierarchy = (roles: Role[]): RoleHierarchy[] => {
    const hierarchy: RoleHierarchy[] = [];
    const roleMap = new Map(roles.map(r => [r.name, r]));

    roles.forEach((role) => {
      let level = 0;
      let currentRole = role;

      while (currentRole.adminRole && roleMap.has(currentRole.adminRole)) {
        level++;
        currentRole = roleMap.get(currentRole.adminRole)!;
      }

      hierarchy.push({
        role: role.name,
        admin: role.adminRole || "None",
        level,
      });
    });

    return hierarchy.sort((a, b) => b.level - a.level);
  };

  const detectSecurityWarnings = (abi: any[], roles: Role[]): string[] => {
    const warnings: string[] = [];

    // Check for missing role checks
    const privilegedFunctions = abi.filter(
      item =>
        item.type === "function" &&
        (item.name.includes("mint") ||
          item.name.includes("burn") ||
          item.name.includes("pause") ||
          item.name.includes("upgrade") ||
          item.name.includes("withdraw"))
    );

    if (privilegedFunctions.length > 0 && roles.length === 0) {
      warnings.push("Privileged functions detected but no access control found");
    }

    // Check for public admin functions
    const adminFunctions = abi.filter(
      item =>
        item.type === "function" &&
        item.stateMutability !== "view" &&
        item.stateMutability !== "pure" &&
        (item.name.includes("set") || item.name.includes("change") || item.name.includes("update"))
    );

    if (adminFunctions.length > 5) {
      warnings.push(`${adminFunctions.length} state-changing functions found - verify all have proper access control`);
    }

    // Check for ownership transfer
    const hasOwnershipTransfer = abi.some(
      item => item.type === "function" && item.name === "transferOwnership"
    );
    const hasTwoStep = abi.some(
      item => item.type === "function" && item.name === "acceptOwnership"
    );

    if (hasOwnershipTransfer && !hasTwoStep) {
      warnings.push("Single-step ownership transfer detected - consider using two-step transfer");
    }

    // Check for renounceOwnership
    const hasRenounce = abi.some(
      item => item.type === "function" && item.name === "renounceOwnership"
    );

    if (hasRenounce) {
      warnings.push("renounceOwnership() present - ensure it's intentional to allow abandoning the contract");
    }

    return warnings;
  };

  const findPublicAdminFunctions = (abi: any[]): string[] => {
    return abi
      .filter(
        item =>
          item.type === "function" &&
          item.stateMutability !== "view" &&
          item.stateMutability !== "pure" &&
          (item.name.includes("set") ||
            item.name.includes("change") ||
            item.name.includes("update") ||
            item.name.includes("withdraw") ||
            item.name.includes("transfer") ||
            item.name.includes("grant") ||
            item.name.includes("revoke"))
      )
      .map(item => item.name);
  };

  const analyzeAccessControl = (abiString: string): AccessControlResult => {
    const abi = JSON.parse(abiString);
    const type = detectAccessControlType(abi) as any;
    const roles = extractRolesFromABI(abi);
    const hierarchy = buildHierarchy(roles);
    const securityWarnings = detectSecurityWarnings(abi, roles);
    const publicAdminFunctions = findPublicAdminFunctions(abi);

    return {
      type,
      roles,
      hierarchy,
      securityWarnings,
      publicAdminFunctions,
    };
  };

  const fetchABI = async (address: string, rpc: string): Promise<string> => {
    // Note: This would typically require an API key from Etherscan or similar
    // For now, we'll show an error message
    throw new Error(
      "Fetching ABI from address requires an Etherscan API key. Please use direct ABI input mode."
    );
  };

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let abi = abiInput;

      if (mode === "address") {
        if (!contractAddress || !rpcUrl) {
          throw new Error("Please provide contract address and RPC URL");
        }
        abi = await fetchABI(contractAddress, rpcUrl);
      }

      if (!abi) {
        throw new Error("Please provide contract ABI");
      }

      const analysisResult = analyzeAccessControl(abi);
      setResult(analysisResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAbiInput("");
    setContractAddress("");
    setRpcUrl("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <Label className="mb-2 block text-sm">Input Mode</Label>
        <div className="flex gap-2">
          <Button
            onClick={() => setMode("abi")}
            variant={mode === "abi" ? "primary" : "secondary"}
            className="flex-1"
          >
            Direct ABI
          </Button>
          <Button
            onClick={() => setMode("address")}
            variant={mode === "address" ? "primary" : "secondary"}
            className="flex-1"
          >
            Contract Address
          </Button>
        </div>
      </div>

      {mode === "abi" ? (
        <div>
          <Label className="mb-2 block text-sm">Contract ABI (JSON)</Label>
          <Textarea
            value={abiInput}
            onChange={(e) => setAbiInput(e.target.value)}
            placeholder='[{"type":"function","name":"hasRole","inputs":[...],...}]'
            className="font-mono text-xs min-h-[200px]"
          />
        </div>
      ) : (
        <>
          <div>
            <Label className="mb-2 block text-sm">Contract Address</Label>
            <Input
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm">RPC URL (with Etherscan API)</Label>
            <Input
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              placeholder="https://api.etherscan.io/api?apikey=YOUR_KEY"
              className="font-mono text-sm"
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleAnalyze} variant="primary" className="flex-1" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Access Control"}
        </Button>
        <Button onClick={handleReset}>
          Reset
        </Button>
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
          {/* Access Control Type */}
          <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
            <Label className="text-sm mb-2 block">Access Control Type</Label>
            <div className="text-base font-bold text-blue-400">{result.type}</div>
          </div>

          {/* Security Warnings */}
          {result.securityWarnings.length > 0 && (
            <div className="p-4 rounded-[12px] border bg-yellow-500/10 border-yellow-500/30">
              <Label className="text-sm mb-3 block text-yellow-400 font-semibold">
                Security Warnings
              </Label>
              <ul className="space-y-2">
                {result.securityWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-yellow-400 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">⚠</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role Hierarchy */}
          {result.hierarchy.length > 0 && (
            <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
              <Label className="text-sm mb-3 block">Role Hierarchy</Label>
              <div className="space-y-2">
                {result.hierarchy.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--color-gray-0)] border border-[var(--color-gray-200)]"
                    style={{ marginLeft: `${item.level * 20}px` }}
                  >
                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-blue-400">
                        {item.role}
                      </div>
                      {item.admin !== "None" && (
                        <div className="text-xs text-gray-400 mt-1">
                          Admin: {item.admin}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Level {item.level}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roles and Functions */}
          {result.roles.length > 0 && (
            <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
              <Label className="text-sm mb-3 block">Roles and Functions</Label>
              <div className="space-y-4">
                {result.roles.map((role, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[12px] bg-[var(--color-gray-0)] border border-[var(--color-gray-200)]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-mono text-sm font-semibold text-[var(--color-green-500)]">
                          {role.name}
                        </div>
                        <div className="font-mono text-xs text-gray-500 mt-1">
                          {role.identifier}
                        </div>
                      </div>
                      {role.adminRole && (
                        <div className="text-xs text-gray-400 bg-[var(--color-gray-0)] px-2 py-1 rounded-[12px]">
                          Admin: {role.adminRole}
                        </div>
                      )}
                    </div>
                    {role.functions.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Protected Functions:</div>
                        <div className="flex flex-wrap gap-2">
                          {role.functions.map((func, funcIdx) => (
                            <span
                              key={funcIdx}
                              className="text-xs font-mono bg-[var(--color-gray-0)] px-2 py-1 rounded-[12px] text-gray-300"
                            >
                              {func}()
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Admin Functions */}
          {result.publicAdminFunctions.length > 0 && (
            <div className="p-4 rounded-[12px] border bg-[var(--color-gray-0)] border-[var(--color-gray-200)]">
              <Label className="text-sm mb-3 block">State-Changing Functions</Label>
              <div className="text-xs text-gray-400 mb-3">
                Verify these functions have proper access control modifiers
              </div>
              <div className="flex flex-wrap gap-2">
                {result.publicAdminFunctions.map((func, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-1 rounded-[12px]"
                  >
                    {func}()
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const accessControlVisualizerConfig: ToolConfig = {
  id: "access-control-visualizer",
  name: "Access Control Visualizer",
  description: "Visualize and analyze smart contract access control patterns and role hierarchies",
  category: "web3",
  component: AccessControlVisualizerTool,
  seo: {
    keywords: [
      "access control",
      "openzeppelin roles",
      "smart contract security",
      "role hierarchy",
      "ownable pattern",
      "role based access",
      "contract permissions",
      "security analysis",
    ],
  },
  sections: [
    {
      title: "What is Access Control?",
      content:
        "Access control restricts who can call certain functions in a smart contract. Common patterns include Ownable (single owner), AccessControl (role-based), and custom role systems.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Access control uses modifiers and mapping structures to check caller permissions before executing functions. Roles are represented as bytes32 identifiers, and each address can have multiple roles. Admin roles can grant or revoke roles, creating hierarchical permission systems.
          </p>

          <h4 className="text-base font-semibold mb-2">OpenZeppelin AccessControl</h4>
          <p className="text-sm mb-4">
            OpenZeppelin's AccessControl provides a role-based access control mechanism with role hierarchies. Each role has an admin role that can grant/revoke that role to addresses.
          </p>

          <h4 className="text-base font-semibold mb-2">Role Hierarchy</h4>
          <p className="text-sm mb-4">
            DEFAULT_ADMIN_ROLE is typically the top-level admin that can manage all other roles. Other common roles include MINTER_ROLE, PAUSER_ROLE, BURNER_ROLE, and UPGRADER_ROLE.
          </p>

          <h4 className="text-base font-semibold mb-2">Security Best Practices</h4>
          <p className="text-sm">
            Always use access control for privileged functions, prefer role-based over single owner for flexibility, use two-step ownership transfer, and carefully consider renounceOwnership implications.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "USDC Token (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)",
      content: "ERC20 with master minter pattern. Verify master minter role controls mint/burn/pause functions on Ethereum mainnet.",
      type: "text",
    },
    {
      title: "Compound cToken (0x39AA39c021dfbaE8fAc545936693ac917d5E7563)",
      content: "ERC20Upgradeable with admin role. Check role hierarchy for implementation upgrades and function access control.",
      type: "text",
    },
    {
      title: "OpenZeppelin Reference Implementation",
      content: "Standard roles: DEFAULT_ADMIN_ROLE (top), MINTER_ROLE, PAUSER_ROLE, BURNER_ROLE, UPGRADER_ROLE with proper hierarchy.",
      type: "text",
    },
  ],
  codeSnippet: `// No external packages needed - standard JSON ABI parsing

interface Role {
  name: string;
  identifier: string;
  functions: string[];
}

// Analyze ABI for access control patterns
function analyzeAccessControl(abi: any[]): {
  type: string;
  roles: Role[];
} {
  const roles: Map<string, Role> = new Map();

  // Detect AccessControl pattern
  const hasAccessControl = abi.some(
    item => item.type === 'function' &&
    (item.name === 'hasRole' || item.name === 'getRoleAdmin')
  );

  // Detect Ownable pattern
  const hasOwnable = abi.some(
    item => item.type === 'function' && item.name === 'owner'
  );

  // Extract role-based functions
  abi.forEach(item => {
    if (item.type === 'function') {
      // Find minter role
      if (item.name.includes('mint') && !item.name.includes('Minter')) {
        if (!roles.has('MINTER_ROLE')) {
          roles.set('MINTER_ROLE', {
            name: 'MINTER_ROLE',
            identifier: 'MINTER_ROLE',
            functions: []
          });
        }
        roles.get('MINTER_ROLE')!.functions.push(item.name);
      }

      // Find pauser role
      if (item.name.includes('pause')) {
        if (!roles.has('PAUSER_ROLE')) {
          roles.set('PAUSER_ROLE', {
            name: 'PAUSER_ROLE',
            identifier: 'PAUSER_ROLE',
            functions: []
          });
        }
        roles.get('PAUSER_ROLE')!.functions.push(item.name);
      }
    }
  });

  const type = hasAccessControl ? 'AccessControl' :
               hasOwnable ? 'Ownable' : 'Unknown';

  return {
    type,
    roles: Array.from(roles.values())
  };
}

// Example usage
const exampleABI = [
  { type: 'function', name: 'hasRole', inputs: [] },
  { type: 'function', name: 'mint', inputs: [] },
  { type: 'function', name: 'pause', inputs: [] }
];

const analysis = analyzeAccessControl(exampleABI);
console.log('Type:', analysis.type); // AccessControl
console.log('Roles:', analysis.roles);`,
  references: [
    {
      title: "OpenZeppelin AccessControl",
      url: "https://docs.openzeppelin.com/contracts/5.x/access-control",
    },
    {
      title: "Ownable Pattern",
      url: "https://docs.openzeppelin.com/contracts/5.x/api/access#Ownable",
    },
  ],
};
