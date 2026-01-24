import type { Metadata, Viewport } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { GeometricBackground } from "@/components/geometric-background";
import { ThemeToggle } from "@/components/theme-toggle";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-albert-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://buidlnow.com"),
  title: {
    default: "Buidl Now! - Developer Tools for Builders Who Ship Fast",
    template: "%s | Buidl Now!",
  },
  description:
    "Free online developer tools for Web3 builders. Convert, encode, decode, hash, format, and validate data. Essential utilities for blockchain developers, smart contract engineers, and modern web developers.",
  keywords: [
    "developer tools",
    "web3 tools",
    "blockchain tools",
    "ethereum tools",
    "smart contract tools",
    "online tools",
    "free tools",
    "converter tools",
    "encoder decoder",
    "hash generator",
    "abi encoder",
    "keccak hash",
    "base64 converter",
    "hex converter",
    "json formatter",
    "crypto tools",
  ],
  authors: [{ name: "Buidl Now!" }],
  creator: "Buidl Now!",
  publisher: "Buidl Now!",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buidlnow.com",
    siteName: "Buidl Now!",
    title: "Buidl Now! - Developer Tools for Builders Who Ship Fast",
    description:
      "Free online developer tools for Web3 builders. Convert, encode, decode, hash, format, and validate data. Essential utilities for blockchain developers.",
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
      "Free online developer tools for Web3 builders. Essential utilities for blockchain developers and smart contract engineers.",
    images: ["/og-image.png"],
    creator: "@buidlnow",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
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
      <body className={`${albertSans.variable} antialiased overflow-x-hidden`}>
        <GeometricBackground />
        <div className="relative z-10 min-h-screen w-full">
          <Header />
          <main className="min-h-screen w-full">
            {children}
          </main>
          <Footer />
        </div>
        <ScrollToTop />
        <ThemeToggle />
      </body>
    </html>
  );
}
