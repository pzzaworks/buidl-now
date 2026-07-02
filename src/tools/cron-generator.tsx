"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString());
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString());
const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const MONTHS = [
  { value: "1", label: "January", labelKey: "monthJanuary" },
  { value: "2", label: "February", labelKey: "monthFebruary" },
  { value: "3", label: "March", labelKey: "monthMarch" },
  { value: "4", label: "April", labelKey: "monthApril" },
  { value: "5", label: "May", labelKey: "monthMay" },
  { value: "6", label: "June", labelKey: "monthJune" },
  { value: "7", label: "July", labelKey: "monthJuly" },
  { value: "8", label: "August", labelKey: "monthAugust" },
  { value: "9", label: "September", labelKey: "monthSeptember" },
  { value: "10", label: "October", labelKey: "monthOctober" },
  { value: "11", label: "November", labelKey: "monthNovember" },
  { value: "12", label: "December", labelKey: "monthDecember" },
];
const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday", labelKey: "daySunday" },
  { value: "1", label: "Monday", labelKey: "dayMonday" },
  { value: "2", label: "Tuesday", labelKey: "dayTuesday" },
  { value: "3", label: "Wednesday", labelKey: "dayWednesday" },
  { value: "4", label: "Thursday", labelKey: "dayThursday" },
  { value: "5", label: "Friday", labelKey: "dayFriday" },
  { value: "6", label: "Saturday", labelKey: "daySaturday" },
];

const PRESETS = [
  { labelKey: "presetEveryMinute", expression: "* * * * *" },
  { labelKey: "presetEveryHour", expression: "0 * * * *" },
  { labelKey: "presetEveryDayMidnight", expression: "0 0 * * *" },
  { labelKey: "presetEveryDayNoon", expression: "0 12 * * *" },
  { labelKey: "presetEveryMonday9am", expression: "0 9 * * 1" },
  { labelKey: "presetEveryWeekday9am", expression: "0 9 * * 1-5" },
  { labelKey: "presetEvery5Minutes", expression: "*/5 * * * *" },
  { labelKey: "presetEvery15Minutes", expression: "*/15 * * * *" },
  { labelKey: "presetEvery30Minutes", expression: "*/30 * * * *" },
  { labelKey: "presetFirstDayOfMonth", expression: "0 0 1 * *" },
];

export function CronGeneratorTool() {
  const t = useTranslations("toolUI.cron-generator");
  const locale = useLocale();
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  // Builds a fully localized human-readable description from the cron fields.
  // Kept inside the component so it can compose translated fragments via `t`
  // and format weekday/month/time names with the active locale.
  const describeCron = (expr: string): string => {
    const fields = expr.trim().split(/\s+/);
    if (fields.length !== 5) return t("invalidExpression");

    const [min, hr, dom, mon, dow] = fields;
    const desc: string[] = [];

    // Minute
    if (min === "*") {
      desc.push(t("everyMinute"));
    } else if (min.startsWith("*/")) {
      desc.push(t("everyNMinutes", { n: Number(min.slice(2)) }));
    } else {
      desc.push(t("atMinute", { minute: min }));
    }

    // Hour
    if (hr !== "*") {
      if (hr.startsWith("*/")) {
        desc.push(t("everyNHours", { n: Number(hr.slice(2)) }));
      } else {
        const hourNum = parseInt(hr);
        const minuteNum = /^\d+$/.test(min) ? parseInt(min) : 0;
        const time = new Intl.DateTimeFormat(locale, {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(2000, 0, 1, hourNum, minuteNum)));
        desc.push(t("atTime", { time }));
      }
    }

    // Day of month
    if (dom !== "*") {
      if (dom.startsWith("*/")) {
        desc.push(t("everyNDays", { n: Number(dom.slice(2)) }));
      } else {
        desc.push(t("onDayOfMonth", { day: dom }));
      }
    }

    // Month
    if (mon !== "*") {
      const monthNum = parseInt(mon);
      if (/^\d+$/.test(mon) && monthNum >= 1 && monthNum <= 12) {
        const monthName = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(
          new Date(Date.UTC(2000, monthNum - 1, 1)),
        );
        desc.push(t("inMonth", { month: monthName }));
      } else {
        desc.push(t("inMonthNumber", { month: mon }));
      }
    }

    // Day of week
    if (dow !== "*") {
      if (dow === "1-5") {
        desc.push(t("onWeekdays"));
      } else if (dow === "0,6") {
        desc.push(t("onWeekends"));
      } else if (/^\d+$/.test(dow) && Number(dow) >= 0 && Number(dow) <= 6) {
        // 2000-01-02 is a Sunday, so adding the field value maps 0..6 to Sun..Sat.
        const dayName = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(
          new Date(Date.UTC(2000, 0, 2 + Number(dow))),
        );
        desc.push(t("onDayOfWeek", { day: dayName }));
      } else {
        desc.push(t("onDayOfWeekNumber", { day: dow }));
      }
    }

    return desc.join(", ").replace(/^./, (c) => c.toUpperCase());
  };

  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  const description = describeCron(expression);

  const applyPreset = (expr: string) => {
    const parts = expr.split(" ");
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  const handleReset = () => {
    setMinute("*");
    setHour("*");
    setDayOfMonth("*");
    setMonth("*");
    setDayOfWeek("*");
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label className="mb-2 block text-sm">{t("quickPresets")}</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.slice(0, 6).map((preset) => (
            <Button
              key={preset.expression}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(preset.expression)}
            >
              {t(preset.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <Label className="mb-2 block text-sm">{t("minute")}</Label>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
          >
            <option value="*">{t("everyStar")}</option>
            <option value="*/5">{t("minuteEvery5")}</option>
            <option value="*/10">{t("minuteEvery10")}</option>
            <option value="*/15">{t("minuteEvery15")}</option>
            <option value="*/30">{t("minuteEvery30")}</option>
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2 block text-sm">{t("hour")}</Label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
          >
            <option value="*">{t("everyStar")}</option>
            <option value="*/2">{t("hourEvery2")}</option>
            <option value="*/4">{t("hourEvery4")}</option>
            <option value="*/6">{t("hourEvery6")}</option>
            <option value="*/12">{t("hourEvery12")}</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h.padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2 block text-sm">{t("dayOfMonth")}</Label>
          <select
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
          >
            <option value="*">{t("everyStar")}</option>
            {DAYS_OF_MONTH.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2 block text-sm">{t("month")}</Label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
          >
            <option value="*">{t("everyStar")}</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {t(m.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2 block text-sm">{t("dayOfWeek")}</Label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
          >
            <option value="*">{t("everyStar")}</option>
            <option value="1-5">{t("weekdays")}</option>
            <option value="0,6">{t("weekends")}</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>
                {t(d.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <Button onClick={handleReset} variant="secondary">
        {t("resetToDefault")}
      </Button>

      {/* Output */}
      <div className="space-y-4">
        <Input
          label={t("cronExpression")}
          value={expression}
          readOnly
          showCopy
          className="font-mono text-lg bg-[var(--color-gray-0)]"
        />

        <div className="p-4 rounded-[12px] bg-[var(--color-blue-50)] border border-[var(--color-blue-200)]">
          <Label className="block text-sm text-[var(--color-blue-700)] mb-1">{t("humanReadableDescription")}</Label>
          <p className="text-[var(--color-blue-900)] font-medium">{description}</p>
        </div>
      </div>

      {/* Format Reference */}
      <div className="p-4 rounded-[12px] bg-[var(--color-gray-50)] border border-[var(--color-gray-200)]">
        <Label className="block text-sm mb-2">{t("cronFormatReference")}</Label>
        <code className="text-xs font-mono text-[var(--color-gray-600)]">
          ┌───────────── minute (0-59)<br />
          │ ┌───────────── hour (0-23)<br />
          │ │ ┌───────────── day of month (1-31)<br />
          │ │ │ ┌───────────── month (1-12)<br />
          │ │ │ │ ┌───────────── day of week (0-6, Sun-Sat)<br />
          │ │ │ │ │<br />
          * * * * *
        </code>
      </div>
    </div>
  );
}

export const cronGeneratorConfig: ToolConfig = {
  id: "cron-generator",
  name: "Cron Expression Generator",
  description: "Build and understand cron expressions visually",
  category: "generators",
  component: CronGeneratorTool,
  seo: {
    keywords: [
      "cron generator",
      "cron expression builder",
      "cron maker",
      "crontab generator",
      "cron schedule",
      "cron job generator",
      "cron expression creator",
      "cron syntax",
      "schedule generator",
      "cron helper",
      "crontab builder",
      "cron job scheduler",
    ],
  },
  sections: [
    {
      title: "What is a Cron Expression?",
      content:
        "A cron expression is a string representing a schedule for running tasks at specific times. It consists of five fields: minute, hour, day of month, month, and day of week. Cron expressions are widely used in Unix-like systems, CI/CD pipelines, and scheduled job systems.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Cron Fields</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>Minute:</strong> 0-59</li>
            <li><strong>Hour:</strong> 0-23</li>
            <li><strong>Day of Month:</strong> 1-31</li>
            <li><strong>Month:</strong> 1-12</li>
            <li><strong>Day of Week:</strong> 0-6 (Sunday to Saturday)</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Special Characters</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>*</strong> - Any value (every)</li>
            <li><strong>*/n</strong> - Every n units (e.g., */5 = every 5 minutes)</li>
            <li><strong>n-m</strong> - Range (e.g., 1-5 = Monday to Friday)</li>
            <li><strong>n,m</strong> - List (e.g., 0,6 = Sunday and Saturday)</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Every day at midnight",
      content: "0 0 * * *",
      type: "code",
    },
    {
      title: "Every Monday at 9 AM",
      content: "0 9 * * 1",
      type: "code",
    },
    {
      title: "Every 15 minutes",
      content: "*/15 * * * *",
      type: "code",
    },
    {
      title: "First day of every month at noon",
      content: "0 12 1 * *",
      type: "code",
    },
  ],
  codeSnippet: `// Cron expression parser and descriptor

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

function parseCron(expression: string): CronParts | null {
  const parts = expression.trim().split(/\\s+/);
  if (parts.length !== 5) return null;

  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4]
  };
}

function describeCron(expression: string): string {
  const parts = parseCron(expression);
  if (!parts) return 'Invalid cron expression';

  const descriptions: string[] = [];

  // Minute
  if (parts.minute === '*') {
    descriptions.push('every minute');
  } else if (parts.minute.startsWith('*/')) {
    descriptions.push(\`every \${parts.minute.slice(2)} minutes\`);
  } else {
    descriptions.push(\`at minute \${parts.minute}\`);
  }

  // Hour
  if (parts.hour !== '*') {
    if (parts.hour.startsWith('*/')) {
      descriptions.push(\`every \${parts.hour.slice(2)} hours\`);
    } else {
      const hour = parseInt(parts.hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      descriptions.push(\`at \${hour12} \${ampm}\`);
    }
  }

  return descriptions.join(', ');
}

// Example usage
const expressions = [
  '* * * * *',      // Every minute
  '0 * * * *',      // Every hour
  '0 0 * * *',      // Every day at midnight
  '0 9 * * 1',      // Every Monday at 9 AM
  '*/15 * * * *',   // Every 15 minutes
  '0 12 1 * *'      // First day of month at noon
];

expressions.forEach(expr => {
  console.log(\`\${expr} => \${describeCron(expr)}\`);
});

// Output:
// * * * * * => every minute
// 0 * * * * => at minute 0
// 0 0 * * * => at minute 0, at 12 AM
// 0 9 * * 1 => at minute 0, at 9 AM
// */15 * * * * => every 15 minutes
// 0 12 1 * * => at minute 0, at 12 PM`,
  references: [
    {
      title: "Crontab.guru - Cron Expression Editor",
      url: "https://crontab.guru/",
    },
    {
      title: "Wikipedia - Cron",
      url: "https://en.wikipedia.org/wiki/Cron",
    },
  ],
};
