"use client";

import type { CSSProperties, ReactNode } from "react";
import { Children, isValidElement, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BuidlWordmark } from "@/components/buidl-wordmark";
import { Code } from "@/components/ui/code";
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "@/components/structured-data";
import { tools } from "@/lib/tools-list";
import { getToolById } from "@/tools";
import { type Tool } from "@/types/tools";

interface SiteAction {
  external?: boolean;
  href: string;
  label: string;
}

interface ToolStoryRow {
  body: string;
  title: string;
}

interface HomepageToolOverride {
  shortLabel: string;
  storyRows: ToolStoryRow[];
}

interface ToolCategoryOption {
  label: string;
  value: string;
}

interface HomePageClientProps {
  includeSiteStructuredData?: boolean;
  initialSelectedToolId?: string;
  routeMode?: "home" | "tool";
}

const monoStyle: CSSProperties = {
  fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", monospace',
};

const sansStyle: CSSProperties = {
  fontFamily: 'var(--font-chakra-petch), "Chakra Petch", sans-serif',
};

const defaultToolId = "function-selector";

const headerActions: SiteAction[] = [
  { href: "#tools", label: "Tools" },
  {
    external: true,
    href: "https://github.com/pzzaworks/buidl-now",
    label: "GitHub",
  },
];

const footerActions: SiteAction[] = [
  { href: "#tools", label: "Open Tools" },
  {
    external: true,
    href: "https://github.com/pzzaworks/buidl-now",
    label: "GitHub",
  },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.74,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const toolSwapTransition = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as const,
};

const staggerParentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
};

const headerRevealVariants = {
  hidden: { opacity: 0, y: -18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: 0.04,
    },
  },
};

const heroWordmarkVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.88,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: 0.14,
    },
  },
};

const heroCopyVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.28,
      staggerChildren: 0.12,
    },
  },
};

function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

const toolCategoryOptions: ToolCategoryOption[] = [
  { value: "all", label: "All Tools" },
  ...Array.from(new Set(tools.map((tool) => tool.category)))
    .sort((left, right) => left.localeCompare(right))
    .map((category) => ({
      value: category,
      label: formatCategoryLabel(category),
    })),
];

const homepageToolOverrides: Record<string, HomepageToolOverride> = {
  "function-selector": {
    shortLabel: "Function Selector",
    storyRows: [
      {
        title: "Selector In Seconds",
        body: "Paste a Solidity function signature and get the 4-byte selector immediately, without bouncing to another lookup tool.",
      },
      {
        title: "Built For Contract Work",
        body: "Useful for calldata inspection, ABI debugging, interface work, and everyday smart-contract development tasks.",
      },
      {
        title: "Copy-Ready Output",
        body: "The result is ready to paste into scripts, tests, deployment flows, and contract tooling the moment you generate it.",
      },
    ],
  },
  "keccak-hash": {
    shortLabel: "Keccak-256",
    storyRows: [
      {
        title: "Hash Text Or Hex",
        body: "Switch between plain text and hexadecimal input without leaving the same workspace or reformatting data elsewhere.",
      },
      {
        title: "Ethereum-Native Flow",
        body: "Perfect for selectors, message hashing, storage checks, and the small cryptographic tasks that come up during Web3 work.",
      },
      {
        title: "Fast Verification",
        body: "Use it as a quick correctness pass when you need to confirm a hash before moving back into code or contract tests.",
      },
    ],
  },
  "abi-encoder": {
    shortLabel: "ABI Encoder",
    storyRows: [
      {
        title: "Encode And Decode",
        body: "Work both directions in one place so calldata creation and calldata inspection feel like the same task, not two separate workflows.",
      },
      {
        title: "Useful During Debugging",
        body: "Great for validating types, checking payload structure, and understanding what a transaction is actually carrying.",
      },
      {
        title: "Ready For Scripts",
        body: "The output is shaped for copy-paste into scripts, test suites, deployment helpers, and contract interaction flows.",
      },
    ],
  },
  "eth-unit-converter": {
    shortLabel: "Unit Convert",
    storyRows: [
      {
        title: "Wei To Ether Fast",
        body: "Convert between common Ethereum denominations without stopping to do mental math or open a second calculator.",
      },
      {
        title: "Safer Value Checks",
        body: "Useful when verifying balances, fee amounts, token values, and human-readable outputs during everyday Web3 work.",
      },
      {
        title: "Less Context Switching",
        body: "Keep the unit conversion step in the same builder workspace so small value checks do not break your implementation flow.",
      },
    ],
  },
};

function getToolMetaById(toolId: string): Tool | undefined {
  return tools.find((tool) => tool.id === toolId);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractTextContent(content: ReactNode): string {
  const text = Children.toArray(content)
    .map((node) => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }

      if (isValidElement<{ children?: ReactNode }>(node)) {
        return extractTextContent(node.props.children);
      }

      return "";
    })
    .filter(Boolean)
    .join(" ");

  return normalizeText(text);
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function summarizeContent(content: ReactNode | string, title: string): string {
  const summarySource =
    typeof content === "string"
      ? normalizeText(content)
      : extractTextContent(content);

  if (summarySource) {
    return truncateText(summarySource, 220);
  }

  return `Practical guidance for ${title.toLowerCase()} in this tool.`;
}

function formatList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function buildExamplesSummary(
  examples: { content: ReactNode | string; title: string }[],
): string | null {
  const exampleTitles = examples
    .map((example) => normalizeText(example.title))
    .filter(Boolean)
    .slice(0, 3);

  if (exampleTitles.length > 0) {
    return `Covers ${formatList(exampleTitles)} so you can compare common inputs and outputs quickly.`;
  }

  const examplePreview = examples
    .map((example) => summarizeContent(example.content, example.title))
    .filter(Boolean)
    .slice(0, 2);

  if (examplePreview.length > 0) {
    return truncateText(examplePreview.join(" "), 220);
  }

  return null;
}

function buildToolStoryRows({
  overrideRows,
  sections,
  examples,
}: {
  examples: { content: ReactNode | string; title: string }[];
  overrideRows?: ToolStoryRow[];
  sections: { content: ReactNode | string; title: string }[];
}): ToolStoryRow[] {
  if (overrideRows && overrideRows.length > 0) {
    return overrideRows.slice(0, 3);
  }

  const rows = sections.slice(0, 3).map((section) => ({
    body: summarizeContent(section.content, section.title),
    title: section.title,
  }));

  const examplesSummary = buildExamplesSummary(examples);

  if (rows.length < 3 && examplesSummary) {
    rows.push({
      title: examples.length === 1 ? "Sample Case" : "Sample Cases",
      body: examplesSummary,
    });
  }

  return rows.slice(0, 3);
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#202020] pt-4">
      <span
        className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]"
        style={monoStyle}
      >
        {title}
      </span>
      <span
        className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]"
        style={monoStyle}
      >
        ■
      </span>
    </div>
  );
}

function ActionLink({
  action,
  className,
  onInternalClick,
}: {
  action: SiteAction;
  className: string;
  onInternalClick?: () => void;
}) {
  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {action.label}
      </a>
    );
  }

  return (
    <a
      href={action.href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onInternalClick?.();
      }}
    >
      {action.label}
    </a>
  );
}

interface RevealSectionProps {
  children: ReactNode;
  className: string;
  pageReady: boolean;
  shouldReduceMotion: boolean;
  threshold?: number;
  variants?: typeof staggerParentVariants | typeof fadeUpVariants;
}

function RevealSection({
  children,
  className,
  pageReady,
  shouldReduceMotion,
  threshold = 0.2,
  variants,
}: RevealSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    if (!pageReady) {
      return;
    }

    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [pageReady, shouldReduceMotion, threshold]);

  return (
    <motion.div
      ref={sectionRef}
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion || isVisible ? "visible" : "hidden"}
      variants={shouldReduceMotion ? undefined : variants}
    >
      {children}
    </motion.div>
  );
}

export function HomePageClient({
  includeSiteStructuredData = true,
  initialSelectedToolId,
  routeMode = "home",
}: HomePageClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const toolsSectionRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isPageReady, setIsPageReady] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState(
    initialSelectedToolId ?? defaultToolId
  );
  const [selectedToolCategory, setSelectedToolCategory] = useState("all");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState("");

  const activeToolMeta = getToolMetaById(selectedToolId) ?? tools[0];
  const activeToolConfig = activeToolMeta
    ? getToolById(activeToolMeta.id)
    : undefined;
  const ActiveToolComponent = activeToolConfig?.component;
  const activeToolName = activeToolMeta?.name ?? activeToolConfig?.name ?? "";
  const activeToolDescription =
    activeToolMeta?.description ?? activeToolConfig?.description ?? "";
  const toolSections = activeToolConfig?.sections ?? [];
  const toolExamples = activeToolConfig?.examples ?? [];
  const toolCodeSnippet = activeToolConfig?.codeSnippet ?? "";
  const activeHomepageOverride =
    homepageToolOverrides[selectedToolId] ??
    homepageToolOverrides[activeToolMeta?.id ?? ""];
  const toolStoryRows = buildToolStoryRows({
    examples: toolExamples,
    overrideRows: activeHomepageOverride?.storyRows,
    sections: toolSections,
  });
  const activeCategoryOption =
    toolCategoryOptions.find((option) => option.value === selectedToolCategory) ??
    toolCategoryOptions[0];

  const normalizedToolSearch = toolSearchQuery.trim().toLowerCase();
  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedToolCategory === "all" || tool.category === selectedToolCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedToolSearch) {
      return true;
    }

    const haystack = `${tool.name} ${tool.description}`.toLowerCase();
    return haystack.includes(normalizedToolSearch);
  });

  const { scrollY } = useScroll();
  const heroWordmarkOpacity = useTransform(scrollY, [0, 220, 520], [1, 0.95, 0.36]);
  const heroCopyY = useTransform(scrollY, [0, 420], [0, -88]);
  const heroCopyX = useTransform(scrollY, [0, 420], [0, 24]);
  const heroCopyOpacity = useTransform(scrollY, [0, 160, 420], [1, 0.9, 0.18]);
  const heroHeadingY = useTransform(scrollY, [0, 420], [0, -34]);
  const heroHeadingX = useTransform(scrollY, [0, 420], [0, 14]);
  const heroBodyY = useTransform(scrollY, [0, 420], [0, -22]);
  const heroBodyX = useTransform(scrollY, [0, 420], [0, 8]);
  const heroActionsY = useTransform(scrollY, [0, 420], [0, -12]);
  const heroActionsX = useTransform(scrollY, [0, 420], [0, 4]);
  const heroActionsOpacity = useTransform(scrollY, [0, 180, 420], [1, 0.9, 0.58]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsPageReady(true);
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;
    let readyTimeout = 0;

    setIsPageReady(false);

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        readyTimeout = window.setTimeout(() => {
          setIsPageReady(true);
        }, 60);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(readyTimeout);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!initialSelectedToolId || !getToolMetaById(initialSelectedToolId)) {
      return;
    }

    setSelectedToolId(initialSelectedToolId);
  }, [initialSelectedToolId]);

  useEffect(() => {
    if (routeMode !== "home") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const toolId = searchParams.get("tool");
    if (!toolId || !getToolMetaById(toolId)) {
      return;
    }

    setSelectedToolId(toolId);

    if (window.location.hash === "#tools") {
      requestAnimationFrame(() => {
        toolsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [routeMode]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!categoryDropdownRef.current) {
        return;
      }

      if (!categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function scrollToTools() {
    toolsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function activateTool(toolId: string) {
    if (!getToolMetaById(toolId)) {
      return;
    }

    setSelectedToolId(toolId);
    setToolSearchQuery("");

    if (routeMode === "tool") {
      router.replace(`/tools/${encodeURIComponent(toolId)}#tools`, {
        scroll: false,
      });
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set("tool", toolId);
      window.history.replaceState({}, "", `${url.pathname}${url.search}#tools`);
    }

    requestAnimationFrame(() => {
      toolsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      {includeSiteStructuredData ? <WebsiteStructuredData /> : null}
      {includeSiteStructuredData ? <OrganizationStructuredData /> : null}

      <div className="min-h-screen w-full bg-[#f5f5f5] text-[#202020]">
        <header className="sticky top-0 z-50 bg-[#f0fb29]">
          <motion.div
            className="mx-auto flex min-h-[84px] w-full max-w-[1920px] items-center justify-between gap-6 px-6 lg:px-16"
            initial={shouldReduceMotion ? false : "hidden"}
            animate={shouldReduceMotion || isPageReady ? "visible" : "hidden"}
            variants={shouldReduceMotion ? undefined : headerRevealVariants}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center"
              aria-label="Buidl Now home"
            >
              <img
                src="/buildnow-inv.svg"
                alt="Buidl Now icon"
                className="h-12 w-auto"
              />
            </Link>

            <div className="flex items-center gap-5 sm:gap-8">
              {headerActions.map((action) => (
                <ActionLink
                  key={action.label}
                  action={action}
                  className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020] sm:text-[13px]"
                  onInternalClick={scrollToTools}
                />
              ))}
            </div>
          </motion.div>
        </header>

        <section className="min-h-[calc(100svh-84px)] border-b border-[#202020] bg-[#f0fb29]">
          <div className="mx-auto flex min-h-[calc(100svh-84px)] w-full max-w-[1920px] flex-col px-6 pb-[72px] pt-8 lg:px-16 lg:pb-20 lg:pt-8">
            <motion.div
              className="w-full max-w-[1420px]"
              style={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: heroWordmarkOpacity,
                    }
              }
              initial={shouldReduceMotion ? false : "hidden"}
              animate={shouldReduceMotion || isPageReady ? "visible" : "hidden"}
              variants={shouldReduceMotion ? undefined : heroWordmarkVariants}
            >
              <BuidlWordmark
                animateLetters={shouldReduceMotion || isPageReady}
                className="h-auto w-full text-[#202020]"
                enableScrollWave
                scrollY={scrollY}
              />
            </motion.div>

            <div className="flex flex-1 items-end justify-start pt-10 lg:pt-[72px]">
              <motion.div
                className="max-w-[710px]"
                style={
                  shouldReduceMotion
                    ? undefined
                    : {
                        x: heroCopyX,
                        y: heroCopyY,
                        opacity: heroCopyOpacity,
                      }
                }
                variants={shouldReduceMotion ? undefined : heroCopyVariants}
                initial={shouldReduceMotion ? false : "hidden"}
                animate={shouldReduceMotion || isPageReady ? "visible" : "hidden"}
              >
                <motion.h1
                  className="text-[40px] font-medium leading-[46px] tracking-[-2.5px] text-[#202020]"
                  style={
                    shouldReduceMotion
                      ? sansStyle
                      : {
                          ...sansStyle,
                          x: heroHeadingX,
                          y: heroHeadingY,
                        }
                  }
                  variants={shouldReduceMotion ? undefined : fadeUpVariants}
                >
                  The developer tools you reach for every day, all in one
                  place.
                </motion.h1>

                <motion.p
                  className="mt-8 max-w-[690px] text-[18px] leading-8 text-[#202020]"
                  style={
                    shouldReduceMotion
                      ? sansStyle
                      : {
                          ...sansStyle,
                          x: heroBodyX,
                          y: heroBodyY,
                        }
                  }
                  variants={shouldReduceMotion ? undefined : fadeUpVariants}
                >
                  Converters, formatters, hashes, validators, and the small
                  utilities you keep reopening stay together instead of getting
                  lost across tabs.
                </motion.p>

                <motion.div
                  className="mt-10 flex flex-wrap items-center gap-4"
                  style={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: heroActionsX,
                          y: heroActionsY,
                          opacity: heroActionsOpacity,
                        }
                  }
                  variants={shouldReduceMotion ? undefined : fadeUpVariants}
                >
                  <button
                    type="button"
                    className="inline-flex rounded-none border border-[#202020] bg-[#202020] px-8 py-6 text-[13px] font-medium uppercase tracking-[0.22em] text-[#f0fb29] transition-colors duration-300 hover:bg-[#f0fb29] hover:text-[#202020]"
                    style={monoStyle}
                    onClick={
                      routeMode === "tool"
                        ? () => {
                            router.replace(`${pathname ?? ""}#tools`, { scroll: false });
                            scrollToTools();
                          }
                        : scrollToTools
                    }
                  >
                    Open Tools
                  </button>

                  <a
                    href="https://github.com/pzzaworks/buidl-now"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-none border border-[#202020] px-8 py-6 text-[13px] font-medium uppercase tracking-[0.22em] text-[#202020] transition-colors hover:bg-[#202020] hover:text-[#f0fb29]"
                    style={monoStyle}
                  >
                    GitHub
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="tools" ref={toolsSectionRef} className="bg-[#f5f5f5]">
          <RevealSection
            className="mx-auto w-full max-w-[1920px] px-6 py-24 lg:px-16"
            pageReady={isPageReady}
            shouldReduceMotion={Boolean(shouldReduceMotion)}
            variants={shouldReduceMotion ? undefined : staggerParentVariants}
          >
            <SectionLabel title="/ Tools" />

            <div className="grid grid-cols-1 gap-y-8 pt-10 lg:h-[760px] lg:grid-cols-[620px_minmax(0,1fr)] lg:items-stretch lg:gap-x-8 lg:pt-12">
              <motion.div
                className="lg:min-h-0"
                variants={shouldReduceMotion ? undefined : fadeUpVariants}
              >
                <div className="border border-[#202020] bg-[#fbfaf6] lg:flex lg:h-full lg:min-h-0 lg:flex-col">
                  <div className="border-b border-[#202020] px-4 py-3">
                    <div
                      className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]"
                      style={monoStyle}
                    >
                      / Tool Finder
                    </div>
                  </div>

                  <div className="border-b border-[#202020] bg-white px-4 py-4">
                    <input
                      type="text"
                      value={toolSearchQuery}
                      onChange={(event) => setToolSearchQuery(event.target.value)}
                      placeholder="Search every tool..."
                      className="w-full rounded-none border border-[#202020] bg-[#f5f5f5] px-4 py-4 text-[15px] text-[#202020] outline-none placeholder:text-[#202020]/44"
                      style={monoStyle}
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-[#202020] px-4 py-3">
                    <div
                      className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/72"
                      style={monoStyle}
                    >
                      {normalizedToolSearch
                        ? `${filteredTools.length} results`
                        : `${tools.length} tools`}
                    </div>
                    <div className="relative" ref={categoryDropdownRef}>
                      <button
                        type="button"
                        className="inline-flex min-w-[168px] items-center justify-between gap-4 border border-[#202020] bg-white px-3 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020] transition-colors hover:bg-[#f5f5f5]"
                        style={monoStyle}
                        onClick={() =>
                          setIsCategoryDropdownOpen((currentValue) => !currentValue)
                        }
                      >
                        <span>{activeCategoryOption.label}</span>
                        <span>{isCategoryDropdownOpen ? "−" : "+"}</span>
                      </button>

                      {isCategoryDropdownOpen ? (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[220px] border border-[#202020] bg-white">
                          {toolCategoryOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={clsx(
                                "flex w-full items-center justify-between border-b border-[#202020]/10 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-[0.18em] text-[#202020] last:border-b-0",
                                option.value === selectedToolCategory
                                  ? "bg-[#f0fb29]"
                                  : "bg-white hover:bg-[#f5f5f5]",
                              )}
                              style={monoStyle}
                              onClick={() => {
                                setSelectedToolCategory(option.value);
                                setIsCategoryDropdownOpen(false);
                              }}
                            >
                              <span>{option.label}</span>
                              <span>
                                {option.value === selectedToolCategory ? "■" : ""}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto bg-white lg:min-h-0 lg:flex-1 lg:max-h-none">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          className={clsx(
                            "flex w-full items-start border-b border-[#202020]/10 px-4 py-4 text-left transition-colors last:border-b-0",
                            tool.id === selectedToolId
                              ? "bg-[#f0fb29]"
                              : "bg-white hover:bg-[#f5f5f5]",
                          )}
                          onClick={() => activateTool(tool.id)}
                        >
                          <div className="min-w-0">
                            <div
                              className="text-[18px] leading-6 text-[#202020]"
                              style={sansStyle}
                            >
                              {tool.name}
                            </div>
                            <div
                              className="mt-1 text-[13px] leading-5 text-[#202020]/68"
                              style={sansStyle}
                            >
                              {tool.description}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-10">
                        <div
                          className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/60"
                          style={monoStyle}
                        >
                          No matches
                        </div>
                        <p
                          className="mt-3 max-w-[360px] text-[16px] leading-7 text-[#202020]"
                          style={sansStyle}
                        >
                          Try a tool name like function selector, keccak, abi,
                          json, base64, or checksum.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="min-w-0 lg:min-h-0"
                variants={shouldReduceMotion ? undefined : fadeUpVariants}
              >
                <div className="border border-[#202020] bg-[#fbfaf6] lg:flex lg:h-full lg:min-h-0 lg:flex-col">
                  <div
                    className="flex items-center gap-2 border-b border-[#202020] px-4 py-3"
                    style={{
                      backgroundImage:
                        "radial-gradient(#202020 0.5px, transparent 0.5px)",
                      backgroundPosition: "center",
                      backgroundSize: "20px 20px",
                    }}
                  >
                    <span className="h-[8px] w-[8px] bg-[#202020]" />
                    <span className="h-[8px] w-[8px] bg-[#202020]" />
                    <span className="h-[8px] w-[8px] bg-[#202020]" />
                  </div>

                  <div className="border-b border-[#202020] px-4 py-4 sm:px-6">
                    <div
                      className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/72"
                      style={monoStyle}
                    >
                      / {activeToolName || "Live Tool"}
                    </div>
                  </div>

                  <div className="bg-white px-4 py-4 sm:px-5 sm:py-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                    <AnimatePresence mode="wait" initial={false}>
                      {ActiveToolComponent ? (
                        <motion.div
                          key={selectedToolId}
                          className="text-[#202020] lg:h-full [&_.font-mono]:!font-[var(--font-ibm-plex-mono)] [&_.text-muted-foreground]:!text-[#202020]/60 [&_button]:!rounded-none [&_button]:!shadow-none [&_input]:!rounded-none [&_input]:!shadow-none [&_textarea]:!rounded-none [&_textarea]:!shadow-none"
                          style={sansStyle}
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 18 }
                          }
                          animate={
                            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                          }
                          exit={
                            shouldReduceMotion ? undefined : { opacity: 0, y: -10 }
                          }
                          transition={shouldReduceMotion ? undefined : toolSwapTransition}
                        >
                          <ActiveToolComponent />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`${selectedToolId}-empty`}
                          className="p-2 text-[16px] leading-7 text-[#202020]"
                          style={sansStyle}
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 18 }
                          }
                          animate={
                            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                          }
                          exit={
                            shouldReduceMotion ? undefined : { opacity: 0, y: -10 }
                          }
                          transition={shouldReduceMotion ? undefined : toolSwapTransition}
                        >
                          This tool is not available yet.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="pt-16 lg:pt-20"
              variants={shouldReduceMotion ? undefined : fadeUpVariants}
            >
              <div
                className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/72"
                style={monoStyle}
              >
                / Selected Tool
              </div>

              <div className="mt-5 border-t border-[#202020]/16 pt-8">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`details-${selectedToolId}`}
                    className="grid grid-cols-1 gap-y-8 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-x-10"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                    transition={shouldReduceMotion ? undefined : toolSwapTransition}
                  >
                    <div>
                      <h2
                        className="text-[32px] font-medium leading-[36px] tracking-[-2px] text-[#202020] lg:text-[40px] lg:leading-[44px]"
                        style={sansStyle}
                      >
                        {activeToolName}
                      </h2>

                      <p
                        className="mt-6 text-[18px] leading-8 text-[#202020]"
                        style={sansStyle}
                      >
                        {activeToolDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-0 lg:grid-cols-3">
                      {toolStoryRows.map((row, index) => (
                        <div
                          key={`${row.title}-${index}`}
                          className="border-t border-[#202020]/16 py-7 first:pt-0 lg:border-t-0 lg:border-l lg:py-0 lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
                        >
                          <div
                            className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#202020]"
                            style={monoStyle}
                          >
                            ■ {String(index + 1).padStart(2, "0")}
                          </div>

                          <h3
                            className="mt-5 text-[24px] font-medium leading-[1.05] tracking-[-0.04em] text-[#202020]"
                            style={sansStyle}
                          >
                            {row.title}
                          </h3>
                          <p
                            className="mt-4 text-[17px] leading-7 text-[#202020]"
                            style={sansStyle}
                          >
                            {row.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              className="pt-24"
              variants={shouldReduceMotion ? undefined : fadeUpVariants}
            >
              <SectionLabel title="/ Code" />

              <div className="grid grid-cols-1 gap-y-10 pt-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-x-8 lg:pt-12">
                <div>
                  <div
                    className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/72"
                    style={monoStyle}
                  >
                    / Integration
                  </div>

                  <p
                    className="mt-5 max-w-[320px] text-[18px] leading-8 text-[#202020]"
                    style={sansStyle}
                  >
                    Source code from the selected tool, shown here alongside the
                    live version on the right.
                  </p>
                </div>

                <div className="min-w-0 border border-[#202020] bg-[#fbfaf6]">
                  <div
                    className="h-[18px] border-b border-[#202020]"
                    style={{
                      backgroundImage:
                        "radial-gradient(#202020 0.5px, transparent 0.5px)",
                      backgroundPosition: "center",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  <div className="flex items-center justify-between border-b border-[#202020] px-4 py-3">
                    <div
                      className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]"
                      style={monoStyle}
                    >
                      / Source Code
                    </div>
                    <div
                      className="bg-[#f0fb29] px-3 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#202020]"
                      style={monoStyle}
                    >
                      {toolCodeSnippet ? "TypeScript" : "Snippet"}
                    </div>
                  </div>

                  <div className="overflow-x-auto bg-white p-4 sm:p-6">
                    <AnimatePresence mode="wait" initial={false}>
                      {toolCodeSnippet ? (
                        <motion.div
                          key={`code-${selectedToolId}`}
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 18 }
                          }
                          animate={
                            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                          }
                          exit={
                            shouldReduceMotion ? undefined : { opacity: 0, y: -10 }
                          }
                          transition={shouldReduceMotion ? undefined : toolSwapTransition}
                        >
                          <Code
                            framed={false}
                            language="typescript"
                            showCopy
                            showLineNumbers={false}
                          >
                            {toolCodeSnippet.trim()}
                          </Code>
                        </motion.div>
                      ) : (
                        <motion.p
                          key={`code-${selectedToolId}-empty`}
                          className="text-[17px] leading-7 text-[#202020]"
                          style={sansStyle}
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 18 }
                          }
                          animate={
                            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                          }
                          exit={
                            shouldReduceMotion ? undefined : { opacity: 0, y: -10 }
                          }
                          transition={shouldReduceMotion ? undefined : toolSwapTransition}
                        >
                          Code examples for this tool will appear here.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </RevealSection>
        </section>

        <footer id="footer" className="border-t border-[#202020] bg-[#f5f5f5]">
          <RevealSection
            className="mx-auto w-full max-w-[1920px] px-6 py-20 lg:px-16"
            pageReady={isPageReady}
            shouldReduceMotion={Boolean(shouldReduceMotion)}
            threshold={0.12}
            variants={shouldReduceMotion ? undefined : staggerParentVariants}
          >
            <motion.div
              className="flex items-end gap-4 sm:gap-8"
              variants={shouldReduceMotion ? undefined : fadeUpVariants}
            >
              <img
                src="/buildnow-inv.svg"
                alt="Buidl Now icon"
                className="h-[64px] w-auto shrink-0 sm:h-[148px] lg:h-[176px]"
              />
              <BuidlWordmark
                animateLetters
                animateOnView
                className="min-w-0 flex-1 max-w-[1280px] text-[#202020]"
                enableScrollWave={false}
              />
            </motion.div>

            <motion.div
              className="mt-10 grid grid-cols-1 gap-y-12 border-t border-[#202020] pt-10 lg:grid-cols-[minmax(0,760px)_240px] lg:justify-between lg:gap-x-10 lg:pt-14"
              variants={shouldReduceMotion ? undefined : fadeUpVariants}
            >
              <div>
                <h2
                  className="max-w-[760px] text-[40px] font-medium leading-[46px] tracking-[-2.5px] text-[#202020]"
                  style={sansStyle}
                >
                  Keep every utility in one place and stay inside the build
                  flow.
                </h2>

                <p
                  className="mt-8 max-w-[560px] text-[18px] leading-8 text-[#202020]"
                  style={sansStyle}
                >
                  Pick a tool, finish the check, copy what you need, and get
                  back to the actual product work.
                </p>
              </div>

              <div className="flex flex-col items-start gap-5 lg:items-end">
                {footerActions.map((action) => (
                  <ActionLink
                    key={action.label}
                    action={action}
                    className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]"
                    onInternalClick={scrollToTools}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              className="mt-16 flex flex-col gap-4 border-t border-[#202020]/16 pt-6 sm:flex-row sm:items-center sm:justify-between"
              variants={shouldReduceMotion ? undefined : fadeUpVariants}
            >
              <span
                className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/72"
                style={monoStyle}
              >
                Developer tools for builders who ship fast.
              </span>

              <span
                className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#202020]/72"
                style={monoStyle}
              >
                Built by{" "}
                <a
                  href="https://pzza.works"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#202020]"
                >
                  berke
                </a>
              </span>
            </motion.div>
          </RevealSection>
        </footer>
      </div>
    </>
  );
}

export default function Home() {
  return <HomePageClient />;
}
