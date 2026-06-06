"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

const sansStyle: CSSProperties = {
  fontFamily: 'var(--font-chakra-petch), "Chakra Petch", sans-serif',
};
const monoStyle: CSSProperties = {
  fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", monospace',
};

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Homepage FAQ accordion. Each row is a button (click anywhere to toggle) and
 * the answer expands with a smooth height/opacity animation. Visuals match the
 * homepage design (yellow/dark, Chakra Petch + IBM Plex Mono).
 */
export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openItems, setOpenItems] = useState<ReadonlySet<number>>(new Set());

  const toggle = (index: number) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const panelId = `faq-panel-${index}`;

        return (
          <div
            key={item.question}
            className="border-b border-[#202020]/16 last:border-b-0"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
              className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left"
            >
              <span
                className="text-[20px] font-medium leading-[1.2] tracking-[-0.02em] text-[#202020] lg:text-[24px]"
                style={sansStyle}
              >
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className={`mt-1 shrink-0 text-[18px] font-medium text-[#202020] transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
                style={monoStyle}
              >
                +
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="answer"
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p
                    className="max-w-[760px] pb-6 text-[17px] leading-7 text-[#202020]"
                    style={sansStyle}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}
