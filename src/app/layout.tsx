import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Safedeal — verified digital goods, held in escrow",
    template: "%s — Safedeal",
  },
  description:
    "Buy and sell verified gaming accounts, game keys, in-game currency and digital goods. Funds are held for 48 hours while you inspect what you bought.",
  keywords: [
    "escrow digital goods",
    "buy game accounts",
    "safe gaming marketplace",
    "steam keys escrow",
    "verified digital accounts",
    "Safedeal escrow",
    "EscrowSocial",
  ],
  authors: [{ name: "Safedeal" }],
  openGraph: {
    type: "website",
    siteName: "Safedeal",
    title: "Safedeal — verified digital goods, held in escrow",
    description:
      "Buy and sell verified gaming accounts, game keys, in-game currency and digital goods. Funds are held for 48 hours while you inspect what you bought.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safedeal — verified digital goods, held in escrow",
    description:
      "Funds are held for 48 hours while you inspect what you bought. No payment until it works.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper font-body text-ink">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}

