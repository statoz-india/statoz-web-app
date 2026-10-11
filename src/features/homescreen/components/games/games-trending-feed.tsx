"use client";

import { GameIcon } from "@/utils";
import { BentoGrid, BentoTile } from "@/widgets/ui/components/bento-grid";

import { toGameTiles } from "../../adapters";
import { useTrendingGames } from "../../queries";
import { BentoSkeleton, FeedEmpty, FeedError } from "../feed-states";
import { ArcadeHeroTile } from "./arcade-hero-tile";
import { QuickGameTile } from "./quick-game-tile";

/** The curated arcade bento — the home screen's GAMES surface. */
export function GamesTrendingFeed() {
  const trending = useTrendingGames();

  if (!trending.data) {
    return trending.status === "error" ? (
      <FeedError
        subject="the trending games"
        error={trending.error}
        onRetry={trending.reload}
      />
    ) : (
      <BentoSkeleton />
    );
  }

  const games = toGameTiles(trending.data);
  if (games.length === 0) {
    return (
      <FeedEmpty
        icon={<GameIcon size={34} className="text-orange" />}
        title="NO GAMES TRENDING RIGHT NOW"
        note="Pick a sport above to see every game it has."
      />
    );
  }

  return (
    <BentoGrid>
      {games.map((game) => (
        // A hero's scene needs the height; a quick plate fits one cell.
        <BentoTile key={game.id} span={game.kind === "hero" ? "tall" : "square"}>
          {game.kind === "hero" ? (
            <ArcadeHeroTile game={game} />
          ) : (
            <QuickGameTile game={game} />
          )}
        </BentoTile>
      ))}
    </BentoGrid>
  );
}
