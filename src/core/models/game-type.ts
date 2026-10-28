import { z } from "zod";

export const gameTypeSchema = z.enum([
  "trending",
  "football",
  "cricket",
  "basketball",
  "tennis",
  "racing",
]);
export type GameType = z.infer<typeof gameTypeSchema>;

/** The sections the matches endpoint accepts. Tennis has games only. */
export type MatchGameType = Exclude<GameType, "tennis">;

/** The sports that have match stats. */
export type StatsGameType = Exclude<GameType, "trending" | "tennis">;
