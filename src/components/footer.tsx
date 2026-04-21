"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { MdApps } from "react-icons/md";

export function Footer() {
  const pathname = usePathname();
  const isToolsPage = pathname?.startsWith("/tools");
  const copyrightLabel = "© 2026 Buidl Now. All rights reserved.";

  return (
    <>
      {/* Mobile Footer - Centered */}
      <div className={`global-footer lg:hidden ${isToolsPage ? "relative mt-4 pb-4" : "fixed bottom-6"} left-0 right-0 flex flex-col items-center gap-4 z-50`}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-semibold" style={{ fontFamily: 'var(--font-turret), sans-serif' }}>
          <span className="text-foreground">{copyrightLabel}</span>
          {pathname === "/tools" ? null : (
            <>
              <span>·</span>
              <Link
                href="/tools"
                className="flex items-center gap-1 text-foreground hover:opacity-50 transition-opacity"
              >
                <MdApps className="w-4 h-4" />
                <span>All Tools</span>
              </Link>
            </>
          )}
          <span>·</span>
          <a
            href="https://github.com/pzzaworks/buidl-now"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-foreground hover:opacity-50 transition-opacity"
            aria-label="GitHub Repository"
          >
            <FaGithub className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Desktop Footer - Left: Built by, Right: GitHub */}
      <div className="hidden lg:block fixed bottom-10 left-10 z-50">
        <span className="text-sm text-foreground font-semibold" style={{ fontFamily: 'var(--font-turret), sans-serif' }}>
          {copyrightLabel}
        </span>
      </div>

      <div className="hidden lg:block fixed bottom-10 right-10 z-50">
        <a
          href="https://github.com/pzzaworks/buidl-now"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-foreground hover:opacity-50 transition-opacity font-semibold"
          style={{ fontFamily: 'var(--font-turret), sans-serif' }}
          aria-label="GitHub Repository"
        >
          <FaGithub className="w-4 h-4" />
          <span>GitHub</span>
        </a>
      </div>
    </>
  );
}
