"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdContentCopy, MdCheck, MdExpandMore, MdExpandLess } from "react-icons/md";

interface CodeProps {
  children: string;
  framed?: boolean;
  language?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
}

export function Code({
  children,
  language = "",
  showLineNumbers = true,
  showCopy = false,
  framed = true,
}: CodeProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const lines = children.split('\n');
  const shouldCollapse = lines.length > 10;
  const displayContent = shouldCollapse && !isExpanded
    ? lines.slice(0, 10).join('\n')
    : children;
  const syntaxTheme = isDark ? oneDark : oneLight;
  const codeBackground = framed
    ? isDark
      ? "var(--color-gray-50)"
      : "#fcfbf7"
    : "transparent";
  const footerBackground = framed ? "var(--color-gray-0)" : "transparent";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Language Badge */}
      {language !== "" && (
        <div className="absolute top-2 left-2 z-10 border border-[var(--color-gray-300)] bg-[var(--color-gray-0)] px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-700)]">
          {language}
        </div>
      )}

      {/* Copy Button */}
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center border border-[var(--color-gray-300)] bg-[var(--color-gray-0)] text-[var(--color-gray-700)] transition-colors cursor-pointer hover:bg-[var(--color-yellow-50)] hover:text-[var(--color-gray-950)]"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <MdCheck style={{ width: 16, height: 16, color: 'var(--color-green-500)' }} />
          ) : (
            <MdContentCopy style={{ width: 16, height: 16 }} />
          )}
        </button>
      )}

      <SyntaxHighlighter
        language={language}
        style={syntaxTheme}
        showLineNumbers={showLineNumbers}
        wrapLongLines={false}
        lineNumberStyle={{
          color: "var(--color-gray-500)",
          minWidth: "2.25rem",
          paddingRight: "1rem",
          userSelect: "none",
        }}
        customStyle={{
          margin: 0,
          borderRadius: "0",
          background: codeBackground,
          color: "var(--color-gray-950)",
          border: framed ? "1px solid var(--color-gray-300)" : "0",
          fontSize: "0.8125rem",
          lineHeight: "1.65",
          padding: "0.75rem",
          paddingTop: language !== "" || showCopy ? "2.5rem" : "0.75rem",
          overflowX: "auto",
          maxWidth: "100%",
        }}
        codeTagProps={{
          style: {
            color: "inherit",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
          },
        }}
      >
        {displayContent}
      </SyntaxHighlighter>

      {/* View More/Less Button */}
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-gray-700)] transition-all duration-200 cursor-pointer hover:text-[var(--color-gray-950)]"
          style={{
            background: footerBackground,
            borderLeft: framed ? "1px solid var(--color-gray-300)" : "0",
            borderRight: framed ? "1px solid var(--color-gray-300)" : "0",
            borderBottom: framed ? "1px solid var(--color-gray-300)" : "0",
            borderTop: "0",
          }}
        >
          {isExpanded ? (
            <>
              <MdExpandLess className="w-4 h-4" />
              <span>View Less</span>
            </>
          ) : (
            <>
              <MdExpandMore className="w-4 h-4" />
              <span>View More ({lines.length - 10} more lines)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
