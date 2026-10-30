import type { CSSProperties } from "react";

import { AppNav } from "@/lib/layout/app-nav";
import { AppTopBar } from "@/lib/layout/app-top-bar";

/**
 * The app shell: navigation sits at the bottom on phones and moves to a side
 * rail once there is room for it. Routes outside this group, such as `/auth`,
 * get the whole screen.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-7xl min-w-0 flex-col lg:flex-row"
      style={
        {
          /**
           * The bar's height, published because the bar is sticky and floats
           * over the page: anything docked above it has to offset by exactly
           * this. The bar below is sized from the same value, so the two
           * cannot drift.
           */
          "--platform-nav-height": "5.25rem",
        } as CSSProperties
      }
    >
      {/* Side rail: lg and up */}
      <div className="hidden shrink-0 lg:block lg:w-56">
        <div className="sticky top-0 h-dvh">
          <AppNav orientation="rail" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar />
        <main className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </div>

      {/* Bottom bar: below lg */}
      <AppNav className="sticky bottom-0 z-20 h-[calc(var(--platform-nav-height)+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] lg:hidden" />
    </div>
  );
}
