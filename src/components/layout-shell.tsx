"use client";

import { usePathname } from "@/i18n/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { GeometricBackground } from "@/components/geometric-background";
import { ThemeToggle } from "@/components/theme-toggle";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname.startsWith("/tools/");

  if (isHomePage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <GeometricBackground />
      <div className="relative z-10 min-h-screen w-full">
        <Header />
        <main className="min-h-screen w-full">{children}</main>
        <Footer />
      </div>
      <ScrollToTop />
      <ThemeToggle />
    </>
  );
}
