"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolConfig } from "@/types/tool";

const GITIGNORE_TEMPLATES: Record<string, { label: string; category: string; content: string }> = {
  nodejs: {
    label: "Node.js",
    category: "Languages",
    content: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
lerna-debug.log*

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# dotenv environment variable files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local`,
  },
  python: {
    label: "Python",
    category: "Languages",
    content: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Jupyter Notebook
.ipynb_checkpoints

# pyenv
.python-version

# pytest
.pytest_cache/`,
  },
  java: {
    label: "Java",
    category: "Languages",
    content: `# Java
*.class
*.log
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties

# Gradle
.gradle/
build/
!gradle-wrapper.jar

# IntelliJ IDEA
.idea/
*.iws
*.iml
*.ipr`,
  },
  go: {
    label: "Go",
    category: "Languages",
    content: `# Go
# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of go coverage tool
*.out

# Go workspace file
go.work

# Dependency directories
vendor/`,
  },
  rust: {
    label: "Rust",
    category: "Languages",
    content: `# Rust
/target/
**/*.rs.bk
Cargo.lock

# IDE
.idea/
*.iml`,
  },
  react: {
    label: "React",
    category: "Frameworks",
    content: `# React / Create React App
/build
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
*.pem`,
  },
  vue: {
    label: "Vue",
    category: "Frameworks",
    content: `# Vue
/dist
/dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea`,
  },
  nextjs: {
    label: "Next.js",
    category: "Frameworks",
    content: `# Next.js
/.next/
/out/

# Production
/build

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel`,
  },
  macos: {
    label: "macOS",
    category: "OS",
    content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent`,
  },
  windows: {
    label: "Windows",
    category: "OS",
    content: `# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk`,
  },
  linux: {
    label: "Linux",
    category: "OS",
    content: `# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*`,
  },
  vscode: {
    label: "VS Code",
    category: "IDE",
    content: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.code-workspace
.history/`,
  },
  jetbrains: {
    label: "JetBrains",
    category: "IDE",
    content: `# JetBrains IDEs
.idea/
*.iws
*.iml
*.ipr
out/
.idea_modules/
atlassian-ide-plugin.xml
com_crashlytics_export_strings.xml
crashlytics.properties
crashlytics-build.properties
fabric.properties`,
  },
  vim: {
    label: "Vim",
    category: "IDE",
    content: `# Vim
[._]*.s[a-v][a-z]
!*.svg
[._]*.sw[a-p]
[._]s[a-rt-v][a-z]
[._]ss[a-gi-z]
[._]sw[a-p]
Session.vim
Sessionx.vim
.netrwhist
*~
tags
[._]*.un~`,
  },
  docker: {
    label: "Docker",
    category: "Tools",
    content: `# Docker
docker-compose*.yml
.docker/`,
  },
  terraform: {
    label: "Terraform",
    category: "Tools",
    content: `# Terraform
**/.terraform/*
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
*.tfvars.json
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraformrc
terraform.rc`,
  },
};

export function GitignoreGeneratorTool() {
  const t = useTranslations("toolUI.gitignore-generator");
  const [selected, setSelected] = useState<Set<string>>(new Set(["nodejs", "macos", "vscode"]));
  const [output, setOutput] = useState("");

  const toggleSelection = (key: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelected(newSelected);
  };

  const handleGenerate = () => {
    if (selected.size === 0) {
      setOutput("");
      return;
    }

    const sections: string[] = [];
    selected.forEach((key) => {
      const template = GITIGNORE_TEMPLATES[key];
      if (template) {
        sections.push(template.content);
      }
    });

    const result = sections.join("\n\n");
    setOutput(result);
  };

  const handleSelectAll = () => {
    setSelected(new Set(Object.keys(GITIGNORE_TEMPLATES)));
  };

  const handleClearAll = () => {
    setSelected(new Set());
  };

  const categories = Array.from(new Set(Object.values(GITIGNORE_TEMPLATES).map((t) => t.category)));

  return (
    <div className="space-y-6">
      {/* Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm">{t("selectTemplates")}</Label>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSelectAll}>
              {t("selectAll")}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleClearAll}>
              {t("clearAll")}
            </Button>
          </div>
        </div>

        {categories.map((category) => (
          <div key={category}>
            <Label className="mb-2 block text-xs text-[var(--color-gray-500)] uppercase tracking-wide">
              {category}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(GITIGNORE_TEMPLATES)
                .filter(([, template]) => template.category === category)
                .map(([key, template]) => (
                  <Checkbox
                    key={key}
                    checked={selected.has(key)}
                    onChange={() => toggleSelection(key)}
                    label={template.label}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} variant="primary" className="w-full">
        {t("generate")}
      </Button>

      {/* Output */}
      {output && (
        <Textarea
          label={t("generatedLabel")}
          value={output}
          readOnly
          showCopy
          className="font-mono min-h-[400px] text-sm"
        />
      )}
    </div>
  );
}

export const gitignoreGeneratorConfig: ToolConfig = {
  id: "gitignore-generator",
  name: ".gitignore Generator",
  description: "Generate .gitignore files for various languages and frameworks",
  category: "generators",
  component: GitignoreGeneratorTool,
  seo: {
    keywords: [
      "gitignore generator",
      "gitignore creator",
      "gitignore builder",
      "git ignore file",
      "gitignore template",
      "create gitignore",
      "gitignore maker",
      "gitignore nodejs",
      "gitignore python",
      "gitignore react",
      "gitignore java",
      "gitignore vscode",
    ],
  },
  sections: [
    {
      title: "What is .gitignore?",
      content:
        "A .gitignore file tells Git which files or directories to ignore in a project. This is useful for excluding build artifacts, dependencies, IDE settings, and sensitive files like environment variables from version control.",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">Pattern Matching</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>*</strong> - Matches any string except /</li>
            <li><strong>**</strong> - Matches any string including /</li>
            <li><strong>?</strong> - Matches any single character</li>
            <li><strong>[abc]</strong> - Matches any character in brackets</li>
            <li><strong>!</strong> - Negates a pattern (include previously ignored)</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common Patterns</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><code>node_modules/</code> - Ignore directory</li>
            <li><code>*.log</code> - Ignore all .log files</li>
            <li><code>.env</code> - Ignore specific file</li>
            <li><code>/build</code> - Ignore only at root level</li>
          </ul>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Node.js project",
      content: "node_modules/\n.env\n.env.local\nnpm-debug.log*",
      type: "code",
    },
    {
      title: "Python project",
      content: "__pycache__/\n*.py[cod]\nvenv/\n.env",
      type: "code",
    },
  ],
  codeSnippet: `// Simple .gitignore generator

const templates: Record<string, string[]> = {
  nodejs: [
    'node_modules/',
    'npm-debug.log*',
    '.env',
    '.env.local'
  ],
  python: [
    '__pycache__/',
    '*.py[cod]',
    'venv/',
    '.env'
  ],
  java: [
    '*.class',
    'target/',
    '.idea/'
  ],
  macos: [
    '.DS_Store',
    '._*'
  ],
  vscode: [
    '.vscode/*',
    '!.vscode/settings.json'
  ]
};

function generateGitignore(selected: string[]): string {
  const lines: string[] = [];

  selected.forEach(key => {
    const template = templates[key];
    if (template) {
      lines.push(\`# \${key}\`);
      lines.push(...template);
      lines.push('');
    }
  });

  return lines.join('\\n');
}

// Example usage
const gitignore = generateGitignore(['nodejs', 'macos', 'vscode']);
console.log(gitignore);

// Output:
// # nodejs
// node_modules/
// npm-debug.log*
// .env
// .env.local
//
// # macos
// .DS_Store
// ._*
//
// # vscode
// .vscode/*
// !.vscode/settings.json`,
  references: [
    {
      title: "Git Documentation - gitignore",
      url: "https://git-scm.com/docs/gitignore",
    },
    {
      title: "GitHub - gitignore templates",
      url: "https://github.com/github/gitignore",
    },
  ],
};
