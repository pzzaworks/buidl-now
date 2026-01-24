"use client";

import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
    checkDarkMode();

    // Listen for changes from other toggles
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="global-theme-toggle fixed top-6 right-6 md:top-10 md:right-10 z-[9999] w-10 h-10 rounded-full bg-[var(--color-gray-0)] border border-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] flex items-center justify-center cursor-pointer transition-colors"
    >
      {isDark ? (
        <FiSun className="w-5 h-5" />
      ) : (
        <FiMoon className="w-5 h-5" />
      )}
    </button>
  );
}
