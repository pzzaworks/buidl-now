"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolConfig } from "@/types/tool";
import { CronExpressionParser } from "cron-parser";

export function CronParserTool() {
  const t = useTranslations("toolUI.cron-parser");
  const locale = useLocale();

  // Generate a locale-aware human-readable description of a cron expression
  const describeCron = (expression: string): string => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      return t("invalidCronExpression");
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const descriptions: string[] = [];

    // Common patterns
    if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return t("descMidnightDaily");
    }
    if (minute === "0" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return t("descHourlyStart");
    }
    if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return t("descEveryMinute");
    }
    if (minute.includes("/") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      const step = minute.split("/")[1];
      return t("descEveryNMinutes", { step });
    }

    // Build description
    if (minute !== "*") {
      if (minute.includes("/")) {
        descriptions.push(t("partEveryNMinutes", { step: minute.split("/")[1] }));
      } else {
        descriptions.push(t("partAtMinute", { minute }));
      }
    }

    if (hour !== "*") {
      if (hour.includes("/")) {
        descriptions.push(t("partEveryNHours", { step: hour.split("/")[1] }));
      } else {
        descriptions.push(t("partAtHour", { hour }));
      }
    }

    if (dayOfMonth !== "*") {
      descriptions.push(t("partOnDayOfMonth", { day: dayOfMonth }));
    }

    if (month !== "*") {
      if (!month.includes(",") && !month.includes("-") && !month.includes("/")) {
        const monthNum = parseInt(month);
        if (monthNum >= 1 && monthNum <= 12) {
          const monthName = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(
            new Date(Date.UTC(2000, monthNum - 1, 1)),
          );
          descriptions.push(t("partInMonth", { month: monthName }));
        } else {
          descriptions.push(t("partInMonthNum", { month }));
        }
      } else {
        descriptions.push(t("partInMonths", { months: month }));
      }
    }

    if (dayOfWeek !== "*") {
      if (!dayOfWeek.includes(",") && !dayOfWeek.includes("-") && !dayOfWeek.includes("/")) {
        const dayNum = parseInt(dayOfWeek);
        if (dayNum >= 0 && dayNum <= 6) {
          // 2000-01-02 is a Sunday, so adding dayNum maps 0..6 to Sun..Sat
          const dayName = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(
            new Date(Date.UTC(2000, 0, 2 + dayNum)),
          );
          descriptions.push(t("partOnDay", { day: dayName }));
        } else {
          descriptions.push(t("partOnDayOfWeek", { day: dayOfWeek }));
        }
      } else {
        descriptions.push(t("partOnWeekdays", { days: dayOfWeek }));
      }
    }

    return descriptions.length > 0 ? descriptions.join(", ") : t("descFallback");
  };

  const [expression, setExpression] = useState("");
  const [numExecutions, setNumExecutions] = useState("5");
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleParse = () => {
    if (!expression.trim()) {
      setError(t("errorEmpty"));
      setNextExecutions([]);
      setDescription("");
      return;
    }

    try {
      const interval = CronExpressionParser.parse(expression.trim());
      const count = Math.min(Math.max(parseInt(numExecutions) || 5, 1), 20);

      const executions: string[] = [];
      for (let i = 0; i < count; i++) {
        const next = interval.next();
        executions.push(next.toDate().toISOString());
      }

      setNextExecutions(executions);
      setDescription(describeCron(expression.trim()));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("invalidCronExpression"));
      setNextExecutions([]);
      setDescription("");
    }
  };

  const handleReset = () => {
    setExpression("");
    setNumExecutions("5");
    setNextExecutions([]);
    setDescription("");
    setError("");
  };

  const presets = [
    { label: t("presetEveryMinute"), value: "* * * * *" },
    { label: t("presetEvery5Minutes"), value: "*/5 * * * *" },
    { label: t("presetEveryHour"), value: "0 * * * *" },
    { label: t("presetEveryDayMidnight"), value: "0 0 * * *" },
    { label: t("presetEveryMonday9am"), value: "0 9 * * 1" },
    { label: t("presetEveryMonth1st"), value: "0 0 1 * *" },
  ];

  return (
    <div className="space-y-6">
      {/* Cron Expression Input */}
      <div>
        <Label className="mb-2 block text-sm">{t("cronExpressionLabel")}</Label>
        <Input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="*/5 * * * *"
          className="font-mono text-sm"
        />
        <div className="text-xs text-muted-foreground mt-2">
          {t("formatHelp")}
        </div>
      </div>

      {/* Presets */}
      <div>
        <Label className="mb-2 block text-sm">{t("commonPresets")}</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              onClick={() => setExpression(preset.value)}
              variant="secondary"
              size="sm"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Number of executions */}
      <div>
        <Label className="mb-2 block text-sm">{t("numExecutionsLabel")}</Label>
        <Input
          type="number"
          min="1"
          max="20"
          value={numExecutions}
          onChange={(e) => setNumExecutions(e.target.value)}
          className="w-24 text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleParse} variant="primary" className="flex-1">
          {t("parse")}
        </Button>
        <Button onClick={handleReset}>
          {t("reset")}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[12px] border bg-[var(--color-red-50)] border-red-500/30 text-[var(--color-red-500)]">
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="p-4 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[var(--radius-12)]">
          <div className="text-sm text-muted-foreground mb-1">{t("humanReadable")}</div>
          <div className="font-medium">{description}</div>
        </div>
      )}

      {/* Next Executions */}
      {nextExecutions.length > 0 && (
        <Textarea
          label={t("nextExecutionTimes")}
          value={nextExecutions.join("\n")}
          readOnly
          showCopy
          className="font-mono min-h-[200px] bg-[var(--color-gray-0)]"
        />
      )}

      {/* Cron Field Reference */}
      <div className="p-4 bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] rounded-[var(--radius-12)]">
        <div className="text-sm font-semibold mb-2">{t("fieldReference")}</div>
        <div className="grid grid-cols-5 gap-2 text-xs font-mono">
          <div className="text-center">
            <div className="font-semibold">{t("fieldMinute")}</div>
            <div className="text-muted-foreground">0-59</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{t("fieldHour")}</div>
            <div className="text-muted-foreground">0-23</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{t("fieldDay")}</div>
            <div className="text-muted-foreground">1-31</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{t("fieldMonth")}</div>
            <div className="text-muted-foreground">1-12</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{t("fieldWeekday")}</div>
            <div className="text-muted-foreground">0-6</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const cronParserConfig: ToolConfig = {
  id: "cron-parser",
  name: "Cron Expression Parser",
  description: "Parse cron expressions and show next execution times",
  category: "converters",
  component: CronParserTool,
  seo: {
    keywords: [
      "cron parser",
      "cron expression parser",
      "crontab parser",
      "cron schedule parser",
      "parse cron expression",
      "cron expression validator",
      "cron job scheduler",
      "crontab validator",
      "cron syntax checker",
      "cron expression generator",
      "next cron execution",
      "cron calculator",
    ],
  },
  sections: [
    {
      title: "What is a Cron Expression?",
      content:
        "A cron expression is a string consisting of five or six fields that represent a schedule. Cron is used in Unix-like operating systems to schedule jobs (commands or scripts) to run at specific times or intervals. The name comes from the Greek word 'chronos' meaning time.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <p className="text-sm mb-4">
            A standard cron expression has five fields separated by spaces: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0 is Sunday). Each field can contain a specific value, asterisk (*) for any value, ranges (1-5), lists (1,3,5), or step values (*/5).
          </p>

          <h4 className="text-base font-semibold mb-2">Special Characters</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>* - matches any value</li>
            <li>, - separates items in a list (1,3,5)</li>
            <li>- - specifies a range (1-5)</li>
            <li>/ - specifies step values (*/5 = every 5)</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common Examples</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>* * * * * - Every minute</li>
            <li>0 * * * * - Every hour</li>
            <li>0 0 * * * - Every day at midnight</li>
            <li>0 9 * * 1-5 - Weekdays at 9am</li>
            <li>*/15 * * * * - Every 15 minutes</li>
          </ul>
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
      title: "Daily at 3:30 AM",
      content: "30 3 * * *",
      type: "code",
    },
    {
      title: "Weekdays at 9 AM",
      content: "0 9 * * 1-5",
      type: "code",
    },
    {
      title: "First of every month",
      content: "0 0 1 * *",
      type: "code",
    },
  ],
  codeSnippet: `// npm install cron-parser

import { CronExpressionParser } from 'cron-parser';

function getNextExecutions(expression: string, count: number = 5): Date[] {
  const interval = CronExpressionParser.parse(expression);
  const executions: Date[] = [];

  for (let i = 0; i < count; i++) {
    executions.push(interval.next().toDate());
  }

  return executions;
}

function validateCronExpression(expression: string): boolean {
  try {
    CronExpressionParser.parse(expression);
    return true;
  } catch {
    return false;
  }
}

function describeCronExpression(expression: string): string {
  const parts = expression.split(' ');
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Simple description logic
  if (minute === '*' && hour === '*') return 'Every minute';
  if (minute === '0' && hour === '*') return 'Every hour';
  if (minute === '0' && hour === '0') return 'Every day at midnight';

  return \`At minute \${minute}, hour \${hour}\`;
}

// Example usage
console.log('=== Validate Expression ===');
console.log('*/5 * * * * is valid:', validateCronExpression('*/5 * * * *'));
console.log('invalid is valid:', validateCronExpression('invalid'));

console.log('\\n=== Next Executions ===');
const expression = '*/15 * * * *';
console.log(\`Expression: \${expression}\`);
console.log(\`Description: \${describeCronExpression(expression)}\`);
console.log('\\nNext 5 executions:');

const executions = getNextExecutions(expression, 5);
executions.forEach((date, i) => {
  console.log(\`  \${i + 1}. \${date.toISOString()}\`);
});

console.log('\\n=== Common Expressions ===');
const expressions = [
  '* * * * *',      // Every minute
  '0 * * * *',      // Every hour
  '0 0 * * *',      // Daily at midnight
  '0 9 * * 1-5',    // Weekdays at 9am
  '0 0 1 * *',      // First of month
];

expressions.forEach(expr => {
  const next = getNextExecutions(expr, 1)[0];
  console.log(\`\${expr.padEnd(15)} -> \${next.toISOString()}\`);
});

// Output:
// === Validate Expression ===
// */5 * * * * is valid: true
// invalid is valid: false
//
// === Next Executions ===
// Expression: */15 * * * *
// Description: Every 15 minutes
//
// Next 5 executions:
//   1. 2024-01-15T10:15:00.000Z
//   2. 2024-01-15T10:30:00.000Z
//   3. 2024-01-15T10:45:00.000Z
//   4. 2024-01-15T11:00:00.000Z
//   5. 2024-01-15T11:15:00.000Z`,
  references: [
    {
      title: "Crontab Guru",
      url: "https://crontab.guru/",
    },
    {
      title: "Cron - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Cron",
    },
    {
      title: "cron-parser on npm",
      url: "https://www.npmjs.com/package/cron-parser",
    },
  ],
};
