"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToolConfig } from "@/types/tool";

export function ReverseStringTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    // Reverse the string character by character
    const reversed = input.split("").reverse().join("");
    setOutput(reversed);
  }, [input]);

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  const handleSwap = () => {
    setInput(output);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Textarea
          label="Input Text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to reverse..."
          className="min-h-[150px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSwap} className="flex-1" disabled={!output}>
          Swap Input/Output
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      {/* Output */}
      <div>
        <Textarea
          label="Reversed Text"
          value={output}
          readOnly
          showCopy
          className="min-h-[150px]"
        />
      </div>

      {/* Stats */}
      {input && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#0f0f0f] border border-border rounded">
            <div className="text-lg font-bold">{input.length}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </div>

          <div className="p-4 bg-[#0f0f0f] border border-border rounded">
            <div className="text-lg font-bold">
              {input.split(/\s+/).filter((w) => w.length > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Words</div>
          </div>
        </div>
      )}
    </div>
  );
}

export const reverseStringConfig: ToolConfig = {
  id: "reverse-string",
  name: "Reverse String",
  description: "Reverse text character by character",
  category: "text",
  component: ReverseStringTool,
  seo: {
    keywords: [
      "reverse string",
      "reverse text",
      "string reverser",
      "backwards text generator",
      "flip text",
      "mirror text",
      "reverse characters",
      "text reverser online",
      "palindrome checker",
      "reverse text generator",
    ],
  },
  sections: [
    {
      title: "What is string reversal?",
      content:
        "String reversal is the process of reversing the order of characters in a text string. The operation flips the string so that the first character becomes the last, the second becomes second-to-last, and so on, creating a mirror image of the original text.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Reversal Process</h4>
          <p className="text-sm mb-4">This tool reverses your input text character by character. The first character becomes the last, the second becomes second-to-last, and so on.</p>

          <h4 className="text-base font-semibold mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li>Check for palindromes</li>
            <li>Create mirror text effects</li>
            <li>Reverse engineering obfuscated strings</li>
            <li>Text manipulation puzzles</li>
            <li>Data transformation tasks</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Unicode Support</h4>
          <p className="text-sm mb-4">This tool handles Unicode characters correctly, including emojis and special characters. Each character is treated as a single unit regardless of its byte length.</p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Simple text",
      content: "Hello World → dlroW olleH",
      type: "code",
    },
    {
      title: "Palindrome",
      content: "racecar → racecar (same forwards and backwards)",
      type: "code",
    },
    {
      title: "With numbers",
      content: "ABC123 → 321CBA",
      type: "code",
    },
  ],
  codeSnippet: `// Reverse a string character by character
function reverseString(input: string): string {
  return input.split('').reverse().join('');
}

// Check if a string is a palindrome
function isPalindrome(input: string): boolean {
  const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === reverseString(cleaned);
}

// Example usage
const text = "Hello World";
const reversed = reverseString(text);
console.log(\`Original: \${text}\`);         // Hello World
console.log(\`Reversed: \${reversed}\`);     // dlroW olleH

// Palindrome check
const palindrome1 = "racecar";
const palindrome2 = "A man, a plan, a canal: Panama";
console.log(\`Is "\${palindrome1}" a palindrome? \${isPalindrome(palindrome1)}\`); // true
console.log(\`Is "\${palindrome2}" a palindrome? \${isPalindrome(palindrome2)}\`); // true`,
  references: [
    {
      title: "Palindrome - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Palindrome",
    },
    {
      title: "String Reversal Algorithms",
      url: "https://en.wikipedia.org/wiki/String_(computer_science)#Reversing",
    },
  ],
};
