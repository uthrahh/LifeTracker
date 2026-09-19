import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: {
    default: "Wayfare — plan less, do more",
    template: "%s · Wayfare",
  },
  description: "One calm place for everything you're trying to improve.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#FAF9F6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
