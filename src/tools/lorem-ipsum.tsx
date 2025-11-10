"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum"
];

const LOREM_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

export function LoremIpsumTool() {
  const [count, setCount] = useState("3");
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");

  const generateWord = () => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  const generateSentence = (wordCount?: number) => {
    const numWords = wordCount || Math.floor(Math.random() * 10) + 5; // 5-14 words
    const words: string[] = [];

    for (let i = 0; i < numWords; i++) {
      words.push(generateWord());
    }

    // Capitalize first word
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    return words.join(" ") + ".";
  };

  const generateParagraph = (sentenceCount?: number) => {
    const numSentences = sentenceCount || Math.floor(Math.random() * 4) + 3; // 3-6 sentences
    const sentences: string[] = [];

    for (let i = 0; i < numSentences; i++) {
      sentences.push(generateSentence());
    }

    return sentences.join(" ");
  };

  const handleGenerate = () => {
    const num = parseInt(count) || 1;
    let result = "";

    if (type === "words") {
      const words: string[] = [];
      if (startWithLorem && num > 0) {
        // Start with "Lorem ipsum dolor sit amet" (5 words)
        const loremStart = LOREM_START.split(" ").slice(0, Math.min(5, num));
        words.push(...loremStart);

        // Generate remaining words
        for (let i = loremStart.length; i < num; i++) {
          words.push(generateWord());
        }
      } else {
        for (let i = 0; i < num; i++) {
          words.push(generateWord());
        }
      }
      result = words.join(" ");
    } else if (type === "sentences") {
      const sentences: string[] = [];
      if (startWithLorem && num > 0) {
        sentences.push(LOREM_START + ".");
        for (let i = 1; i < num; i++) {
          sentences.push(generateSentence());
        }
      } else {
        for (let i = 0; i < num; i++) {
          sentences.push(generateSentence());
        }
      }
      result = sentences.join(" ");
    } else {
      // paragraphs
      const paragraphs: string[] = [];
      if (startWithLorem && num > 0) {
        paragraphs.push(LOREM_START + ". " + generateParagraph(4).split(". ").slice(1).join(". "));
        for (let i = 1; i < num; i++) {
          paragraphs.push(generateParagraph());
        }
      } else {
        for (let i = 0; i < num; i++) {
          paragraphs.push(generateParagraph());
        }
      }
      result = paragraphs.join("\n\n");
    }

    setOutput(result);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Count"
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="3"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Type</Label>
          <div className="flex gap-2">
            <Button
              variant={type === "paragraphs" ? "default" : "secondary"}
              onClick={() => setType("paragraphs")}
              className="flex-1"
              size="sm"
            >
              Paragraphs
            </Button>
            <Button
              variant={type === "sentences" ? "default" : "secondary"}
              onClick={() => setType("sentences")}
              className="flex-1"
              size="sm"
            >
              Sentences
            </Button>
            <Button
              variant={type === "words" ? "default" : "secondary"}
              onClick={() => setType("words")}
              className="flex-1"
              size="sm"
            >
              Words
            </Button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div>
        <Checkbox
          id="startWithLorem"
          checked={startWithLorem}
          onChange={(e) => setStartWithLorem(e.target.checked)}
          label="Start with &quot;Lorem ipsum dolor sit amet&quot;"
        />
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate Lorem Ipsum
      </Button>

      {/* Output */}
      {output && (
        <Textarea
          label="Generated Text"
          value={output}
          readOnly
          showCopy
          className="min-h-[300px]"
        />
      )}
    </div>
  );
}

export const loremIpsumConfig: ToolConfig = {
  id: "lorem-ipsum",
  name: "Lorem Ipsum Generator",
  description: "Generate Lorem Ipsum placeholder text",
  category: "text",
  component: LoremIpsumTool,
  seo: {
    keywords: [
      "lorem ipsum generator",
      "placeholder text",
      "dummy text generator",
      "sample text",
      "lorem ipsum",
      "filler text",
      "lorem ipsum text generator",
      "fake text generator",
      "random text generator",
      "lipsum generator",
    ],
  },
  sections: [
    {
      title: "What is Lorem Ipsum?",
      content:
        "Lorem Ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups. It helps designers focus on design elements without being distracted by meaningful content.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Generator Functionality</h4>
          <p className="text-sm mb-4">This tool generates Lorem Ipsum text in paragraphs, sentences, or words. You can specify the count and optionally start with the classic "Lorem ipsum dolor sit amet" phrase.</p>

          <h4 className="text-base font-semibold mb-2">Origin</h4>
          <p className="text-sm mb-4">Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. It has been used as dummy text since the 1500s.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Classic start",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      type: "text",
    },
  ],
  codeSnippet: `const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

function generateWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(wordCount?: number): string {
  const numWords = wordCount || Math.floor(Math.random() * 10) + 5; // 5-14 words
  const words: string[] = [];

  for (let i = 0; i < numWords; i++) {
    words.push(generateWord());
  }

  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph(sentenceCount?: number): string {
  const numSentences = sentenceCount || Math.floor(Math.random() * 4) + 3; // 3-6 sentences
  const sentences: string[] = [];

  for (let i = 0; i < numSentences; i++) {
    sentences.push(generateSentence());
  }

  return sentences.join(' ');
}

function generateLoremIpsum(count: number, type: 'paragraphs' | 'sentences' | 'words', startWithLorem = true): string {
  if (type === 'paragraphs') {
    const paragraphs: string[] = [];
    if (startWithLorem && count > 0) {
      paragraphs.push(LOREM_START + '. ' + generateParagraph(4).split('. ').slice(1).join('. '));
      for (let i = 1; i < count; i++) {
        paragraphs.push(generateParagraph());
      }
    } else {
      for (let i = 0; i < count; i++) {
        paragraphs.push(generateParagraph());
      }
    }
    return paragraphs.join('\\n\\n');
  }

  return ''; // Simplified for brevity
}

// Example usage
const loremText = generateLoremIpsum(3, 'paragraphs', true);
console.log(loremText);`,
  references: [
    {
      title: "Lorem Ipsum - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Lorem_ipsum",
    },
  ],
};
