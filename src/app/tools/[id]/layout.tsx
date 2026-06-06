import type { Metadata } from "next";
import { tools } from "@/lib/tools-list";
import {
  buildToolSeoDescription,
  buildToolSeoKeywords,
  buildToolSeoTitle,
} from "@/lib/seo";
import { getToolById } from "@/tools";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tool = tools.find((t) => t.id === id);
  const toolConfig = getToolById(id);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  // Intent-optimized title: honor an explicit per-tool override, otherwise
  // derive "{name} - {search-intent qualifier}" so every tool benefits.
  // The brand suffix is appended by the root title template.
  const title = toolConfig?.seo?.title || buildToolSeoTitle(tool);

  // Compelling, unique, ~140-160 char description with the action and the
  // "free online / in-browser / no signup" angle for click-through.
  const description = buildToolSeoDescription(
    tool,
    toolConfig?.seo?.description,
  );
  const url = `https://buidlnow.com${tool.path}`;

  // Page-specific keywords: author-tuned keywords first, then derived
  // name/category variants. De-duplicated and capped inside the helper.
  const keywords = buildToolSeoKeywords(tool, toolConfig?.seo?.keywords ?? []);

  return {
    title,
    description,
    keywords,
    authors: [{ name: "Buidl Now!" }],
    creator: "Buidl Now!",
    publisher: "Buidl Now!",
    openGraph: {
      title,
      description,
      url,
      siteName: "Buidl Now!",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "https://buidlnow.com/og-image.png",
          width: 1200,
          height: 630,
          alt: `${tool.name} - Developer Tool`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://buidlnow.com/og-image.png"],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    id: tool.id,
  }));
}

export default function ToolLayout({ children }: Props) {
  return <>{children}</>;
}
