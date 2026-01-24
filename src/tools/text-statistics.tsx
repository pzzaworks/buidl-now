"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

export function TextStatisticsTool() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    lines: 0,
    paragraphs: 0,
    totalWords: 0,
    uniqueWords: 0,
    avgWordLength: 0,
    longestWord: "",
    shortestWord: "",
    avgSentenceLength: 0,
    lexicalDensity: 0,
    readingTime: 0,
  });
  const [charFrequency, setCharFrequency] = useState<Array<{ char: string; count: number; percentage: number }>>([]);

  useEffect(() => {
    if (!text) {
      setStats({
        characters: 0,
        charactersNoSpaces: 0,
        lines: 0,
        paragraphs: 0,
        totalWords: 0,
        uniqueWords: 0,
        avgWordLength: 0,
        longestWord: "",
        shortestWord: "",
        avgSentenceLength: 0,
        lexicalDensity: 0,
        readingTime: 0,
      });
      setCharFrequency([]);
      return;
    }

    // Basic counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const lines = text.split("\n").length;
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length;

    // Extract words
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const totalWords = words.length;
    const uniqueWords = new Set(words).size;

    // Reading time (200 words per minute)
    const readingTime = Math.ceil(totalWords / 200);

    // Average word length
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    const avgWordLength = totalWords > 0 ? totalLength / totalWords : 0;

    // Longest and shortest words
    let longestWord = "";
    let shortestWord = words[0] || "";

    words.forEach((word) => {
      if (word.length > longestWord.length) {
        longestWord = word;
      }
      if (word.length < shortestWord.length) {
        shortestWord = word;
      }
    });

    // Average sentence length
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? totalWords / sentences.length : 0;

    // Lexical density (unique words / total words)
    const lexicalDensity = totalWords > 0 ? (uniqueWords / totalWords) * 100 : 0;

    setStats({
      characters,
      charactersNoSpaces,
      lines,
      paragraphs,
      totalWords,
      uniqueWords,
      avgWordLength,
      longestWord,
      shortestWord,
      avgSentenceLength,
      lexicalDensity,
      readingTime,
    });

    // Character frequency analysis
    const charMap = new Map<string, number>();
    const textLower = text.toLowerCase();
    let totalChars = 0;

    for (const char of textLower) {
      // Only count letters and numbers
      if (/[a-z0-9]/.test(char)) {
        charMap.set(char, (charMap.get(char) || 0) + 1);
        totalChars++;
      }
    }

    // Sort by frequency and calculate percentages
    const sortedChars = Array.from(charMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([char, count]) => ({
        char,
        count,
        percentage: (count / totalChars) * 100,
      }));

    setCharFrequency(sortedChars);
  }, [text]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Textarea
          label="Enter Text to Analyze"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here for detailed statistical analysis..."
          className="min-h-[200px]"
        />
      </div>

      {/* Statistics */}
      {text && (
        <>
          <div>
            <Label className="text-sm mb-3 block">Basic Counts</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Characters</div>
                <div className="text-lg font-mono">{stats.characters.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Characters (no spaces)</div>
                <div className="text-lg font-mono">{stats.charactersNoSpaces.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Lines</div>
                <div className="text-lg font-mono">{stats.lines.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Paragraphs</div>
                <div className="text-lg font-mono">{stats.paragraphs.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm mb-3 block">Word Statistics</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Total Words</div>
                <div className="text-lg font-mono">{stats.totalWords.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Unique Words</div>
                <div className="text-lg font-mono">{stats.uniqueWords.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Average Word Length</div>
                <div className="text-lg font-mono">{stats.avgWordLength.toFixed(2)}</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Lexical Density</div>
                <div className="text-lg font-mono">{stats.lexicalDensity.toFixed(1)}%</div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Longest Word</div>
                <div className="text-lg font-mono truncate">{stats.longestWord || "-"}</div>
                {stats.longestWord && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.longestWord.length} characters
                  </div>
                )}
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Shortest Word</div>
                <div className="text-lg font-mono">{stats.shortestWord || "-"}</div>
                {stats.shortestWord && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.shortestWord.length} character{stats.shortestWord.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Average Sentence Length</div>
                <div className="text-lg font-mono">
                  {stats.avgSentenceLength.toFixed(1)} words
                </div>
              </div>

              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="text-sm text-muted-foreground mb-1">Reading Time</div>
                <div className="text-lg font-mono">
                  {stats.readingTime} {stats.readingTime === 1 ? "minute" : "minutes"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on 200 words/min
                </div>
              </div>
            </div>
          </div>

          {/* Character Frequency */}
          {charFrequency.length > 0 && (
            <div>
              <Label className="text-sm mb-3 block">Character Frequency Distribution</Label>
              <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
                <div className="space-y-2">
                  {charFrequency.map(({ char, count, percentage }, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="text-sm font-mono w-8 text-center bg-[var(--color-gray-0)] px-2 py-1 rounded-[12px]">
                        {char}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="h-2 bg-[var(--color-gray-0)] rounded-[12px] overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${(count / charFrequency[0].count) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-mono text-muted-foreground w-16 text-right">
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
          <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <Label className="text-sm mb-2 block">About These Metrics</Label>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                <strong>Lexical Density:</strong> Ratio of unique words to total words. Higher values indicate more varied vocabulary.
              </li>
              <li>
                <strong>Character Frequency:</strong> Shows the most common letters/numbers in your text.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export const textStatisticsConfig: ToolConfig = {
  id: "text-statistics",
  name: "Text Analyzer",
  description: "Comprehensive text analysis with word count, character count, reading time, and advanced statistics",
  category: "text",
  component: TextStatisticsTool,
  seo: {
    keywords: [
      "text analyzer",
      "word count",
      "character count",
      "text statistics",
      "text analysis",
      "word counter",
      "character counter",
      "reading time calculator",
      "sentence counter",
      "paragraph counter",
      "word frequency",
      "character frequency",
      "lexical density",
      "text metrics",
      "readability statistics",
      "text complexity",
      "word length analysis",
      "sentence length",
      "vocabulary analysis",
      "text analysis tool",
      "count words in text",
    ],
  },
  sections: [
    {
      title: "What is text analysis?",
      content:
        "Text analysis is the process of examining text to extract meaningful statistics and metrics. This tool provides both basic counts (characters, words, lines, paragraphs) and advanced linguistic metrics (vocabulary richness, word frequency, character distribution, readability measures) to help you understand and optimize your text.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">This tool analyzes your text in real-time, providing comprehensive statistics from basic counts to advanced linguistic metrics. All calculations happen automatically as you type or paste text.</p>

          <h4 className="text-base font-semibold mb-2">Basic Counts</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Character count (with and without spaces)</li>
            <li>Word count</li>
            <li>Line count</li>
            <li>Paragraph count</li>
            <li>Reading time (based on 200 words/minute)</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Advanced Statistics</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Total and unique words</li>
            <li>Average word length</li>
            <li>Longest and shortest words</li>
            <li>Lexical density - measures vocabulary richness (unique/total words)</li>
            <li>Average sentence length - readability indicator</li>
            <li>Character frequency distribution - most common letters/numbers</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Understanding Lexical Density</h4>
          <p className="text-sm">Lexical density is the ratio of unique words to total words, expressed as a percentage. Higher values (60-80%) indicate more varied vocabulary, while lower values suggest more repetitive text. It's a useful metric for analyzing writing style and complexity.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Use Cases",
      content: "Word count for essays, character limits for social media, content analysis for SEO, writing analysis, vocabulary assessment, readability testing, text complexity evaluation",
      type: "text",
    },
  ],
  codeSnippet: `type TextStatistics = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  averageWordLength: number;
  readingTime: number;
};

function analyzeText(text: string): TextStatistics {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\\s/g, '').length;
  const lines = text.split('\\n').length;
  const paragraphs = text.split(/\\n\\n+/).filter((p) => p.trim()).length;

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, ' ')
    .split(/\\s+/)
    .filter((word) => word.length > 0);

  const wordCount = words.length;

  // Reading time (200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);

  // Average word length
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = wordCount > 0 ? totalLength / wordCount : 0;

  // Sentence count
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  return {
    characters,
    charactersNoSpaces,
    words: wordCount,
    lines,
    paragraphs,
    sentences,
    averageWordLength,
    readingTime,
  };
}

// Example usage
const sampleText = \`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\`;

const stats = analyzeText(sampleText);

console.log(\`Characters: \${stats.characters}\`);
console.log(\`Words: \${stats.words}\`);
console.log(\`Lines: \${stats.lines}\`);
console.log(\`Paragraphs: \${stats.paragraphs}\`);
console.log(\`Sentences: \${stats.sentences}\`);
console.log(\`Average word length: \${stats.averageWordLength.toFixed(2)}\`);
console.log(\`Reading time: \${stats.readingTime} minute(s)\`);`,
  references: [
    {
      title: "Average Reading Speed",
      url: "https://en.wikipedia.org/wiki/Words_per_minute#Reading_and_comprehension",
    },
    {
      title: "Lexical Density",
      url: "https://en.wikipedia.org/wiki/Lexical_density",
    },
  ],
};
