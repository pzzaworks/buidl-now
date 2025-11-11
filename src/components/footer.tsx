import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-[640px] w-full mx-auto px-4 sm:px-6 pt-16 pb-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground text-center">
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-row items-center gap-1">
              <span className="font-medium">Buidl</span>
              <span className="font-normal italic">Now!</span>
            </div>
            <span className="font-normal">·</span>
            <Link
              href="/tools"
              className="text-foreground hover:text-white hover:underline transition-colors"
            >
              All Tools
            </Link>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-normal">
              Built by{" "}
              <a
                href="https://pzza.works"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-white hover:underline transition-colors"
              >
                Berke
              </a>
            </span>
            <span className="font-normal">·</span>
            <a
              href="https://github.com/pzzaworks/buidl-now"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-foreground hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <FaGithub className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
