import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation primitives. Components import Link/useRouter/etc from
// here (instead of next/navigation) so internal links automatically carry the
// active locale prefix without every call site having to thread it manually.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
