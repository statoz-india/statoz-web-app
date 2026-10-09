import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";

import { PlatformNav } from "@/widgets/nav/platform-nav";

import "./globals.css";

const onest = localFont({
  src: "./fonts/onest-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-onest",
  display: "swap",
});

const orbitron = localFont({
  src: "./fonts/orbitron-latin-variable.woff2",
  weight: "400 900",
  style: "normal",
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StatOz",
  description: "Sports predictions, picks, and games.",
};

/**
 * Without viewport-fit=cover, iOS reports env(safe-area-inset-bottom) as 0,
 * so the bottom bar's home-indicator padding does nothing.
 */
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Navigation sits at the bottom on phones and moves to a side rail
            once there is room for it. */}
        <div
          className="min-h-dvh"
          style={
            {
              background: "var(--ds-gradient-app-background)",
              /**
               * The bar's height, published because the bar is sticky and
               * floats over the page: anything docked above it has to offset
               * by exactly this. The bar below is sized from the same value,
               * so the two cannot drift.
               */
              "--platform-nav-height": "5.25rem",
            } as CSSProperties
          }
        >
          <div className="mx-auto flex min-h-dvh w-full max-w-7xl min-w-0 flex-col lg:flex-row">
            {/* Side rail: lg and up */}
            <div className="hidden shrink-0 lg:block lg:w-56">
              <div className="sticky top-0 h-dvh">
                <PlatformNav orientation="rail" />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              {/* top bar / breadcrumbs go here */}
              <main className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
                {children}
              </main>
            </div>

            {/* Bottom bar: below lg */}
            <PlatformNav className="sticky bottom-0 z-20 h-[calc(var(--platform-nav-height)+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] lg:hidden" />
          </div>
        </div>
      </body>
    </html>
  );
}
