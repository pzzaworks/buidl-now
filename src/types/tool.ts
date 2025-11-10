import { ReactNode, ComponentType } from "react";

export interface ToolExample {
  title: string;
  content: string | ReactNode;
  type?: "text" | "code";
}

export interface ToolReference {
  title: string;
  url: string;
}

export interface ToolSection {
  title: string;
  content: string | ReactNode;
}

export interface ToolSEO {
  title?: string; // Custom SEO title (if different from name)
  description?: string; // Custom SEO description (if different from description)
  keywords?: string[]; // Specific keywords for this tool
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  component: ComponentType;
  sections?: ToolSection[];
  examples?: ToolExample[];
  codeSnippet?: string;
  references?: ToolReference[];
  seo?: ToolSEO;
}
