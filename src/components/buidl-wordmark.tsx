"use client";

import { useRef } from "react";
import {
  motion,
  motionValue,
  type MotionValue,
  useInView,
  useReducedMotion,
  useTransform,
} from "framer-motion";

interface WordmarkRect {
  x: number;
  y: number;
}

interface WordmarkLetter {
  id: string;
  originX: number;
  rects: WordmarkRect[];
}

interface BuidlWordmarkProps {
  animateLetters?: boolean;
  animateOnView?: boolean;
  className?: string;
  enableScrollWave?: boolean;
  scrollY?: MotionValue<number>;
}

const wordmarkLetters: WordmarkLetter[] = [
  {
    id: "b",
    originX: 0,
    rects: [
      { x: 0, y: 0 },
      { x: 14, y: 0 },
      { x: 28, y: 0 },
      { x: 42, y: 0 },
      { x: 0, y: 14 },
      { x: 56, y: 14 },
      { x: 0, y: 28 },
      { x: 56, y: 28 },
      { x: 0, y: 42 },
      { x: 14, y: 42 },
      { x: 28, y: 42 },
      { x: 42, y: 42 },
      { x: 0, y: 56 },
      { x: 56, y: 56 },
      { x: 0, y: 70 },
      { x: 56, y: 70 },
      { x: 0, y: 84 },
      { x: 14, y: 84 },
      { x: 28, y: 84 },
      { x: 42, y: 84 },
    ],
  },
  {
    id: "u",
    originX: 84,
    rects: [
      { x: 0, y: 0 },
      { x: 56, y: 0 },
      { x: 0, y: 14 },
      { x: 56, y: 14 },
      { x: 0, y: 28 },
      { x: 56, y: 28 },
      { x: 0, y: 42 },
      { x: 56, y: 42 },
      { x: 0, y: 56 },
      { x: 56, y: 56 },
      { x: 0, y: 70 },
      { x: 56, y: 70 },
      { x: 0, y: 84 },
      { x: 14, y: 84 },
      { x: 28, y: 84 },
      { x: 42, y: 84 },
      { x: 56, y: 84 },
    ],
  },
  {
    id: "i",
    originX: 168,
    rects: [
      { x: 0, y: 0 },
      { x: 14, y: 0 },
      { x: 28, y: 0 },
      { x: 42, y: 0 },
      { x: 56, y: 0 },
      { x: 28, y: 14 },
      { x: 28, y: 28 },
      { x: 28, y: 42 },
      { x: 28, y: 56 },
      { x: 28, y: 70 },
      { x: 0, y: 84 },
      { x: 14, y: 84 },
      { x: 28, y: 84 },
      { x: 42, y: 84 },
      { x: 56, y: 84 },
    ],
  },
  {
    id: "d",
    originX: 252,
    rects: [
      { x: 0, y: 0 },
      { x: 14, y: 0 },
      { x: 28, y: 0 },
      { x: 42, y: 0 },
      { x: 0, y: 14 },
      { x: 56, y: 14 },
      { x: 0, y: 28 },
      { x: 56, y: 28 },
      { x: 0, y: 42 },
      { x: 56, y: 42 },
      { x: 0, y: 56 },
      { x: 56, y: 56 },
      { x: 0, y: 70 },
      { x: 56, y: 70 },
      { x: 0, y: 84 },
      { x: 14, y: 84 },
      { x: 28, y: 84 },
      { x: 42, y: 84 },
    ],
  },
  {
    id: "l",
    originX: 336,
    rects: [
      { x: 0, y: 0 },
      { x: 0, y: 14 },
      { x: 0, y: 28 },
      { x: 0, y: 42 },
      { x: 0, y: 56 },
      { x: 0, y: 70 },
      { x: 0, y: 84 },
      { x: 14, y: 84 },
      { x: 28, y: 84 },
      { x: 42, y: 84 },
      { x: 56, y: 84 },
    ],
  },
  {
    id: "n",
    originX: 476,
    rects: [
      { x: 0, y: 0 },
      { x: 56, y: 0 },
      { x: 0, y: 14 },
      { x: 14, y: 14 },
      { x: 56, y: 14 },
      { x: 0, y: 28 },
      { x: 28, y: 28 },
      { x: 56, y: 28 },
      { x: 0, y: 42 },
      { x: 42, y: 42 },
      { x: 56, y: 42 },
      { x: 0, y: 56 },
      { x: 56, y: 56 },
      { x: 0, y: 70 },
      { x: 56, y: 70 },
      { x: 0, y: 84 },
      { x: 56, y: 84 },
    ],
  },
  {
    id: "o",
    originX: 560,
    rects: [
      { x: 14, y: 0 },
      { x: 28, y: 0 },
      { x: 42, y: 0 },
      { x: 0, y: 14 },
      { x: 56, y: 14 },
      { x: 0, y: 28 },
      { x: 56, y: 28 },
      { x: 0, y: 42 },
      { x: 56, y: 42 },
      { x: 0, y: 56 },
      { x: 56, y: 56 },
      { x: 0, y: 70 },
      { x: 56, y: 70 },
      { x: 14, y: 84 },
      { x: 28, y: 84 },
      { x: 42, y: 84 },
    ],
  },
  {
    id: "w",
    originX: 644,
    rects: [
      { x: 0, y: 0 },
      { x: 56, y: 0 },
      { x: 0, y: 14 },
      { x: 56, y: 14 },
      { x: 0, y: 28 },
      { x: 56, y: 28 },
      { x: 0, y: 42 },
      { x: 28, y: 42 },
      { x: 56, y: 42 },
      { x: 0, y: 56 },
      { x: 28, y: 56 },
      { x: 56, y: 56 },
      { x: 0, y: 70 },
      { x: 28, y: 70 },
      { x: 56, y: 70 },
      { x: 14, y: 84 },
      { x: 42, y: 84 },
    ],
  },
  {
    id: "exclamation",
    originX: 728,
    rects: [
      { x: 0, y: 0 },
      { x: 0, y: 14 },
      { x: 0, y: 28 },
      { x: 0, y: 42 },
      { x: 0, y: 56 },
      { x: 0, y: 84 },
    ],
  },
];

function WordmarkLetterGroup({
  animateLetters,
  enableScrollWave,
  index,
  letter,
  scrollY,
}: {
  animateLetters: boolean;
  enableScrollWave: boolean;
  index: number;
  letter: WordmarkLetter;
  scrollY?: MotionValue<number>;
}) {
  const shouldReduceMotion = useReducedMotion();
  const scrollStart = index * 56;
  const scrollEnd = scrollStart + 78;
  const driftY = useTransform(
    scrollY ?? motionValueZero,
    [0, scrollStart, scrollEnd],
    [0, 0, shouldReduceMotion ? 0 : -26],
  );

  return (
    <g transform={`translate(${letter.originX} 0)`}>
      <motion.g
        initial={
          shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 22 }
        }
        animate={
          animateLetters
            ? { opacity: 1, scale: 1, y: 0 }
            : shouldReduceMotion
              ? undefined
              : { opacity: 0, scale: 0.96, y: 22 }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                delay: 0.08 + index * 0.055,
                duration: 0.46,
                ease: [0.22, 1, 0.36, 1],
              }
        }
        style={
          shouldReduceMotion || !enableScrollWave
            ? undefined
            : {
                y: driftY,
                transformOrigin: "50% 50%",
              }
        }
      >
        {letter.rects.map((rect, rectIndex) => (
          <rect
            key={`${letter.id}-${rect.x}-${rect.y}-${rectIndex}`}
            x={rect.x}
            y={rect.y}
            width="14"
            height="14"
            fill="currentColor"
          />
        ))}
      </motion.g>
    </g>
  );
}

export function BuidlWordmark({
  animateLetters = true,
  animateOnView = false,
  className,
  enableScrollWave = true,
  scrollY,
}: BuidlWordmarkProps) {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.45 });
  const shouldAnimateLetters = animateLetters && (!animateOnView || isInView);

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 742 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Buidl Now"
      role="img"
    >
      {wordmarkLetters.map((letter, index) => (
        <WordmarkLetterGroup
          key={letter.id}
          animateLetters={shouldAnimateLetters}
          enableScrollWave={enableScrollWave}
          index={index}
          letter={letter}
          scrollY={scrollY}
        />
      ))}
    </svg>
  );
}

const motionValueZero = motionValue(0);
