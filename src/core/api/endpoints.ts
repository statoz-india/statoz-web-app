import type { Sport } from "@/config/sports";

export const ENDPOINTS = {
  sendOtp: "/api/v1/authorization/send-otp",
  login: "/api/v1/authorization/login",
  trendingMatches: "/api/v2/trending/public/matches",
  matches: (gameType: Sport, istDate: string) =>
    `/api/v1/match/public/matches/${gameType}/${encodeURIComponent(istDate)}`,
  races: (istDate: string) =>
    `/api/v1/match/public/motorsport/matchesForDate/${encodeURIComponent(istDate)}`,
  matchStats: (matchObjectId: string) =>
    `/api/v1/match/public/matchStats/${encodeURIComponent(matchObjectId)}`,
  raceStats: (raceId: string) =>
    `/api/v1/match/public/matchStats/f1/race/${encodeURIComponent(raceId)}`,
  matchSportsType: "/api/v1/sports/matchSportsTypes",
  sportsType: "/api/v1/sports/sportsType",
  sportsLeaderboard: (gameType: string) =>
    `/api/v1/leaderboard/public/sport/${encodeURIComponent(gameType)}`,
  tournamentLeaderboard: (tournament: string) =>
    `/api/v1/leaderboard/public/tournament/${encodeURIComponent(tournament)}`,
  matchEvents: (matchId: string) =>
    `/api/v1/events/public/matchEvents/${encodeURIComponent(matchId)}`,
  matchPredictions: (matchId: string) =>
    `/api/v1/prediction/public/matchPredictions/${encodeURIComponent(matchId)}`,
  matchQuizzes: (matchId: string) =>
    `/api/v1/quiz/public/matchQuizzes/${encodeURIComponent(matchId)}`,
} as const;
