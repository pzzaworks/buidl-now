import type { Metadata } from "next";
import Link from "next/link";

const monoStyle = {
  fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", monospace',
} as const;

const sansStyle = {
  fontFamily: 'var(--font-chakra-petch), "Chakra Petch", sans-serif',
} as const;

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 py-24 text-center">
      <div className="w-full max-w-[640px]">
        <div
          className="text-[12px] font-medium uppercase tracking-[0.22em] text-foreground/72"
          style={monoStyle}
        >
          / 404 - Not Found
        </div>

        <h1
          className="mt-6 text-[40px] font-medium leading-[44px] tracking-[-2px] text-foreground"
          style={sansStyle}
        >
          This page took a wrong turn.
        </h1>

        <p
          className="mt-6 text-[18px] leading-8 text-foreground"
          style={sansStyle}
        >
          The page you are looking for does not exist or has moved. Head back to
          the homepage or jump straight into the tools.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex rounded-none border border-[#202020] bg-[#202020] px-8 py-5 text-[13px] font-medium uppercase tracking-[0.22em] text-[#f0fb29] transition-colors duration-300 hover:bg-[#f0fb29] hover:text-[#202020]"
            style={monoStyle}
          >
            Go Home
          </Link>

          <Link
            href="/#tools"
            className="inline-flex rounded-none border border-[#202020] px-8 py-5 text-[13px] font-medium uppercase tracking-[0.22em] text-[#202020] transition-colors hover:bg-[#202020] hover:text-[#f0fb29]"
            style={monoStyle}
          >
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
