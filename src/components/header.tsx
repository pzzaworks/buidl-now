"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="global-header fixed top-0 left-0 p-6 md:p-10 z-50">
      <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-50 transition-opacity">
        <Image
          src="/buidl-now-logo.svg"
          alt="Buidl Now"
          width={32}
          height={32}
          className="w-8 h-8"
          style={{ filter: isDark ? "invert(1)" : "none" }}
        />
        <div className="flex flex-row items-center gap-1">
          <span className="text-md font-medium">Buidl</span>
          <span className="text-md font-normal italic">Now!</span>
        </div>
      </Link>
    </div>
  );
}
