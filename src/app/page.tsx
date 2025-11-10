"use client";

import { tools } from "@/lib/tools-list";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { MdSearch, MdClose, MdKeyboardReturn } from "react-icons/md";
import Image from "next/image";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/structured-data";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLAnchorElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = searchQuery
    ? tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Focus search input when user starts typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if already focused or if modifier keys are pressed
      if (
        document.activeElement === searchInputRef.current ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key === "Tab"
      ) {
        return;
      }

      // Focus input when user types any character
      if (e.key.length === 1 && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll selected item into view when selectedIndex changes
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchQuery || filteredTools.length === 0) return;

    if (e.key === "Enter") {
      e.preventDefault();
      window.location.href = filteredTools[selectedIndex].path;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredTools.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  // Reset selected index when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(0);
  };

  return (
    <>
      <WebsiteStructuredData />
      <OrganizationStructuredData />

      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="flex items-end gap-4 text-white mb-8">
          <Image
            src="/buidl-now-logo.svg"
            alt="Buidl Now"
            width={80}
            height={80}
            className="w-24 h-24 sm:w-32 sm:h-32"
          />
          <div className="flex flex-col items-start justify-end gap-2">
            <div className="flex flex-row items-center gap-2">
              <span className="text-3xl sm:text-4xl font-medium">Buidl</span>
              <span className="text-3xl sm:text-4xl font-normal italic">Now!</span>
            </div>
            <span className="text-sm sm:text-base text-muted-foreground">
              Developer tools for builders who ship fast
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl px-4 relative">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-24 h-12 text-base"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchQuery && filteredTools.length > 0 && (
                <kbd className="hidden sm:inline-flex items-center justify-center px-2 h-7 text-muted-foreground rounded border border-muted-foreground/30 min-w-[32px]">
                  <MdKeyboardReturn className="w-4 h-4" />
                </kbd>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results - Below Search Box (Absolute) */}
          <div
            className={`absolute left-4 right-4 top-full mt-2 bg-background/95 backdrop-blur-sm rounded-md border border-border shadow-lg max-h-[400px] overflow-y-auto z-50 transition-all duration-300 ease-out scroll-py-2 ${
              searchQuery
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {filteredTools.length === 0 ? (
              <div className="py-6 px-2 text-center">
                <p className="text-sm text-muted-foreground">
                  No tools found. Try a different search?
                </p>
              </div>
            ) : (
              <div className="space-y-0 py-2 px-2">
                {filteredTools.map((tool, index) => (
                  <Link
                    key={tool.id}
                    ref={index === selectedIndex ? selectedItemRef : null}
                    href={tool.path}
                    className={`block px-3 py-2.5 rounded-md transition-colors ${
                      index === selectedIndex
                        ? "bg-accent"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSearchQuery("")}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="font-medium text-foreground">{tool.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {tool.description}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
