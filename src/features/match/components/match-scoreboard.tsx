"use client";

import type { MatchDetailScoreboard, SportMatch } from "@/features/match/types";

import { BasketballStatsView } from "./basketball-stats-view";
import { CricketStatsView } from "./cricket-stats-view";
import { FootballStatsView } from "./football-stats-view";
import { MotorsportStatsView } from "./motorsport-stats-view";

/**
 * The match report. Each sport has a view of its own; this picks one.
 *
 * StatOz also has a plain three-section report for tennis and for a race
 * without a full report. It is left out here, so those return nothing.
 */
export function MatchScoreboard({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  if (match.sport === "football")
    return <FootballStatsView match={match} scoreboard={scoreboard} />;
  if (match.sport === "basketball")
    return <BasketballStatsView match={match} scoreboard={scoreboard} />;
  if (match.sport === "cricket")
    return <CricketStatsView match={match} scoreboard={scoreboard} />;
  if (match.sport === "racing" && scoreboard.race)
    return <MotorsportStatsView report={scoreboard.race} />;
  return null;
}
