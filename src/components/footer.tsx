import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-[640px] w-full mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground text-center">
          <div className="flex flex-row items-center gap-1">
            <span className="font-medium">Buidl</span>
            <span className="font-normal italic">Now!</span>
          </div>
          <span className="font-normal hidden sm:inline">·</span>
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
          <span className="font-normal hidden sm:inline">·</span>
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
    </footer>
  );
}
