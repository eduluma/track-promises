import type { Metadata } from "next";

import { SiteHeader } from "@/components/navigation/site-header";
import { getRequestLocale } from "@/modules/i18n/request";
import { getAppVersion } from "@/modules/version/app-version";

import "./globals.css";

export const metadata: Metadata = {
  title: "Track Promises",
  description: "Civic accountability tracker for political promises, sources, and public sentiment."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const appVersion = getAppVersion();

  return (
    <html
      lang={locale}
    >
      <body className="font-[var(--font-body)] text-ink antialiased">
        <SiteHeader />
        <div className="min-h-screen bg-sand/30">
          {children}
          <footer className="border-t border-ink/10 px-6 py-4 text-center text-xs text-ink/50 sm:px-10">
            {appVersion}
          </footer>
        </div>
      </body>
    </html>
  );
}
