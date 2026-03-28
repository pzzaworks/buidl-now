"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
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

  // Hide on /tools page - has its own header
  if (pathname === "/tools") {
    return null;
  }

  return (
    <div className="global-header fixed top-0 left-0 p-6 md:p-10 z-50">
      <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-50 transition-opacity">
        <Image
          src={isDark ? "/buidl-now.svg" : "/buidl-now-black.svg"}
          alt="Buidl Now"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <div className="flex flex-row items-center gap-1 font-semibold" style={{ fontFamily: 'var(--font-turret), sans-serif' }}>
          <span className="text-md">Buidl</span>
          <span className="text-md italic">Now!</span>
        </div>
      </Link>
    </div>
  );
}
