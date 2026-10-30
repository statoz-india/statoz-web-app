import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AuthGateHost } from "@/features/auth/components/auth-gate-host";
import { IMAGES } from "@/config/images";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: IMAGES.icons.siteIcon, type: "image/png", sizes: "192x192" },
    ],
    apple: { url: IMAGES.icons.appleIcon, type: "image/png", sizes: "180x180" },
  },
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
        {/* The nav shell lives in (app)/layout.tsx, so routes outside that
            group, such as /auth, get the whole screen. */}
        <div
          className="min-h-dvh"
          style={{ background: "var(--ds-gradient-app-background)" }}
        >
          {children}
        </div>
        <AuthGateHost />
      </body>
    </html>
  );
}
