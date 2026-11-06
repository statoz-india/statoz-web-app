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

/** A sport's tournament, with how many players have XP in it. */
export const leaderboardTournamentSchema = z.object({
  _id: z.string(),
  tournament: z.string(),
  tournamentName: z.string(),
  tournamentYear: z.string(),
  gameType: z.string(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  textColor: z.string().nullable(),
  isIccTournament: z.boolean(),
  displayOrder: z.number().nullable(),
  /** Counts deleted accounts too. */
  totalPlayers: z.number(),
});
export type LeaderboardTournament = z.infer<typeof leaderboardTournamentSchema>;

/** Most players first. */
export const leaderboardTournamentsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    tournaments: listOf(leaderboardTournamentSchema),
    totalTournaments: z.number(),
    gameType: z.string(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type LeaderboardTournamentsResponse = z.infer<
  typeof leaderboardTournamentsResponseSchema
>;

/** One player on a tournament's board. */
export const tournamentLeaderboardEntrySchema = z.object({
  _id: z.string(),
  userName: z.string().optional(),
  userType: z.string(),
  coins: z.number(),
  tournamentXP: z.number(),
  totalXP: z.number(),
  rank: z.number(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});
export type TournamentLeaderboardEntry = z.infer<
  typeof tournamentLeaderboardEntrySchema
>;

/** The top 100 of a tournament. An unknown code answers an empty board. */
export const tournamentLeaderboardResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    leaderboard: listOf(tournamentLeaderboardEntrySchema),
    totalUsers: z.number(),
    tournament: z.string().optional(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type TournamentLeaderboardResponse = z.infer<
  typeof tournamentLeaderboardResponseSchema
>;
