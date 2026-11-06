"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { ChevronRightIcon } from "@/lib/icons";
import { guideFor } from "@/lib/screens/howToPlay/guides";

/** A step in the trail. Steps without `href` have no page of their own. */
type Crumb = { label: string; href?: string };

const HOME: Crumb = { label: "HOME", href: "/" };
const PROFILE: Crumb = { label: "PROFILE", href: "/profile" };
const HISTORY: Crumb = { label: "HISTORY" };
const HOW_TO_PLAY: Crumb = { label: "HOW TO PLAY", href: "/profile/how-to-play" };
const TALK: Crumb = { label: "TALK TO STATOZ", href: "/profile/talk-to-statoz" };

/** The last crumb is the current page. */
const TRAILS: Record<string, Crumb[]> = {
  "/": [{ label: "HOME" }],
  "/homescreen": [{ label: "HOME" }],
  "/shop": [HOME, { label: "SHOP" }],
  "/leaderboard": [HOME, { label: "LEADERBOARD" }],
  "/profile": [HOME, { label: "PROFILE" }],
  "/profile/xp": [HOME, PROFILE, { label: "XP PROGRESS" }],
  "/profile/history/games": [HOME, PROFILE, HISTORY, { label: "GAMES RESULTS" }],
  "/profile/history/predict": [HOME, PROFILE, HISTORY, { label: "PREDICT RESULTS" }],
  "/profile/history/pick": [HOME, PROFILE, HISTORY, { label: "PICK RESULTS" }],
  "/profile/talk-to-statoz": [HOME, PROFILE, { label: "TALK TO STATOZ" }],
  "/profile/talk-to-statoz/bug": [HOME, PROFILE, TALK, { label: "BUG REPORT" }],
  "/profile/talk-to-statoz/feature": [HOME, PROFILE, TALK, { label: "FEATURE REQUEST" }],
  "/profile/talk-to-statoz/mismatch": [HOME, PROFILE, TALK, { label: "DATA MISMATCH" }],
  "/profile/talk-to-statoz/shoutout": [HOME, PROFILE, TALK, { label: "SHOUTOUT" }],
  "/cards": [HOME, PROFILE, { label: "ALL CARDS" }],
  "/friends": [HOME, PROFILE, { label: "FRIENDS" }],
  "/profile/how-to-play": [HOME, PROFILE, { label: "HOW TO PLAY" }],
};

function trailFor(pathname: string): Crumb[] | null {
  if (pathname.startsWith("/match/")) return [HOME, { label: "MATCH" }];
  if (pathname.startsWith("/picks/")) {
    return [HOME, { label: "PICKS", href: "/" }, { label: "MARKET DETAILS" }];
  }
  const guide = pathname.startsWith(`${HOW_TO_PLAY.href}/`)
    ? guideFor(pathname.slice(`${HOW_TO_PLAY.href}/`.length))
    : undefined;
  if (guide) return [HOME, PROFILE, HOW_TO_PLAY, { label: guide.title }];
  return TRAILS[pathname] ?? null;
}

/** The breadcrumb strip under the top bar, on desktop only. */
export function PlatformNavigation() {
  return (
    // The path is only known at request time on dynamic routes; the empty
    // strip holds the space until it is.
    <Suspense fallback={<Strip />}>
      <RoutedTrail />
    </Suspense>
  );
}

function RoutedTrail() {
  const trail = trailFor(usePathname());
  if (!trail) return null;
  return (
    <Strip>
      <ol className="flex items-center">
        {trail.map((crumb, index) => {
          const current = index === trail.length - 1;
          return (
            <li key={crumb.label} className="flex shrink-0 items-center">
              {index > 0 ? (
                <ChevronRightIcon size={14} className="mx-1.5 text-line-strong" />
              ) : null}
              {current ? (
                <span aria-current="page" className="max-w-72 truncate text-cyan">
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <Link
                  href={crumb.href}
                  className="flex min-h-11 items-center text-muted transition-colors duration-150 hover:text-cyan"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-muted">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </Strip>
  );
}

function Strip({ children }: { children?: ReactNode }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden h-11 shrink-0 items-center overflow-x-auto border-b border-line-subtle bg-surface/80 px-6 font-display text-2xs font-black tracking-ultra uppercase scrollbar-none lg:flex [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </nav>
  );
}
