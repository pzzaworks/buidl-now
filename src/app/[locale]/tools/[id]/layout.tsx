import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tools } from "@/lib/tools-list";
import {
  buildLocalizedToolSeo,
  buildToolSeoDescription,
  buildToolSeoKeywords,
  buildToolSeoTitle,
} from "@/lib/seo";
import { getToolById } from "@/tools";
import { routing } from "@/i18n/routing";
import { languageAlternates, localeUrl } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const tool = tools.find((t) => t.id === id);
  const toolConfig = getToolById(id);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  let title: string;
  let description: string;
  let keywords: string[];

  if (locale === routing.defaultLocale) {
    // English keeps the original, hand-tuned generators (honoring per-tool
    // overrides) so the source-of-truth pages are unchanged.
    title = toolConfig?.seo?.title || buildToolSeoTitle(tool);
    description = buildToolSeoDescription(tool, toolConfig?.seo?.description);
    keywords = buildToolSeoKeywords(tool, toolConfig?.seo?.keywords ?? []);
  } else {
    // Other locales get a localized <title>/description/keywords built from the
    // translated name/description plus the locale's SEO phrase catalog.
    const tMeta = await getTranslations({ locale, namespace: "toolMeta" });
    const tSeo = await getTranslations({ locale, namespace: "seo" });
    const name = tMeta.has(`${id}.name`) ? tMeta(`${id}.name`) : tool.name;
    const localizedDescription = tMeta.has(`${id}.description`)
      ? tMeta(`${id}.description`)
      : tool.description;
    const seo = buildLocalizedToolSeo({
      category: tool.category,
      name,
      description: localizedDescription,
      qualifierPrimary: tSeo(`qualifiers.${tool.category}.primary`),
      qualifierFallback: tSeo(`qualifiers.${tool.category}.fallback`),
      actionPhrase: tSeo(`actionPhrases.${tool.category}`),
      closing: tSeo("closing"),
      keywordAngles: tSeo(`keywordAngles.${tool.category}`),
      customKeywords: toolConfig?.seo?.keywords ?? [],
    });
    title = seo.title;
    description = seo.description;
    keywords = seo.keywords;
  }

  const url = localeUrl(locale, tool.path);

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
      locale,
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
      languages: languageAlternates(tool.path),
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
