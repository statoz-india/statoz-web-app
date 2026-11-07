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
  userAssets: "/api/v1/user/user-assets",
  deleteUser: "/api/v1/user/delete-user",
  userStats: "/api/v1/user/userStats",
  userQuizzes: "/api/v1/quiz/userQuizzes",
  quiz: (id: string) => `/api/v1/quiz/${encodeURIComponent(id)}`,
  prediction: (id: string) => `/api/v1/prediction/${encodeURIComponent(id)}`,
  event: (id: string) => `/api/v1/events/${encodeURIComponent(id)}`,
  future: (id: string) => `/api/v1/futures/${encodeURIComponent(id)}`,
  submitQuiz: (id: string) =>
    `/api/v1/quiz/submitQuiz/${encodeURIComponent(id)}`,
  markQuizResultsViewed: (id: string) =>
    `/api/v1/quiz/markResultsViewed/${encodeURIComponent(id)}`,
  predictionBets: (id: string) =>
    `/api/v1/prediction/${encodeURIComponent(id)}/userPredictionBet`,
  eventBets: (id: string) =>
    `/api/v1/events/${encodeURIComponent(id)}/userEventBet`,
  futureBets: (id: string) =>
    `/api/v1/futures/${encodeURIComponent(id)}/userBet`,
  predictionOdds: (id: string) =>
    `/api/v1/prediction/predictionOdds/${encodeURIComponent(id)}`,
  eventOdds: (id: string) =>
    `/api/v1/events/eventOdds/${encodeURIComponent(id)}`,
  futureOdds: (id: string) =>
    `/api/v1/futures/futureOdds/${encodeURIComponent(id)}`,
  submitPrediction: (id: string) =>
    `/api/v1/prediction/submitPrediction/${encodeURIComponent(id)}`,
  submitEventBet: (id: string) =>
    `/api/v1/events/submitEventBet/${encodeURIComponent(id)}`,
  submitFutureBet: (id: string) =>
    `/api/v1/futures/submitBet/${encodeURIComponent(id)}`,
  userPredictions: "/api/v1/prediction/userPredictions",
  shopTeams: (catalog: ShopCatalog) => `/api/v1/${catalog}/team-abbreviations`,
  shopItems: (catalog: ShopCatalog, team: string) =>
    `/api/v1/${catalog}/by-team/${encodeURIComponent(team)}`,
  shopPurchase: (catalog: ShopCatalog) => `/api/v1/${catalog}/purchase`,
  freeProfilePics: "/api/v1/profile-pics/",
  freeProfileBanners: "/api/v1/profile-banners/",
  paidProfileBanners: (page: number, limit: number) =>
    `/api/v1/profile-banners/paid?page=${page}&limit=${limit}`,
  signupTournaments: "/api/v1/tournament/trending",
  xpTracker: (query: string) => `/api/v1/tracker/xp${query ? `?${query}` : ""}`,
  xpTrackerMap: (query: string) =>
    `/api/v1/tracker/xp/map${query ? `?${query}` : ""}`,
  coinTracker: (query: string) =>
    `/api/v1/tracker/coins${query ? `?${query}` : ""}`,
  coinTrackerMap: (query: string) =>
    `/api/v1/tracker/coins/map${query ? `?${query}` : ""}`,
  contactUs: "/api/v1/contact-us",
  trendingMatches: "/api/v2/trending/public/matches",
  signedInTrending: "/api/v2/trending/matches",
  matches: (gameType: Sport, istDate: string) =>
    `/api/v1/match/public/matches/${gameType}/${encodeURIComponent(istDate)}`,
  races: (istDate: string) =>
    `/api/v1/match/public/motorsport/matchesForDate/${encodeURIComponent(istDate)}`,
  match: (id: string) => `/api/v1/match/public/match/${encodeURIComponent(id)}`,
  motorSportMatch: (id: string) =>
    `/api/v1/match/public/motorsport/${encodeURIComponent(id)}`,
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
  leaderboardTournaments: (gameType: string) =>
    `/api/v1/leaderboard/tournaments/${encodeURIComponent(gameType)}`,
  tournamentBoard: (tournament: string) =>
    `/api/v1/leaderboard/${encodeURIComponent(tournament)}`,
  matchEvents: (matchId: string) =>
    `/api/v1/events/public/matchEvents/${encodeURIComponent(matchId)}`,
  matchPredictions: (matchId: string) =>
    `/api/v1/prediction/public/matchPredictions/${encodeURIComponent(matchId)}`,
  matchQuizzes: (matchId: string) =>
    `/api/v1/quiz/public/matchQuizzes/${encodeURIComponent(matchId)}`,
} as const;
