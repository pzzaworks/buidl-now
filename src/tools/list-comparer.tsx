"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";
import { MdContentCopy, MdCheck } from "react-icons/md";

export function ListComparerTool() {
  const t = useTranslations("toolUI.list-comparer");
  const [list1, setList1] = useState("");
  const [list2, setList2] = useState("");
  const [onlyInList1, setOnlyInList1] = useState<string[]>([]);
  const [onlyInList2, setOnlyInList2] = useState<string[]>([]);
  const [inBoth, setInBoth] = useState<string[]>([]);
  const [copiedList1, setCopiedList1] = useState(false);
  const [copiedList2, setCopiedList2] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  const handleCompare = () => {
    if (!list1 && !list2) {
      setOnlyInList1([]);
      setOnlyInList2([]);
      setInBoth([]);
      return;
    }

    const items1 = list1
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);
    const items2 = list2
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);

    const set1 = new Set(items1);
    const set2 = new Set(items2);

    const only1 = items1.filter((item) => !set2.has(item));
    const only2 = items2.filter((item) => !set1.has(item));
    const both = items1.filter((item) => set2.has(item));

    setOnlyInList1([...new Set(only1)]);
    setOnlyInList2([...new Set(only2)]);
    setInBoth([...new Set(both)]);
  };

  const handleReset = () => {
    setList1("");
    setList2("");
    setOnlyInList1([]);
    setOnlyInList2([]);
    setInBoth([]);
  };

  const handleCopyList1 = async () => {
    if (onlyInList1.length > 0) {
      await navigator.clipboard.writeText(onlyInList1.join("\n"));
      setCopiedList1(true);
      setTimeout(() => setCopiedList1(false), 2000);
    }
  };

  const handleCopyList2 = async () => {
    if (onlyInList2.length > 0) {
      await navigator.clipboard.writeText(onlyInList2.join("\n"));
      setCopiedList2(true);
      setTimeout(() => setCopiedList2(false), 2000);
    }
  };

  const handleCopyBoth = async () => {
    if (inBoth.length > 0) {
      await navigator.clipboard.writeText(inBoth.join("\n"));
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* List 1 */}
      <div>
        <Label className="mb-2 block text-sm">{t("list1Label")}</Label>
        <Textarea
          value={list1}
          onChange={(e) => setList1(e.target.value)}
          placeholder="apple&#10;banana&#10;orange"
          className="min-h-[150px]"
        />
      </div>

      {/* List 2 */}
      <div>
        <Label className="mb-2 block text-sm">{t("list2Label")}</Label>
        <Textarea
          value={list2}
          onChange={(e) => setList2(e.target.value)}
          placeholder="banana&#10;grape&#10;orange"
          className="min-h-[150px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleCompare} variant="primary" className="flex-1">
          {t("compareLists")}
        </Button>
        <Button onClick={handleReset}>
          {t("reset")}
        </Button>
      </div>

      {/* Results */}
      {(onlyInList1.length > 0 || onlyInList2.length > 0 || inBoth.length > 0) && (
        <div className="space-y-4">
          {/* Only in List 1 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm">
                {t("onlyInList1", { count: onlyInList1.length })}
              </Label>
              {onlyInList1.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyList1}
                  className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
                  title={copiedList1 ? t("copied") : t("copyToClipboard")}
                >
                  {copiedList1 ? (
                    <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                  ) : (
                    <MdContentCopy style={{ width: 16, height: 16 }} />
                  )}
                </button>
              )}
            </div>
            <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px] min-h-[80px]">
              {onlyInList1.length > 0 ? (
                onlyInList1.map((item, i) => (
                  <div key={i} className="text-sm py-1">
                    {item}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">{t("noUniqueItems")}</div>
              )}
            </div>
          </div>

          {/* Only in List 2 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm">
                {t("onlyInList2", { count: onlyInList2.length })}
              </Label>
              {onlyInList2.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyList2}
                  className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
                  title={copiedList2 ? t("copied") : t("copyToClipboard")}
                >
                  {copiedList2 ? (
                    <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                  ) : (
                    <MdContentCopy style={{ width: 16, height: 16 }} />
                  )}
                </button>
              )}
            </div>
            <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px] min-h-[80px]">
              {onlyInList2.length > 0 ? (
                onlyInList2.map((item, i) => (
                  <div key={i} className="text-sm py-1">
                    {item}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">{t("noUniqueItems")}</div>
              )}
            </div>
          </div>

          {/* In Both */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm">
                {t("inBothLists", { count: inBoth.length })}
              </Label>
              {inBoth.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyBoth}
                  className="w-8 h-8 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center transition-colors cursor-pointer"
                  title={copiedBoth ? t("copied") : t("copyToClipboard")}
                >
                  {copiedBoth ? (
                    <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
                  ) : (
                    <MdContentCopy style={{ width: 16, height: 16 }} />
                  )}
                </button>
              )}
            </div>
            <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px] min-h-[80px]">
              {inBoth.length > 0 ? (
                inBoth.map((item, i) => (
                  <div key={i} className="text-sm py-1">
                    {item}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">{t("noCommonItems")}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const listComparerConfig: ToolConfig = {
  id: "list-comparer",
  name: "List Comparer",
  description: "Compare two lists and find differences and intersections",
  category: "text",
  component: ListComparerTool,
  seo: {
    keywords: [
      "list comparer",
      "compare lists",
      "list difference finder",
      "compare two lists",
      "list intersection",
      "find unique items",
      "list comparison tool",
      "compare arrays",
      "list diff",
      "set operations",
    ],
  },
  sections: [
    {
      title: "What is list comparison?",
      content:
        "List comparison is the process of analyzing two lists to identify their differences and similarities. It helps find items that are unique to each list and items that appear in both lists.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">This tool compares two lists line by line and shows you: items only in the first list, items only in the second list, and items that appear in both lists. Duplicate items within each list are automatically removed.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Example comparison",
      content: "List 1: apple, banana, orange | List 2: banana, grape, orange | Result: Only in 1: apple | Only in 2: grape | In both: banana, orange",
      type: "text",
    },
  ],
  codeSnippet: `type ComparisonResult = {
  onlyInList1: string[];
  onlyInList2: string[];
  inBoth: string[];
};

function compareLists(list1: string, list2: string): ComparisonResult {
  const items1 = list1
    .split('\\n')
    .map((s) => s.trim())
    .filter((s) => s);
  const items2 = list2
    .split('\\n')
    .map((s) => s.trim())
    .filter((s) => s);

  const set1 = new Set(items1);
  const set2 = new Set(items2);

  const only1 = items1.filter((item) => !set2.has(item));
  const only2 = items2.filter((item) => !set1.has(item));
  const both = items1.filter((item) => set2.has(item));

  return {
    onlyInList1: [...new Set(only1)],
    onlyInList2: [...new Set(only2)],
    inBoth: [...new Set(both)],
  };
}

// Example usage
const list1 = \`apple
banana
orange\`;

const list2 = \`banana
grape
orange\`;

const result = compareLists(list1, list2);

console.log('Only in List 1:', result.onlyInList1);  // ['apple']
console.log('Only in List 2:', result.onlyInList2);  // ['grape']
console.log('In Both:', result.inBoth);              // ['banana', 'orange']`,
  references: [
    {
      title: "Set Operations",
      url: "https://en.wikipedia.org/wiki/Set_(mathematics)#Basic_operations",
    },
  ],
};
