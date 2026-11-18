import type { Metadata, Viewport } from "next";
import { Grenze_Gotisch, Literata, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import { Atmosphere } from "@/components/atmosphere";
import { MusicPlayer } from "@/components/music-player";
import { ReadingControls } from "@/components/reading-controls";
import { ReadingPrefsSync } from "@/components/reading-prefs-sync";
import { HeaderBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { visibleTracks } from "@/lib/media";
import { readingPrefsBootstrapScript } from "@/lib/reading-prefs";

import soundtrackFile from "../../content/soundtrack.json";
import "./globals.css";

const display = Grenze_Gotisch({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const reading = Literata({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-reading",
  display: "swap",
});

const ui = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const tracks = visibleTracks(soundtrackFile.tracks);

export const metadata: Metadata = {
  title: {
    default: "Demonic Cortex",
    template: "%s · Demonic Cortex",
  },
  description:
    "Demonic Cortex is a graphic novel in progress by Jim. Read Chapter 1 free. Later chapters stay locked until subscriptions open.",
};

export const viewport: Viewport = {
  themeColor: "#050303",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${reading.variable} ${ui.variable}`}>
      <body>
        <Script id="reading-prefs" strategy="beforeInteractive">
          {readingPrefsBootstrapScript()}
        </Script>
        <ReadingPrefsSync />
        <Atmosphere />
        <div className="site-shell">
          <a className="skip" href="#main">
            Skip to content
          </a>
          <a className="skip skip-audio" href="#soundtrack">
            Skip to soundtrack
          </a>
          <Suspense fallback={<HeaderBar pathname="" />}>
            <SiteHeader />
          </Suspense>
          <main id="main" tabIndex={-1}>
            <div className="wrap">
              <ReadingControls />
            </div>
            {children}
          </main>
          <SiteFooter />
        </div>
        <MusicPlayer tracks={tracks} />
      </body>
    </html>
  );
}
