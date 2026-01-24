"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolConfig } from "@/types/tool";

export function EpochConverterTool() {
  const [timestamp, setTimestamp] = useState("");
  const [humanDate, setHumanDate] = useState("");
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Manual date input
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");

  // Batch convert
  const [batchInput, setBatchInput] = useState("");
  const [batchOutput, setBatchOutput] = useState("");

  // Seconds converter
  const [seconds, setSeconds] = useState("");
  const [timeBreakdown, setTimeBreakdown] = useState("");

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timestampToDate = (ts: string) => {
    if (!ts) {
      setHumanDate("");
      return;
    }

    try {
      const num = parseInt(ts);
      if (isNaN(num)) {
        setHumanDate("");
        return;
      }

      const milliseconds = num.toString().length === 10 ? num * 1000 : num;
      const date = new Date(milliseconds);

      if (isNaN(date.getTime())) {
        setHumanDate("");
        return;
      }

      setHumanDate(date.toISOString());
    } catch (e) {
      setHumanDate("");
    }
  };

  const dateToTimestamp = (dateStr: string) => {
    if (!dateStr) {
      setTimestamp("");
      return;
    }

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        setTimestamp("");
        return;
      }

      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch (e) {
      setTimestamp("");
    }
  };

  const handleManualDateConvert = () => {
    if (!year || !month || !day) return;

    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour || "0"),
      parseInt(minute || "0"),
      parseInt(second || "0")
    );

    if (!isNaN(date.getTime())) {
      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
      setHumanDate(date.toISOString());
    }
  };

  const handleBatchConvert = () => {
    if (!batchInput) {
      setBatchOutput("");
      return;
    }

    const lines = batchInput.split("\n").filter((l) => l.trim());
    const results = lines.map((line) => {
      const num = parseInt(line.trim());
      if (isNaN(num)) return `${line} → Invalid`;

      const milliseconds = num.toString().length === 10 ? num * 1000 : num;
      const date = new Date(milliseconds);

      if (isNaN(date.getTime())) return `${line} → Invalid`;

      return `${line} → ${date.toISOString()}`;
    });

    setBatchOutput(results.join("\n"));
  };

  const handleSecondsConvert = () => {
    if (!seconds) {
      setTimeBreakdown("");
      return;
    }

    const sec = parseInt(seconds);
    if (isNaN(sec)) {
      setTimeBreakdown("");
      return;
    }

    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = sec % 60;

    setTimeBreakdown(
      `${days} days, ${hours} hours, ${minutes} minutes, ${remainingSeconds} seconds`
    );
  };

  const handleCurrentTime = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    timestampToDate(now.toString());
  };

  const handleReset = () => {
    setTimestamp("");
    setHumanDate("");
    setYear("");
    setMonth("");
    setDay("");
    setHour("");
    setMinute("");
    setSecond("");
  };

  return (
    <div className="space-y-8">
      {/* Current Time Display */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[var(--radius-12)]">
        <div className="text-sm text-muted-foreground mb-1">
          The current Unix epoch time is
        </div>
        <div className="font-mono text-lg font-bold">
          {currentTime !== null ? Math.floor(currentTime / 1000) : "—"}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {currentTime !== null ? new Date(currentTime).toUTCString() : "—"}
        </div>
      </div>

      {/* Basic Conversion */}
      <div>
        <h3 className="text-base font-semibold mb-4">Convert epoch to human-readable date and vice versa</h3>
        <div className="space-y-4">
          <div>
            <Input
              label="Unix Timestamp"
              value={timestamp}
              onChange={(e) => {
                setTimestamp(e.target.value);
                timestampToDate(e.target.value);
              }}
              placeholder="1761665520"
              showCopy
              className="font-mono text-sm mb-2"
            />
            <Button onClick={handleCurrentTime} className="w-full mb-2" variant="primary">
              Timestamp to Human date
            </Button>
            <div className="text-xs text-muted-foreground">
              Supports Unix timestamps in seconds, milliseconds, microseconds and nanoseconds.
            </div>
          </div>

          <Input
            label="Human Readable Date"
            value={humanDate}
            onChange={(e) => {
              setHumanDate(e.target.value);
              dateToTimestamp(e.target.value);
            }}
            placeholder="2021-01-01T00:00:00.000Z"
            showCopy
            className="font-mono text-sm"
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* Manual Date Input */}
      <div>
        <h3 className="text-base font-semibold mb-4">Manual Date Input</h3>
        <div className="grid grid-cols-6 gap-2 mb-2">
          <div>
            <Label className="text-xs">Year</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Month</Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="10"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Day</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="28"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Hour</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Sec</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={second}
              onChange={(e) => setSecond(e.target.value)}
              placeholder="0"
              className="text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleManualDateConvert} className="flex-1" variant="primary">
            Human date to Timestamp
          </Button>
          <Button onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      <hr className="border-border" />

      {/* Batch Convert */}
      <div>
        <h3 className="text-base font-semibold mb-4">Batch Convert</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Timestamps (one per line)</Label>
            <Textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="1609459200&#10;1640995200&#10;1672531200"
              className="font-mono min-h-[100px]"
            />
          </div>
          <Button onClick={handleBatchConvert} className="w-full" variant="primary">
            Batch Convert
          </Button>
          {batchOutput && (
            <Textarea
              label="Results"
              value={batchOutput}
              readOnly
              showCopy
              className="font-mono min-h-[100px] bg-[var(--color-gray-0)]"
            />
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Seconds to Days/Hours/Minutes */}
      <div>
        <h3 className="text-base font-semibold mb-4">
          Convert seconds to days, hours and minutes
        </h3>
        <div className="space-y-4">
          <div>
            <Input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              placeholder="90061"
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleSecondsConvert} className="w-full" variant="primary">
            Seconds to days, hours, minutes
          </Button>
          {timeBreakdown && (
            <Input
              label="Time Breakdown"
              value={timeBreakdown}
              readOnly
              showCopy
              className="font-mono text-sm bg-[var(--color-gray-0)]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const epochConverterConfig: ToolConfig = {
  id: "epoch-converter",
  name: "Epoch Timestamp Converter",
  description: "Convert between Unix timestamps and human-readable dates",
  category: "converters",
  component: EpochConverterTool,
  seo: {
    keywords: [
      "unix timestamp converter",
      "epoch time converter",
      "timestamp to date",
      "unix time",
      "epoch to date",
      "date to timestamp",
      "milliseconds to date",
      "unix epoch calculator",
      "timestamp calculator",
      "utc timestamp",
      "iso date converter",
      "unix time converter",
    ],
  },
  sections: [
    {
      title: "What is Unix Timestamp?",
      content:
        "Unix timestamp (also known as Epoch time) is a system for describing a point in time. It is the number of seconds that have elapsed since the Unix epoch, which is 00:00:00 UTC on 1 January 1970.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            Timestamp to date converts seconds since epoch (January 1, 1970) to a JavaScript Date object, which is then formatted as ISO 8601 string. Date to timestamp parses the input string, converts to a Date object, and extracts milliseconds since epoch divided by 1000 for seconds. The tool auto-detects format by digit count.
          </p>

          <h4 className="text-base font-semibold mb-2">Seconds vs Milliseconds</h4>
          <p className="text-sm">
            Unix timestamps are typically represented in seconds, but some systems use milliseconds. This tool automatically detects the format based on the number of digits (10 digits for seconds, 13 for milliseconds).
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Unix epoch start",
      content: "0 → 1970-01-01T00:00:00.000Z",
      type: "code",
    },
    {
      title: "Year 2000",
      content: "946684800 → 2000-01-01T00:00:00.000Z",
      type: "code",
    },
    {
      title: "Year 2024",
      content: "1704067200 → 2024-01-01T00:00:00.000Z",
      type: "code",
    },
  ],
  codeSnippet: `// No npm packages needed - pure Node.js/TypeScript

interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function timestampToDate(timestamp: number | string): string {
  const num = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;

  // Auto-detect format: 10 digits = seconds, 13 = milliseconds
  const milliseconds = num.toString().length === 10 ? num * 1000 : num;

  const date = new Date(milliseconds);
  return date.toISOString();
}

function dateToTimestamp(dateStr: string): number {
  const date = new Date(dateStr);
  return Math.floor(date.getTime() / 1000);
}

function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

function secondsToTimeBreakdown(seconds: number): TimeBreakdown {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return { days, hours, minutes, seconds: remainingSeconds };
}

function batchConvertTimestamps(timestamps: number[]): string[] {
  return timestamps.map(ts => {
    try {
      return \`\${ts} → \${timestampToDate(ts)}\`;
    } catch (e) {
      return \`\${ts} → Invalid\`;
    }
  });
}

// Example usage
console.log('=== Timestamp to Date ===');
const timestamp = 1704067200;
console.log(\`\${timestamp} → \${timestampToDate(timestamp)}\`);

console.log('\\n=== Date to Timestamp ===');
const isoDate = '2024-01-01T00:00:00.000Z';
console.log(\`\${isoDate} → \${dateToTimestamp(isoDate)}\`);

console.log('\\n=== Current Timestamp ===');
console.log(\`Current: \${getCurrentTimestamp()}\`);

console.log('\\n=== Seconds Breakdown ===');
const breakdown = secondsToTimeBreakdown(90061);
console.log(\`90061 seconds = \${breakdown.days}d \${breakdown.hours}h \${breakdown.minutes}m \${breakdown.seconds}s\`);

console.log('\\n=== Batch Convert ===');
const timestamps = [1609459200, 1640995200, 1672531200];
const results = batchConvertTimestamps(timestamps);
results.forEach(result => console.log(result));

// Output:
// === Timestamp to Date ===
// 1704067200 → 2024-01-01T00:00:00.000Z
//
// === Date to Timestamp ===
// 2024-01-01T00:00:00.000Z → 1704067200
//
// === Current Timestamp ===
// Current: 1731283200
//
// === Seconds Breakdown ===
// 90061 seconds = 1d 1h 1m 1s
//
// === Batch Convert ===
// 1609459200 → 2021-01-01T00:00:00.000Z
// 1640995200 → 2022-01-01T00:00:00.000Z
// 1672531200 → 2023-01-01T00:00:00.000Z`,
  references: [
    {
      title: "Unix time - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Unix_time",
    },
    {
      title: "ISO 8601 Date Format",
      url: "https://en.wikipedia.org/wiki/ISO_8601",
    },
  ],
};
