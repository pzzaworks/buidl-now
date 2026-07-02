"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

interface PermissionSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

interface Permissions {
  owner: PermissionSet;
  group: PermissionSet;
  other: PermissionSet;
}

export function ChmodCalculatorTool() {
  const t = useTranslations("toolUI.chmod-calculator");
  const [permissions, setPermissions] = useState<Permissions>({
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    other: { read: true, write: false, execute: true },
  });
  const [numericInput, setNumericInput] = useState("755");
  const [symbolicInput, setSymbolicInput] = useState("rwxr-xr-x");

  const permissionToNumber = (perm: PermissionSet): number => {
    return (perm.read ? 4 : 0) + (perm.write ? 2 : 0) + (perm.execute ? 1 : 0);
  };

  const numberToPermission = (num: number): PermissionSet => {
    return {
      read: (num & 4) !== 0,
      write: (num & 2) !== 0,
      execute: (num & 1) !== 0,
    };
  };

  const permissionToSymbolic = (perm: PermissionSet): string => {
    return (
      (perm.read ? "r" : "-") +
      (perm.write ? "w" : "-") +
      (perm.execute ? "x" : "-")
    );
  };

  const symbolicToPermission = (sym: string): PermissionSet => {
    return {
      read: sym[0] === "r",
      write: sym[1] === "w",
      execute: sym[2] === "x",
    };
  };

  const getNumericValue = (): string => {
    return (
      permissionToNumber(permissions.owner).toString() +
      permissionToNumber(permissions.group).toString() +
      permissionToNumber(permissions.other).toString()
    );
  };

  const getSymbolicValue = (): string => {
    return (
      permissionToSymbolic(permissions.owner) +
      permissionToSymbolic(permissions.group) +
      permissionToSymbolic(permissions.other)
    );
  };

  useEffect(() => {
    setNumericInput(getNumericValue());
    setSymbolicInput(getSymbolicValue());
  }, [permissions]);

  const handleCheckboxChange = (
    role: "owner" | "group" | "other",
    permission: "read" | "write" | "execute",
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: checked,
      },
    }));
  };

  const handleNumericChange = (value: string) => {
    setNumericInput(value);

    // Validate input: should be 3 digits, each 0-7
    if (/^[0-7]{3}$/.test(value)) {
      const owner = parseInt(value[0]);
      const group = parseInt(value[1]);
      const other = parseInt(value[2]);

      setPermissions({
        owner: numberToPermission(owner),
        group: numberToPermission(group),
        other: numberToPermission(other),
      });
    }
  };

  const handleSymbolicChange = (value: string) => {
    setSymbolicInput(value);

    // Validate input: should be 9 characters like rwxr-xr-x
    if (/^[rwx-]{9}$/.test(value)) {
      setPermissions({
        owner: symbolicToPermission(value.slice(0, 3)),
        group: symbolicToPermission(value.slice(3, 6)),
        other: symbolicToPermission(value.slice(6, 9)),
      });
    }
  };

  const handleReset = () => {
    setPermissions({
      owner: { read: true, write: true, execute: true },
      group: { read: true, write: false, execute: true },
      other: { read: true, write: false, execute: true },
    });
  };

  const presets = [
    { label: "755 (rwxr-xr-x)", value: "755", desc: "Standard for directories/executables" },
    { label: "644 (rw-r--r--)", value: "644", desc: "Standard for files" },
    { label: "777 (rwxrwxrwx)", value: "777", desc: "Full permissions (caution)" },
    { label: "700 (rwx------)", value: "700", desc: "Owner only" },
    { label: "600 (rw-------)", value: "600", desc: "Private file" },
    { label: "444 (r--r--r--)", value: "444", desc: "Read-only for all" },
  ];

  const PermissionCheckboxes = ({
    role,
    label,
  }: {
    role: "owner" | "group" | "other";
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-4">
        <Checkbox
          checked={permissions[role].read}
          onChange={(e) => handleCheckboxChange(role, "read", e.target.checked)}
          label={`${t("read")} (r)`}
        />
        <Checkbox
          checked={permissions[role].write}
          onChange={(e) => handleCheckboxChange(role, "write", e.target.checked)}
          label={`${t("write")} (w)`}
        />
        <Checkbox
          checked={permissions[role].execute}
          onChange={(e) => handleCheckboxChange(role, "execute", e.target.checked)}
          label={`${t("execute")} (x)`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Permission Checkboxes */}
      <div className="space-y-4 p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
        <PermissionCheckboxes role="owner" label={t("ownerLabel")} />
        <PermissionCheckboxes role="group" label={t("groupLabel")} />
        <PermissionCheckboxes role="other" label={t("otherLabel")} />
      </div>

      {/* Numeric Input */}
      <div>
        <Input
          label={t("numericLabel")}
          value={numericInput}
          onChange={(e) => handleNumericChange(e.target.value)}
          placeholder="755"
          maxLength={3}
          showCopy
          className="font-mono text-lg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("numericHelp")}
        </p>
      </div>

      {/* Symbolic Input */}
      <div>
        <Input
          label={t("symbolicLabel")}
          value={symbolicInput}
          onChange={(e) => handleSymbolicChange(e.target.value)}
          placeholder="rwxr-xr-x"
          maxLength={9}
          showCopy
          className="font-mono text-lg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("symbolicHelp")}
        </p>
      </div>

      {/* chmod Command */}
      <div>
        <Input
          label={`chmod ${t("command")}`}
          value={`chmod ${getNumericValue()} filename`}
          readOnly
          showCopy
          className="font-mono bg-[var(--color-gray-0)]"
        />
      </div>

      {/* Presets */}
      <div>
        <Label className="mb-2 block text-sm">{t("commonPresets")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              onClick={() => handleNumericChange(preset.value)}
              variant={numericInput === preset.value ? "primary" : "secondary"}
              size="sm"
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} className="w-full">
        {t("resetDefault")} (755)
      </Button>

      {/* Permission Table */}
      <div className="overflow-x-auto">
        <Label className="mb-2 block text-sm">{t("permissionBreakdown")}</Label>
        <table className="w-full text-sm border border-border rounded-[12px] overflow-hidden">
          <thead>
            <tr className="bg-[var(--color-gray-0)]">
              <th className="px-3 py-2 text-left border-b border-border">{t("colRole")}</th>
              <th className="px-3 py-2 text-center border-b border-border">{t("read")} (4)</th>
              <th className="px-3 py-2 text-center border-b border-border">{t("write")} (2)</th>
              <th className="px-3 py-2 text-center border-b border-border">{t("execute")} (1)</th>
              <th className="px-3 py-2 text-center border-b border-border">{t("colValue")}</th>
              <th className="px-3 py-2 text-center border-b border-border">{t("colSymbolic")}</th>
            </tr>
          </thead>
          <tbody>
            {(["owner", "group", "other"] as const).map((role) => (
              <tr key={role}>
                <td className="px-3 py-2 border-b border-border capitalize">{role}</td>
                <td className="px-3 py-2 text-center border-b border-border">
                  {permissions[role].read ? "4" : "-"}
                </td>
                <td className="px-3 py-2 text-center border-b border-border">
                  {permissions[role].write ? "2" : "-"}
                </td>
                <td className="px-3 py-2 text-center border-b border-border">
                  {permissions[role].execute ? "1" : "-"}
                </td>
                <td className="px-3 py-2 text-center border-b border-border font-mono">
                  {permissionToNumber(permissions[role])}
                </td>
                <td className="px-3 py-2 text-center border-b border-border font-mono">
                  {permissionToSymbolic(permissions[role])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const chmodCalculatorConfig: ToolConfig = {
  id: "chmod-calculator",
  name: "Chmod Calculator",
  description: "Convert between numeric and symbolic Unix file permissions",
  category: "utilities",
  component: ChmodCalculatorTool,
  seo: {
    keywords: [
      "chmod calculator",
      "file permissions",
      "unix permissions",
      "linux chmod",
      "permission calculator",
      "octal permissions",
      "symbolic permissions",
      "rwx permissions",
      "chmod command",
      "file permission converter",
      "chmod 755",
      "chmod 644",
      "chmod 777",
      "permission bits",
      "linux file permissions",
    ],
  },
  sections: [
    {
      title: "What is chmod?",
      content:
        "chmod (change mode) is a Unix/Linux command used to change file and directory permissions. Permissions control who can read, write, or execute a file. This calculator helps you convert between numeric (octal) and symbolic permission representations.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Permission Types</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Read (r = 4)</strong> - View file contents or list directory</li>
            <li><strong>Write (w = 2)</strong> - Modify file or add/remove files in directory</li>
            <li><strong>Execute (x = 1)</strong> - Run file as program or access directory</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Permission Groups</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Owner (User)</strong> - The file&apos;s owner</li>
            <li><strong>Group</strong> - Users in the file&apos;s group</li>
            <li><strong>Other (World)</strong> - All other users</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Calculating Numeric Values</h4>
          <p className="text-sm mb-2">
            Add the values for each permission: read (4) + write (2) + execute (1).
            For example, rwx = 4+2+1 = 7, r-x = 4+0+1 = 5.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "755 - Standard directory",
      content: "rwxr-xr-x: Owner can read/write/execute, others can read/execute",
      type: "text",
    },
    {
      title: "644 - Standard file",
      content: "rw-r--r--: Owner can read/write, others can only read",
      type: "text",
    },
    {
      title: "700 - Private directory",
      content: "rwx------: Only owner has any permissions",
      type: "text",
    },
    {
      title: "600 - Private file",
      content: "rw-------: Only owner can read and write",
      type: "text",
    },
  ],
  codeSnippet: `// Chmod permission calculator in TypeScript
// No external dependencies required

interface PermissionSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

interface Permissions {
  owner: PermissionSet;
  group: PermissionSet;
  other: PermissionSet;
}

function permissionToOctal(perm: PermissionSet): number {
  return (perm.read ? 4 : 0) + (perm.write ? 2 : 0) + (perm.execute ? 1 : 0);
}

function octalToPermission(num: number): PermissionSet {
  return {
    read: (num & 4) !== 0,
    write: (num & 2) !== 0,
    execute: (num & 1) !== 0,
  };
}

function permissionToSymbolic(perm: PermissionSet): string {
  return (
    (perm.read ? 'r' : '-') +
    (perm.write ? 'w' : '-') +
    (perm.execute ? 'x' : '-')
  );
}

function parseOctalString(octal: string): Permissions {
  if (!/^[0-7]{3}$/.test(octal)) {
    throw new Error('Invalid octal format. Use 3 digits (0-7).');
  }

  return {
    owner: octalToPermission(parseInt(octal[0])),
    group: octalToPermission(parseInt(octal[1])),
    other: octalToPermission(parseInt(octal[2])),
  };
}

function toOctalString(perms: Permissions): string {
  return (
    permissionToOctal(perms.owner).toString() +
    permissionToOctal(perms.group).toString() +
    permissionToOctal(perms.other).toString()
  );
}

function toSymbolicString(perms: Permissions): string {
  return (
    permissionToSymbolic(perms.owner) +
    permissionToSymbolic(perms.group) +
    permissionToSymbolic(perms.other)
  );
}

// Example usage
console.log('=== Parse Octal ===');
const perms755 = parseOctalString('755');
console.log('755 =', toSymbolicString(perms755)); // rwxr-xr-x

const perms644 = parseOctalString('644');
console.log('644 =', toSymbolicString(perms644)); // rw-r--r--

console.log('\\n=== Build Permissions ===');
const customPerms: Permissions = {
  owner: { read: true, write: true, execute: false },
  group: { read: true, write: false, execute: false },
  other: { read: false, write: false, execute: false },
};

console.log('Custom:', toOctalString(customPerms)); // 640
console.log('Symbolic:', toSymbolicString(customPerms)); // rw-r-----

console.log('\\n=== chmod Command ===');
console.log(\`chmod \${toOctalString(perms755)} myfile.sh\`);

// Output:
// === Parse Octal ===
// 755 = rwxr-xr-x
// 644 = rw-r--r--
//
// === Build Permissions ===
// Custom: 640
// Symbolic: rw-r-----
//
// === chmod Command ===
// chmod 755 myfile.sh`,
  references: [
    {
      title: "chmod - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Chmod",
    },
    {
      title: "Linux File Permissions Explained",
      url: "https://www.linux.com/training-tutorials/understanding-linux-file-permissions/",
    },
    {
      title: "chmod Man Page",
      url: "https://man7.org/linux/man-pages/man1/chmod.1.html",
    },
  ],
};
