import type { Sport } from "@/config/sports";

/** The three shop catalogues, as their path segment. */
export type ShopCatalog = "profile-pics" | "profile-banners" | "player-cards";

export const ENDPOINTS = {
  sendOtp: "/api/v1/authorization/send-otp",
  loginSignupUser: "/api/v1/authorization/loginSignupUser",
  googleSignIn: "/api/v1/authorization/firebase/google",
  logout: "/api/v1/authorization/logout",
  refreshToken: "/api/v1/authorization/refresh-token",
  currentUser: "/api/v1/user/current-user",
  updateUser: "/api/v1/user/update-user",
  userStats: "/api/v1/user/userStats",
  userQuizzes: "/api/v1/quiz/userQuizzes",
  userPredictions: "/api/v1/prediction/userPredictions",
  shopTeams: (catalog: ShopCatalog) => `/api/v1/${catalog}/team-abbreviations`,
  shopItems: (catalog: ShopCatalog, team: string) =>
    `/api/v1/${catalog}/by-team/${encodeURIComponent(team)}`,
  paidProfileBanners: (page: number, limit: number) =>
    `/api/v1/profile-banners/paid?page=${page}&limit=${limit}`,
  signupTournaments: "/api/v1/tournament/trending",
  xpTracker: (query: string) =>
    `/api/v1/tracker/xp${query ? `?${query}` : ""}`,
  xpTrackerMap: (query: string) =>
    `/api/v1/tracker/xp/map${query ? `?${query}` : ""}`,
  coinTracker: (query: string) =>
    `/api/v1/tracker/coins${query ? `?${query}` : ""}`,
  coinTrackerMap: (query: string) =>
    `/api/v1/tracker/coins/map${query ? `?${query}` : ""}`,
  contactUs: "/api/v1/contact-us",
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
