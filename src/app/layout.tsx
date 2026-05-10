import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import "./globals.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Track Promises",
  description: "Civic accountability tracker for political promises, sources, and public sentiment."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-[var(--font-body)] text-ink antialiased">{children}</body>
    </html>
  );
}
