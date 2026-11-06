import type { LeaderboardEntry, TournamentLeaderboardEntry } from "@/core";

/** One player as the board widget draws them, whichever board they're on. */
export type BoardRow = {
  _id: string;
  rank: number;
  name: string;
  xp: number;
  avatarUrl?: string;
};

export const sportRow = (entry: LeaderboardEntry): BoardRow => ({
  _id: entry._id,
  rank: entry.rank,
  name: entry.userName,
  xp: entry.sportXP,
});

export const tournamentRow = (entry: TournamentLeaderboardEntry): BoardRow => ({
  _id: entry._id,
  rank: entry.rank,
  name: entry.userName || "Player",
  xp: entry.tournamentXP,
  avatarUrl: entry.avatarUrl,
});
