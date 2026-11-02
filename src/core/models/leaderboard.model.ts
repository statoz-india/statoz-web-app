import { z } from "zod";

import { listOf } from "./list-of";

/** One player on a sport's leaderboard. */
export const leaderboardEntrySchema = z.object({
  _id: z.string(),
  userName: z.string(),
  /** Starts at 1. */
  rank: z.number(),
  /** XP earned in this board's sport. */
  sportXP: z.number(),
  /** XP earned across every sport. */
  totalXP: z.number(),
  coins: z.number(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

/** A sport's leaderboard, best first. */
export const sportLeaderboardSchema = z.object({
  leaderboard: listOf(leaderboardEntrySchema),
  totalUsers: z.number(),
  totalPlayers: z.number(),
  gameType: z.string(),
});
export type SportLeaderboard = z.infer<typeof sportLeaderboardSchema>;
