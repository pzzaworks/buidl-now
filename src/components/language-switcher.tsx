"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import type { FlagComponent } from "country-flag-icons/react/3x2";
import GB from "country-flag-icons/react/3x2/GB";
import ES from "country-flag-icons/react/3x2/ES";
import BR from "country-flag-icons/react/3x2/BR";
import FR from "country-flag-icons/react/3x2/FR";
import DE from "country-flag-icons/react/3x2/DE";
import IT from "country-flag-icons/react/3x2/IT";
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import CN from "country-flag-icons/react/3x2/CN";
import HK from "country-flag-icons/react/3x2/HK";
import VN from "country-flag-icons/react/3x2/VN";
import SK from "country-flag-icons/react/3x2/SK";
import TR from "country-flag-icons/react/3x2/TR";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeList, localeMeta, type Locale } from "@/i18n/locales";

const monoStyle: CSSProperties = {
  fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", monospace',
};

// SVG flag components keyed by ISO country code (tree-shaken - only the 13
// locales in use are bundled).
const flagByCountry: Record<string, FlagComponent> = {
  GB,
  ES,
  BR,
  FR,
  DE,
  IT,
  JP,
  KR,
  CN,
  HK,
  VN,
  SK,
  TR,
};

function Flag({ country, className }: { country: string; className?: string }) {
  const Component = flagByCountry[country];
  if (!Component) {
    return null;
  }
  return <Component className={className} />;
}

// Locale picker rendered in the homepage header. Switching keeps the current
// route and only swaps the locale segment, so a visitor stays on the same
// tool/page in their chosen language. Styled to match the brutalist header
// (mono, uppercase, dark border on the yellow bar).
export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectLocale(locale: Locale) {
    setIsOpen(false);
    if (locale === activeLocale) {
      return;
    }
    router.replace(pathname, { locale });
  }

  const active = localeMeta[activeLocale];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={t("selectAriaLabel")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 border border-[#202020] bg-transparent px-3 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#202020] transition-colors hover:bg-[#202020] hover:text-[#f0fb29]"
        style={monoStyle}
      >
        <Flag country={active.country} className="h-[13px] w-auto shrink-0" />
        <span className="hidden sm:inline">{active.code}</span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[320px] min-w-[200px] overflow-y-auto border border-[#202020] bg-white"
        >
          {localeList.map((meta) => (
            <button
              key={meta.code}
              type="button"
              role="option"
              aria-selected={meta.code === activeLocale}
              dir={meta.dir}
              onClick={() => selectLocale(meta.code)}
              className={clsx(
                "flex w-full items-center gap-3 border-b border-[#202020]/10 px-4 py-3 text-left text-[13px] tracking-[0.04em] text-[#202020] transition-colors last:border-b-0",
                meta.code === activeLocale
                  ? "bg-[#f0fb29]"
                  : "bg-white hover:bg-[#f5f5f5]",
              )}
              style={monoStyle}
            >
              <Flag country={meta.country} className="h-[14px] w-auto shrink-0" />
              <span className="flex-1">{meta.label}</span>
              {meta.code === activeLocale ? (
                <span aria-hidden="true">■</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
