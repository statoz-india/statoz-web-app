"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SignalOffIcon } from "@/lib/icons";

import { isSportHubSelection } from "../adapters";
import { useMatchSports } from "../data/getSports.data";
import { SportsMatchFeed } from "../screens/SportsMatchFeed";
import { TrendingFeed } from "../screens/TrendingFeed";
import type { SportHubSelection } from "../types";
import { BentoSkeleton, FeedEmpty, FeedError } from "./feed-states";
import { HubBackdrop, type HubTheme } from "./hubBackdrop";
import { SportHubTabs } from "./sport-hub-tabs";

/** The backdrop theme for each tab. Racing's art is named for motorsport. */
const HUB_THEME: Record<SportHubSelection, HubTheme> = {
  trending: "trending",
  football: "football",
  cricket: "cricket",
  basketball: "basketball",
  racing: "motorsport",
};

/**
 * The home surface: the sport browse strip over the feed. The strip holds only
 * what the match sports-types list sends, and the hub owns the selection and
 * nothing else; each feed loads what it shows from the API when it is first
 * opened.
 */
export function HomeHub() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("sport");
  // `null` until a tab is picked, here or in the URL.
  const [picked, setPicked] = useState<SportHubSelection | null>(
    isSportHubSelection(requested) ? requested : null,
  );
  const list = useMatchSports();

  // With nothing picked, or a tab the list no longer sends, the first tab shows.
  const selected =
    picked !== null && list.tabs.includes(picked) ? picked : list.tabs[0];

  /** Mirrors the selection in the URL without asking the server for anything. */
  function selectTab(tab: SportHubSelection) {
    setPicked(tab);
    window.history.replaceState(null, "", `${pathname}?sport=${tab}`);
  }

  function feed() {
    if (!list.data) {
      return list.status === "error" ? (
        <FeedError
          subject="the sports list"
          error={list.error}
          onRetry={list.reload}
        />
      ) : (
        <BentoSkeleton />
      );
    }
    if (selected === undefined) {
      return (
        <FeedEmpty
          icon={<SignalOffIcon size={34} className="text-cyan" />}
          title="NO SPORTS RIGHT NOW"
          note="Check back soon."
        />
      );
    }
    return selected === "trending" ? (
      <TrendingFeed />
    ) : (
      <SportsMatchFeed key={selected} sport={selected} />
    );
  }

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col">
      {/*
       * The page itself scrolls, so this layer is as tall as the feed, and the
       * backdrop inside it stays pinned one screen tall while the feed scrolls
       * over it. Until a tab is known, the trending art shows.
       */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <HubBackdrop
          theme={selected === undefined ? "trending" : HUB_THEME[selected]}
        />
      </div>
      {selected !== undefined && (
        <SportHubTabs
          destinations={list.tabs}
          selected={selected}
          onSelect={selectTab}
        />
      )}
      <div
        className={`flex-1 overflow-y-auto py-3 ${selected === "trending" ? "px-6" : "px-4"}`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          {feed()}
        </div>
      </div>
    </div>
  );
}
