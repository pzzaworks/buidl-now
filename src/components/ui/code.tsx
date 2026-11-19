"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdContentCopy, MdCheck, MdExpandMore, MdExpandLess } from "react-icons/md";

type SyntaxTheme = typeof oneLight;

// One Light token colors that fall below 4.5:1 on the code backgrounds (#fcfbf7 framed, white
// unframed), darkened in 1% lightness steps until they pass on both with a small margin (>= 4.6:1),
// keeping hue and saturation. Line numbers carry the "comment" class, so they follow its color.
const ONE_LIGHT_AA_COLORS: Record<string, string> = {
  "hsl(230, 4%, 64%)": "hsl(230, 4%, 45%)", // comments and line numbers
  "hsl(35, 99%, 36%)": "hsl(35, 99%, 32%)", // numbers, booleans, class names
  "hsl(5, 74%, 59%)": "hsl(5, 74%, 48%)", // properties, tags
  "hsl(119, 34%, 47%)": "hsl(119, 34%, 37%)", // strings
  "hsl(221, 87%, 60%)": "hsl(221, 87%, 55%)", // functions, variables
  "hsl(198, 99%, 37%)": "hsl(198, 99%, 34%)", // urls
};

function withTokenColors(theme: SyntaxTheme, colors: Record<string, string>): SyntaxTheme {
  return Object.fromEntries(
    Object.entries(theme).map(([selector, style]) => {
      const color = typeof style.color === "string" ? colors[style.color] : undefined;
      return [selector, color ? { ...style, color } : style];
    })
  );
}

const oneLightAA = withTokenColors(oneLight, ONE_LIGHT_AA_COLORS);

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
  const syntaxTheme = isDark ? oneDark : oneLightAA;
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
      {/* Language Badge: a code language id, so it is uppercased with English rules in every locale
          (Turkish rules would print "TYPESCRİPT") */}
      {language !== "" && (
        <div
          lang="en"
          className="absolute top-2 left-2 z-10 border border-[var(--color-gray-300)] bg-[var(--color-gray-0)] px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-700)]"
        >
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
