"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

type TemplateStyle = "minimal" | "standard" | "detailed";

const TEMPLATE_STYLES: { value: TemplateStyle; labelKey: string; descKey: string }[] = [
  { value: "minimal", labelKey: "styleMinimal", descKey: "styleMinimalDesc" },
  { value: "standard", labelKey: "styleStandard", descKey: "styleStandardDesc" },
  { value: "detailed", labelKey: "styleDetailed", descKey: "styleDetailedDesc" },
];

function generateReadme(
  projectName: string,
  description: string,
  features: string,
  installation: string,
  usage: string,
  license: string,
  author: string,
  style: TemplateStyle
): string {
  const featuresList = features
    .split("\n")
    .filter((f) => f.trim())
    .map((f) => `- ${f.trim()}`)
    .join("\n");

  if (style === "minimal") {
    return `# ${projectName}

${description}

## Installation

\`\`\`bash
${installation || "npm install"}
\`\`\`

## Usage

\`\`\`bash
${usage || "npm start"}
\`\`\`

## License

${license || "MIT"}
`;
  }

  if (style === "standard") {
    return `# ${projectName}

${description}

## Features

${featuresList || "- Feature 1\n- Feature 2\n- Feature 3"}

## Installation

\`\`\`bash
${installation || "npm install"}
\`\`\`

## Usage

\`\`\`bash
${usage || "npm start"}
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ${license || "MIT"} License.

## Author

${author || "Your Name"}
`;
  }

  // Detailed
  return `# ${projectName}

[![License](https://img.shields.io/badge/license-${encodeURIComponent(license || "MIT")}-blue.svg)](LICENSE)

${description}

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Testing](#testing)
- [License](#license)
- [Author](#author)

## Features

${featuresList || "- Feature 1\n- Feature 2\n- Feature 3"}

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/username/${projectName.toLowerCase().replace(/\s+/g, "-")}.git
\`\`\`

2. Navigate to the project directory:

\`\`\`bash
cd ${projectName.toLowerCase().replace(/\s+/g, "-")}
\`\`\`

3. Install dependencies:

\`\`\`bash
${installation || "npm install"}
\`\`\`

## Usage

\`\`\`bash
${usage || "npm start"}
\`\`\`

## Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
# Example environment variables
API_KEY=your_api_key
DATABASE_URL=your_database_url
\`\`\`

## API Reference

### Endpoint 1

\`\`\`
GET /api/example
\`\`\`

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| \`id\`      | \`string\` | **Required**. Item ID      |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## Testing

Run the test suite:

\`\`\`bash
npm test
\`\`\`

## License

This project is licensed under the ${license || "MIT"} License - see the [LICENSE](LICENSE) file for details.

## Author

**${author || "Your Name"}**

- GitHub: [@username](https://github.com/username)
- Twitter: [@username](https://twitter.com/username)

---

If you found this project helpful, please give it a star!
`;
}

export function ReadmeGeneratorTool() {
  const t = useTranslations("toolUI.readme-generator");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [installation, setInstallation] = useState("npm install");
  const [usage, setUsage] = useState("npm start");
  const [license, setLicense] = useState("MIT");
  const [author, setAuthor] = useState("");
  const [style, setStyle] = useState<TemplateStyle>("standard");
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    if (!projectName.trim()) {
      setOutput("");
      return;
    }

    const readme = generateReadme(
      projectName,
      description,
      features,
      installation,
      usage,
      license,
      author,
      style
    );
    setOutput(readme);
  };

  const handleReset = () => {
    setProjectName("");
    setDescription("");
    setFeatures("");
    setInstallation("npm install");
    setUsage("npm start");
    setLicense("MIT");
    setAuthor("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Template Style */}
      <div>
        <Label className="mb-2 block text-sm">{t("templateStyle")}</Label>
        <div className="flex gap-2">
          {TEMPLATE_STYLES.map((s) => (
            <Button
              key={s.value}
              variant={style === s.value ? "primary" : "secondary"}
              onClick={() => setStyle(s.value)}
              className="flex-1"
              size="sm"
            >
              {t(s.labelKey)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-gray-500)] mt-1">
          {t(
            TEMPLATE_STYLES.find((s) => s.value === style)?.descKey ??
              "styleStandardDesc"
          )}
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("projectNameLabel")}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={t("projectNamePlaceholder")}
        />
        <Input
          label={t("authorLabel")}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={t("authorPlaceholder")}
        />
      </div>

      {/* Description */}
      <Textarea
        label={t("descriptionLabel")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("descriptionPlaceholder")}
        className="min-h-[80px]"
      />

      {/* Features */}
      <Textarea
        label={t("featuresLabel")}
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
        placeholder={t("featuresPlaceholder")}
        className="min-h-[100px]"
      />

      {/* Installation & Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("installationLabel")}
          value={installation}
          onChange={(e) => setInstallation(e.target.value)}
          placeholder="npm install"
          className="font-mono"
        />
        <Input
          label={t("usageLabel")}
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="npm start"
          className="font-mono"
        />
      </div>

      {/* License */}
      <div>
        <Label className="mb-2 block text-sm">{t("licenseLabel")}</Label>
        <select
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          className="flex h-11 w-full rounded-[var(--radius-12)] bg-[var(--color-gray-0)] px-4 text-sm text-[var(--color-gray-950)] border border-[var(--color-gray-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-500)]/20 focus-visible:border-[var(--color-blue-500)]"
        >
          <option value="MIT">MIT</option>
          <option value="Apache-2.0">Apache 2.0</option>
          <option value="GPL-3.0">GPL 3.0</option>
          <option value="BSD-3-Clause">BSD 3-Clause</option>
          <option value="ISC">ISC</option>
          <option value="Unlicense">Unlicense</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleGenerate} variant="primary" className="flex-1">
          {t("generate")}
        </Button>
        <Button onClick={handleReset} variant="secondary">
          {t("reset")}
        </Button>
      </div>

      {/* Output */}
      {output && (
        <Textarea
          label={t("outputLabel")}
          value={output}
          readOnly
          showCopy
          className="font-mono min-h-[400px] text-sm"
        />
      )}
    </div>
  );
}

export const readmeGeneratorConfig: ToolConfig = {
  id: "readme-generator",
  name: "README Generator",
  description: "Generate professional README.md files for your projects",
  category: "generators",
  component: ReadmeGeneratorTool,
  seo: {
    keywords: [
      "readme generator",
      "readme creator",
      "readme template",
      "github readme",
      "readme builder",
      "readme maker",
      "markdown readme",
      "project readme",
      "readme.md generator",
      "create readme",
      "readme file generator",
      "professional readme",
    ],
  },
  sections: [
    {
      title: "What is a README?",
      content:
        "A README file is typically the first file visitors see when they discover your project. It provides essential information about the project including what it does, how to install and use it, and how to contribute. A well-written README can significantly improve your project's adoption and contribution rate.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Template Styles</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>Minimal:</strong> Perfect for simple projects or quick documentation</li>
            <li><strong>Standard:</strong> Balanced template with all essential sections</li>
            <li><strong>Detailed:</strong> Comprehensive template for professional projects</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Essential Sections</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>Title:</strong> Clear project name</li>
            <li><strong>Description:</strong> What the project does</li>
            <li><strong>Installation:</strong> How to set it up</li>
            <li><strong>Usage:</strong> How to use it</li>
            <li><strong>License:</strong> Usage rights</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Minimal README",
      content: "# Project Name\n\nBrief description.\n\n## Installation\n\n```bash\nnpm install\n```",
      type: "code",
    },
    {
      title: "Feature list",
      content: "## Features\n\n- Fast and lightweight\n- Easy to use\n- Well documented",
      type: "code",
    },
  ],
  codeSnippet: `// README Generator function

interface ReadmeOptions {
  projectName: string;
  description: string;
  features: string[];
  installation: string;
  usage: string;
  license: string;
  author: string;
}

function generateReadme(options: ReadmeOptions): string {
  const {
    projectName,
    description,
    features,
    installation,
    usage,
    license,
    author
  } = options;

  const featuresList = features
    .map(f => \`- \${f}\`)
    .join('\\n');

  return \`# \${projectName}

\${description}

## Features

\${featuresList}

## Installation

\\\`\\\`\\\`bash
\${installation}
\\\`\\\`\\\`

## Usage

\\\`\\\`\\\`bash
\${usage}
\\\`\\\`\\\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the \${license} License.

## Author

\${author}
\`;
}

// Example usage
const readme = generateReadme({
  projectName: 'My Awesome Project',
  description: 'A fantastic tool for developers',
  features: ['Fast and lightweight', 'Easy to use', 'Well documented'],
  installation: 'npm install my-awesome-project',
  usage: 'npx my-awesome-project',
  license: 'MIT',
  author: 'John Doe'
});

console.log(readme);`,
  references: [
    {
      title: "Make a README",
      url: "https://www.makeareadme.com/",
    },
    {
      title: "GitHub - About READMEs",
      url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
    },
  ],
};
