"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { getToolById } from "@/tools";
import { tools } from "@/lib/tools-list";
import { ToolRenderer } from "./tool-renderer";
import { ToolStructuredData } from "@/components/structured-data";
import { Code } from "@/components/ui/code";

export default function ToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tool = getToolById(id);
  const toolMeta = tools.find((t) => t.id === id);

  useEffect(() => {
    scrollTo(0, 0);
  }, []);

  if (!tool || !toolMeta) {
    notFound();
  }

  return (
    <>
      <ToolStructuredData tool={toolMeta} />
      {/* Title and Description */}
      <div className="mb-6 sm:mb-8 w-full">
        <h1 className="mb-2 text-xl sm:text-2xl font-semibold">
          {tool.name}
        </h1>
        <p className="text-xs sm:text-sm opacity-50">
          {tool.description}
        </p>
      </div>

      {/* Tool Component */}
      <div className="mb-8">
        <ToolRenderer toolId={id} />
      </div>

      <hr className="border-border my-8" />

      {/* Sections and Content */}
      <div className="w-full space-y-6">
        {/* Sections */}
        {tool.sections && tool.sections.length > 0 && (
          <>
            {tool.sections.map((section, index) => (
              <div key={index}>
                <h2 className="mb-3 text-lg sm:text-xl font-semibold">
                  {index + 1}. {section.title}
                </h2>
                {typeof section.content === "string" ? (
                  <p className="text-xs sm:text-sm leading-relaxed">{section.content}</p>
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed">{section.content}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Examples Section */}
        {tool.examples && tool.examples.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg sm:text-xl font-semibold">
              {tool.sections ? tool.sections.length + 1 : 1}. Examples
            </h2>
            <div className="space-y-4">
              {tool.examples.map((example, index) => (
                <div key={index}>
                  {example.title && (
                    <h3 className="mb-1 text-sm sm:text-base font-medium break-words">
                      {example.title}
                    </h3>
                  )}
                  {example.type === "code" || (typeof example.content === "string" && !example.type) ? (
                    <Code showLineNumbers={false}>
                      {typeof example.content === "string" ? example.content : JSON.stringify(example.content, null, 2)}
                    </Code>
                  ) : (
                    <div className="text-xs sm:text-sm leading-relaxed break-words">{example.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Code Section */}
        {tool.codeSnippet && (
          <div>
            <h2 className="mb-3 text-lg sm:text-xl font-semibold">
              {((tool.sections?.length || 0) + (tool.examples ? 1 : 0)) + 1}. Source Code
            </h2>
            <Code language="typescript" showLineNumbers={true} showCopy={true}>
              {tool.codeSnippet}
            </Code>
          </div>
        )}

        <hr className="border-border my-6 sm:my-8" />

        {/* References Section */}
        {tool.references && tool.references.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg sm:text-xl font-semibold">References</h2>
            <ul className="space-y-1 list-disc list-inside">
              {tool.references.map((ref, index) => (
                <li key={index} className="text-xs sm:text-sm break-words">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {ref.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
