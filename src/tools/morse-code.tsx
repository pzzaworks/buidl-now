"use client";

import { useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

const MORSE_CODE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      if (char === " ") return "/";
      return MORSE_CODE[char] || "";
    })
    .filter(Boolean)
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .split(" ")
    .map((code) => {
      if (code === "/" || code === "") return " ";
      return REVERSE_MORSE[code] || "?";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function MorseCodeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopPlayingRef = useRef(false);

  const handleConvert = () => {
    if (!input) {
      setOutput("");
      return;
    }

    if (mode === "encode") {
      setOutput(textToMorse(input));
    } else {
      setOutput(morseToText(input));
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    stopPlayingRef.current = true;
    setIsPlaying(false);
  };

  const playMorse = useCallback(async () => {
    const morseCode = mode === "encode" ? output : textToMorse(input);
    if (!morseCode) return;

    stopPlayingRef.current = false;
    setIsPlaying(true);

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioContext = audioContextRef.current;

    const dotDuration = 0.08; // 80ms
    const dashDuration = dotDuration * 3;
    const symbolGap = dotDuration;
    const letterGap = dotDuration * 3;
    const wordGap = dotDuration * 7;

    const playTone = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopPlayingRef.current) {
          resolve();
          return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 600;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + duration - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);

        setTimeout(resolve, duration * 1000);
      });
    };

    const wait = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopPlayingRef.current) {
          resolve();
          return;
        }
        setTimeout(resolve, duration * 1000);
      });
    };

    for (const char of morseCode) {
      if (stopPlayingRef.current) break;

      switch (char) {
        case ".":
          await playTone(dotDuration);
          await wait(symbolGap);
          break;
        case "-":
          await playTone(dashDuration);
          await wait(symbolGap);
          break;
        case " ":
          await wait(letterGap);
          break;
        case "/":
          await wait(wordGap);
          break;
      }
    }

    setIsPlaying(false);
  }, [mode, output, input]);

  const stopPlaying = () => {
    stopPlayingRef.current = true;
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === "encode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("encode");
            setOutput("");
          }}
          className="flex-1"
        >
          Text to Morse
        </Button>
        <Button
          variant={mode === "decode" ? "primary" : "secondary"}
          onClick={() => {
            setMode("decode");
            setOutput("");
          }}
          className="flex-1"
        >
          Morse to Text
        </Button>
      </div>

      {/* Input Section */}
      <div>
        <Label className="mb-2 block text-sm">
          {mode === "encode" ? "Text Input" : "Morse Code Input"}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Enter text to convert to Morse code..."
              : "Enter Morse code (use . for dot, - for dash, space between letters, / between words)"
          }
          rows={6}
          className={`text-sm mb-2 ${mode === "decode" ? "font-mono" : ""}`}
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} variant="primary" className="flex-1">
            {mode === "encode" ? "Convert to Morse" : "Convert to Text"}
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <div className="space-y-2">
          <Textarea
            label={mode === "encode" ? "Morse Code Output" : "Text Output"}
            value={output}
            readOnly
            showCopy
            className={`bg-[var(--color-gray-0)] text-sm ${mode === "encode" ? "font-mono" : ""}`}
            rows={6}
          />

          {/* Audio Playback */}
          {mode === "encode" && (
            <div className="flex gap-2">
              <Button
                onClick={isPlaying ? stopPlaying : playMorse}
                variant={isPlaying ? "secondary" : "primary"}
                className="flex-1"
              >
                {isPlaying ? "Stop Audio" : "Play Audio"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Morse Code Reference */}
      <div className="p-4 rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-gray-50)]">
        <h3 className="text-sm font-semibold mb-3">Morse Code Reference</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2 text-xs font-mono">
          {Object.entries(MORSE_CODE).slice(0, 36).map(([char, code]) => (
            <div
              key={char}
              className="flex flex-col items-center p-1 rounded bg-[var(--color-gray-0)]"
            >
              <span className="font-semibold">{char}</span>
              <span className="text-[var(--color-gray-500)]">{code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const morseCodeConfig: ToolConfig = {
  id: "morse-code",
  name: "Morse Code Translator",
  description: "Translate text to Morse code and back with audio playback",
  category: "encoders-decoders",
  component: MorseCodeTool,
  seo: {
    keywords: [
      "morse code translator",
      "morse code converter",
      "text to morse code",
      "morse code to text",
      "morse code decoder",
      "morse code encoder",
      "morse code audio",
      "learn morse code",
      "morse code generator",
      "sos morse code",
      "morse alphabet",
      "morse code online",
    ],
  },
  sections: [
    {
      title: "What is Morse Code?",
      content:
        "Morse code is a method of encoding text characters as standardized sequences of two signal durations called dots (.) and dashes (-). Invented by Samuel Morse in the 1830s for use with the telegraph, it was one of the first digital communication systems.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h3 className="text-base font-semibold mb-2">Signal Timing</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>A dot (.) is one unit of time</li>
            <li>A dash (-) is three units of time</li>
            <li>Space between symbols: one unit</li>
            <li>Space between letters: three units</li>
            <li>Space between words: seven units (represented as /)</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Common Codes</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>SOS:</strong> ... --- ... (international distress signal)</li>
            <li><strong>E:</strong> . (shortest letter - most common in English)</li>
            <li><strong>T:</strong> - (second most common letter)</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Use Cases</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Emergency communication</li>
            <li>Amateur radio (ham radio)</li>
            <li>Aviation and maritime communication</li>
            <li>Educational purposes</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "SOS distress signal",
      content: "SOS -> ... --- ...",
      type: "code",
    },
    {
      title: "Hello World",
      content: "HELLO WORLD -> .... . .-.. .-.. --- / .-- --- .-. .-.. -..",
      type: "code",
    },
    {
      title: "Numbers",
      content: "123 -> .---- ..--- ...--",
      type: "code",
    },
  ],
  codeSnippet: `// Morse code encoding and decoding

const MORSE_CODE: Record<string, string> = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
  'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
  'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
  'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
  'Y': '-.--',  'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.',
};

const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text.toUpperCase()
    .split('')
    .map(char => {
      if (char === ' ') return '/';
      return MORSE_CODE[char] || '';
    })
    .filter(Boolean)
    .join(' ');
}

function morseToText(morse: string): string {
  return morse.split(' ')
    .map(code => {
      if (code === '/') return ' ';
      return REVERSE_MORSE[code] || '?';
    })
    .join('');
}

// Example usage
console.log(textToMorse('HELLO WORLD'));
// .... . .-.. .-.. --- / .-- --- .-. .-.. -..

console.log(morseToText('... --- ...'));
// SOS`,
  references: [
    {
      title: "Wikipedia: Morse Code",
      url: "https://en.wikipedia.org/wiki/Morse_code",
    },
    {
      title: "ITU-R M.1677 - International Morse Code",
      url: "https://www.itu.int/rec/R-REC-M.1677",
    },
    {
      title: "Learn Morse Code",
      url: "https://morsecode.world/international/morse2.html",
    },
  ],
};
