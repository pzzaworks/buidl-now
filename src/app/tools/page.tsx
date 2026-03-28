"use client";

import { tools } from "@/lib/tools-list";
import { toolCategories } from "@/types/tools";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdExpandMore } from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function AllToolsPage() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isDark, setIsDark] = useState(false);

  // Theme toggle and hide global header
  useEffect(() => {
    // Add class to hide global header on mobile
    document.body.classList.add('tool-page');

    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      document.body.classList.remove('tool-page');
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // Check if desktop and redirect
  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1280; // xl breakpoint
      setIsDesktop(desktop);
      if (desktop) {
        router.replace("/");
      }
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [router]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Group tools by category
  const toolsByCategory = toolCategories.map((category) => ({
    ...category,
    tools: tools.filter((tool) => tool.category === category.id),
  }));

  // Show nothing while checking or if desktop (will redirect)
  if (isDesktop === null || isDesktop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[var(--color-gray-300)] border-t-[var(--color-gray-600)] rounded-full animate-spin" />
      </div>
    );
  }

  // Mobile-only view
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-50 transition-opacity">
          <Image
            src="/buidl-now.svg"
            alt="Buidl Now"
            width={32}
            height={32}
            className="w-8 h-8"
            style={{ filter: isDark ? "invert(1)" : "none" }}
          />
          <div className="flex flex-row items-center gap-1 font-semibold" style={{ fontFamily: 'var(--font-turret), sans-serif' }}>
            <span className="text-md">Buidl</span>
            <span className="text-md italic">Now!</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center cursor-pointer transition-colors"
        >
          {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
      </div>

      {/* Title */}
      <div className="px-4 mb-4">
        <p
          className="text-xs font-medium tracking-[0.2em] text-[var(--color-gray-400)] uppercase"
          style={{ fontFamily: "var(--font-turret), sans-serif" }}
        >
          All Tools ({tools.length})
        </p>
      </div>

      {/* Tools List */}
      <div className="space-y-3 px-4">
        {toolsByCategory.map((category) => (
          <div
            key={category.id}
            className="bg-[var(--color-gray-0)] rounded-[16px] border border-[var(--color-gray-200)] overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center gap-3 w-full text-left p-4 cursor-pointer"
            >
              <category.icon className="w-5 h-5 text-[var(--color-gray-500)]" />
              <span className="text-sm font-medium text-[var(--color-gray-900)] flex-1">
                {category.name}
              </span>
              <span className="text-xs text-[var(--color-gray-400)] mr-1">
                {category.tools.length}
              </span>
              <motion.span
                className="text-[var(--color-gray-400)]"
                animate={{
                  rotate: expandedCategories.has(category.id) ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <MdExpandMore className="w-5 h-5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {expandedCategories.has(category.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 pt-0 border-t border-[var(--color-gray-100)]">
                    <div className="pt-3 space-y-0.5">
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.path}
                          className="flex items-center gap-2 py-2 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)] transition-colors"
                        >
                          {tool.icon && (
                            <tool.icon className="w-4 h-4 text-[var(--color-gray-400)]" />
                          )}
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

    </div>
  );
}
