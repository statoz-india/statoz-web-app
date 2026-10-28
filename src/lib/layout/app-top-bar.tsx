"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { accentVar } from "@/styles";
import { SearchIcon } from "@/lib/icons";

export type AppTopBarProps = {
  title?: string;
  coins?: number;
  /** Accent for the wordmark glow and the search button. */
  accent?: string;
  /** Runs when search is pressed. The button is there either way. */
  onSearch?: () => void;
};

const DEFAULT_TITLE = "StatOz";

/**
 * The title the current route gets. It is its own component so that only this
 * text waits on the URL: while a route with a dynamic segment is prerendered
 * the path is not known yet, and the rest of the bar has no reason to wait.
 */
function RouteTitle() {
  const pathname = usePathname();
  return pathname.startsWith("/shop")
    ? "Shop"
    : pathname === "/leaderboard"
      ? "Leaderboard"
      : pathname.startsWith("/profile")
        ? "Profile"
        : DEFAULT_TITLE;
}

/** The persistent header: the wordmark, and search at its end. */
export function AppTopBar({
  title,
  accent = accentVar("cyan"),
  onSearch,
}: AppTopBarProps) {
  return (
    <header
      className="flex h-19.5 shrink-0 items-center gap-3 border-b bg-surface-nav px-4 pr-3.5"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 26%, transparent)`,
        boxShadow: "var(--ds-shadow-hard-drop)",
      }}
    >
      <h1
        className="flex-1 truncate font-display text-2xl font-black leading-compact tracking-tight"
        style={{
          textShadow: `0 0 12px color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      >
        {title ?? (
          <Suspense fallback={DEFAULT_TITLE}>
            <RouteTitle />
          </Suspense>
        )}
      </h1>
      {/* <button
        type="button"
        onClick={onSearch}
        aria-label="Search"
        title="Search"
        className="grid size-11 shrink-0 place-items-center text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent }}
      >
        <SearchIcon size={24} />
      </button> */}
    </header>
  );
}
