import { Tool } from "@/types/tools";
import { buildToolSeoDescription } from "@/lib/seo";

interface ToolStructuredDataProps {
  tool: Tool;
}

export function ToolStructuredData({ tool }: ToolStructuredDataProps) {
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
    publisher: {
      "@type": "Organization",
      name: "Buidl Now!",
      url: "https://buidlnow.com",
      logo: {
        "@type": "ImageObject",
        url: "https://buidlnow.com/buildnow.svg",
      },
    },
    audience: {
      "@type": "Audience",
      audienceType: "Developers",
    },
    keywords: [tool.name, tool.category, "developer tool", "online utility", "free tool"].filter(Boolean).join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
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
    publisher: {
      "@type": "Organization",
      name: "Buidl Now!",
      url: "https://buidlnow.com",
      logo: {
        "@type": "ImageObject",
        url: "https://buidlnow.com/buildnow.svg",
      },
    },
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
    sameAs: [
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
