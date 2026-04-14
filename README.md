<p align="center">
  <img src="public/buildnow.svg" alt="Buidl Now" width="80" />
</p>

Buidl Now! Developer tools for builders who ship fast. A comprehensive suite of developer tools and Web3 utilities.

## Features

- 🔧 Developer Tools (Base64, Hash Generator, etc.)
- 🌐 Web3 Utilities (Function Selector, Keccak-256, etc.)
- ⚡ Built with Next.js 16 & React 19
- 🎨 Tailwind CSS 4 (CSS-first approach)
- 🔥 TypeScript
- 📦 Modular tool architecture

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3100](http://localhost:3100) to see the application.

## Tech Stack

- **Framework:** Next.js 16.1.0
- **React:** 19.2.0
- **Styling:** Tailwind CSS 4.1.16
- **TypeScript:** 5.9.3
- **Web3:** Viem 2.38.5, Wagmi 2.19.0
- **Testing:** Vitest

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/ens/route.ts   # ENS resolution API
│   ├── tools/[id]/        # Dynamic tool pages
│   ├── tools/page.tsx     # Tools index redirect
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── header.tsx
│   ├── footer.tsx
│   └── layout-shell.tsx
├── tools/                # Tool implementations
│   ├── function-selector.tsx
│   ├── base64-text.tsx
│   ├── hash-generator.tsx
│   ├── keccak-hash.tsx
│   ├── __tests__/        # Tool tests
│   └── index.ts
├── lib/                  # Utilities and tool metadata
│   └── tools-list.ts
└── types/                # TypeScript types
```

## Adding a New Tool

1. Create a new file in `src/tools/your-tool.tsx`:

```typescript
"use client";

import { ToolConfig } from "@/types/tool";

export function YourTool() {
  return <div>Your tool UI here</div>;
}

export const yourToolConfig: ToolConfig = {
  id: "your-tool",
  name: "Your Tool Name",
  description: "Tool description",
  category: "converters",
  component: YourTool,
  examples: [],
  references: [],
};
```

2. Register it in `src/tools/index.ts`:

```typescript
import { yourToolConfig } from "./your-tool";

export const toolRegistry = {
  // ... other tools
  "your-tool": yourToolConfig,
};
```

3. Add to the tools list in `src/lib/tools-list.ts`

4. Optionally add a test in `src/tools/__tests__/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Buidl Team - [https://buidlnow.com](https://buidlnow.com)

Project Link: [https://github.com/pzzaworks/buidl-now](https://github.com/pzzaworks/buidl-now)
