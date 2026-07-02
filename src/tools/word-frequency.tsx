"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

// Common English stop words
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
  "used", "it", "its", "this", "that", "these", "those", "i", "you", "he",
  "she", "we", "they", "what", "which", "who", "whom", "whose", "where",
  "when", "why", "how", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own",
  "same", "so", "than", "too", "very", "just", "also", "now", "here",
  "there", "then", "once", "if", "about", "into", "through", "during",
  "before", "after", "above", "below", "between", "under", "again",
  "further", "any", "am", "up", "down", "out", "off", "over", "your",
  "my", "his", "her", "our", "their", "me", "him", "us", "them",
]);

interface WordCount {
  word: string;
  count: number;
  percentage: number;
}

export function WordFrequencyTool() {
  const t = useTranslations("toolUI.word-frequency");
  const [input, setInput] = useState("");
  const [topN, setTopN] = useState("25");
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [minWordLength, setMinWordLength] = useState("1");

  const { wordCounts, totalWords, uniqueWords } = useMemo(() => {
    if (!input.trim()) {
      return { wordCounts: [], totalWords: 0, uniqueWords: 0 };
    }

    // Extract words
    let text = input;
    if (!caseSensitive) {
      text = text.toLowerCase();
    }

    const words = text
      .replace(/[^\w\s'-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= (parseInt(minWordLength) || 1));

    // Count frequencies
    const frequency = new Map<string, number>();
    let filteredTotal = 0;

    for (const word of words) {
      const normalizedWord = caseSensitive ? word : word.toLowerCase();

      if (ignoreStopWords && STOP_WORDS.has(normalizedWord)) {
        continue;
      }

      frequency.set(normalizedWord, (frequency.get(normalizedWord) || 0) + 1);
      filteredTotal++;
    }

    // Sort by frequency and take top N
    const limit = parseInt(topN) || 25;
    const sorted: WordCount[] = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({
        word,
        count,
        percentage: filteredTotal > 0 ? (count / filteredTotal) * 100 : 0,
      }));

    return {
      wordCounts: sorted,
      totalWords: filteredTotal,
      uniqueWords: frequency.size,
    };
  }, [input, topN, ignoreStopWords, caseSensitive, minWordLength]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <Textarea
        label={t("textInputLabel")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("textInputPlaceholder")}
        className="min-h-[200px]"
      />

      {/* Options */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("topNLabel")}
            type="number"
            min="1"
            max="500"
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
            placeholder="25"
          />
          <Input
            label={t("minLengthLabel")}
            type="number"
            min="1"
            max="50"
            value={minWordLength}
            onChange={(e) => setMinWordLength(e.target.value)}
            placeholder="1"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Checkbox
            id="ignoreStopWords"
            checked={ignoreStopWords}
            onChange={(e) => setIgnoreStopWords(e.target.checked)}
            label={t("ignoreStopWordsLabel")}
          />
          <Checkbox
            id="caseSensitive"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            label={t("caseSensitiveLabel")}
          />
        </div>
      </div>

      {/* Statistics */}
      {input && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm text-muted-foreground mb-1">{t("totalWords")}</div>
            <div className="text-lg font-mono">{totalWords.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm text-muted-foreground mb-1">{t("uniqueWords")}</div>
            <div className="text-lg font-mono">{uniqueWords.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {wordCounts.length > 0 && (
        <div>
          <Label className="text-sm mb-3 block">{t("wordFrequencyLabel")}</Label>
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="space-y-2">
              {wordCounts.map(({ word, count, percentage }, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-sm font-mono w-6 text-muted-foreground text-right">
                    {index + 1}.
                  </div>
                  <div className="text-sm font-mono min-w-[120px] truncate">
                    {word}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-2 bg-[var(--color-gray-100)] rounded-[12px] overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(count / wordCounts[0].count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground w-12 text-right">
                      {count}
                    </div>
                    <div className="text-sm font-mono text-muted-foreground w-16 text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {ignoreStopWords && input && (
        <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
          <div className="text-xs text-muted-foreground">
            {t("stopWordsInfo")}
          </div>
        </div>
      )}
    </div>
  );
}

export const wordFrequencyConfig: ToolConfig = {
  id: "word-frequency",
  name: "Word Frequency Counter",
  description: "Count word frequencies in text with options for stop words and case sensitivity",
  category: "text",
  component: WordFrequencyTool,
  seo: {
    keywords: [
      "word frequency counter",
      "word count tool",
      "text analysis",
      "word frequency analyzer",
      "word counter",
      "text word frequency",
      "keyword density",
      "word occurrence counter",
      "frequency analysis",
      "word statistics",
      "content analysis tool",
      "keyword counter",
    ],
  },
  sections: [
    {
      title: "What is Word Frequency Analysis?",
      content:
        "Word frequency analysis counts how often each word appears in a text. This technique is widely used in linguistics, SEO, content analysis, and natural language processing to understand the composition and focus of written content.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Analysis Process</h4>
          <p className="text-sm mb-4">
            The tool tokenizes your text into individual words, counts occurrences, and ranks them by frequency. You can customize the analysis with various options to focus on the most relevant words.
          </p>

          <h4 className="text-base font-semibold mb-2">Options</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Top N Words: Limit results to the most frequent words</li>
            <li>Stop Words: Filter out common words that don&apos;t carry meaning</li>
            <li>Case Sensitivity: Treat &quot;Word&quot; and &quot;word&quot; as same or different</li>
            <li>Minimum Length: Filter out very short words</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>SEO keyword density analysis</li>
            <li>Content optimization and editing</li>
            <li>Academic text analysis</li>
            <li>Writing style assessment</li>
            <li>Plagiarism pattern detection</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Sample output",
      content: "word: 15 (5.2%), text: 12 (4.1%), analysis: 8 (2.7%)",
      type: "code",
    },
  ],
  codeSnippet: `const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  // ... more stop words
]);

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

function countWordFrequency(
  text: string,
  options: {
    topN?: number;
    ignoreStopWords?: boolean;
    caseSensitive?: boolean;
    minWordLength?: number;
  } = {}
): WordFrequency[] {
  const {
    topN = 25,
    ignoreStopWords = true,
    caseSensitive = false,
    minWordLength = 1
  } = options;

  // Normalize and tokenize
  let processedText = caseSensitive ? text : text.toLowerCase();
  const words = processedText
    .replace(/[^\\w\\s'-]/g, ' ')
    .split(/\\s+/)
    .filter(word => word.length >= minWordLength);

  // Count frequencies
  const frequency = new Map<string, number>();
  let total = 0;

  for (const word of words) {
    if (ignoreStopWords && STOP_WORDS.has(word.toLowerCase())) {
      continue;
    }
    frequency.set(word, (frequency.get(word) || 0) + 1);
    total++;
  }

  // Sort and format results
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({
      word,
      count,
      percentage: (count / total) * 100
    }));
}

// Example usage
const text = \`The quick brown fox jumps over the lazy dog.
The dog was not amused by the fox.\`;

const frequencies = countWordFrequency(text, { topN: 5 });
console.log(frequencies);
// Output:
// [
//   { word: 'fox', count: 2, percentage: 16.67 },
//   { word: 'dog', count: 2, percentage: 16.67 },
//   { word: 'quick', count: 1, percentage: 8.33 },
//   { word: 'brown', count: 1, percentage: 8.33 },
//   { word: 'jumps', count: 1, percentage: 8.33 }
// ]`,
  references: [
    {
      title: "Word Frequency - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Word_lists_by_frequency",
    },
    {
      title: "Stop Words in NLP",
      url: "https://en.wikipedia.org/wiki/Stop_word",
    },
  ],
};
