import { Tool } from "@/types/tools";
import { buildToolSeoDescription, getToolCategoryLabel } from "@/lib/seo";
import { type FaqItem } from "@/lib/homepage-faq";
import { localeUrl } from "@/lib/site";
import { defaultLocale } from "@/i18n/locales";

// Single source of truth for the E-E-A-T author/creator identity used across
// the JSON-LD graph. Modeled as a Person with sameAs links to the real X and
// GitHub profiles plus the personal site, so search and answer engines can tie
// the content to a verifiable author.
const personAuthor = {
  "@type": "Person",
  name: "Berke (pzzaworks)",
  url: "https://pzza.works",
  sameAs: [
    "https://x.com/pzzaworks",
    "https://github.com/pzzaworks",
    "https://pzza.works",
  ],
} as const;

const organizationPublisher = {
  "@type": "Organization",
  name: "Buidl Now!",
  url: "https://buidlnow.com",
  logo: {
    "@type": "ImageObject",
    url: "https://buidlnow.com/buildnow.svg",
  },
} as const;

interface ToolStructuredDataProps {
  tool: Tool;
  /** Active locale - URLs are emitted under this locale's prefix. */
  locale?: string;
  /** Localized tool name (falls back to the English source). */
  name?: string;
  /** Localized meta description (falls back to the English generator). */
  description?: string;
  /** Localized category label for the breadcrumb. */
  categoryLabel?: string;
  /** Localized "Home" breadcrumb label. */
  homeLabel?: string;
}

export function ToolStructuredData({
  tool,
  locale = defaultLocale,
  name,
  description,
  categoryLabel,
  homeLabel = "Home",
}: ToolStructuredDataProps) {
  const toolName = name ?? tool.name;
  const toolDescription = description ?? buildToolSeoDescription(tool);
  const category = categoryLabel ?? getToolCategoryLabel(tool.category);
  const toolUrl = localeUrl(locale, tool.path);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: localeUrl(locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category,
        item: localeUrl(locale, `/?category=${tool.category}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: toolName,
        item: toolUrl,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: toolName,
    description: toolDescription,
    url: toolUrl,
    inLanguage: locale,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: personAuthor,
    creator: personAuthor,
    publisher: organizationPublisher,
    audience: {
      "@type": "Audience",
      audienceType: "Developers",
    },
    keywords: [toolName, category, "developer tool", "online utility", "free tool"]
      .filter(Boolean)
      .join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  );
}

interface SiteStructuredDataProps {
  /** Active locale. */
  locale?: string;
  /** Localized site description. */
  description?: string;
}

export function WebsiteStructuredData({
  locale = defaultLocale,
  description = "Developer tools for builders who ship fast",
}: SiteStructuredDataProps = {}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Buidl Now!",
    description,
    url: localeUrl(locale),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${localeUrl(locale)}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    author: personAuthor,
    creator: personAuthor,
    publisher: organizationPublisher,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface FaqStructuredDataProps {
  items: FaqItem[];
}

export function FaqStructuredData({ items }: FaqStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData({
  description = "Free online developer tools for builders who ship fast",
}: {
  description?: string;
} = {}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Buidl Now!",
    url: "https://buidlnow.com",
    logo: "https://buidlnow.com/buildnow.svg",
    description,
    founder: personAuthor,
    sameAs: [
      "https://x.com/pzzaworks",
      "https://github.com/pzzaworks",
      "https://pzza.works",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
