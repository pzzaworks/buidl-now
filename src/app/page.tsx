"use client";

import { tools } from "@/lib/tools-list";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MdSearch,
  MdClose,
  MdKeyboardReturn,
  MdAccessTime,
  MdOutlineCurrencyExchange,
  MdCode,
} from "react-icons/md";
import Image from "next/image";
import {
  WebsiteStructuredData,
  OrganizationStructuredData,
} from "@/components/structured-data";

function HomeContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLAnchorElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize search query from URL parameter
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const filteredTools = searchQuery
    ? tools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
      const container = selectedItemRef.current.closest("[data-scrollable]");
      if (container) {
        const itemRect = selectedItemRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = 8; // py-2 = 0.5rem = 8px padding

        if (itemRect.top < containerRect.top + offset) {
          // Item is above visible area
          container.scrollTop -= containerRect.top + offset - itemRect.top;
        } else if (itemRect.bottom > containerRect.bottom - offset) {
          // Item is below visible area
          container.scrollTop +=
            itemRect.bottom - containerRect.bottom + offset;
        }
      }
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
        prev < filteredTools.length - 1 ? prev + 1 : prev,
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

      <div className="flex flex-col items-center justify-center h-[72vh]">
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
              <span className="text-3xl sm:text-4xl font-normal italic">
                Now!
              </span>
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
                <kbd className="hidden sm:inline-flex items-center justify-center px-2 h-7 text-muted-foreground rounded border border-muted-foreground/30 min-w-8">
                  <MdKeyboardReturn className="w-4 h-4" />
                </kbd>
              )}
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-auto p-1 min-h-0"
                >
                  <MdClose className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Results - Below Search Box (Absolute) */}
          <div
            data-scrollable
            className={`absolute left-4 right-4 top-full mt-2 bg-background/95 backdrop-blur-sm rounded-md border border-border shadow-lg max-h-[40vh] overflow-y-auto z-50 transition-all duration-300 ease-out ${
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
              <div className="py-2 px-2">
                {filteredTools.map((tool, index) => (
                  <Link
                    key={tool.id}
                    ref={index === selectedIndex ? selectedItemRef : null}
                    href={tool.path}
                    className={`block px-3 py-2.5 rounded-md transition-colors ${
                      index === selectedIndex ? "bg-accent" : "hover:bg-accent"
                    }`}
                    onClick={() => setSearchQuery("")}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {tool.icon && (
                        <tool.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <div className="font-medium text-foreground">
                        {tool.name}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tool.description}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Tools */}
        <div className="w-full max-w-2xl px-4 mt-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              {
                tool: tools.find((t) => t.id === "epoch-converter"),
                icon: MdAccessTime,
              },
              {
                tool: tools.find((t) => t.id === "eth-unit-converter"),
                icon: MdOutlineCurrencyExchange,
              },
              {
                tool: tools.find((t) => t.id === "json-validator"),
                icon: MdCode,
              },
            ]
              .filter((item) => item.tool)
              .map(({ tool, icon: Icon }) => (
                <Link key={tool!.id} href={tool!.path}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tool!.name}
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="flex items-end gap-4 text-white mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted/20 rounded-lg animate-pulse" />
        <div className="flex flex-col items-start justify-end gap-2">
          <div className="h-9 w-32 bg-muted/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-full max-w-2xl px-4">
        <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
