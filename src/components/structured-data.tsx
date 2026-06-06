import { Tool } from "@/types/tools";
import { buildToolSeoDescription, getToolCategoryLabel } from "@/lib/seo";
import { type FaqItem } from "@/lib/homepage-faq";

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
}

export function ToolStructuredData({ tool }: ToolStructuredDataProps) {
  const categoryLabel = getToolCategoryLabel(tool.category);
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://buidlnow.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `https://buidlnow.com/?category=${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://buidlnow.com${tool.path}`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: buildToolSeoDescription(tool),
    url: `https://buidlnow.com${tool.path}`,
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
    keywords: [tool.name, tool.category, "developer tool", "online utility", "free tool"].filter(Boolean).join(", "),
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

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Buidl Now!",
    description: "Developer tools for builders who ship fast",
    url: "https://buidlnow.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://buidlnow.com/?search={search_term_string}",
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

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Buidl Now!",
    url: "https://buidlnow.com",
    logo: "https://buidlnow.com/buildnow.svg",
    description: "Free online developer tools for builders who ship fast",
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
