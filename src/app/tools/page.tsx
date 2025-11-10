"use client";

import { toolCategories, toolSubcategories } from "@/types/tools";
import { tools } from "@/lib/tools-list";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { Button } from "@/components/ui/button";

export default function AllToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = searchQuery
      ? tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8 w-full">
        <h1 className="mb-2 text-xl sm:text-2xl font-semibold">All Tools</h1>
        <p className="text-xs sm:text-sm opacity-50">
          Browse all {tools.length} developer tools
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground h-auto p-1 min-h-0"
            >
              <MdClose className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedCategory(null)}
          variant={selectedCategory === null ? "default" : "secondary"}
          size="sm"
          className="h-auto min-h-0 px-3 py-1.5 text-xs"
        >
          All
        </Button>
        {toolCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              className="h-auto min-h-0 px-3 py-1.5 text-xs gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {category.name}
            </Button>
          );
        })}
      </div>

      <hr className="border-border mb-8" />

      {/* Tool Categories */}
      {filteredTools.length === 0 ? (
        <div className="py-12">
          <p className="text-sm text-muted-foreground">
            No tools found. Try a different search?
          </p>
        </div>
      ) : (
        toolCategories.map((category) => {
          const categoryTools = filteredTools.filter((t) => t.category === category.id);

          if (categoryTools.length === 0) return null;

          // Group tools by subcategory
          const subcategoryGroups = toolSubcategories
            .filter((sub) => sub.parent === category.id)
            .map((subcategory) => ({
              subcategory,
              tools: categoryTools.filter((t) => t.subcategory === subcategory.id),
            }))
            .filter((group) => group.tools.length > 0);

          // Tools without subcategory
          const uncategorizedTools = categoryTools.filter((t) => !t.subcategory);

          return (
            <section key={category.id} className="mb-12">
              <h2 className="mb-6 text-base font-medium text-muted-foreground flex items-center gap-2">
                <category.icon className="w-5 h-5" />
                {category.name}
              </h2>

              <div className="space-y-6">
                {/* Subcategory groups */}
                {subcategoryGroups.map(({ subcategory, tools: subTools }) => (
                  <div key={subcategory.id} className="pl-6">
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground/70 flex items-center gap-2">
                      <subcategory.icon className="w-4 h-4" />
                      {subcategory.name}
                    </h3>
                    <div className="space-y-2 pl-6">
                      {subTools.map((tool) => (
                        <div key={tool.id} className="flex items-end gap-2">
                          <Link
                            href={tool.path}
                            className="hover:underline transition-colors whitespace-nowrap"
                          >
                            {tool.name}
                          </Link>
                          <div className="flex-1 h-[0.75px] mb-[6px] bg-muted-foreground/20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Uncategorized tools */}
                {uncategorizedTools.length > 0 && (
                  <div>
                    <div className="space-y-2">
                      {uncategorizedTools.map((tool) => (
                        <div key={tool.id} className="flex items-end gap-2">
                          <Link
                            href={tool.path}
                            className="hover:underline transition-colors whitespace-nowrap"
                          >
                            {tool.name}
                          </Link>
                          <div className="flex-1 h-[0.75px] mb-[6px] bg-muted-foreground/20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}
    </>
  );
}
