import type { Metadata } from "next";
import { tools } from "@/lib/tools-list";
import { buildToolSeoDescription } from "@/lib/seo";
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

  // Use SEO overrides from toolConfig if available
  const title = toolConfig?.seo?.title || tool.name;
  const description = buildToolSeoDescription(
    tool,
    toolConfig?.seo?.description || tool.description,
  );
  const url = `https://buidlnow.com${tool.path}`;

  // Build keywords array
  const baseKeywords: string[] = [
    tool.name,
    tool.category,
    tool.subcategory,
    "developer tools",
    "online tools",
    "free tools",
    "developer utility",
    "browser tool",
  ].filter((k): k is string => Boolean(k));

  const customKeywords = toolConfig?.seo?.keywords || [];
  const keywords = [...customKeywords, ...baseKeywords];

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
