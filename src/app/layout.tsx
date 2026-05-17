import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Chakra_Petch,
  IBM_Plex_Mono,
  Turret_Road,
} from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://buidlnow.com"),
  icons: {
    icon: "/buildnow.svg",
    shortcut: "/buildnow.svg",
    apple: "/buildnow.svg",
  },
  title: {
    default: "Buidl Now! - Developer Tools for Builders Who Ship Fast",
    template: "%s | Buidl Now!",
  },
  description:
    "Free online developer tools to convert, encode, decode, hash, format, validate, and inspect everyday data in a fast browser workspace for builders.",
  keywords: [
    "developer tools",
    "online tools",
    "free tools",
    "converter tools",
    "encoder decoder",
    "hash generator",
    "formatter",
    "validator",
    "base64 converter",
    "hex converter",
    "json formatter",
    "developer utility",
  ],
  authors: [{ name: "Berke (pzzaworks)", url: "https://pzza.works" }],
  creator: "Berke (pzzaworks)",
  publisher: "Berke (pzzaworks)",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buidlnow.com",
    siteName: "Buidl Now!",
    title: "Buidl Now! - Developer Tools for Builders Who Ship Fast",
    description:
      "Free online developer tools to convert, encode, decode, hash, format, validate, and inspect everyday data in a fast browser workspace for builders.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Buidl Now! - Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buidl Now! - Developer Tools for Builders Who Ship Fast",
    description:
      "Free online developer tools to convert, encode, decode, hash, format, validate, and inspect everyday data in a fast browser workspace for builders.",
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
    canonical: "https://buidlnow.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${turretRoad.variable} ${chakraPetch.variable} ${ibmPlexMono.variable} overflow-x-hidden antialiased`}
      >
        {shouldLoadAnalytics ? (
          <Script
            src="/api/rybbit/script.js"
            data-site-id="3988064a6374"
            strategy="afterInteractive"
          />
        ) : null}
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
