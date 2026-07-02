"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface DiffLine {
  lineNumber1: number | null;
  lineNumber2: number | null;
  content: string;
  type: "added" | "removed" | "unchanged" | "modified";
}

interface WordDiff {
  value: string;
  type: "added" | "removed" | "unchanged";
}

export function DiffViewerTool() {
  const t = useTranslations("toolUI.diff-viewer");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffMode, setDiffMode] = useState<"line" | "word">("line");
  const [lineDiff, setLineDiff] = useState<DiffLine[]>([]);
  const [wordDiff, setWordDiff] = useState<WordDiff[]>([]);
  const [stats, setStats] = useState({ additions: 0, deletions: 0, unchanged: 0 });

  const computeLineDiff = (str1: string, str2: string): DiffLine[] => {
    const lines1 = str1.split("\n");
    const lines2 = str2.split("\n");

    const m = lines1.length;
    const n = lines2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    // Build LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff
    const result: DiffLine[] = [];
    let i = m, j = n;
    let lineNum1 = m, lineNum2 = n;

    const tempResult: DiffLine[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        tempResult.unshift({
          lineNumber1: lineNum1,
          lineNumber2: lineNum2,
          content: lines1[i - 1],
          type: "unchanged",
        });
        i--;
        j--;
        lineNum1--;
        lineNum2--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        tempResult.unshift({
          lineNumber1: null,
          lineNumber2: lineNum2,
          content: lines2[j - 1],
          type: "added",
        });
        j--;
        lineNum2--;
      } else if (i > 0) {
        tempResult.unshift({
          lineNumber1: lineNum1,
          lineNumber2: null,
          content: lines1[i - 1],
          type: "removed",
        });
        i--;
        lineNum1--;
      }
    }

    // Renumber lines properly
    let num1 = 1, num2 = 1;
    for (const line of tempResult) {
      if (line.type === "unchanged") {
        line.lineNumber1 = num1++;
        line.lineNumber2 = num2++;
      } else if (line.type === "added") {
        line.lineNumber2 = num2++;
      } else if (line.type === "removed") {
        line.lineNumber1 = num1++;
      }
      result.push(line);
    }

    return result;
  };

  const computeWordDiff = (str1: string, str2: string): WordDiff[] => {
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
    const result: WordDiff[] = [];
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
      setLineDiff([]);
      setWordDiff([]);
      setStats({ additions: 0, deletions: 0, unchanged: 0 });
      return;
    }

    if (diffMode === "line") {
      const diff = computeLineDiff(text1, text2);
      setLineDiff(diff);
      setWordDiff([]);

      const additions = diff.filter(d => d.type === "added").length;
      const deletions = diff.filter(d => d.type === "removed").length;
      const unchanged = diff.filter(d => d.type === "unchanged").length;
      setStats({ additions, deletions, unchanged });
    } else {
      const diff = computeWordDiff(text1, text2);
      setWordDiff(diff);
      setLineDiff([]);

      const additions = diff.filter(d => d.type === "added").length;
      const deletions = diff.filter(d => d.type === "removed").length;
      const unchanged = diff.filter(d => d.type === "unchanged").length;
      setStats({ additions, deletions, unchanged });
    }
  };

  const handleReset = () => {
    setText1("");
    setText2("");
    setLineDiff([]);
    setWordDiff([]);
    setStats({ additions: 0, deletions: 0, unchanged: 0 });
  };

  const handleSwap = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  return (
    <div className="space-y-6">
      {/* Input Texts Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Textarea
            label={t("originalLabel")}
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder={t("originalPlaceholder")}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <div>
          <Textarea
            label={t("modifiedLabel")}
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder={t("modifiedPlaceholder")}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </div>

      {/* Diff Mode Selection */}
      <div>
        <Label className="mb-2 block text-sm">{t("diffModeLabel")}</Label>
        <div className="flex gap-2">
          <Button
            variant={diffMode === "line" ? "primary" : "secondary"}
            onClick={() => setDiffMode("line")}
            className="flex-1"
            size="sm"
          >
            {t("lineByLine")}
          </Button>
          <Button
            variant={diffMode === "word" ? "primary" : "secondary"}
            onClick={() => setDiffMode("word")}
            className="flex-1"
            size="sm"
          >
            {t("wordByWord")}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleCompare} variant="primary" className="flex-1">
          {t("compare")}
        </Button>
        <Button onClick={handleSwap} className="sm:flex-none">
          {t("swap")}
        </Button>
        <Button onClick={handleReset} className="sm:flex-none">
          {t("reset")}
        </Button>
      </div>

      {/* Statistics */}
      {(lineDiff.length > 0 || wordDiff.length > 0) && (
        <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
          <Label className="text-sm mb-2 block">{t("statistics")}</Label>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[var(--color-green-500)]">+ {t("additions")}</span>{" "}
              <span className="font-mono">{stats.additions}</span>
            </div>
            <div>
              <span className="text-[var(--color-red-500)]">- {t("deletions")}</span>{" "}
              <span className="font-mono">{stats.deletions}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("unchanged")}</span>{" "}
              <span className="font-mono">{stats.unchanged}</span>
            </div>
          </div>
        </div>
      )}

      {/* Line Diff Display */}
      {lineDiff.length > 0 && (
        <div>
          <Label className="text-sm mb-2 block">{t("differences")}</Label>
          <div className="border border-border rounded-[12px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <tbody>
                  {lineDiff.map((line, index) => (
                    <tr
                      key={index}
                      className={
                        line.type === "added"
                          ? "bg-green-500/10"
                          : line.type === "removed"
                          ? "bg-red-500/10"
                          : ""
                      }
                    >
                      <td className="w-12 px-2 py-1 text-right text-muted-foreground border-r border-border select-none">
                        {line.lineNumber1 || ""}
                      </td>
                      <td className="w-12 px-2 py-1 text-right text-muted-foreground border-r border-border select-none">
                        {line.lineNumber2 || ""}
                      </td>
                      <td className="w-6 px-2 py-1 text-center border-r border-border select-none">
                        {line.type === "added" && (
                          <span className="text-[var(--color-green-500)]">+</span>
                        )}
                        {line.type === "removed" && (
                          <span className="text-[var(--color-red-500)]">-</span>
                        )}
                      </td>
                      <td
                        className={`px-2 py-1 whitespace-pre ${
                          line.type === "added"
                            ? "text-[var(--color-green-500)]"
                            : line.type === "removed"
                            ? "text-[var(--color-red-500)]"
                            : ""
                        }`}
                      >
                        {line.content || " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Word Diff Display */}
      {wordDiff.length > 0 && (
        <div>
          <Label className="text-sm mb-2 block">{t("differences")}</Label>
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px] min-h-[150px] font-mono text-sm whitespace-pre-wrap break-words">
            {wordDiff.map((part, index) => (
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
      )}
    </div>
  );
}

export const diffViewerConfig: ToolConfig = {
  id: "diff-viewer",
  name: "Diff Viewer",
  description: "Compare two text inputs side by side and highlight differences",
  category: "utilities",
  component: DiffViewerTool,
  seo: {
    keywords: [
      "diff viewer",
      "text diff",
      "compare text",
      "diff tool online",
      "text comparison",
      "code diff",
      "file diff",
      "diff checker",
      "compare files",
      "text difference",
      "side by side diff",
      "line by line comparison",
      "word diff",
      "unified diff",
      "diff online",
      "compare strings",
      "difference finder",
    ],
  },
  sections: [
    {
      title: "What is a Diff Viewer?",
      content:
        "A diff viewer is a tool that compares two pieces of text and highlights the differences between them. It shows what was added, removed, or changed, making it easy to review modifications in documents, code, or any text content.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            This tool uses the Longest Common Subsequence (LCS) algorithm to compute differences between two texts. Additions are highlighted in green with a + prefix, and deletions are shown in red with a - prefix.
          </p>

          <h4 className="text-base font-semibold mb-2">Diff Modes</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>Line by Line</strong> - Compares text line by line, showing line numbers for both versions. Best for code review and structured documents.</li>
            <li><strong>Word by Word</strong> - Compares individual words, showing inline additions and deletions. Best for prose and natural language text.</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Reading the Output</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-[var(--color-green-500)]">Green (+)</span> - Lines or words that were added</li>
            <li><span className="text-[var(--color-red-500)]">Red (-)</span> - Lines or words that were removed</li>
            <li>Normal text - Content that remained unchanged</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Code review",
      content: "Compare old and new versions of code to see what changed",
      type: "text",
    },
    {
      title: "Document comparison",
      content: "Find differences between document drafts or revisions",
      type: "text",
    },
    {
      title: "Configuration files",
      content: "Spot changes in config files between environments",
      type: "text",
    },
  ],
  codeSnippet: `// Line-by-line diff using Longest Common Subsequence (LCS)
// No external dependencies required

interface DiffLine {
  lineNumber1: number | null;
  lineNumber2: number | null;
  content: string;
  type: 'added' | 'removed' | 'unchanged';
}

function computeLineDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split('\\n');
  const lines2 = text2.split('\\n');

  const m = lines1.length;
  const n = lines2.length;

  // Build LCS dynamic programming table
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build the diff
  const result: DiffLine[] = [];
  let i = m, j = n;
  let num1 = m, num2 = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      result.unshift({
        lineNumber1: num1--,
        lineNumber2: num2--,
        content: lines1[i - 1],
        type: 'unchanged'
      });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        lineNumber1: null,
        lineNumber2: num2--,
        content: lines2[j - 1],
        type: 'added'
      });
      j--;
    } else if (i > 0) {
      result.unshift({
        lineNumber1: num1--,
        lineNumber2: null,
        content: lines1[i - 1],
        type: 'removed'
      });
      i--;
    }
  }

  return result;
}

// Example usage
const original = \`function hello() {
  console.log("Hello");
}\`;

const modified = \`function hello() {
  console.log("Hello, World!");
  return true;
}\`;

const diff = computeLineDiff(original, modified);

diff.forEach(line => {
  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
  const num1 = line.lineNumber1?.toString().padStart(2) || '  ';
  const num2 = line.lineNumber2?.toString().padStart(2) || '  ';
  console.log(\`\${num1} \${num2} \${prefix} \${line.content}\`);
});

// Output:
//  1  1   function hello() {
//  2     -   console.log("Hello");
//     2 +   console.log("Hello, World!");
//     3 +   return true;
//  3  4   }`,
  references: [
    {
      title: "Diff Algorithm",
      url: "https://en.wikipedia.org/wiki/Diff",
    },
    {
      title: "Longest Common Subsequence",
      url: "https://en.wikipedia.org/wiki/Longest_common_subsequence_problem",
    },
    {
      title: "Unified Diff Format",
      url: "https://en.wikipedia.org/wiki/Diff#Unified_format",
    },
  ],
};
