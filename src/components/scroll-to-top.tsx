"use client";

import { useState, useEffect } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
import { Button } from "./ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-[640px] mx-auto px-6 py-12 flex justify-end">
        <Button
          onClick={scrollToTop}
          variant="secondary"
          size="sm"
          className={`pointer-events-auto !px-2 h-auto min-h-0 transition-all duration-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          aria-label="Scroll to top"
        >
          <MdKeyboardArrowUp className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
