"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { IMAGES } from "@/config/images";
import { SignalOffIcon } from "@/lib/icons";

import { isSportHubSelection } from "../adapters";
import { useMatchSports } from "../queries";
import { TrendingFeed } from "../screens/TrendingFeed";
import type { SportHubSelection } from "../types";
import { BentoSkeleton, FeedEmpty, FeedError } from "./feed-states";
import { SportMatchFeed } from "./matches/sport-match-feed";
import { SportHubTabs } from "./sport-hub-tabs";

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
      <SportMatchFeed key={selected} sport={selected} />
    );
  }

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col">
      {/*
       * The page itself scrolls, so the hub is as tall as its feed. The art is
       * held one screen tall and pinned to the top, so it stays put while the
       * feed scrolls over it instead of stretching down the whole feed.
       */}
      {selected === "trending" && (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="sticky top-0 h-dvh">
            {/* `fill` needs a relative parent; a sticky one is not accepted. */}
            <div className="relative h-full">
              <Image
                src={IMAGES.backgrounds.hub.trendingPortrait}
                alt=""
                fill
                sizes="100vw"
                loading="eager"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}
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
