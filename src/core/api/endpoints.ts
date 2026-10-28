import type { MatchGameType } from "@/core/models";

export const ENDPOINTS = {
  matches: (gameType: MatchGameType, istDate: string) =>
    `/matches/${gameType}/${encodeURIComponent(istDate)}`,
  races: (istDate: string) =>
    `/motorsport/matchesForDate/${encodeURIComponent(istDate)}`,
  trendingMatches: "/trending/matches",
  trendingGames: "/trending/games",
  matchSportTabs: "/games",
  games: "/games/get-games",
  gameSportTabs: "/games/gamesTab",
  matchStats: (matchObjectId: string) =>
    `/matchStats/${encodeURIComponent(matchObjectId)}`,
  raceStats: (raceId: string) =>
    `/matchStats/f1/race/${encodeURIComponent(raceId)}`,
} as const;
