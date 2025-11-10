"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import { useEffect } from "react";
import { Button } from "./ui/button";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isToolPage = pathname?.startsWith("/tools/") || pathname === "/tools";
  const isHomePage = pathname === "/";

  // Navigate to home on Escape key
  useEffect(() => {
    if (!isToolPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isToolPage, router]);

  // Don't show header on homepage
  if (isHomePage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute top-0 left-0 right-0 z-0 h-24 w-full bg-gradient-to-b from-background via-background/75 to-transparent pointer-events-none"></div>
      <div className="relative z-10 max-w-[640px] w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-50 transition-opacity">
          <Image src="/buidl-now-logo.svg" alt="Buidl Now" width={32} height={32} className="w-8 h-8" />
          <div className="flex flex-row items-center gap-1">
            <span className="text-md sm:text-l font-medium">Buidl</span>
            <span className="text-md sm:text-md font-normal italic">Now!</span>
          </div>
        </Link>

        {isToolPage && (
          <Link
            href="/"
          >
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1 h-auto px-2 py-1 text-xs"
          >
            <MdArrowBack className="w-4 h-4" />
            <span>Return</span>
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-semibold text-muted-foreground/80 rounded border border-muted-foreground/30 min-w-[24px] ml-1.5 transition-colors">
              ESC
            </kbd>
          </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
