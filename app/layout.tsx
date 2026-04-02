import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { Providers } from "@/components/providers";
import "@/app/globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Our Memory Diary",
    template: "%s | Our Memory Diary"
  },
  description:
    "A private shared diary for couples to save memories, letters, milestones, and moments in one secure space.",
  applicationName: "Our Memory Diary",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Our Memory Diary",
    statusBarStyle: "default"
  },
  formatDetection: {
    telephone: false
  },
  keywords: ["couple diary", "private memories", "shared journal", "pwa", "supabase", "next.js"],
  openGraph: {
    title: "Our Memory Diary",
    description: "A private, installable memory vault for two hearts.",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1226" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
