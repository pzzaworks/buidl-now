import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Chakra_Petch,
  IBM_Plex_Mono,
  Turret_Road,
} from "next/font/google";
import "../globals.css";
import { LayoutShell } from "@/components/layout-shell";
import { routing } from "@/i18n/routing";
import { localeDirection, type Locale } from "@/i18n/locales";
import { languageAlternates, localeUrl } from "@/lib/site";

const turretRoad = Turret_Road({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-turret",
  weight: ["400", "500", "700"],
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chakra-petch",
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
  weight: ["300", "400", "500", "600", "700"],
});
const shouldLoadAnalytics = process.env.NODE_ENV === "production";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("titleDefault");
  const description = t("description");

  return {
    metadataBase: new URL("https://buidlnow.com"),
    icons: {
      icon: "/buildnow.svg",
      shortcut: "/buildnow.svg",
      apple: "/buildnow.svg",
    },
    title: {
      default: `${title} | Buidl Now!`,
      template: "%s | Buidl Now!",
    },
    description,
    keywords: t("keywords")
      .split(",")
      .map((keyword) => keyword.trim()),
    authors: [{ name: "Berke (pzzaworks)", url: "https://pzza.works" }],
    creator: "Berke (pzzaworks)",
    publisher: "Berke (pzzaworks)",
    openGraph: {
      type: "website",
      locale,
      url: localeUrl(locale),
      siteName: "Buidl Now!",
      title: `${title} | Buidl Now!`,
      description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Buidl Now!`,
      description,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: localeUrl(locale),
      languages: languageAlternates(),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const dir = localeDirection(locale as Locale);

  return (
    <html lang={locale} dir={dir}>
      <head>
        {/* Warm up the connection to the analytics origin used in production so
            the beacon request does not pay the full DNS + TLS cost on first
            send. Only emitted when analytics is actually loaded. */}
        {shouldLoadAnalytics ? (
          <>
            <link
              rel="preconnect"
              href="https://analytics.pzza.works"
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href="https://analytics.pzza.works" />
          </>
        ) : null}
      </head>
      <body
        className={`${turretRoad.variable} ${chakraPetch.variable} ${ibmPlexMono.variable} overflow-x-hidden antialiased`}
      >
        {shouldLoadAnalytics ? (
          <Script
            src="/api/rybbit/script.js"
            data-site-id="site-buidlnow"
            strategy="beforeInteractive"
          />
        ) : null}
        <NextIntlClientProvider>
          <LayoutShell>{children}</LayoutShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
