"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // Hide on /tools page - has its own header
  if (pathname === "/tools") {
    return null;
  }

  return (
    <div className="global-header fixed top-0 left-0 p-5 md:p-8 z-50">
      <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-50 transition-opacity">
        <Image
          src="/buildnow-inv.svg?v=20260517"
          alt="Buidl Now"
          width={27}
          height={48}
          className="h-12 w-auto"
        />
        <div className="flex flex-row items-center gap-1 font-semibold" style={{ fontFamily: 'var(--font-turret), sans-serif' }}>
          <span className="text-md">Buidl</span>
          <span className="text-md italic">Now!</span>
        </div>
      </Link>
    </div>
  );
}
