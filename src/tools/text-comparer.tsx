"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface DiffPart {
  value: string;
  type: "added" | "removed" | "unchanged";
}

export function TextComparerTool() {
  const t = useTranslations("toolUI.text-comparer");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffMode, setDiffMode] = useState<"character" | "word">("word");
  const [diff, setDiff] = useState<DiffPart[]>([]);
  const [stats, setStats] = useState({ additions: 0, deletions: 0, unchanged: 0 });

  const computeCharDiff = (str1: string, str2: string): DiffPart[] => {
    // Simple character-level diff using LCS approach
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    // Build LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff
    const result: DiffPart[] = [];
    let i = m, j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
        result.unshift({ value: str1[i - 1], type: "unchanged" });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ value: str2[j - 1], type: "added" });
        j--;
      } else if (i > 0) {
        result.unshift({ value: str1[i - 1], type: "removed" });
        i--;
      }
    }

    return result;
  };

  const computeWordDiff = (str1: string, str2: string): DiffPart[] => {
    const words1 = str1.split(/(\s+)/);
    const words2 = str2.split(/(\s+)/);

    const m = words1.length;
    const n = words2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    // Build LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (words1[i - 1] === words2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff
    const result: DiffPart[] = [];
    let i = m, j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
        result.unshift({ value: words1[i - 1], type: "unchanged" });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ value: words2[j - 1], type: "added" });
        j--;
      } else if (i > 0) {
        result.unshift({ value: words1[i - 1], type: "removed" });
        i--;
      }
    }

    return result;
  };

  const handleCompare = () => {
    if (!text1 && !text2) {
      setDiff([]);
      setStats({ additions: 0, deletions: 0, unchanged: 0 });
      return;
    }

    const diffResult = diffMode === "character"
      ? computeCharDiff(text1, text2)
      : computeWordDiff(text1, text2);

    setDiff(diffResult);

    // Calculate statistics
    const additions = diffResult.filter(d => d.type === "added").length;
    const deletions = diffResult.filter(d => d.type === "removed").length;
    const unchanged = diffResult.filter(d => d.type === "unchanged").length;

    setStats({ additions, deletions, unchanged });
  };

  return (
    <div className="space-y-6">
      {/* Input Text 1 */}
      <div>
        <Textarea
          label={t("originalText")}
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          placeholder={t("originalPlaceholder")}
          className="min-h-[150px]"
        />
      </div>

      {/* Input Text 2 */}
      <div>
        <Textarea
          label={t("modifiedText")}
          value={text2}
          onChange={(e) => setText2(e.target.value)}
          placeholder={t("modifiedPlaceholder")}
          className="min-h-[150px]"
        />
      </div>

      {/* Diff Mode */}
      <div>
        <Label className="mb-2 block text-sm">{t("diffMode")}</Label>
        <div className="flex gap-2">
          <Button
            variant={diffMode === "word" ? "primary" : "secondary"}
            onClick={() => setDiffMode("word")}
            className="flex-1"
            size="sm"
          >
            {t("wordLevel")}
          </Button>
          <Button
            variant={diffMode === "character" ? "primary" : "secondary"}
            onClick={() => setDiffMode("character")}
            className="flex-1"
            size="sm"
          >
            {t("charLevel")}
          </Button>
        </div>
      </div>

      {/* Compare Button */}
      <Button onClick={handleCompare} variant="primary" className="w-full">
        {t("compare")}
      </Button>

      {/* Results */}
      {diff.length > 0 && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <Label className="text-sm mb-2 block">{t("statistics")}</Label>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--color-green-500)]">{t("additions")}</span>{" "}
                <span className="font-mono">{stats.additions}</span>
              </div>
              <div>
                <span className="text-[var(--color-red-500)]">{t("deletions")}</span>{" "}
                <span className="font-mono">{stats.deletions}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("unchanged")}</span>{" "}
                <span className="font-mono">{stats.unchanged}</span>
              </div>
            </div>
          </div>

          {/* Diff Display */}
          <div>
            <Label className="text-sm mb-2 block">{t("differences")}</Label>
            <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px] min-h-[150px] font-mono text-sm whitespace-pre-wrap break-words">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.type === "added"
                      ? "bg-green-500/20 text-[var(--color-green-500)]"
                      : part.type === "removed"
                      ? "bg-red-500/20 text-[var(--color-red-500)] line-through"
                      : ""
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const textComparerConfig: ToolConfig = {
  id: "text-comparer",
  name: "Text Comparer",
  description: "Compare two texts and highlight differences with character or word-level granularity",
  category: "text",
  component: TextComparerTool,
  seo: {
    keywords: [
      "text comparer",
      "compare texts",
      "text difference finder",
      "compare two texts",
      "text comparison tool",
      "find text differences",
      "text diff tool",
      "compare documents",
      "text similarity checker",
      "line by line comparison",
      "string diff",
      "text diff viewer",
      "compare strings",
      "string difference",
      "character diff",
      "word diff",
      "string comparison",
      "diff viewer online",
      "text change detector",
      "code diff",
    ],
  },
  sections: [
    {
      title: "What is text comparison?",
      content:
        "Text comparison (or diff) is a tool that identifies and highlights changes between two pieces of text. It shows what was added, removed, or kept the same, making it easy to spot differences between documents, code versions, or any text content.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">This tool uses the Longest Common Subsequence (LCS) algorithm to compute differences between two texts. It highlights additions in green and deletions in red with strikethrough, providing a visual representation of changes.</p>

          <h4 className="text-base font-semibold mb-2">Diff Modes</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Word Level</strong> - Compares text word by word, better for natural language and general text</li>
            <li><strong>Character Level</strong> - Compares character by character, more granular for precise changes</li>
          </ul>

          <h4 className="text-base font-semibold mb-2 mt-4">Statistics</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Additions</strong> - Content that exists in the modified text but not in the original</li>
            <li><strong>Deletions</strong> - Content that was removed from the original text</li>
            <li><strong>Unchanged</strong> - Content that remains the same in both texts</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Common Use Cases",
      content: "Code review, document comparison, text editing history, detecting changes in configuration files, comparing API responses, verifying text modifications",
      type: "text",
    },
  ],
  codeSnippet: `type DiffPart = {
  value: string;
  type: 'added' | 'removed' | 'unchanged';
};

// Compute word-level diff using Longest Common Subsequence (LCS)
function computeWordDiff(str1: string, str2: string): DiffPart[] {
  const words1 = str1.split(/(\\s+)/);
  const words2 = str2.split(/(\\s+)/);

  const m = words1.length;
  const n = words2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  // Build LCS table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  const result: DiffPart[] = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      result.unshift({ value: words1[i - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ value: words2[j - 1], type: 'added' });
      j--;
    } else if (i > 0) {
      result.unshift({ value: words1[i - 1], type: 'removed' });
      i--;
    }
  }

  return result;
}

// Example usage
const text1 = "The quick brown fox jumps";
const text2 = "The quick red fox runs";

const diff = computeWordDiff(text1, text2);

diff.forEach((part) => {
  if (part.type === 'added') {
    console.log(\`+ \${part.value}\`);
  } else if (part.type === 'removed') {
    console.log(\`- \${part.value}\`);
  } else {
    console.log(\`  \${part.value}\`);
  }
});`,
  references: [
    {
      title: "Longest Common Subsequence Algorithm",
      url: "https://en.wikipedia.org/wiki/Longest_common_subsequence_problem",
    },
    {
      title: "Diff Algorithm",
      url: "https://en.wikipedia.org/wiki/Diff",
    },
  ],
};
