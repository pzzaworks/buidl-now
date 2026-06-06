"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface CronField {
  name: string;
  min: number;
  max: number;
  values: string[];
}

const CRON_FIELDS: CronField[] = [
  { name: "minute", min: 0, max: 59, values: [] },
  { name: "hour", min: 0, max: 23, values: [] },
  { name: "day of month", min: 1, max: 31, values: [] },
  { name: "month", min: 1, max: 12, values: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] },
  { name: "day of week", min: 0, max: 6, values: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] },
];

interface ParsedCron {
  isValid: boolean;
  error?: string;
  description: string;
  nextRuns: Date[];
  fields: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}

function parseFieldValue(value: string, field: CronField): number[] {
  const results: number[] = [];

  // Handle named values (JAN, MON, etc.)
  let normalizedValue = value.toUpperCase();
  field.values.forEach((name, index) => {
    const actualIndex = field.name === "day of week" ? index : index + 1;
    normalizedValue = normalizedValue.replace(new RegExp(name, "g"), actualIndex.toString());
  });

  // Split by comma for multiple values
  const parts = normalizedValue.split(",");

  for (const part of parts) {
    if (part === "*") {
      // All values
      for (let i = field.min; i <= field.max; i++) {
        results.push(i);
      }
    } else if (part.includes("/")) {
      // Step values (*/5, 1-10/2, etc.)
      const [range, step] = part.split("/");
      const stepNum = parseInt(step);
      let start = field.min;
      let end = field.max;

      if (range !== "*") {
        if (range.includes("-")) {
          const [rangeStart, rangeEnd] = range.split("-").map(Number);
          start = rangeStart;
          end = rangeEnd;
        } else {
          start = parseInt(range);
        }
      }

      for (let i = start; i <= end; i += stepNum) {
        results.push(i);
      }
    } else if (part.includes("-")) {
      // Range (1-5)
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        results.push(i);
      }
    } else {
      // Single value
      const num = parseInt(part);
      if (!isNaN(num)) {
        results.push(num);
      }
    }
  }

  return [...new Set(results)].sort((a, b) => a - b);
}

function describeCronField(value: string, field: CronField): string {
  if (value === "*") {
    return `every ${field.name}`;
  }

  if (value.includes("/")) {
    const [range, step] = value.split("/");
    if (range === "*") {
      return `every ${step} ${field.name}s`;
    }
    return `every ${step} ${field.name}s from ${range}`;
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${field.name}s ${start} through ${end}`;
  }

  if (value.includes(",")) {
    return `${field.name}s ${value.replace(/,/g, ", ")}`;
  }

  // Single value
  if (field.name === "day of week") {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = parseInt(value);
    if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex <= 6) {
      return `on ${dayNames[dayIndex]}`;
    }
  }

  if (field.name === "month") {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = parseInt(value) - 1;
    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
      return `in ${monthNames[monthIndex]}`;
    }
  }

  return `at ${field.name} ${value}`;
}

function parseCronExpression(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    return {
      isValid: false,
      error: "Cron expression must have exactly 5 fields (minute hour day month weekday)",
      description: "",
      nextRuns: [],
      fields: { minute: "", hour: "", dayOfMonth: "", month: "", dayOfWeek: "" },
    };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Validate each field
  try {
    const minuteValues = parseFieldValue(minute, CRON_FIELDS[0]);
    const hourValues = parseFieldValue(hour, CRON_FIELDS[1]);
    const dayValues = parseFieldValue(dayOfMonth, CRON_FIELDS[2]);
    const monthValues = parseFieldValue(month, CRON_FIELDS[3]);
    const weekdayValues = parseFieldValue(dayOfWeek, CRON_FIELDS[4]);

    // Generate description
    let description = "Runs ";

    // Time description
    if (minute === "0" && hour === "*") {
      description += "every hour at minute 0";
    } else if (minute === "*" && hour === "*") {
      description += "every minute";
    } else if (minute === "*/5") {
      description += "every 5 minutes";
    } else if (minute === "*/15") {
      description += "every 15 minutes";
    } else if (minute === "*/30") {
      description += "every 30 minutes";
    } else if (minute !== "*" && hour !== "*") {
      description += `at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    } else if (minute !== "*") {
      description += `at minute ${minute}`;
    } else if (hour !== "*") {
      description += `during hour ${hour}`;
    }

    // Day description
    if (dayOfMonth !== "*" && dayOfWeek === "*") {
      description += ` on day ${dayOfMonth} of the month`;
    } else if (dayOfMonth === "*" && dayOfWeek !== "*") {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dayOfWeek.includes("-")) {
        const [start, end] = dayOfWeek.split("-").map(Number);
        description += ` ${dayNames[start]} through ${dayNames[end]}`;
      } else if (dayOfWeek.includes(",")) {
        const days = dayOfWeek.split(",").map(d => dayNames[parseInt(d)]).join(", ");
        description += ` on ${days}`;
      } else {
        const dayIndex = parseInt(dayOfWeek);
        description += ` on ${dayNames[dayIndex]}`;
      }
    }

    // Month description
    if (month !== "*") {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      if (month.includes(",")) {
        const months = month.split(",").map(m => monthNames[parseInt(m) - 1]).join(", ");
        description += ` in ${months}`;
      } else {
        const monthIndex = parseInt(month) - 1;
        if (!isNaN(monthIndex)) {
          description += ` in ${monthNames[monthIndex]}`;
        }
      }
    }

    // Calculate next 5 run times
    const nextRuns = calculateNextRuns(minuteValues, hourValues, dayValues, monthValues, weekdayValues, 5);

    return {
      isValid: true,
      description,
      nextRuns,
      fields: { minute, hour, dayOfMonth, month, dayOfWeek },
    };
  } catch (e) {
    return {
      isValid: false,
      error: e instanceof Error ? e.message : "Invalid cron expression",
      description: "",
      nextRuns: [],
      fields: { minute: "", hour: "", dayOfMonth: "", month: "", dayOfWeek: "" },
    };
  }
}

function calculateNextRuns(
  minutes: number[],
  hours: number[],
  days: number[],
  months: number[],
  weekdays: number[],
  count: number
): Date[] {
  const results: Date[] = [];
  const now = new Date();
  let current = new Date(now);

  // Start from next minute
  current.setSeconds(0);
  current.setMilliseconds(0);
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  const maxIterations = 366 * 24 * 60; // One year of minutes

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    const monthMatches = months.includes(current.getMonth() + 1);
    const dayMatches = days.includes(current.getDate());
    const weekdayMatches = weekdays.includes(current.getDay());
    const hourMatches = hours.includes(current.getHours());
    const minuteMatches = minutes.includes(current.getMinutes());

    // Day matching: if both day and weekday are specified (not *), it's OR
    // If only one is specified, just check that one
    const allDays = days.length === 31;
    const allWeekdays = weekdays.length === 7;

    let dayCondition: boolean;
    if (allDays && allWeekdays) {
      dayCondition = true;
    } else if (allDays) {
      dayCondition = weekdayMatches;
    } else if (allWeekdays) {
      dayCondition = dayMatches;
    } else {
      dayCondition = dayMatches || weekdayMatches;
    }

    if (monthMatches && dayCondition && hourMatches && minuteMatches) {
      results.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

const COMMON_EXAMPLES = [
  { expression: "* * * * *", description: "Every minute" },
  { expression: "*/5 * * * *", description: "Every 5 minutes" },
  { expression: "*/15 * * * *", description: "Every 15 minutes" },
  { expression: "0 * * * *", description: "Every hour" },
  { expression: "0 */2 * * *", description: "Every 2 hours" },
  { expression: "0 0 * * *", description: "Every day at midnight" },
  { expression: "0 9 * * *", description: "Every day at 9:00 AM" },
  { expression: "0 9 * * 1-5", description: "Every weekday at 9:00 AM" },
  { expression: "0 0 * * 0", description: "Every Sunday at midnight" },
  { expression: "0 0 1 * *", description: "First day of every month" },
  { expression: "0 0 1 1 *", description: "Every year on January 1st" },
  { expression: "30 4 1,15 * *", description: "1st and 15th of month at 4:30 AM" },
];

export function CrontabGuruTool() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedCron | null>(null);

  const handleParse = () => {
    if (!input.trim()) {
      setParsed(null);
      return;
    }
    setParsed(parseCronExpression(input));
  };

  const handleExampleClick = (expression: string) => {
    setInput(expression);
    setParsed(parseCronExpression(expression));
  };

  const handleReset = () => {
    setInput("");
    setParsed(null);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Input
          label="Cron Expression"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleParse()}
          placeholder="* * * * *"
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Format: minute hour day-of-month month day-of-week
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleParse} variant="primary" className="flex-1">
          Parse Expression
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>

      {/* Error */}
      {parsed && !parsed.isValid && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{parsed.error}</div>
        </div>
      )}

      {/* Results */}
      {parsed && parsed.isValid && (
        <div className="space-y-4">
          {/* Description */}
          <div className="p-4 bg-[var(--color-green-50)] border border-green-500/30 rounded-[12px]">
            <div className="text-sm font-semibold text-[var(--color-green-500)]">{parsed.description}</div>
          </div>

          {/* Fields Breakdown */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm font-semibold mb-3">Field Breakdown</div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div>
                <div className="font-mono text-lg">{parsed.fields.minute}</div>
                <div className="text-muted-foreground">minute</div>
              </div>
              <div>
                <div className="font-mono text-lg">{parsed.fields.hour}</div>
                <div className="text-muted-foreground">hour</div>
              </div>
              <div>
                <div className="font-mono text-lg">{parsed.fields.dayOfMonth}</div>
                <div className="text-muted-foreground">day (month)</div>
              </div>
              <div>
                <div className="font-mono text-lg">{parsed.fields.month}</div>
                <div className="text-muted-foreground">month</div>
              </div>
              <div>
                <div className="font-mono text-lg">{parsed.fields.dayOfWeek}</div>
                <div className="text-muted-foreground">day (week)</div>
              </div>
            </div>
          </div>

          {/* Next 5 Runs */}
          <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
            <div className="text-sm font-semibold mb-3">Next 5 Execution Times</div>
            <div className="space-y-2">
              {parsed.nextRuns.map((date, index) => (
                <div key={index} className="flex justify-between text-sm font-mono">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span>{date.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Common Examples */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
        <div className="text-sm font-semibold mb-3">Common Cron Expressions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMMON_EXAMPLES.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.expression)}
              className="text-left p-2 bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] rounded cursor-pointer transition-colors"
            >
              <div className="font-mono text-xs">{example.expression}</div>
              <div className="text-xs text-muted-foreground">{example.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
        <div className="text-sm font-semibold mb-3">Quick Reference</div>
        <div className="text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><code className="font-mono">*</code> any value</div>
            <div><code className="font-mono">,</code> value list separator</div>
            <div><code className="font-mono">-</code> range of values</div>
            <div><code className="font-mono">/</code> step values</div>
          </div>
          <div className="mt-2 text-muted-foreground">
            Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          </div>
        </div>
      </div>
    </div>
  );
}

export const crontabGuruConfig: ToolConfig = {
  id: "crontab-guru",
  name: "Crontab Guru",
  description: "Parse and explain cron expressions with next execution times",
  category: "utilities",
  component: CrontabGuruTool,
  seo: {
    keywords: [
      "cron expression",
      "crontab",
      "cron parser",
      "cron generator",
      "cron schedule",
      "cron syntax",
      "cron job",
      "crontab guru",
      "cron explained",
      "cron calculator",
      "cron expression builder",
      "unix cron",
    ],
  },
  sections: [
    {
      title: "What is Cron?",
      content:
        "Cron is a time-based job scheduler in Unix-like operating systems. Users can schedule jobs (commands or scripts) to run at specific times, dates, or intervals. The cron expression syntax is used to define these schedules.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <div className="text-base font-semibold mb-2">Cron Expression Format</div>
          <p className="text-sm mb-4">
            A standard cron expression has 5 fields: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0 is Sunday).
          </p>

          <div className="text-base font-semibold mb-2">Special Characters</div>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><code className="font-mono">*</code> - matches any value</li>
            <li><code className="font-mono">,</code> - separates multiple values (1,3,5)</li>
            <li><code className="font-mono">-</code> - defines a range (1-5)</li>
            <li><code className="font-mono">/</code> - defines step values (*/5 = every 5)</li>
          </ul>

          <div className="text-base font-semibold mb-2">Named Values</div>
          <p className="text-sm">
            Months can use names (JAN-DEC) and days can use names (SUN-SAT) instead of numbers.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Every 5 minutes",
      content: "*/5 * * * *",
      type: "code",
    },
    {
      title: "Every day at 9 AM",
      content: "0 9 * * *",
      type: "code",
    },
    {
      title: "Every Monday at 8:30 AM",
      content: "30 8 * * 1",
      type: "code",
    },
  ],
  codeSnippet: `// No external dependencies needed - pure JavaScript/TypeScript

interface CronSchedule {
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
}

function parseCronField(field: string, min: number, max: number): number[] {
  const values: number[] = [];

  if (field === '*') {
    for (let i = min; i <= max; i++) values.push(i);
    return values;
  }

  const parts = field.split(',');
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const stepNum = parseInt(step);
      let start = min, end = max;

      if (range !== '*' && range.includes('-')) {
        [start, end] = range.split('-').map(Number);
      }

      for (let i = start; i <= end; i += stepNum) {
        values.push(i);
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        values.push(i);
      }
    } else {
      values.push(parseInt(part));
    }
  }

  return [...new Set(values)].sort((a, b) => a - b);
}

function parseCronExpression(expression: string): CronSchedule {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.split(' ');

  return {
    minute: parseCronField(minute, 0, 59),
    hour: parseCronField(hour, 0, 23),
    dayOfMonth: parseCronField(dayOfMonth, 1, 31),
    month: parseCronField(month, 1, 12),
    dayOfWeek: parseCronField(dayOfWeek, 0, 6),
  };
}

function describeCron(expression: string): string {
  const parts = expression.split(' ');
  const [minute, hour] = parts;

  if (minute === '*' && hour === '*') return 'Every minute';
  if (minute === '0' && hour === '*') return 'Every hour';
  if (minute === '*/5') return 'Every 5 minutes';

  return \`At \${hour}:\${minute.padStart(2, '0')}\`;
}

// Example usage
const expression = '*/5 * * * *';
const schedule = parseCronExpression(expression);
const description = describeCron(expression);

console.log('Expression:', expression);
console.log('Description:', description);
console.log('Minutes:', schedule.minute.slice(0, 5).join(', '), '...');

// Output:
// Expression: */5 * * * *
// Description: Every 5 minutes
// Minutes: 0, 5, 10, 15, 20 ...`,
  references: [
    {
      title: "Cron - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Cron",
    },
    {
      title: "Crontab Guru - The cron schedule expression editor",
      url: "https://crontab.guru/",
    },
  ],
};
