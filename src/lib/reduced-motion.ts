import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => false;

/**
 * Reduced-motion preference that is safe to branch on during hydration.
 *
 * framer-motion's `useReducedMotion` already reports the client preference on
 * the hydration render, while the server always rendered the animated
 * ("hidden") state. React does not patch mismatched attributes, so with reduced
 * motion the server's `opacity: 0` stayed on the header and hero forever. This
 * hook reports `false` while hydrating (matching the server HTML) and the real
 * preference right after; callers remount their motion tree on that change.
 */
export function useHydrationSafeReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
