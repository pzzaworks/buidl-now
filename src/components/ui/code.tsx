"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdContentCopy, MdCheck, MdExpandMore, MdExpandLess } from "react-icons/md";
import { Button } from "./button";

interface CodeProps {
  children: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
}

export function Code({ children, language = "", showLineNumbers = true, showCopy = false }: CodeProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = children.split('\n');
  const shouldCollapse = lines.length > 10;
  const displayContent = shouldCollapse && !isExpanded
    ? lines.slice(0, 10).join('\n')
    : children;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Language Badge */}
      {language !== "" && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 text-xs text-muted-foreground bg-[#1a1a1a] rounded border border-border">
          {language}
        </div>
      )}

      {/* Copy Button */}
      {showCopy && (
        <Button
          type="button"
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 z-10 h-auto min-h-0 px-2 py-1 text-xs"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <MdCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400">Copied</span>
            </>
          ) : (
            <>
              <MdContentCopy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      )}

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          borderRadius: shouldCollapse ? "4px 4px 0 0" : "4px",
          background: "#0f0f0f",
          border: "1px solid #1f1f1f",
          borderBottom: shouldCollapse ? "none" : "1px solid #1f1f1f",
          fontSize: "0.75rem",
          padding: "1rem",
          paddingTop: language !== "" || showCopy ? "2.5rem" : "1rem",
          overflowX: "auto",
          maxWidth: "100%",
        }}
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
          },
        }}
      >
        {displayContent}
      </SyntaxHighlighter>

      {/* View More/Less Button */}
      {shouldCollapse && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
          className="w-full px-4 py-2 text-xs rounded-t-none border border-t-0 border-border rounded-b"
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
        </Button>
      )}
    </div>
  );
}
