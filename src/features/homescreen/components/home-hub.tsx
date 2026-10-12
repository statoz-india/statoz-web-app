"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { isMatchSport, isSport, type MatchSport } from "@/config/sports";
import { accentVar, GameIcon, MatchIcon } from "@/utils";
import {
  GlidingTabs,
  type GlidingTab,
} from "@/lib/widgets/ui/components/gliding-tabs";

import { useGameSports, useMatchSports } from "../queries";
import { GamesTrendingFeed } from "./games/games-trending-feed";
import { SportGameDeck } from "./games/sport-game-deck";
import { SportMatchFeed } from "./matches/sport-match-feed";
import { TrendingFeed } from "./matches/trending-feed";
import { SportHubTabs, type SportHubSelection } from "./sport-hub-tabs";

const tabs: GlidingTab[] = [
  {
    id: "match",
    label: "MATCH",
    accent: accentVar("cyan"),
    icon: <MatchIcon size={18} />,
  },
  {
    id: "games",
    label: "GAMES",
    accent: accentVar("orange"),
    icon: <GameIcon size={18} />,
  },
];

/**
 * The home surface: the MATCH / GAMES switch over the sport browse strip and
 * the feed. The hub owns the selection and nothing else; each panel and feed
 * loads what it shows from the public API when it is first opened.
 *
 * Each tab keeps its own sport selection, so switching between them does not
 * reset the other's browse position.
 */
export function HomeHub() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSport = searchParams.get("sport");
  const initialTab = searchParams.get("tab") === "games" ? 1 : 0;
  const [tab, setTab] = useState(initialTab);
  // Tennis has games but no fixtures, so a sport can be valid on one tab only.
  const [matchSport, setMatchSport] = useState<MatchSport | null>(
    initialTab === 0 && isMatchSport(requestedSport) ? requestedSport : null,
  );
  const [gamesSport, setGamesSport] = useState<SportHubSelection>(
    initialTab === 1 && isSport(requestedSport) ? requestedSport : null,
  );

  /** Mirrors the selection in the URL without asking the server for anything. */
  function persistBrowseState(nextTab: number, sport: SportHubSelection) {
    const params = new URLSearchParams();
    params.set("tab", nextTab === 0 ? "match" : "games");
    if (sport !== null) params.set("sport", sport);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  }

  function selectTab(nextTab: number) {
    setTab(nextTab);
    persistBrowseState(nextTab, nextTab === 0 ? matchSport : gamesSport);
  }

  function selectMatchSport(selection: SportHubSelection) {
    const sport = isMatchSport(selection) ? selection : null;
    setMatchSport(sport);
    persistBrowseState(0, sport);
  }

  function selectGamesSport(selection: SportHubSelection) {
    setGamesSport(selection);
    persistBrowseState(1, selection);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <GlidingTabs
        label="Match or games"
        tabs={tabs}
        activeIndex={tab}
        onChange={selectTab}
      />

      {tab === 0 ? (
        <MatchPanel sport={matchSport} onSelect={selectMatchSport} />
      ) : (
        <GamesPanel sport={gamesSport} onSelect={selectGamesSport} />
      )}

    </div>
  );
}

function MatchPanel({
  sport,
  onSelect,
}: {
  sport: MatchSport | null;
  onSelect: (selection: SportHubSelection) => void;
}) {
  const { sports, trending } = useMatchSports();
  return (
    <div
      role="tabpanel"
      aria-label="Match"
      className="flex min-h-0 flex-1 flex-col"
    >
      <SportHubTabs
        sports={sports}
        trending={trending}
        selected={sport}
        onSelect={onSelect}
      />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          {sport === null ? (
            <TrendingFeed />
          ) : (
            <SportMatchFeed key={sport} sport={sport} />
          )}
        </div>
      </div>
    </div>
  );
}

function GamesPanel({
  sport,
  onSelect,
}: {
  sport: SportHubSelection;
  onSelect: (selection: SportHubSelection) => void;
}) {
  const { sports, trending } = useGameSports();
  return (
    <div
      role="tabpanel"
      aria-label="Games"
      className="flex min-h-0 flex-1 flex-col"
    >
      <SportHubTabs
        sports={sports}
        trending={trending}
        selected={sport}
        onSelect={onSelect}
      />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          {sport === null ? <GamesTrendingFeed /> : <SportGameDeck sport={sport} />}
        </div>
      </div>
    </div>
  );
}
