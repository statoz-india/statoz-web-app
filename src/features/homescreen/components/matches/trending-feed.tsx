"use client";

import { useTodayInIST } from "@/hooks/useTodayInIST";
import { FlameIcon } from "@/utils";
import { BentoGrid, BentoTile } from "@/lib/widgets/ui/components/bento-grid";

import { toTrendingTiles } from "../../adapters";
import { useTrendingMatches } from "../../queries";
import type { TrendingTile } from "../../types";
import { BentoSkeleton, FeedEmpty, FeedError } from "../feed-states";
import { SportFixtureCard } from "./sport-fixture-card";
import { TrendingMarketCard } from "./trending-market-card";
import { TrendingPredictCard } from "./trending-predict-card";

/** The curated trending bento — the home screen's main surface. */
export function TrendingFeed() {
  const trending = useTrendingMatches();
  const today = useTodayInIST();

  if (!trending.data) {
    return trending.status === "error" ? (
      <FeedError
        subject="what's trending"
        error={trending.error}
        onRetry={trending.reload}
      />
    ) : (
      <BentoSkeleton />
    );
  }

  const tiles = toTrendingTiles(trending.data.items ?? []);
  if (tiles.length === 0) {
    return (
      <FeedEmpty
        icon={<FlameIcon size={34} className="text-cyan" />}
        title="NOTHING TRENDING RIGHT NOW"
        note="Pick a sport above to browse its fixtures."
      />
    );
  }

  return (
    <BentoGrid>
      {tiles.map((tile) => (
        <BentoTile key={tile.id} span={tile.span}>
          <Tile tile={tile} today={today} />
        </BentoTile>
      ))}
    </BentoGrid>
  );
}

function Tile({ tile, today }: { tile: TrendingTile; today: string | null }) {
  if (tile.kind === "match") {
    return (
      <SportFixtureCard
        match={tile.fixture}
        appearance="trending"
        today={today}
      />
    );
  }
  if (tile.kind === "predict") {
    return <TrendingPredictCard mission={tile.mission} />;
  }
  return (
    <TrendingMarketCard
      market={tile.market}
      kind={tile.kind}
      detailed={tile.span === "tall"}
    />
  );
}
