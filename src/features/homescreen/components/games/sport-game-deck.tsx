"use client";

import { sportModuleFor, type Sport } from "@/config/sports";
import { GameIcon } from "@/lib/icons";

import { toGameDecks } from "../../adapters";
import { useAllGames } from "../../queries";
import { CardGridSkeleton, FeedEmpty, FeedError } from "../feed-states";
import { ArcadeHeroTile } from "./arcade-hero-tile";
import { QuickGameTile } from "./quick-game-tile";
import { QuickPlayHeader } from "./quick-play-header";

export type SportGameDeckProps = {
  sport: Sport;
};

/**
 * Everything one sport has to play: its featured games as full-width banners,
 * then the free games on a shelf below.
 *
 * The banners stack one per row on a phone. They reflow to two and three
 * columns once there is room, so a five-game deck does not become a scroll on
 * a desktop.
 */
export function SportGameDeck({ sport }: SportGameDeckProps) {
  const games = useAllGames();
  const label = sportModuleFor(sport).label;

  if (!games.data) {
    return games.status === "error" ? (
      <FeedError
        subject={`the ${label.toLowerCase()} games`}
        error={games.error}
        onRetry={games.reload}
      />
    ) : (
      <CardGridSkeleton />
    );
  }

  const deck = toGameDecks(games.data)[sport] ?? [];
  const heroes = deck.filter((game) => game.kind === "hero");
  const quick = deck.filter((game) => game.kind === "quick");

  if (deck.length === 0) {
    return (
      <FeedEmpty
        icon={<GameIcon size={34} className="text-orange" />}
        title={`NO ${label.toUpperCase()} GAMES YET`}
        note="Pick another sport, or head back to the trending arcade."
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <h2 className="sr-only">{label} games</h2>

      {/* A lone featured game keeps the full width the app gives it; several
          share the row rather than stacking into a scroll. */}
      {heroes.length > 0 ? (
        <ul
          className={[
            "grid gap-3",
            heroes.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {heroes.map((game) => (
            <li key={game.id}>
              <ArcadeHeroTile game={game} layout="landscape" />
            </li>
          ))}
        </ul>
      ) : null}

      {quick.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <QuickPlayHeader count={quick.length} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quick.map((game) => (
              <li key={game.id}>
                <QuickGameTile game={game} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
